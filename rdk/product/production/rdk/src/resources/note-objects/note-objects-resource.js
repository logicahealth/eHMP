'use strict';

var _ = require('lodash');
var async = require('async');
var rdk = require('../../core/rdk');
var clincialObjectsSubsystem = require('../../subsystems/clinical-objects/clinical-objects-subsystem');
var httpUtil = rdk.utils.http;
var UidUtil = require('../../utils/uid-utils');
var madlibStringGenerator = require('./note-objects-madlib-generator');
var moment = require('moment');
var description = {
    get: 'Get note objects for an author for a given visit'
};

module.exports.getNoteObjects = getNoteObjects;
module.exports.generateNoteObjectString = generateNoteObjectString;

module.exports.getResourceConfig = function(app) {
    return [{
        name: 'notes-objects-get',
        path: '',
        get: getNoteObjects,
        description: description,
        subsystems: ['patientrecord', 'jds', 'solr', 'jdsSync', 'authorization'],
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['sign-note'],
        isPatientCentric: true
    }];
};

/**
 * Retrieves a list of note objects. Note objects will have the madlib, note
 * object string, and problem text generated. For each note object, the source
 * clinical object and active problem is retrieved.
 *
 * @param {object} req The node request object
 * @param {object} res The node response object
 */
function getNoteObjects(req, res) {
    if (!req.query.visitLocation) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing visitLocation parameter');
    } else if (!req.query.visitDateTime) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing visitDateTime parameter');
    } else if (!req.query.visitServiceCategory) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing visitServiceCategory parameter');
    }

    var noteObjectResponse = {
        data: {
            items: []
        }
    };

    var site = req.session.user.site;
    var user = req.session.user.duz[site];
    var authorUid = 'urn:va:user:' + site + ':' + user;
    var logger = req.logger;
    var appConfig = req.app.config;
    var patientIdentifiers = _.get(req, 'interceptorResults.patientIdentifiers', {});
    var patientUids = _.get(patientIdentifiers, 'uids', []);
    var patientUid;
    if (_.isUndefined(patientIdentifiers.dfn) || _.isUndefined(patientIdentifiers.site)) {
        logger.debug('getNoteObjects - Patient dfn not found on interceptor results');
        return res.status(rdk.httpstatus.precondition_failed).rdkSend('Patient identifiers not found on interceptor results');
    }
    if (_.isEmpty(patientUids)) {
        logger.debug('getNoteObjects - Patient uids not found on interceptor results');
        return res.status(rdk.httpstatus.precondition_failed).rdkSend('Patient uids not found on interceptor results');
    }
    patientUid = UidUtil.getSiteDfnUidFromUidArray(req);
    if (_.isUndefined(patientUid)) {
        logger.debug('getNoteObjects - Patient uid not found in interceptor results uids array');
        return res.status(rdk.httpstatus.precondition_failed).rdkSend('Patient uid not found in interceptor results uids array');
    }

    var clinicalObjFilter = {
        'patientUid': patientUid,
        'authorUid': authorUid,
        'domain': 'ehmp-note',
        'subDomain': 'noteObject',
        'ehmpState': 'active',
        'visit': {
            'dateTime': moment(req.query.visitDateTime, 'YYYYMMDDHHmmss').format('YYYYMMDDHHmmss'), //visitDateTime may or may not have seconds
            'location': req.query.visitLocation,
            'serviceCategory': req.query.visitServiceCategory
        }
    };

    clincialObjectsSubsystem.find(logger, appConfig, clinicalObjFilter, false, function(err, response) {
        logger.info('getNoteObjects response', response);

        if (err) {
            logger.warn({
                noteObjectError: err
            }, 'Error reading note objects from pJDS');

            logger.warn('Failed to read the note objects from JDS.');
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        }

        var noteObjects = response.items;

        if (!noteObjects) {
            return res.rdkSend(noteObjectResponse);
        }

        async.each(noteObjects, _.bind(iterateNoteObjects, null, logger, appConfig, req), function(error) {
            if (error) {
                req.logger.error(error);
                return res.status(rdk.httpstatus.internal_server_error).rdkSend(error.toString());
            }

            noteObjectResponse.data.items = noteObjects;
            return res.rdkSend(noteObjectResponse);
        });
    });
}

function iterateNoteObjects(logger, appConfig, req, noteObject, callback) {
    async.parallel([
        _.bind(generateMadlib, null, noteObject, logger, appConfig),
        _.bind(retrieveActiveProblem, null, noteObject, req)
    ], function(err, results) {
        if (err) {
            return callback(err);
        }

        generateNoteObjectString(noteObject);
        delete noteObject.data.problem;
        return callback();
    });
}

//Retrives the source clinical object and generates the madlib text
function generateMadlib(noteObject, logger, appConfig, callback) {
    var uid = noteObject.data.sourceUid;
    clincialObjectsSubsystem.read(logger, appConfig, uid, true, function(errorMessages, sourceClinicalObject) {
        if (!_.isEmpty(errorMessages)) {
            return callback(errorMessages);
        }

        var errors = [];
        madlibStringGenerator.generateMadlibString(errors, noteObject, sourceClinicalObject, appConfig);

        if (!_.isEmpty(errors)) {
            return callback(errors);
        }

        return callback();
    });
}

//Fetches the active problem using the problem UID
function retrieveActiveProblem(noteObject, req, callback) {
    var uid = noteObject.data.problemRelationship;

    if (!uid) {
        return setImmediate(callback);
    }

    var path = '/vpr/uid/' + uid;
    var options = _.extend({}, req.app.config.jdsServer, {
        url: path,
        logger: req.logger,
        json: true
    });

    httpUtil.get(options, function(err, response, body) {
        if (err) {
            req.logger.error(err);
            return callback(err);
        }

        var problem = _.get(body, 'data.items[0]');

        if (problem) {
            noteObject.data.problem = problem;
            return callback();
        }

        return callback('There was an error processing your request. The error has been logged.');
    });
}

/**
 * Generates the problem text and the note object string representation
 *
 * @param {object} noteObject The noteObject to be parsed and updated
 */
function generateNoteObjectString(noteObject) {
    // Protect against bad data
    if (!_.isObject(noteObject)) {
        return 'note-objects-resource.js::generateNoteObject has malformed noteObject argument';
    }
    if (_.isEmpty(noteObject.data)) {
        return 'note-objects-resource.js::generateNoteObject has invalid "data" subfield (subfield is empty)';
    }

    // Simplify
    var data = noteObject.data;
    var problem = data.problem;
    var noteObjectString = '';

    // Remove old codes (snomed/i9) and use problem.problemText instead
    if (!_.isEmpty(problem) && !_.isEmpty(problem.problemText)) {
        var icd9Index = problem.problemText.indexOf('(ICD-9');
        if (icd9Index > 0) {
            problem.problemText = problem.problemText.substring(0, icd9Index).trim();
        }
        var sctIndex = problem.problemText.indexOf('(SCT');
        if (sctIndex > 0) {
            problem.problemText = problem.problemText.substring(0, sctIndex).trim();
        }
        noteObjectString += problem.problemText;
        noteObject.data.problemText = problem.problemText;
    }

    // Append extras
    if (noteObjectString !== '' && data.madlib) {
        noteObjectString += '\n';
    }
    noteObjectString += data.madlib || '';
    if (noteObjectString !== '' && data.annotation) {
        noteObjectString += '\n';
    }
    if (data.annotation) {
        noteObjectString += data.annotation;
    }

    // Mutate the argument
    noteObject.data.noteObjectString = noteObjectString;
}
