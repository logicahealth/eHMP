'use strict';

var _ = require('lodash');
var dd = require('drilldown');

function validateInput(logger, model, errors) {
    if (!_.isArray(errors)) {
        return false;
    }

    if (_.isUndefined(model)) {
        errors.push('Missing model');
        return;
    }

    if (_.isUndefined(model.encounterPatientDFN)) {
        errors.push('Missing encounterPatientDFN');
    }

    if (_.isUndefined(model.encounterServiceCategory)) {
        errors.push('Missing encounter service category');
    }

    if (_.isUndefined(model.encounterDateTime)) {
        errors.push('Missing visit date');
    }

    if (_.isUndefined(model.immunizationIEN)) {
        errors.push('Missing immunizationIEN');
    }

    if (_.isUndefined(model.encounterLocation)) {
        errors.push('Missing encounter location');
    }
}

function add (writebackContext, callback) {
    var errors = [];
    var model = writebackContext.model;
    // dfn is now part of the interceptor results...
    model.encounterPatientDFN = dd(writebackContext)('interceptorResults')('patientIdentifiers')('dfn').val;

    validateInput(writebackContext.logger, model, errors);

    var retVal = _.size(errors) === 0 ? null : errors;
    return setImmediate(callback, retVal);
}

module.exports._validateInput = validateInput;
module.exports.add = add;
