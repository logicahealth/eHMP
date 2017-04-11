'use strict';

var async = require('async');
var _ = require('lodash');
var pjds = require('../../subsystems/clinical-objects/clinical-objects-subsystem');

/**
 * Find clinical object in pJDS.
 * If there is no clinical object, create new clinical object in pJDS.
 * Create Note Object in pJDS
 */
module.exports = function(writebackContext, callback) {
    var logger = writebackContext.logger;
    logger.debug('save-note-object');

    var model = writebackContext.model;
    if (model && model.referenceId) {
        async.waterfall([
            async.apply(findClinicalObject, writebackContext),
            getClinicalObjectUid,
            createNoteObject,
        ], function(err, result) {
            if (err) {
                return callback(err);
            }
            writebackContext.vprResponse = result;
            callback(null);
        });
    } else {
        logger.error('Missing input parameters');
        return callback('Missing input parameters');
    }
};

/**
 * task #1: Find Clinical Object in pJDS
 */
function findClinicalObject(writebackContext, callback) {
    var model = writebackContext.model;
    model.domain = 'ehmp-observation';
    model.subDomain = 'labResult';
    model.ehmpState = 'active';
    pjds.find(writebackContext.logger, writebackContext.appConfig, model, false, function(err, response) {
        if (err) {
            if (err[0] === pjds.CLINICAL_OBJECT_NOT_FOUND) {
                return callback(null, writebackContext, null);
            }
            return callback(err);
        }
        writebackContext.logger.debug({
            clinicalObject: response
        }, 'existing clinical object');
        if (response && response.items.length > 0) {
            return callback(null, writebackContext, response.items[0].uid);
        } else {
            return callback(null, writebackContext, null);
        }
    });
}

/**
 * task #2: Return clinical object UID
 * If clinical object was found in task #1, return the pjds clinical object UID.
 * Otherwise, create new clinical object in pJDS and return it's UID
 */
function getClinicalObjectUid(writebackContext, pjdsClinicalObjectUid, callback) {
    if (pjdsClinicalObjectUid) {
        return callback(null, writebackContext, pjdsClinicalObjectUid);
    } else {
        var clinicalObject = {};
        clinicalObject.patientUid = writebackContext.model.patientUid;
        clinicalObject.authorUid = writebackContext.model.authorUid;
        clinicalObject.domain = 'ehmp-observation';
        clinicalObject.subDomain = 'labResult';
        clinicalObject.visit = writebackContext.model.visit;
        clinicalObject.ehmpState = 'active';
        clinicalObject.referenceId = writebackContext.model.referenceId;
        pjds.create(writebackContext.logger, writebackContext.appConfig, clinicalObject, function(err, response) {
            if (err) {
                return callback(err);
            }
            writebackContext.logger.debug({
                clinicalObject: response
            }, 'new clinical object');
            var location = response.headers.location;
            var clinicalObjectUid = location.substring(location.indexOf('urn:va'), location.length);
            return callback(null, writebackContext, clinicalObjectUid);
        });
    }
}

/**
 * task #3: Create note object in pJDS.
 */
function createNoteObject(writebackContext, clinicalObjectUid, callback) {
    var noteObject = {};
    noteObject.patientUid = writebackContext.model.patientUid;
    noteObject.authorUid = writebackContext.model.authorUid;
    noteObject.domain = 'ehmp-note';
    noteObject.subDomain = 'noteObject';
    noteObject.visit = writebackContext.model.visit;
    noteObject.ehmpState = 'active';
    noteObject.referenceId = null;
    var noteObjectData = {};
    noteObjectData.sourceUid = clinicalObjectUid;
    noteObjectData.problemRelationship = '';
    noteObjectData.annotation = '';
    if (writebackContext.model.data) {
        if (writebackContext.model.data.problemRelationship) {
            noteObjectData.problemRelationship = writebackContext.model.data.problemRelationship;
        }
        if (writebackContext.model.data.annotation) {
            noteObjectData.annotation = writebackContext.model.data.annotation;
        }
        noteObjectData.madlib = writebackContext.model.data.madlib;
    }
    noteObject.data = noteObjectData;
    pjds.create(writebackContext.logger, writebackContext.appConfig, noteObject, function(err, response) {
        if (err) {
            return callback(err);
        }
        writebackContext.logger.debug({
            noteObject: response
        }, 'new note object');
        return callback(null, response.headers.location);
    });
}

module.exports._findClinicalObject = findClinicalObject;
module.exports._getClinicalObjectUid = getClinicalObjectUid;
module.exports._createNoteObject = createNoteObject;
