'use strict';

var rdk = require('../../core/rdk');
var async = require('async');
var dd = require('drilldown');
var httpUtil = require('../../core/rdk').utils.http;
var _ = require('lodash');
var jdsFilter = require('jds-filter');
var querystring = require('querystring');
var moment = require('moment');
var asuUtils = require('./asu-utils');
var clincialObjectsSubsystem = require('../../subsystems/clinical-objects/clinical-objects-subsystem');
var clincialObjectsWrapperNote = require('../../subsystems/clinical-objects/clinical-objects-wrapper-note');

var description = {
    get: 'Get notes data for a patient'
};

var getResourceConfig = function() {
    return [{
        name: 'patient-record-notes',
        path: '',
        get: getPatientNotes,
        description: description,
        subsystems: ['patientrecord', 'jds', 'solr', 'jdsSync', 'authorization'],
        interceptors: {
            jdsFilter: true,
            pep: {
                handlers: ['permission']
            }
        },
        requiredPermissions: ['read-document'],
        isPatientCentric: true,
        outerceptors: ['emulateJdsResponse']
    }];
};

function getPatientNotes(req, res) {
    if (!req.query.localPid) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing localPid parameter');
    }

    async.parallel([

        _.bind(readEhmpUnsignedNotes, null, req),
        _.bind(readVistaUnsignedNotes, null, req),
        _.bind(readVistaUncosignedNotes, null, req),
        _.bind(readVistaSignedNotes, null, req)

    ], function(err, results) {

        req.logger.info('NOTES-READER: master callback triggered');
        if (err) {
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        }

        var rawNotes = {
            ehmpUnsigned: results[0],
            vistaUnsigned: results[1],
            vistaUncosigned: results[2],
            vistaSigned: results[3]
        };
        var requiredPermission = 'VIEW';
        var allPermissions = [
            'VIEW',
            'SIGNATURE',
            'EDIT RECORD',
            'DELETE RECORD',
            'CHANGE TITLE'
        ];
        async.parallel([
            _.bind(asuUtils.applyAsuRulesWithActionNames, null, req, requiredPermission, allPermissions, wrapItems(rawNotes.ehmpUnsigned)),
            _.bind(asuUtils.applyAsuRulesWithActionNames, null, req, requiredPermission, allPermissions, wrapItems(rawNotes.vistaUnsigned)),
            _.bind(asuUtils.applyAsuRulesWithActionNames, null, req, requiredPermission, allPermissions, wrapItems(rawNotes.vistaUncosigned)),
            _.bind(asuUtils.applyAsuRulesWithActionNames, null, req, requiredPermission, allPermissions, wrapItems(rawNotes.vistaSigned))

        ], function(err, results) {

            req.logger.info('NOTES-READER: post-ASU callback triggered');
            if (err) {
                return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
            }

            var filteredNotes = {
                ehmpUnsigned: results[0],
                vistaUnsigned: results[1],
                vistaUncosigned: results[2],
                vistaSigned: results[3]
            };

            var unsignedNotes = customDateSort(mergeUnsignedNotes(filteredNotes));
            var uncosignedNotes = customDateSort(filteredNotes.vistaUncosigned);

            return res.rdkSend({
                data: {
                    items: [{
                        'id': 'unsigned',
                        'name': 'Unsigned',
                        'notes': unsignedNotes
                    }, {
                        'id': 'uncosigned',
                        'name': 'Uncosigned',
                        'notes': uncosignedNotes
                    }, {
                        'id': 'signed',
                        'name': 'My Signed Notes',
                        'notes': filteredNotes.vistaSigned
                    }]
                }
            });
        });
    });
}

function readEhmpUnsignedNotes(req, callback) {
    getDocumentsFromPjds(req, function(err, results) {
        req.logger.info('NOTES-READER: ehmp unsigned raw results: ' + JSON.stringify(results));
        if (err || (results && results.error)) {
            return callback(err || results.error);
        }
        var notes = results.notes;
        _.each(notes, function(note) {
            note.uid = note.uid.toString();
            note.id = note.uid.toString();
            note.app = 'ehmp';
            note.documentDefUidUnique = getDocumentDefUidUnique(note, 'all');
        });
        return callback(null, notes);
    });
}

