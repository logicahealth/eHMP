'use strict';
var _ = require('lodash');

var clinicalObjectSubsystem = require('../../subsystems/clinical-objects/clinical-objects-subsystem');

function addImmunization(writebackContext, callback) {
    // only do this for VA administered immunizations.

    if (writebackContext.encounterServiceCategory === 'E') {
        return process.nextTick(callback);
    }

    clinicalObjectSubsystem.create(writebackContext.logger, writebackContext.appConfig, writebackContext.model, function(err, result) {
        if (err) {
            writebackContext.vprResponse = null;
            writebackContext.vprModel = null;
            return callback(err);
        }

        if (_.isEmpty(result)) {
            writebackContext.model = null;
            writebackContext.vprResponse = null;
            return callback(result);
        }

        var referenceId = _.get(result, 'headers.location') || '';
        referenceId = referenceId.substring(referenceId.indexOf('urn:va:ehmp'));
        if (_.isEmpty(referenceId)) {
            writebackContext.vprResponse = null;
            writebackContext.vprModel = null;
            return callback('Missing referenceId received');
        }


        if (_.isEmpty(referenceId)) {
            writebackContext.vprResponse = null;
            writebackContext.vprModel = null;
            return callback('Malformed referenceId received');
        }

        writebackContext.model.referenceId = null;
        writebackContext.model.domain = 'ehmp-note';
        writebackContext.model.subDomain = 'noteObject';
        writebackContext.model.data = {};
        writebackContext.model.data.sourceUid = referenceId;
        writebackContext.model.data.madlib = null;
        writebackContext.vprResponse = _.set(writebackContext.vprResponse, 'immunizationnNoteReferenceId', referenceId);

        return callback(null);
    });
}

function addImmunizationNote(writebackContext, callback) {
    // only do this for VA administered immunizations.

    if (writebackContext.encounterServiceCategory === 'E') {
        return process.nextTick(callback);
    }

    clinicalObjectSubsystem.create(writebackContext.logger, writebackContext.appConfig, writebackContext.model, function(err, result) {
        if (err) {
            writebackContext.vprResponse = null;
            writebackContext.vprModel = null;
            return callback(err);
        }

        if (_.isEmpty(result)) {
            writebackContext.model = null;
            writebackContext.vprResponse = null;
            return callback(result);
        }

        writebackContext.logger.debug({lastVprResponse: writebackContext.vprResponse});

        var referenceId = _.get(result, 'headers.location') || '';
        referenceId = referenceId.substring(referenceId.indexOf('urn:va:ehmp'));
        if (_.isEmpty(referenceId)) {
            writebackContext.vprResponse = null;
            writebackContext.vprModel = null;
            return callback('Missing referenceId received');
        }

        writebackContext.vprResponse = _.set(writebackContext.vprResponse, 'noteObjectReferenceId', referenceId);

        return callback(null);
    });
}

module.exports.addImmunization = addImmunization;
module.exports.addImmunizationNote = addImmunizationNote;
