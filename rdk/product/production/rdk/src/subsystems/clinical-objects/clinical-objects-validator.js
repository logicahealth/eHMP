'use strict';

var _ = require('lodash');
var validateOrder = require('./clinical-objects-validator-order');
var validateNote = require('./clinical-objects-validator-note');
var validateActivity = require('./clinical-objects-validator-activity');
var validateObservation = require('./clinical-objects-validator-observation');
var uidUtils = require('../../utils/uid-utils');

module.exports.validateCreate = validateCreate;
module.exports.validateRead = validateRead;
module.exports.validateUpdate = validateUpdate;
module.exports.validateFind = validateFind;
module.exports.validateGetClinicalObjectList = validateGetClinicalObjectList;

var UTC_STANDARD = module.exports.UTC_STANDARD = 'YYYYMMDDHHmmss+0000';

function validateCreate(errorMessages, model, appConfig, next) {
    validateCreateModel(errorMessages, model, appConfig, next);
}

function validateRead(errorMessages, uid) {
    validateUid(errorMessages, uid);
}

function validateUpdate(errorMessages, uid, model, appConfig, next) {
    validateUid(errorMessages, uid);
    validateUpdateModel(errorMessages, model, appConfig, next);
}

function validateCreateModel(errorMessages, model, appConfig, next) {
    validateGeneralCreateModel(errorMessages, model, appConfig, next);
}

function validateUpdateModel(errorMessages, model, appConfig, next) {
    validateGeneralUpdateModel(errorMessages, model, appConfig, next);
}

function validateFind(errorMessages, model) {
    var queryFields = ['patientUid', 'authorUid', 'domain', 'subDomain', 'ehmpState', 'referenceId', 'visit.location', 'visit.serviceCategory', 'visit.dateTime'];
    var queryList = [];

    _.each(queryFields, function(fieldName) {
        if (!_.isEmpty(getValue(model, fieldName))) {
            queryList.push(fieldName);
        }
    });

    if (_.isEmpty(queryList)) {
        errorMessages.push('At least one of the fields (patientUid, authorUid, domain, subDomain, ehmpState, visit.location, visit.serviceCategory, visit.dateTime) must present to find Clinical Object');
    }
}

function validateGetClinicalObjectList(errorMessages, uidList) {
    _.each(uidList, function(uid){
        validateUid(errorMessages, uid);
    });
}

var modelDomainValidators = {
    // domain- and subdomain-specific validation functions
    // keys must correspond to the output of detectDomain
    'ehmp-note': validateNote.validateCreateModel,
    'ehmp-order': validateOrder.validateModel,
    'ehmp-activity': validateActivity.validateCreateModel,
    'ehmp-observation': validateObservation.validateCreateModel,
    invalid: handleInvalidDomain
};

function validateGeneralCreateModel(errorMessages, model, appConfig, next) {
    // Run checks that every clinical object needs
    if (model.uid) {
        errorMessages.push('model uid cannot be set during create');
    }
    var requiredFields = ['patientUid', 'authorUid', 'domain', 'subDomain', 'visit', 'visit.dateTime', 'ehmpState'];
    validateGeneralCreateUpdateModel(errorMessages, model, requiredFields, appConfig, next);
}

function validateGeneralUpdateModel(errorMessages, model, appConfig, next) {
    var requiredFields = ['uid', 'patientUid', 'authorUid', 'domain', 'subDomain', 'visit', 'visit.dateTime', 'ehmpState'];
    validateGeneralCreateUpdateModel(errorMessages, model, requiredFields, appConfig, next);
}

function validateGeneralCreateUpdateModel(errorMessages, model, requiredFields, appConfig, next) {
    if (!_.isObject(model)) {
        errorMessages.push('model is not an object');
        next(errorMessages);
        return;
    }

    validateRequiredFields(requiredFields, model, errorMessages);

    if (model.patientUid) {
        validatePatientUid(errorMessages, model.patientUid);
    }

    var domain = detectDomain(model);
    var subDomain = model.subDomain || 'invalid';
    if (domain === 'ehmp-activity' && subDomain.toLowerCase() === 'laboratory') {
        domain = 'ehmp-order';
    }

    var domainValidator = _.get(modelDomainValidators, domain, handleInvalidDomain);
    domainValidator(errorMessages, model, appConfig, next);
}

function validateRequiredFields(requiredFields, model, errorMessages) {
    _.each(requiredFields, function(fieldName) {
        if (!_.has(model, fieldName)) {
            errorMessages.push('model does not contain ' + fieldName + ' field');
        }
        if (_.isEmpty(getValue(model, fieldName))) {
            errorMessages.push(fieldName + ' cannot be empty');
        }
    });
}

function getValue(model, key) {
    return key.split('.').reduce(function(object, field) {
        return _.isEmpty(object) ? object : object[field];
    }, model);
}

function detectDomain(body) {
    return body.domain || 'invalid';
}

function handleInvalidDomain(errorMessages, model, appConfig, next) {
    errorMessages.push('invalid domain');
    next(errorMessages);
}

function validateUid(errorMessages, uid) {
    if (!uid) {
        errorMessages.push('uid not found');
        return;
    }

    var uidRegex = /^urn:va:.*?:\w{8}-\w{4}-4\w{3}-\w{4}-\w{12}$/;

    if (uidUtils.isValidUidFormat(uid).error || !uidRegex.test(uid)) {
        errorMessages.push('model uid field is invalid');
    }
}

function validatePatientUid(errorMessages, patientUid) {
    if (!patientUid) {
        errorMessages.push('patientUid not found');
        return;
    }

    if (uidUtils.isValidUidFormat(patientUid).error) {
        errorMessages.push('model patientUid field is invalid');
    }
}