function readVistaUnsignedNotes(req, callback) {
    var authorUid = getCurrentUserUid(req);
    return getDocumentsFromJds(req, {
        filter: [
            ['eq', 'status', 'UNSIGNED'],
            ['eq', 'documentClass', 'PROGRESS NOTES'],
            ['eq', 'authorUid', authorUid],
            ['like', 'uid', '%' + req.session.user.site + '%']
        ]
    }, function(err, results) {
        req.logger.info('NOTES-READER: vista unsigned raw results: ' + JSON.stringify(results));
        if (err || (results && results.error)) {
            return callback(err || results.error);
        }
        var notes = results.data.items;
        _.each(notes, function(note) {
            note.id = note.uid;
            note.app = 'vista';
            note.documentDefUidUnique = getDocumentDefUidUnique(note, 'all');
        });
        return callback(null, notes);
    });
}

function readVistaUncosignedNotes(req, callback) {
    var userUid = getCurrentUserUid(req);
    getDocumentsFromJds(req, {
        filter: [
            ['in', 'status', ['UNSIGNED', 'UNCOSIGNED']],
            ['eq', 'documentClass', 'PROGRESS NOTES'],
            ['eq', 'clinicians[].uid', userUid],
            ['like', 'uid', '%' + req.session.user.site + '%']
        ]
    }, function(err, results) {
        req.logger.info('NOTES-READER: vista uncosigned raw results: ' + JSON.stringify(results));
        if (err || (results && results.error)) {
            return callback(err || results.error);
        }
        var uncosignedNotes = [];
        _.each(results.data.items, function(note) {
            var cosigner = _.find(note.clinicians, {
                role: 'EC',
                uid: userUid
            });
            if (!_.isUndefined(cosigner)) {
                note.app = 'vista';
                note.documentDefUidUnique = getDocumentDefUidUnique(note, 'all');
                uncosignedNotes.push(note);
            }
        });
        return callback(null, uncosignedNotes);
    });
}

function readVistaSignedNotes(req, callback) {
    var fromDate = moment().subtract(2, 'years').format('YYYYMMDD');
    var toDate = moment().hours(23).minutes(59).seconds(59).format('YYYYMMDDHHmmss');
    var userUid = getCurrentUserUid(req);
    return getDocumentsFromJds(req, {
        filter: [
            ['in', 'status', ['COMPLETED', 'UNCOSIGNED']],
            ['eq', 'documentClass', 'PROGRESS NOTES'],
            ['like', 'uid', '%' + req.session.user.site + '%'],
            ['eq', 'signerUid', userUid],
            ['between', 'signedDateTime', fromDate, toDate]
        ],
        order: 'referenceDateTime DESC'
    }, function(err, results) {
        req.logger.info('NOTES-READER: vista signed raw results: ' + JSON.stringify(results));
        if (err || (results && results.error)) {
            return callback(err || results.error);
        }
        var notes = results.data.items;
        _.each(notes, function(note) {
            note.id = note.uid;
            note.app = 'vista';
            note.documentDefUidUnique = getDocumentDefUidUnique(note, 'all');
        });
        return callback(null, notes);
    });
}

function getDocumentsFromJds(req, queryConfig, callback) {
    var pid = req.query.pid;
    var index = 'docs-view';
    var baseJdsResource = '/vpr/' + pid + '/index/' + index;
    var jdsQuery = {};
    var filter = [];

    if (queryConfig.filter) {
        var filterVals = _.isFunction(queryConfig.filter) ? queryConfig.filter() : queryConfig.filter;
        filter = filter.concat(filterVals);
    }

    var filterString = jdsFilter.build(filter);
    if (filterString) {
        jdsQuery.filter = filterString;
    }
    if (queryConfig.order) {
        jdsQuery.order = queryConfig.order;
    }

    var jdsQueryString = querystring.stringify(jdsQuery);
    var path = '/vpr/' + pid + '/index/' + index + (jdsQueryString ? '?' + jdsQueryString : '');
    var options = _.extend({}, req.app.config.jdsServer, {
        url: path,
        logger: req.logger,
        json: true
    });

    req.audit.patientId = pid;
    req.audit.dataDomain = index;
    req.audit.logCategory = 'RETRIEVE';
    req.logger.info('Retrieve pid=%s index=%s from server %s', pid, index, options.baseUrl);

    req.logger.info('NOTES-READER: jds url = ' + options.url);

    httpUtil.get(options, function(err, response, body) {
        if (err) {
            req.logger.error(err);
            return callback(err);
        } else {
            if (body && body.data) {
                return callback(null, body);
            }
            return callback('There was an error processing your request. The error has been logged.');
        }
    });
}

