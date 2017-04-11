'use strict';

var rdk = require('../../core/rdk');
var nullchecker = rdk.utils.nullchecker;
var async = require('async');
var httpUtil = require('../../core/rdk').utils.http;
var _ = require('lodash');
var jdsFilter = require('jds-filter');
var querystring = require('querystring');
var moment = require('moment');
var asuUtils = require('./asu-utils');
var vistaJs = require('vista-js');
var filemanDateUtil = require('../../utils/fileman-date-converter');
var UidUtil = require('../../utils/uid-utils');
var RpcParameter = vistaJs.RpcParameter;
var RpcClient = vistaJs.RpcClient;
var clincialObjectsSubsystem = require('../../subsystems/clinical-objects/clinical-objects-subsystem');
var clincialObjectsWrapperNote = require('../../subsystems/clinical-objects/clinical-objects-wrapper-note');
var documentSignatures = require('./patient-record-document-view-signatures');

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
    }, {
        name: 'patient-record-note-by-consult-uid',
        path: 'consultuid',
        get: getNoteUidAssociatedtoConsultUid,
        description: {
            get: 'Get note clinical object uid for the given consult uid'
        },
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
    var localPid = req.body.localPid || req.query.localPid;
    if (!localPid) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing localPid parameter');
    }

    async.parallel([

        _.bind(readEhmpUnsignedNotes, null, req),
        _.bind(readEhmpUnsignedAddenda, null, req),
        _.bind(readVistaUnsignedNotes, null, req),
        _.bind(readVistaUncosignedNotes, null, req),
        _.bind(readVistaUncosignedAddenda, null, req),
        _.bind(readVistaSignedNotes, null, req),
        _.bind(getLocationName, null, req)

    ], function(err, results) {

        req.logger.info('NOTES-READER: master callback triggered');

        if (err) {
            req.logger.error('getPatientNotes error:', err);
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        }

        var rawNotes = {
            ehmpUnsigned: results[0],
            ehmpAddenda: results[1],
            vistaUnsigned: results[2],
            vistaUncosigned: results[3],
            vistaUncosignedAddendaParents: results[4],
            vistaSigned: results[5]
        };
        var vistaLocationName = results[6];
        var requiredPermission = 'VIEW';
        var allPermissions = [
            'VIEW',
            'SIGNATURE',
            'EDIT RECORD',
            'DELETE RECORD',
            'CHANGE TITLE',
            'MAKE ADDENDUM'
        ];
        var unsignedAddenda = [];
        _.each(rawNotes.ehmpAddenda, function(note) {
            unsignedAddenda = unsignedAddenda.concat(note.unsignedAddenda);
        });
        async.parallel([
            _.bind(asuUtils.applyAsuRulesWithActionNames, null, req, requiredPermission, allPermissions, wrapItems(rawNotes.ehmpUnsigned)),
            _.bind(asuUtils.applyAsuRulesWithActionNames, null, req, requiredPermission, allPermissions, wrapItems(rawNotes.ehmpAddenda)),
            _.bind(asuUtils.applyAsuRulesWithActionNames, null, req, requiredPermission, allPermissions, wrapItems(rawNotes.vistaUnsigned)),
            _.bind(asuUtils.applyAsuRulesWithActionNames, null, req, requiredPermission, allPermissions, wrapItems(rawNotes.vistaUncosigned)),
            _.bind(asuUtils.applyAsuRulesWithActionNames, null, req, requiredPermission, allPermissions, wrapItems(rawNotes.vistaUncosignedAddendaParents)),
            _.bind(asuUtils.applyAsuRulesWithActionNames, null, req, requiredPermission, allPermissions, wrapItems(rawNotes.vistaSigned)),
            _.bind(asuUtils.applyAsuRulesWithActionNames, null, req, requiredPermission, allPermissions, wrapItems(unsignedAddenda))

        ], function(err, results) {

            req.logger.info('NOTES-READER: post-ASU callback triggered');
            if (err) {
                return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
            }

            var filteredNotes = {
                ehmpUnsigned: results[0],
                ehmpWithUnsignedAddenda: results[1],
                vistaUnsigned: results[2],
                vistaUncosigned: results[3],
                vistaUncosignedAddendaParents: results[4],
                vistaSigned: results[5],
                unsignedAddenda: results[6]
            };
            var authorUid = getCurrentUserUid(req);
            var unsignedNotes = customDateSort(mergeUnsignedNotes(req.logger, filteredNotes, authorUid));
            var unsignedNoteIds = _.pluck(unsignedNotes, 'uid');
            var uncosignedNotes = customDateSort(mergeUncosignedNotes(req.logger, filteredNotes, authorUid));
            var signedNotes = _.filter(filteredNotes.vistaSigned, function(note) {
                return unsignedNoteIds.indexOf(note.uid) === -1;
            });

            //If the signed note is by the author but contains only addnenda not by the author
            //then show the note in the signed section of the tray
            var unsignedNoteIdsWithAddendaNotByAuthor = [];
            _.each(unsignedNotes, function(unsignedNote) {
                if (!unsignedNote.addenda || unsignedNote.addenda.length <= 0) {
                    return;
                }

                var foundAuthor = false;
                _.each(unsignedNote.addenda, function(addendum) {
                    if (addendum.authorUid === authorUid && addendum.status === 'UNSIGNED') {
                        foundAuthor = true;
                        return false;
                    }
                });

                if (!foundAuthor) {
                    unsignedNoteIdsWithAddendaNotByAuthor.push(unsignedNote.uid);
                }
            });

            var unsignedNotesWithAddendaNotByAuthor = _.remove(unsignedNotes, function(unsignedNote) {
                return unsignedNoteIdsWithAddendaNotByAuthor.indexOf(unsignedNote.uid) >= 0;
            });

            signedNotes = signedNotes.concat(unsignedNotesWithAddendaNotByAuthor);
            //End of moving unsigned notes to signed section

            addLocationName(req.logger, [unsignedNotes, uncosignedNotes, signedNotes], vistaLocationName);
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
                        'notes': signedNotes
                    }]
                }
            });
        });
    });
}

