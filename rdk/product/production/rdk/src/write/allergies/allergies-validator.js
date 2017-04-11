'use strict';

var _ = require('lodash');
var dd = require('drilldown');
var filemanDateUtil = require('../../utils/fileman-date-converter');
var nullChecker = require('../../utils/nullchecker');
var paramUtil = require('../../utils/param-converter');
var allergyConstants = require('./constants');

function validateInput(logger, model, errors){
    if (! _.isArray(errors)) {
        return false;
    }

    if (_.isUndefined(model)) {
        errors.push('Missing model');
        return;
    }

    if (_.isUndefined(model.dfn)) {
        errors.push('patient dfn is missing');
    }

    if (_.isUndefined(model.eventDateTime)) {
        errors.push('eventDateTime is missing');
    }

    if (_.isUndefined(model.allergyName)) {
        errors.push('allergy name is missing');
    }

    if (nullChecker.isNullish(model.enteredBy)){
        errors.push('The enteredBy is missing');
    }

    if (_.isUndefined(model.natureOfReaction)) {
        errors.push('nature of reaction is missing');
    }

    if (_.isUndefined(model.historicalOrObserved)) {
        errors.push('historical or observed is missing');
    } else {
        if (model.historicalOrObserved !== allergyConstants.OBSERVED &&
            model.historicalOrObserved !== allergyConstants.HISTORICAL) {
            errors.push('historical or observed is not specified');
        }
    }

    if (!_.isUndefined(model.symptoms)) {
        if (! _.isArray(model.symptoms)) {
            errors.push('symptoms are not of type array');
        }else {
            _.each(model.symptoms, function (symptom, index) {

                if (_.isUndefined(symptom.name)) {
                    errors.push('Symptom name is missing for index"  ' + index);
                }

                if (_.isUndefined(symptom.IEN)) {
                    errors.push('Symptom IEN is missing for index"  ' + index);
                }

                if (!nullChecker.isNullish(symptom.dateTime)) {
                    var sympDT = paramUtil.convertWriteBackInputDate(symptom.dateTime);
                    if (filemanDateUtil.getFilemanDateTime(sympDT.toDate()) === -1) {
                        errors.push('Symptom date is incorrect');
                    }
                }
            });
        }
    }

    if (model.historicalOrObserved === allergyConstants.OBSERVED) {
        if (_.isUndefined(model.observedDate) || _.isUndefined(model.severity)) {
            errors.push('The observed allergy is missing the observed date or severity');
        } else {
            var observedDateTimeMoment = paramUtil.convertWriteBackInputDate(model.observedDate);
            var observedDate = filemanDateUtil.getFilemanDateWithArgAsStr(observedDateTimeMoment.format(paramUtil.WRITEBACK_INPUT_DATE_FORMAT));
            if (observedDate === -1 && model.observedDate.substring(6, 8) !== '00'){
                errors.push('ObservedDate (a.k.a. GMRARDT) is not a valid date: ' + model.observedDate);
            }
        }
    }
}

function create (writebackContext, callback) {
    var errors = [];
    var model = writebackContext.model;
    // dfn is now part of the interceptor results...
    model.dfn = dd(writebackContext)('interceptorResults')('patientIdentifiers')('dfn').val;

    validateInput(writebackContext.logger, model, errors);

    var retVal = _.size(errors) === 0 ? null : errors;
    return setImmediate(callback, retVal);
}

function enteredInError(writebackContext, callback) {
    var errors = [];
    var model = writebackContext.model;
    // dfn is now part of the interceptor results...
    model.dfn = dd(writebackContext)('interceptorResults')('patientIdentifiers')('dfn').val;
    model.ien = writebackContext.resourceId;
    model.enteredBy = writebackContext.duz[writebackContext.siteHash];

    validateEnteredInError(writebackContext.logger, model, errors);

    var retVal = _.size(errors) === 0 ? null : errors;
    return setImmediate(callback, retVal);
}

function validateEnteredInError(logger, model, errors){
    if (! _.isArray(errors)) {
        return false;
    }

    if (nullChecker.isNullish(model)) {
        errors.push('Missing message body');
        return false;
    }

    if (nullChecker.isNullish(model.ien)){
        errors.push('The allergy IEN is required');
    }

    if (nullChecker.isNullish(model.enteredBy)){
        errors.push('The enteredBy is missing');
    }

    // comments in the model are optional
    // no validation is needed
}

module.exports.create = create;
module.exports._validateInput = validateInput;

module.exports.enteredInError = enteredInError;
module.exports._validateEnteredInError = validateEnteredInError;

