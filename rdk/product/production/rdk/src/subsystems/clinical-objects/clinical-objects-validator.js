'use strict';

var _ = require('lodash');
var validateOrder = require('./clinical-objects-validator-order');
var validateNote = require('./clinical-objects-validator-note');

module.exports.validateCreate = validateCreate;
module.exports.validateRead = validateRead;
module.exports.validateUpdate = validateUpdate;
module.exports.validateDelete = validateDelete;
module.exports.validateFind = validateFind;
module.exports.validateGetClinicalObjectList = validateGetClinicalObjectList;

function validateCreate(errorMessages, model) {
    validateCreateModel(errorMessages, model);
}
function validateRead(errorMessages, uid) {
    validateUid(errorMessages, uid);
}
function validateUpdate(errorMessages, uid, model) {
    validateUpdateModel(errorMessages, model);
    validateUid(errorMessages, uid);
}
function validateDelete(errorMessages, uid) {
    validateUid(errorMessages, uid);
}

function validateCreateModel(errorMessages, model) {
    validateGeneralCreateModel(errorMessages, model);
}

function validateUpdateModel(errorMessages, model) {
    validateGeneralUpdateModel(errorMessages, model);
}

function validateFind(errorMessages, model) {
    var queryFields = ['patientUid', 'authorUid', 'domain', 'subDomain', 'ehmpState', 'displayName', 'referenceId', 'visit.location', 'visit.serviceCategory', 'visit.dateTime'];
    var queryList = [];

    _.each(queryFields, function(fieldName) {
        if (!_.isEmpty(getValue(model, fieldName))) {
            queryList.push(fieldName);
        }
    });

    if (_.isEmpty(queryList)) {
        errorMessages.push('At least one of the fields (patientUid, authorUid, domain, subDomain, ehmpState, displayName, visit.location, visit.serviceCategory, visit.dateTime) must present to find Clinical Object');
    }
}

function validateGetClinicalObjectList(errorMessages, uidList) {
    _.each(uidList, function(uid){
        validateUid(errorMessages, uid);
    });
}

var createModelDomainValidators = {
    // domain- and subdomain-specific validation functions
    // keys must correspond to the output of detectDomain
    note: validateNote.validateCreateModel,
    order: validateOrder.validateCreateModel,
    invalid: handleInvalidDomain
};

function validateGeneralCreateModel(errorMessages, model) {
    // Run checks that every clinical object needs
    if (model.uid) {
        errorMessages.push('model uid cannot be set during create');
    }
    var requiredFields = ['patientUid', 'authorUid', 'domain', 'subDomain', 'visit', 'visit.location', 'visit.serviceCategory', 'visit.dateTime', 'ehmpState'];
    validateGeneralCreateUpdateModel(errorMessages, model, requiredFields);
}

function validateGeneralUpdateModel(errorMessages, model) {
    var requiredFields = ['uid', 'patientUid', 'authorUid', 'domain', 'subDomain', 'visit', 'visit.location', 'visit.serviceCategory', 'visit.dateTime', 'ehmpState'];
    validateGeneralCreateUpdateModel(errorMessages, model, requiredFields);
}

function validateGeneralCreateUpdateModel(errorMessages, model, requiredFields) {
    if (!_.isObject(model)) {
        errorMessages.push('model is not an object');
        return;
    }
    var domain = detectDomain(model);
    var domainValidator = _.get(createModelDomainValidators, domain, handleInvalidDomain);
    domainValidator(errorMessages, model);

    validateRequiredFields(requiredFields, model, errorMessages);
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

function handleInvalidDomain(errorMessages) {
    errorMessages.push('invalid domain');
}

var updateModelDomainValidators = {
    // domain- and subdomain-specific validation functions
    // keys must correspond to the output of detectDomain
    note: validateNote.validateUpdateModel,
    order: validateOrder.validateUpdateModel,
    invalid: handleInvalidDomain
};

function validateUid(errorMessages, uid) {
    if (!uid) {
        errorMessages.push('uid not found');
        return;
    }
    var uidRegex = /^urn:va:ehmp:.*?:\w{8}-\w{4}-4\w{3}-\w{4}-\w{12}$/;
    if (!uidRegex.test(uid)) {
        errorMessages.push('model uid field is invalid');
    }

}
