'use strict';

var moment = require('moment');
var dd = require('drilldown');
var async = require('async');
var httpUtil = require('../../core/rdk').utils.http;
var _ = require('lodash');
var querystring = require('querystring');
var auditUtil = require('../../utils/audit');
var clinicalObjUtil = require('../../subsystems/clinical-objects/clinical-objects-wrapper-note');
var clinicalObjSubsystem = require('../../subsystems/clinical-objects/clinical-objects-subsystem');

module.exports.create = function(writebackContext, callback) {
    var logger = writebackContext.logger;
    var appConfig = writebackContext.appConfig;

    var model = writebackContext.model;
    model.entered = moment().format('YYYYMMDDHHmmss');
    model.status = 'UNSIGNED';

    var errors = [];
    var clinicalObj = clinicalObjUtil.wrapCreateNote(errors, writebackContext);

    if (!_.isEmpty(errors) || !clinicalObj) {
        logger.error(errors, 'Failed to wrap the note into a clinical object.');
        return callback(errors);
    }

    clinicalObjSubsystem.create(logger, appConfig, clinicalObj, function(err, response) {
        logger.info('note create response', response);
        var msg = '';
        if (err) {
            logger.warn({
                unsignedNoteWriteError: err
            }, 'Error calling the pJDS clinicalObj writeback endpoint');
            writebackContext.vprResponse = {
                error: 'Error calling the pJDS clinicalObj writeback endpoint'
            };

            writebackContext.resourceId = model.localId;
            logger.warn('Failed to write note to pJDS.');
            return callback(err);
        }
        var location = dd(response)('headers')('location').val;
        if (!location) {
            msg = 'Clinical object create did not return the location.';
            logger.error(msg, response);
            return callback(msg);
        }
        var uid = location.substring(location.indexOf('urn:va:ehmp'));

        if (!uid || uid === location) {
            msg = 'Failed to extract the uid from clinical object create response.';
            logger.error(msg, response);
            return callback(msg);
        }

        writebackContext.model.uid = uid;

        writebackContext.vprResponse = {
            notes: writebackContext.model
        };
        return callback(null);
    });
};

module.exports.update = function(writebackContext, callback) {
    var logger = writebackContext.logger;
    var model = writebackContext.model;
    model.updated = moment().format();

    var appConfig = writebackContext.appConfig;
    var errors = [];
    var clinicalObj = clinicalObjUtil.wrapUpdateNote(errors, writebackContext.model);

    if (!_.isEmpty(errors) || !clinicalObj) {
        logger.error(errors, 'Failed to wrap the note into a clinical object.');
        return callback(errors);
    }

    clinicalObjSubsystem.update(logger, appConfig, clinicalObj.uid, clinicalObj, function(err, response) {
        if (err) {
            logger.warn({
                unsignedNoteWriteError: err
            }, 'Error calling the pJDS clinicalObj update endpoint');
            writebackContext.vprResponse = {
                error: 'Error calling the pJDS clinicalObj update endpoint'
            };

            logger.warn('Failed to update clinicalObj in pJDS.');
            return callback(err);
        }
        writebackContext.vprResponse = {
            notes: writebackContext.model
        };
        return callback(null);
    });
};

/*
 * This function is needed for deleting, creating, and signing a note.
 * On create we need it in order to correctly update the note to tie a
 *     process instance id to it.
 * On delete we only receive the uid from the client, so we need
 *      to get the entire note for deleting the associated process.
 */
