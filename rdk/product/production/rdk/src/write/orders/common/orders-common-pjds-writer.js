'use strict';

var pjds = require('../../../subsystems/clinical-objects/clinical-objects-subsystem');

/**
 * Save order object to pJDS.
 * Set following in the clinical object before saving.
 *    ehmpState to 'active'
 *    referenceId to JDS URN Identifier
 *
 * After successful create of clinical object in pJDS, create a note object in pJDS.
 */
module.exports = function(writebackContext, pjdsResponse, callback) {
    var logger = writebackContext.logger;
    logger.debug('orders-common-pjds-writer');
    var clinicalObject = writebackContext.model.clinicalObject;
    var vprModel = writebackContext.vprModel;
    if (!clinicalObject || !vprModel) {
        logger.warn('No clinical object or VPR model defined, skipping clinical object subsystem call');
        return setImmediate(callback);
    }

    clinicalObject.ehmpState = 'active';
    clinicalObject.referenceId = vprModel.uid;

    if (!clinicalObject.uid) {
        pjds.create(logger, writebackContext.appConfig, clinicalObject, function(err, clinicalObjectResponse) {
            processClinicalObjectResponse(err, clinicalObjectResponse, clinicalObject, logger,
                writebackContext.appConfig, pjdsResponse, callback);
        });
    } else {
        pjds.update(logger, writebackContext.appConfig, clinicalObject.uid, clinicalObject, function(err, clinicalObjectResponse) {
            processClinicalObjectResponse(err, clinicalObjectResponse, clinicalObject, logger,
                writebackContext.appConfig, pjdsResponse, callback);
        });
    }
};

/**
 * Process clinical object response.  If the response was success, create & save a note object to pJDS.
 * Otherwise, return error message.
 */
function processClinicalObjectResponse(err, clinicalObjectResponse, clinicalObject, logger, appConfig, pjdsResponse, callback) {
    if (err) {
        logger.warn({
            pjdsWriterResponseError: err
        }, 'Error calling the clinical object subsystem endpoint');
        pjdsResponse.message = 'Error calling the clinical object subsystem endpoint';
        return callback();
    }
    logger.debug({clinicalObject: clinicalObjectResponse}, 'pJDS clinical object');

    if (!clinicalObjectResponse || !clinicalObjectResponse.headers || !clinicalObjectResponse.headers.location) {
        logger.warn({
            pjdsWriterResponseError: err
        }, 'Invalid response returned by the clinical object subsystem');
        pjdsResponse.message = 'Invalid response returned by the clinical object subsystem';
        return callback();
    } else {
       var location = clinicalObjectResponse.headers.location;
       var clinicalObjectUid = location.substring(location.indexOf('urn:va'), location.length);
        if (!clinicalObjectUid) {
            logger.warn({
                pjdsWriterResponseError: err
            }, 'No clinical object UID included in the clinical object response header location');
            pjdsResponse.message = 'No clinical object UID included in the clinical object response header location';
            return callback();
        } else {
            var noteObject = createNoteObject(clinicalObject, clinicalObjectUid);
            pjds.create(logger, appConfig, noteObject, function(err, noteObjectResponse) {
                if (err) {
                    logger.warn({
                        pjdsWriterResponseError: err
                    }, 'Error calling the clinical object subsystem endpoint');
                    pjdsResponse.message = 'Error calling the clinical object subsystem endpoint';
                }

                logger.debug({note: noteObjectResponse}, 'pJDS note object');
                return callback();
            });
        }
    }
}

/**
 * Create note object using some of clinical object data.
 */
function createNoteObject(clinicalObject, clinicalObjectUid) {
    var noteObject = {};
    noteObject.patientUid = clinicalObject.patientUid;
    noteObject.authorUid = clinicalObject.authorUid;
    noteObject.domain = 'ehmp-note';
    noteObject.subDomain = 'noteObject';
    noteObject.visit = clinicalObject.visit;
    noteObject.ehmpState = 'active';
    noteObject.referenceId = null;
    var noteObjectData = {};
    noteObjectData.sourceUid = clinicalObjectUid;
    noteObjectData.madlib = '';
    noteObjectData.problemRelationship = '';
    noteObjectData.annotation = '';
    if (clinicalObject.data) {
        if (clinicalObject.data.problemRelationship) {
            noteObjectData.problemRelationship = clinicalObject.data.problemRelationship;
        }
        if (clinicalObject.data.annotation) {
            noteObjectData.annotation = clinicalObject.data.annotation;
        }
    }
    noteObject.data = noteObjectData;
    return noteObject;
}

module.exports._createNoteObject = createNoteObject;
