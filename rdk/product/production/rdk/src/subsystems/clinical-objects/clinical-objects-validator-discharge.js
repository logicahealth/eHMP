'use strict';
var _ = require('lodash');

function validateModel(errorMessages, model, appConfig, callback) {
    if (!_.isObject(model)) {
        errorMessages.push('model is not an object');
        //unable to procede with further validation at this point
        return callback(errorMessages);
    }
    if (model.domain !== 'ehmp-activity') {
        errorMessages.push('Discharge FollowUp clinical object has the wrong domain');
        return callback(errorMessages);
    }

    if (!_.includes(['discharge'], model.subDomain)) {
        errorMessages.push('Discharge FollowUp clinical object invalid subDomain');
    }
    if (!_.isEmpty(model.referenceId)) {
        errorMessages.push('Discharge FollowUp clinical object should not have a referenceId');
    }
    errorMessages = errorMessages.concat(checkRequiredStrings(['displayName'], model, null));

    if (!_.isObject(model.data)) {
        errorMessages.push('Discharge FollowUp clinical object has no data object');
        return callback(errorMessages); //all further validations require data object
    }
    //data.activity should already have been validated by parent validator-activity

    //discharge validation
    var discharge = _.get(model, 'data.discharge');
    if (!_.isObject(discharge)) {
        errorMessages.push('Discharge FollowUp clinical object discharge section is not an object');
    } else {
        errorMessages = errorMessages.concat(validateDischarge(discharge));
    }

    //contact validation
    var contact = _.get(model, 'data.contact');
    if (!_.isObject(contact)) {
        errorMessages.push('Discharge FollowUp clinical object contact section is not an object');
    } else {
        errorMessages = errorMessages.concat(validateContact(contact));
    }

    //follow-up validation
    var followup = _.get(model, 'data.follow-up');
    if (!_.isArray(followup)) {
        errorMessages.push('Discharge FollowUp clinical object follow-up section is not an array');
    } else {
        errorMessages = errorMessages.concat(validateFollowUp(followup));
    }

    return callback(errorMessages);
}

function checkRequiredStrings(requiredStrings, testObject, testObjectName) {
    var errorMessages = [];
    _.each(requiredStrings, function(required) {
        var dischargeField = _.get(testObject, required);
        if (!_.isString(dischargeField)) {
            errorMessages.push('Discharge FollowUp clinical object' + (testObjectName ? ' ' + testObjectName : '') + ' has invalid ' + required + ' field type');
        } else {
            if (_.isEmpty(dischargeField)) {
                errorMessages.push('Discharge FollowUp clinical object' + (testObjectName ? ' ' + testObjectName : '') + ' has invalid ' + required + ' field content');
            }
        }
    });
    return errorMessages;
}

function validateDischarge(discharge) {
    var errorMessages = [];
    var requiredStrings = ['dateTime', 'admitDateTime', 'fromFacilityId', 'timeout'];
    errorMessages = errorMessages.concat(checkRequiredStrings(requiredStrings, discharge, 'discharge'));

    if (!_.isArray(discharge.diagnosis)) {
        errorMessages.push('Discharge FollowUp clinical object discharge has invalid diagnosis field type');
    } else {
        //diagnosis is not required but if it has contents they must be valid
        errorMessages = errorMessages.concat(validateDischargeDiagnosis(discharge.diagnosis));
    }

    return errorMessages;
}

//diagnosis guaranteed to be an array
function validateDischargeDiagnosis(diagnosisArr) {
    var errorMessages = [];

    if (_.size(diagnosisArr) > 0) {
        var requiredStrings = ['description'];
        _.each(diagnosisArr, function(diagnosis) {
            errorMessages = errorMessages.concat(checkRequiredStrings(requiredStrings, diagnosis, 'discharge.diagnosis'));
        });
    }

    return errorMessages;
}

function validateContact(contact) {
    var errorMessages = [];

    errorMessages = errorMessages.concat(checkRequiredStrings(['attempts', 'dueDateTime'], contact, 'contact'));

    return errorMessages;
}

//guaranteed to be an array
function validateFollowUp(followupArr) {
    var errorMessages = [];

    if (_.size(followupArr) > 0) {
        var requiredStrings = ['actionId', 'actionText', 'executionDateTime', 'executionUserId', 'executionUserName', 'attempt'];
        _.each(followupArr, function(followup) {
            errorMessages = errorMessages.concat(checkRequiredStrings(requiredStrings, followup, 'followup'));
            if (!_.isString(followup.comment)) {
                errorMessages.push('Discharge FollowUp clinical object followup has invalid comment field type');
            }
            if (!_.isObject(followup.visit)) {
                errorMessages.push('Discharge FollowUp clinical object followup has invalid visit field type');
            } else {
                errorMessages = errorMessages.concat(validateFollowupVisit(followup.visit));
            }
        });
    }

    return errorMessages;
}

//visit guaranteed to be an object
function validateFollowupVisit(visit) {
    var errorMessages = [];
    var requiredStrings = ['location', 'serviceCategory', 'dateTime'];
    errorMessages = errorMessages.concat(checkRequiredStrings(requiredStrings, visit, 'followup.visit'));

    return errorMessages;
}

module.exports.validateModel = validateModel;

//unit test exports
module.exports._validateDischarge = validateDischarge;
module.exports._validateDischargeDiagnosis = validateDischargeDiagnosis;
module.exports._validateContact = validateContact;
module.exports._validateFollowUp = validateFollowUp;
module.exports._validateFollowupVisit = validateFollowupVisit;
