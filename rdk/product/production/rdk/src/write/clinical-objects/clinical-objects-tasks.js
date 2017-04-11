'use strict';

var _ = require('lodash');
var clinicalObjectSubsystem = require('../../subsystems/clinical-objects/clinical-objects-subsystem');

module.exports.create = function(writebackContext, callback) {
    var logger = writebackContext.logger;
    var pid = writebackContext.pid;
    var body = writebackContext.model;
    var appConfig = writebackContext.appConfig;

    var errorMessages = [];
    validatePatientIdentifier(errorMessages, pid, body);
    if (!_.isEmpty(errorMessages)) {
        logger.info({validationErrors: errorMessages}, 'clinical-objects-tasks create');
        return callback(errorMessages);
    }

    return clinicalObjectSubsystem.create(logger, appConfig, body, function(err, response) {
        if (err) {
            return callback(err);
        }
        writebackContext.vprResponse = response;
        return callback(null);
    });
};

module.exports.read = function(writebackContext, callback) {
    var logger = writebackContext.logger;
    var uid = writebackContext.resourceId;
    var appConfig = writebackContext.appConfig;
    var loadReference = writebackContext.loadReference;
    return clinicalObjectSubsystem.read(logger, appConfig, uid, loadReference, function(err, response) {
        if (err) {
            return callback(err);
        }
        writebackContext.vprResponse = response;
        return callback(null);
    });
};

module.exports.update = function(writebackContext, callback) {
    var logger = writebackContext.logger;
    var uid = writebackContext.resourceId;
    var pid = writebackContext.pid;
    var body = writebackContext.model;
    var appConfig = writebackContext.appConfig;

    var errorMessages = [];
    validatePatientIdentifier(errorMessages, pid, body);
    if (!_.isEmpty(errorMessages)) {
        logger.info({validationErrors: errorMessages}, 'clinical-objects-tasks create');
        return callback(errorMessages);
    }

    return clinicalObjectSubsystem.update(logger, appConfig, uid, body, function(err, response) {
        if (err) {
            return callback(err);
        }
        writebackContext.vprResponse = response;
        return callback(null);
    });
};

module.exports.delete = function(writebackContext, callback) {
    var logger = writebackContext.logger;
    var uid = writebackContext.resourceId;
    var appConfig = writebackContext.appConfig;

    return clinicalObjectSubsystem.delete(logger, appConfig, uid, function(err, response) {
        if (err) {
            return callback(err);
        }
        writebackContext.vprResponse = response;
        return callback(null);
    });
};

module.exports.find = function(writebackContext, callback) {
    var logger = writebackContext.logger;
    var model = writebackContext.model;
    var appConfig = writebackContext.appConfig;
    var loadReference = writebackContext.loadReference;

    return clinicalObjectSubsystem.find(logger, appConfig, model, loadReference, function(err, response) {
        if (err) {
            return callback(err);
        }
        writebackContext.vprResponse = response;
        callback(null, response);
    });
};

module.exports.getList = function(writebackContext, callback) {
    var logger = writebackContext.logger;
    var appConfig = writebackContext.appConfig;
    var uidList = writebackContext.uidList;
    var loadReference = writebackContext.loadReference;

    return clinicalObjectSubsystem.getList(logger, appConfig, uidList, loadReference, function(err, response){
        if (err) {
            return callback(err);
        }
        writebackContext.vprResponse = response;
        return callback(null);
    });
};

function validatePatientIdentifier(errorMessages, pid, model) {
    if (!_.isObject(model)) {
        errorMessages.push('model is not an object');
    }
    if (!pid) {
        errorMessages.push('pid not found');
    }
    if (!model.patientUid) {
        errorMessages.push('model does not contain pid field');
    }
    if (pid !== model.patientUid) {
        errorMessages.push('path pid does not equal model pid');
    }
}