module.exports.getNote = function(writebackContext, callback) {
    // TODO: refactor to allow multi-sign
    var uid = writebackContext.model.uid ? writebackContext.model.uid : writebackContext.signedNotes[0].clinicalObject.uid;
    var logger = writebackContext.logger;
    var appConfig = writebackContext.appConfig;

    clinicalObjSubsystem.read(logger, appConfig, uid, false, function(err, response) {
        if (err) {
            logger.warn({
                unsignedNoteWriteError: err
            }, 'Error calling the JDS notes read endpoint');

            logger.warn('Failed to read the note from JDS.');
            return callback(err);
        }
        var errors = [];
        var model = clinicalObjUtil.returnClinicialObjectData(errors, [response])[0];
        if (!_.isEmpty(errors) || !model) {
            return callback({
                error: 'Could not find a unique note to delete.',
                results: errors
            });
        }
        writebackContext.model = model;
        return callback(null);
    });
};

/*
 *  This is more of an update. The 'data' field is set to null
 *  and the ehmpState is set to 'deleted'
 */
function deleteNote(writebackContext, uid, callback) {
    var logger = writebackContext.logger;
    var appConfig = writebackContext.appConfig;
    uid = uid || writebackContext.model.uid;
    var errors = [];
    var clinicalObj = clinicalObjUtil.wrapUpdateNote(errors, writebackContext.model);

    if (!_.isEmpty(errors) || !clinicalObj) {
        logger.error(errors, 'Failed to wrap the note into a clinical object.');
        return callback(errors);
    }

    clinicalObj.data = null;
    clinicalObj.ehmpState = 'deleted';

    clinicalObjSubsystem.update(logger, appConfig, uid, clinicalObj, function(err, response) {
        if (err) {
            logger.warn({
                unsignedNoteWriteError: err
            }, 'Error calling the pJDS clinicalObj delete endpoint');

            logger.warn('Failed to delete note in pJDS.');
            writebackContext.vprResponse = {
                error: err,
                response: response
            };
            return callback(err);
        }
        return callback(null);
    });
}

module.exports.delete = function(writebackContext, callback) {
    deleteNote(writebackContext, writebackContext.model.uid, function(error, response) {
        if (error) {
            return callback(error);
        }
        writebackContext.vprResponse = {
            'delete': true
        };
        return callback(null);
    });
};

module.exports.signNotes = function(writebackContext, callback) {

    writebackContext.notes = [];
    writebackContext.vprResponse.failures = {};
    var logger = writebackContext.logger;
    var errorObject = {
        error: 'Failed to sign these notes in pJDS - did not attempt to sign in VistA.',
        notes: []
    };
    async.each(writebackContext.signedNotes, function(note, cb) {
        signNote(writebackContext, note, function(err, response) {
            if (err) {
                errorObject.notes.push({
                    uid: note.uid,
                    error: err,
                    response: response
                });
            } else {
                writebackContext.notes.push(note);
            }
            cb();
        });
    }, function(err) {
        if (err) {
            logger.error('Something went wrong', err);
        } else {
            if (errorObject.notes.length > 0) {
                if (writebackContext.notes.length === 0) {
                    errorObject.error = 'Failed to sign any of the notes in pJDS. Did not attempt to sign in VistA.';
                    return callback(errorObject);
                }
                writebackContext.vprResponseStatus = 207;
                writebackContext.vprResponse.failures['pJDS failures'] = errorObject;
            }
            return callback(null);
        }
    });
};

var signNote = function(writebackContext, note, cb) {
    var logger = writebackContext.logger;
    var appConfig = writebackContext.appConfig;

    var errors = [];
    var clinicalObj = clinicalObjUtil.wrapUpdateNote(errors, note);

    if (!_.isEmpty(errors) || !clinicalObj) {
        logger.error(errors, 'Failed to wrap the note into a clinical object.');
        return cb(errors);
    }
    clinicalObj.data = null;
    clinicalObj.ehmpState = 'active';
    clinicalObj.referenceId = note.uid;

    clinicalObjSubsystem.update(logger, appConfig, clinicalObj.uid, clinicalObj, function(err, response) {
        if (err) {
            logger.warn({
                unsignedNoteWriteError: err
            }, 'Error calling the JDS notes update endpoint');

            logger.warn('Failed to update note in JDS.');
            return cb(err, response);
        }
        return cb(null);
    });
};