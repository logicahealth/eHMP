'use strict';

var _ = require('lodash');
var clinicalObjectSubsystem = require('../../subsystems/clinical-objects/clinical-objects-subsystem');
var uidUtils = require('../../utils/uid-utils');

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
        if (isClinicalObjectNotFound(err)) {
            err = undefined;
            response = {};
        }
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

module.exports.find = function(writebackContext, callback) {
    var logger = writebackContext.logger;
    var model = writebackContext.model;
    var appConfig = writebackContext.appConfig;
    var loadReference = writebackContext.loadReference;

    return clinicalObjectSubsystem.find(logger, appConfig, model, loadReference, function(err, response) {
        if (isClinicalObjectNotFound(err)) {
            err = undefined;
            response = {};
        }
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
        if (isClinicalObjectNotFound(err)) {
            err = undefined;
            response = {};
        }
        if (err) {
            return callback(err);
        }
        writebackContext.vprResponse = response;
        return callback(null);
    });
};

function pidAndUidMatch(pid, uid) {
    var splitPid = pid.split(';');
    var splitUid = uid.split(':');

    var pidSite = splitPid[0];
    var uidSite = splitUid[3];

    var pidDfn = splitPid[1];
    var uidDfn = splitUid[4];

    return ((pidSite === uidSite) && (pidDfn === uidDfn));
}

function validatePatientIdentifier(errorMessages, pid, model) {
    if (!_.isObject(model)) {
        errorMessages.push('model is not an object');
    }
    if (!pid) {
        errorMessages.push('pid not found');
    }
    if (model && !model.patientUid) {
        errorMessages.push('model does not contain patientUid field');
    }

    //bail out of pid or patientUid is falsy
    if (!model || !pid || !model.patientUid) {
        return;
    }

    var uidSite = uidUtils.extractSiteFromUID(model.patientUid, ':');
    var uidLocalId = uidUtils.extractLocalIdFromUID(model.patientUid, ':');

    var isInvalid;

    //if patientUid site piece is ICN and pid starts with either VLER or HDR, just compare id values
    if (uidSite === 'ICN' &&
        (_.startsWith(pid, 'VLER') || _.startsWith(pid, 'HDR'))) {
        var icn = pid.substr(pid.lastIndexOf(';')+1);

        isInvalid = icn !== uidLocalId;
    }
    //otherwise compare pids
    else {
        var pidFromUid = uidSite + ";" + uidLocalId;

        isInvalid = pid !== pidFromUid;
    }

    if (isInvalid) {
        errorMessages.push('path pid does not correlate to patient represented by patientUid');
    }
}

function isClinicalObjectNotFound(err) {
    return (err && (err.length === 1) && (err[0] === clinicalObjectSubsystem.CLINICAL_OBJECT_NOT_FOUND)) ? true : false;
}
