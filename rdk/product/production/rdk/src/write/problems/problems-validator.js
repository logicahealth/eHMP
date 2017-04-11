'use strict';

var _ = require('lodash');
var dd = require('drilldown');

function validateAddInput(logger, model, errors) {
    if (!_.isArray(errors)) {
        errors = [];
    }

    if (_.isUndefined(model)) {
        errors.push('Missing model');
        return;
    }

    if (_.isUndefined(model.patientIEN)) {
        errors.push('patient IEN is missing');
    }

    if (_.isUndefined(model.patientName)) {
        errors.push('patient Name is missing');
    }

    if (_.isUndefined(model.problemText) && !_.isUndefined(model.newTermText)) {
        errors.push('problem text is missing');
    }

    if (_.isUndefined(model.dateOfOnset)) {
        errors.push('date Of Onset is missing');
    }

    if (_.isUndefined(model.problemName)) {
        errors.push('problem name is missing');
    }

    if (_.isUndefined(model.responsibleProviderIEN)) {
        errors.push('provider IEN is missing');
    }

    if (_.isUndefined(model.status)) {
        errors.push('status is missing');
    }
}

function add(writebackContext, callback) {
    var errors = [];
    var model = writebackContext.model;

    validateAddInput(writebackContext.logger, model, errors);

    var retVal = _.size(errors) === 0 ? null : errors;
    return setImmediate(callback, retVal);
}

module.exports._validateAddInput = validateAddInput;
module.exports.add = add;