function readEhmpUnsignedNotes(req, callback) {
    getDocumentsFromPjds(req, function(err, results) {
        req.logger.info({
            result: results
        }, 'NOTES-READER: ehmp unsigned raw results');
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

function readEhmpUnsignedAddenda(req, callback) {
    getAddendaFromPjds(req, true, function(err, results) {
        req.logger.info({
            result: results
        }, 'NOTES-READER: ehmp unsigned addenda raw results');
        if (err || (results && results.error)) {
            return callback(err || results.error);
        }
        var notes = results.notes;
        _.each(notes, function(note) {
            if (note) {
                note.app = 'ehmp';
                note.documentDefUidUnique = getDocumentDefUidUnique(note, 'all');
            }
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
        req.logger.info({
            result: results
        }, 'NOTES-READER: vista unsigned raw results');
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
        req.logger.info({
            result: results
        }, 'NOTES-READER: vista uncosigned raw results');
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

// Returns the parent notes with their data of all addenda needing to be co-signed
function readVistaUncosignedAddenda(req, callback) {
    var userUid = getCurrentUserUid(req);
    getDocumentsFromJds(req, {
        filter: [
            ['eq', 'status', 'COMPLETED'], // We will not encounter duplicates because the base note type differs from above
            ['eq', 'documentClass', 'PROGRESS NOTES'],
            ['eq', 'text[].status', 'UNCOSIGNED'], // This is the addendum, we call it "text" (cannot query deeper than this at the JDS level)
            ['like', 'uid', '%' + req.session.user.site + '%']
        ]
    }, function(err, results) {
        req.logger.info({
            result: results
        }, 'NOTES-READER: vista uncosigned raw results (uncosigned addenda)');
        if (err || (results && results.error)) {
            return callback(err || results.error);
        }
        var uncosignedAddendaParentNotes = [];
        _.each(results.data.items, function(note) {
            createAddendaFromText(req, note);
            for (var n = 1; n < note.text.length; n++) { // Addenda start at [1], not [0]
                var addendum = note.text[n];
                var userCanCosign = !!_.find(addendum.clinicians, { // Ensured to have "text" at the query level
                    role: 'EC',
                    uid: userUid
                });
                if (userCanCosign) {
                    uncosignedAddendaParentNotes.push(note); // Ensured non-empty at the query level
                    break; // If ANY of the addenda have us as an expected cosigner, send the whole note and all its addenda into the payload and keep looking for the same criteria in the other notes
                }
            }
        });
        return callback(null, uncosignedAddendaParentNotes);
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
        req.logger.info({
            result: results
        }, 'NOTES-READER: vista signed raw results');
        if (err || (results && results.error)) {
            return callback(err || results.error);
        }
        var notes = results.data.items;
        async.each(notes, function(note, asyncCallback) {
            note.id = note.uid;
            note.documentDefUidUnique = getDocumentDefUidUnique(note, 'all');
            if (note.text.length > 1) {
                createAddendaFromText(req, note);
            }
            var ehmpSignedNoteFilter = {
                'uid': note.id,
                'domain': 'ehmp-note',
                'subDomain': 'tiu',
                'ehmpState': 'active'
            };
            clincialObjectsSubsystem.find(req.logger, req.app.config, ehmpSignedNoteFilter, false, function(err, response) {
                if (!err) {
                    note.app = 'ehmp';
                } else {
                    note.app = 'vista';
                }

                return asyncCallback(null);
            });
        }, function(err) {
            // if any of the file processing produced an error, err would equal that error
            if (err) {
                // One of the iterations produced an error.
                // All processing will now stop.
                req.logger.error('A file failed to process in readVistaSignedNotes()');
                return callback(err);
            } else {
                return callback(null, notes);
            }
        });
    });
}



function getDocumentsFromJds(req, queryConfig, callback) {
    var pid = req.body.pid || req.query.pid;
    var index = 'docs-view';
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
                documentSignatures.addSignatures(req, body, function(error, req, results) {
                    return callback(null, results);
                });
            } else {
                return callback('There was an error processing your request. The error has been logged.');
            }
        }
    });
}

function getDocumentsFromPjds(req, callback) {
    var site = req.session.user.site;
    var user = req.session.user.duz[site];
    var authorUid = 'urn:va:user:' + site + ':' + user;
    var logger = req.logger;
    var appConfig = req.app.config;

    /*  For a patient with a site identifier, the format isd
        "urn:va:patient:[site]:[dfn]:[dfn]” (e.g. "urn:va:patient:9E7A:3:3")
        For a patient with only an ICN identifier the format is
        "urn:va:patient:VLER:[icn-value]:[icn-value]” (e.g. "urn:va:patient:VLER:45679V45679:45679V45679")
    */
    var patientIdentifiers = _.get(req, 'interceptorResults.patientIdentifiers', {});
    var patientUids = _.get(patientIdentifiers, 'uids', []);
    var patientUid;
    if (_.isUndefined(patientIdentifiers.dfn) && _.isUndefined(patientIdentifiers.icn)) {
        logger.debug('getDocumentsFromPjds - Patient dfn or icn not found on interceptor results');
        return callback('Patient dfn or icn not found on interceptor results', null);
    }
    if (_.isEmpty(patientUids)) {
        logger.debug('getDocumentsFromPjds - Patient uids not found on interceptor results');
        return callback('Patient uids not found on interceptor results', null);
    }
    if (patientIdentifiers.dfn && patientIdentifiers.site) {
        patientUid = UidUtil.getSiteDfnUidFromUidArray(req);
    } else if (req.interceptorResults.patientIdentifiers.icn) {
        patientUid = UidUtil.getIcnUidFromUidArray(req);
    }
    if (_.isUndefined(patientUid)) {
        logger.debug('getDocumentsFromPjds - Patient uid not found in interceptor results uids array');
        return callback('Patient uid not found in interceptor results uids array', null);
    }

    var clinicalObjFilter = {
        'authorUid': authorUid,
        'domain': 'ehmp-note',
        'subDomain': 'tiu',
        'patientUid': patientUid,
        'ehmpState': 'draft'
    };

    clincialObjectsSubsystem.find(logger, appConfig, clinicalObjFilter, false, function(err, response) {
        logger.info('getDocumentsFromPjds response', response);
        if (err) {
            if (err[0].toLowerCase().indexOf('not found') > -1) {
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

function getAddendaFromPjds(req, removeNonAuthorNote, callback) {
    var logger = req.logger;
    var pid = req.body.localPid || req.body.pid || req.query.localPid || req.query.pid;

    if (pid.indexOf(';') <= -1) {
        req.logger.warn(pid + ' is not a regular pid');
        return callback('NOT REGULAR PID');
    }

    pid = _.last(pid.split(';'));
    var site = req.session.user.site;
    var user = req.session.user.duz[site];
    var authorUid = 'urn:va:user:' + site + ':' + user;
    var appConfig = req.app.config;

    /*  For a patient with a site identifier, the format isd
        "urn:va:patient:[site]:[dfn]:[dfn]” (e.g. "urn:va:patient:9E7A:3:3")
        For a patient with only an ICN identifier the format is
        "urn:va:patient:VLER:[icn-value]:[icn-value]” (e.g. "urn:va:patient:VLER:45679V45679:45679V45679")
    */
    var patientIdentifiers = _.get(req, 'interceptorResults.patientIdentifiers', {});
    var patientUids = _.get(patientIdentifiers, 'uids', []);
    var patientUid;
    if (_.isUndefined(patientIdentifiers.dfn) && _.isUndefined(patientIdentifiers.icn)) {
        logger.debug('getAddendaFromPjds - Patient dfn or icn not found on interceptor results');
        return callback('Patient dfn or icn not found on interceptor results', null);
    }
    if (_.isEmpty(patientUids)) {
        logger.debug('getAddendaFromPjds - Patient uids not found on interceptor results');
        return callback('Patient uids not found on interceptor results', null);
    }
    if (patientIdentifiers.dfn && patientIdentifiers.site) {
        patientUid = UidUtil.getSiteDfnUidFromUidArray(req);
    } else if (req.interceptorResults.patientIdentifiers.icn) {
        patientUid = UidUtil.getIcnUidFromUidArray(req);
    }
    if (_.isUndefined(patientUid)) {
        logger.debug('getAddendaFromPjds - Patient uid not found in interceptor results uids array');
        return callback('Patient uid not found in interceptor results uids array', null);
    }

    var addendumObjFilter = {
        'domain': 'ehmp-note',
        'subDomain': 'addendum',
        'patientUid': patientUid,
        'ehmpState': 'draft',
    };

    clincialObjectsSubsystem.find(logger, appConfig, addendumObjFilter, true, function(err, response) {
        logger.info('Addendum search response', response);
        if (err) {
            if (err[0].toLowerCase().indexOf('not found') > -1) {
                return callback(null, {
                    notes: []
                });
            }
            logger.warn({
                unsignedAddendaReadError: err
            }, 'Error reading unsigned addenda from pJDS');

            logger.warn('Failed to read the addenda from JDS.');
            return callback(err);
        }

        var addenda = response.items;

        if (!addenda) {
            logger.info('no addenda found. sending back empty array');
            return callback(null, {
                notes: [],
            });
        }

        var errorMessages = [];
        var parents = clincialObjectsWrapperNote.returnClinicialObjectData(errorMessages, addenda);
        if (!_.isEmpty(errorMessages) || !parents) {
            return callback(new Error(errorMessages.toString()));
        }

        var parentUids = [];

        parents = _.filter(parents, function(parent, index) {
            parent.uid = parent.clinicalObject.referenceId;

            if (parent.status === 'RETRACTED') {
                // Update addendum clinical obj
                retractClinicalObject(parent, logger, appConfig);
                return false;
            } else {
                parent.addenda = [];
                var unsignedAddenda = [];
                unsignedAddenda.push(createModelForUnsignedAddendum(logger, parent, authorUid));
                parent.unsignedAddenda = unsignedAddenda;
                parentUids.push(parent.uid);
                return true;
            }
        });

        //Consolidate addenda with the same parent
        parentUids = _.uniq(parentUids);

        var uniqueParents = [];
        _.each(parentUids, function(parentUid) {
            var filteredParents = _.filter(parents, {
                uid: parentUid
            });

            _.each(filteredParents, function(filteredParent, index) {
                if (index === 0) {
                    return;
                }

                filteredParents[0].unsignedAddenda = filteredParents[0].unsignedAddenda.concat(filteredParent.unsignedAddenda);
            });

            uniqueParents.push(filteredParents[0]);
        });

        //Add the rest of the VistA addenda
        _.each(uniqueParents, function(parent) {
            createAddendaFromText(req, parent);
            delete parent.clinicalObject;
            return parent.status !== 'RETRACTED';
        });

        return callback(null, {
            notes: uniqueParents
        });
    });
}

function retractClinicalObject(parent, logger, appConfig) {

    var addendumClinObj = parent.clinicalObject;
    addendumClinObj.ehmpState = 'deleted';
    addendumClinObj.deleteReason = 'retracted parent note';
    clincialObjectsSubsystem.update(logger, appConfig, addendumClinObj.uid, addendumClinObj, function(err, response) {
        if (err) {
            logger.warn({
                patientNotesError: err
            }, 'Failed to delete the pJDS unsigned addendum of a retracted note.');
        }
    });
}

// Create the addendum object so they show up in the tray
function createAddendaFromText(req, note) {
    var rawAddenda = note.text;
    if (rawAddenda.length > 1) {
        var addenda = [];
        for (var i = 1; i < rawAddenda.length; i++) {
            addenda.push(createModelForDocumentAddendum(req.logger, rawAddenda[i], note));
        }
        note.addenda = customAddendumDateSort(addenda);
    }
}

function createModelForUnsignedAddendum(logger, parent, authorUid) {
    var newAddendum = _.clone(parent.clinicalObject.addendum);
    newAddendum.referenceId = parent.clinicalObject.referenceId;
    newAddendum.uid = parent.clinicalObject.uid;
    newAddendum.statusDisplayName = 'Unsigned';
    newAddendum.app = 'ehmp';
    newAddendum.text[0].app = 'ehmp';
    newAddendum.clinicalObject = _.omit(parent.clinicalObject, 'addendum');
    return newAddendum;
}

function createModelForDocumentAddendum(logger, addendum, parent) {
    var newAddendum = _.clone(addendum);
    var statusDisplayName = newAddendum.status.toLowerCase();
    statusDisplayName = statusDisplayName.charAt(0).toUpperCase() + statusDisplayName.substr(1);
    newAddendum.app = 'vista';
    newAddendum.documentDefUid = parent.documentDefUid;
    newAddendum.encounterName = parent.encounterName;
    newAddendum.encounterUid = parent.encounterUid;
    newAddendum.isInterdisciplinary = parent.isInterdisciplinary;
    newAddendum.localId = '';
    newAddendum.localTitle = 'Addendum to: ' + parent.localTitle;
    newAddendum.noteType = 'ADDENDUM';
    newAddendum.parentUid = parent.uid;
    newAddendum.pid = parent.pid;
    newAddendum.referenceDateTime = newAddendum.dateTime;
    newAddendum.statusDisplayName = statusDisplayName;
    addendum.app = 'vista';
    newAddendum.text = [addendum];
    return newAddendum;
}

function extractAddenda(logger, notes, omitUids) {
    var allNotesAndAddenda = [];
    _.each(notes, function(note) {
        if (!omitUids || omitUids.indexOf(note.uid) === -1) {
            allNotesAndAddenda.push(note);
            if (note.addenda) {
                allNotesAndAddenda = allNotesAndAddenda.concat(note.addenda);
            }
        }
    });
    return allNotesAndAddenda;
}

function removeNoteIfNoUnsignedAddendaByAuthor(authorUid, parents) {
    var authorsAddenda = [];
    _.each(parents, function(parent) {
        if (parent.authorUid === authorUid) {
            authorsAddenda.push(parent);
            return;
        }

        var foundAuthor = false;
        _.each(parent.addenda, function(addendum) {
            if (addendum.authorUid === authorUid) {
                foundAuthor = true;
                return false;
            }
        });

        if (foundAuthor) {
            authorsAddenda.push(parent);
        }
    });

    return authorsAddenda;
}

function mergeUnsignedNotes(logger, rawNotes, userUid) {
    var allUnsignedNotes = _.clone(rawNotes.ehmpUnsigned); // shallow copy
    var vistaSignedWithUnsignedAddenda = _.filter(rawNotes.vistaSigned, function(note) {
        return _.findWhere(note.text, {
            status: 'UNSIGNED',
            authorUid: userUid
        });
    });
    _.each(rawNotes.ehmpWithUnsignedAddenda, function(note, index, all) {
        note.addenda = note.addenda.concat(note.unsignedAddenda);
        delete note.unsignedAddenda;
        note.addenda = customAddendumDateSort(note.addenda);
    });
    allUnsignedNotes = allUnsignedNotes.concat(rawNotes.ehmpWithUnsignedAddenda).concat(vistaSignedWithUnsignedAddenda);

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

    var mergedResults = _.uniq(allUnsignedNotes, false, function(resultItem) {
        return resultItem.uid;
    });

    var uniqueParents = removeNoteIfNoUnsignedAddendaByAuthor(userUid, mergedResults);
    return uniqueParents;
}

function mergeUncosignedNotes(logger, rawNotes, userUid) {
    var uncosignedNotes = (rawNotes.vistaUncosigned || []);
    var uncosignedAddendaParentNotes = (rawNotes.vistaUncosignedAddendaParents || []);

    return uncosignedNotes.concat(uncosignedAddendaParentNotes); // Ensured non-duplicate at the query level
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

function customAddendumDateSort(addendums) {
    return _.sortBy(addendums, function(addendum) {
        var val;
        if (addendum.referenceDateTime) {
            val = moment(addendum.referenceDateTime, 'YYYYMMDDHHmmss').format('YYYYMMDDHHmmss') * 1;
        }
        return val; // sortBy does ascending sort
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

function getLocationName(req, cb) {

    var DFN = req.interceptorResults.patientIdentifiers.dfn;

    if (nullchecker.isNullish(DFN)) {
        return cb('Missing required patient identifiers');
    }

    var HMP_UI_CONTEXT = 'HMP UI CONTEXT';
    var RPC_NAME = 'TIU DOCUMENTS BY CONTEXT';
    var START_DATE = filemanDateUtil.getFilemanDateTime(new Date(moment().subtract(2, 'years').format('MMMM D, YYYY HH:mm:ss')));
    var STOP_DATE = filemanDateUtil.getFilemanDateTime(new Date(moment().format('MMMM D, YYYY HH:mm:ss')));
    if (_.isUndefined(req.interceptorResults.patientIdentifiers.site)) {
        req.logger.debug('getLocationName - missing patient site from interceptor patient identifier results');
        return cb('Missing patient site parameter.', null);
    }

    var vistaConfig = _.extend({}, req.app.config.vistaSites[req.interceptorResults.patientIdentifiers.site], {
        context: HMP_UI_CONTEXT,
        accessCode: req.session.user.accessCode,
        verifyCode: req.session.user.verifyCode
    });

    var parameters = [];
    parameters.push(RpcParameter.literal('3')); // 3 -> Progress Notes
    parameters.push(RpcParameter.literal('5')); // 1 -> All signed documents, 5 -> All signed documents date range
    parameters.push(RpcParameter.literal(DFN));
    parameters.push(RpcParameter.literal(START_DATE)); // EARLY DATE/TIME in regular FileMan format
    parameters.push(RpcParameter.literal(STOP_DATE)); // LATE DATE/TIME in regular FileMan format
    parameters.push(RpcParameter.literal('0'));
    parameters.push(RpcParameter.literal('1000')); // maximum number of documents to be retrieved in the current query
    parameters.push(RpcParameter.literal('D')); // sort order by reference date/time D/A
    parameters.push(RpcParameter.literal('1')); // sBOOLEAN parameter determines whether addenda will be included in the return array

    RpcClient.callRpc(req.logger, vistaConfig, RPC_NAME, parameters, function(err, result) {
        if (err) {
            req.logger.error(err, 'Rresource patient-record-notes: function getLocationName(), error on RPC TIU DOCUMENTS BY CONTEXT call');
            return cb(null, []); // return empty list in case of error
        }

        req.logger.debug({
            result: result
        }, 'Resource patient-record-notes: getLocationName(), TIU DOCUMENTS BY CONTEXT: response success');
        var arrResults = result.split('\n');
        var arrObj = [];

        /* ---------- return of TIU DOCUMENTS BY CONTEXT

            11737^
            Addendum to CARDIOLOGY ATTENDING OUTPATIENT^
            3160323.1549^
            TEN, PATIENT  (T0010)^
            10000000272;VIHAAN KHAN;KHAN,VIHAAN^
            CARDIOLOGY^
            completed^
            Visit: 03/22/16;3160322.160000^
            ;^^0^^^11735^
        ------------------------------------------------*/
        arrResults.forEach(function(record) {
            var arrRecord = record.split('^');
            if (arrRecord[0]) {
                arrObj.push({
                    id: arrRecord[0], // note/addendum id
                    visitLocationName: arrRecord[5] // visit location name for note/addendum
                });
            }
        });
        /* DEBUG
        req.logger.debug('TIU DOCUMENTS BY CONTEXT: arrObj.length :' + arrObj.length);
        arrObj.forEach(function(item) {
            req.logger.debug('TIU DOCUMENTS BY CONTEXT: arrObj :' + item.id + " | "+item.visitLocationName);
        });*/
        return cb(null, arrObj);

    });
}

function addLocationName(logger, arrNotes, arrLocations) {
    if (arrNotes) {
        arrNotes.forEach(function(subArrNotes) {
            if (subArrNotes) {
                subArrNotes.forEach(function(note) {
                    setLocationName(note, arrLocations);
                });
            }
        });
    }
}

function setLocationName(obj, locationsList) {
    var id;
    var objLocationName;
    var addendums;
    if (obj) {
        if (obj.uid) { // set visit location name for note originated from VistA
            id = _.last(obj.uid.split(':'));
            objLocationName = _.findWhere(locationsList, {
                id: id
            });
            if (!_.isUndefined(objLocationName)) {
                obj.visitLocationName = objLocationName.visitLocationName;
            }
        }
        if (obj.addenda) {
            addendums = obj.addenda;
            addendums.forEach(function(addenda) { // set visit location name for addendums
                if (addenda.app === 'ehmp') {
                    if (obj.visitLocationName) {
                        addenda.visitLocationName = obj.visitLocationName;
                    }
                } else if (addenda.uid) {
                    id = _.last(addenda.uid.split(':'));
                    objLocationName = _.findWhere(locationsList, {
                        id: id
                    });
                    if (!_.isUndefined(objLocationName)) {
                        addenda.visitLocationName = objLocationName.visitLocationName;
                    }
                }
            });
        }
    }
}

function getNoteUidAssociatedtoConsultUid(req, res) {
    var consultUid = req.body.consultUid || req.query.consultUid;
    if (!consultUid) {
        return res.rdkSend({
            data: {
                noteClinicalObjectUid: ''
            }
        });
    }

    clincialObjectsSubsystem.read(req.logger, req.app.config, consultUid, true, function(err, response) {
        if (err) {
            req.logger.error('getNoteUidAssociatedtoConsultUid error:', err);
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        }

        var noteClinicalObjectUid = _.get(response, 'data.completion.noteClinicalObjectUid') || '';

        return res.rdkSend({
            data: {
                noteClinicalObjectUid: noteClinicalObjectUid
            }
        });
    });
}

module.exports.getResourceConfig = getResourceConfig;
module.exports.getAddendaFromPjds = getAddendaFromPjds;
module.exports._createModelForUnsignedAddendum = createModelForUnsignedAddendum;
module.exports.customAddendumDateSort = customAddendumDateSort;

// for unit testing
module.exports._customDateSort = customDateSort;
module.exports._getCurrentUserId = getCurrentUserUid;
module.exports._getDocumentDefUidUnique = getDocumentDefUidUnique;
module.exports._wrapItems = wrapItems;
module.exports._getDocumentsFromPjds = getDocumentsFromPjds;
module.exports._createModelForDocumentAddendum = createModelForDocumentAddendum;
module.exports._extractAddenda = extractAddenda;