function getDocumentsFromPjds(req, callback) {
    var pid = req.query.localPid;
    var site = req.session.user.site;
    var user = req.session.user.duz[site];
    var authorUid = 'urn:va:user:' + site + ':' + user;
    var logger = req.logger;
    var appConfig = req.app.config;

    var clinicalObjFilter = {
        'authorUid': authorUid,
        'domain': 'note',
        'subDomain': 'tiu',
        'patientUid': pid,
        'ehmpState': 'draft'
    };

    clincialObjectsSubsystem.find(logger, appConfig, clinicalObjFilter, false, function(err, response) {
        logger.info('getDocumentsFromPjds response', response);
        if (err) {
            if (err[0].indexOf('not found') > -1) {
                return callback(null, {
                    notes: []
                });
            }
            logger.warn({
                unsignedNoteWriteError: err
            }, 'Error reading notes from pJDS');

            logger.warn('Failed to read the note from JDS.');
            return callback(err);
        }

        var items = response.items;

        if (!items) {
            return callback(null, {
                notes: []
            });
        }

        var errorMessages = [];
        items = clincialObjectsWrapperNote.returnClinicialObjectData(errorMessages, items);

        if (!_.isEmpty(errorMessages) || !items) {
            return callback(new Error(errorMessages.toString()));
        }

        return callback(null, {
            notes: items
        });
    });
}

function mergeUnsignedNotes(rawNotes) {
    var allUnsignedNotes = _.clone(rawNotes.ehmpUnsigned); // shallow copy

    _.each(rawNotes.vistaUnsigned, function(vistaNote, index, all) {
        // JDS may not have updated quickly enough after signing a note
        // check all collections to make sure the note isn't already here.
        var text = (vistaNote.text ? vistaNote.text[0].content : '') || '';
        if (text.toLowerCase().indexOf('this is a stub of an unsigned note created in ehmp') === 0) {
            var searchCriteria = {
                noteUid: vistaNote.uid
            };
            var ehmpNote = _.findWhere(rawNotes.ehmpUnsigned, searchCriteria) || _.findWhere(rawNotes.vistaUncosigned, searchCriteria) || _.findWhere(rawNotes.vistaSigned, searchCriteria);
            if (!ehmpNote) { // only add the note if it's not a vista stub note
                allUnsignedNotes.push(vistaNote);
            }
        } else {
            allUnsignedNotes.push(vistaNote);
        }
    });
    return allUnsignedNotes;
}

function customDateSort(notes) {
    // need to sort notes without a reference date before notes with a reference date
    return _.sortBy(notes, function(note) {
        var val;
        if (note.referenceDateTime) {
            val = moment(note.referenceDateTime, 'YYYYMMDDHHmmss').format('YYYYMMDDHHmmss') * 1;
        } else {
            // multiply the entered date by 10 so it will sort before the reference dates.
            val = moment(note.entered, 'YYYYMMDDHHmmss').format('YYYYMMDDHHmmss') * 10;
        }
        return val * -1; // sortBy does ascending sort, but we want descending, so invert the value
    }, null);
}

function getCurrentUserUid(req) {
    var site = req.session.user.site;
    var duz = req.session.user.duz;
    return 'urn:va:user:' + site + ':' + duz[site];
}

function getDocumentDefUidUnique(note, suffix) {
    var fields = [
        note.documentDefUid,
        note.localTitle.replace(/\s/g, '_'), //replace spaces in the title with '_'
        suffix
    ];
    return fields.join('---');
}

function wrapItems(items) {
    return {
        data: {
            items: items
        }
    };
}

module.exports.getResourceConfig = getResourceConfig;

// for unit testing
module.exports._customDateSort = customDateSort;
module.exports._getCurrentUserId = getCurrentUserUid;
module.exports._getDocumentDefUidUnique = getDocumentDefUidUnique;
module.exports._wrapItems = wrapItems;
module.exports._getDocumentsFromPjds = getDocumentsFromPjds;
