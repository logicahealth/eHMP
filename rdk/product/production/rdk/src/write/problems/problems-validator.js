'use strict';

var _ = require('lodash');

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

    //     this is really the code from the pick list, in RPC land
//     it is the (1)=GMPFLD(.01)="12474^410.90" ;CODE FROM LEXICON SEARCH ABOUT

//    {
//        "lexIen": "7044423",
//        "prefText": "Headache",
//        "code": "R69.",
//        "codeIen": "521774",
//        "codeSys": "SNOMED CT",
//        "conceptId": "25064002",
//        "desigId": "41990019",
//        "version": "ICD-10-CM"
//    }

    if (_.isUndefined(model.code)) {
        errors.push('code is missing');
    }

    if (_.isUndefined(model.lexiconCode)) {
        errors.push('lexiconCode is missing');
    }
}

function add(writebackContext, callback) {
    var errors = [];
    var model = writebackContext.model;

    validateAddInput(writebackContext.logger, model, errors);

    var retVal = _.size(errors) === 0 ? null : errors;
    return setImmediate(callback, retVal);
}

function validateUpdateInput(logger, model, errors) {
    if (!_.isArray(errors)) {
        errors = [];
    }

    if (_.isUndefined(model)) {
        errors.push('Missing model');
        return;
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

    if (_.isUndefined(model.code)) {
        errors.push('code is missing');
    }

    if (_.isUndefined(model.lexiconCode)) {
        errors.push('lexiconCode is missing');
    }
}

function update(writebackContext, callback) {
    var errors = [];
    var model = writebackContext.model;

    // dfn is now part of the interceptor results...
    model.dfn = writebackContext.pid;
    model.dfn = model.dfn.split(';');
    model.dfn = model.dfn[1];
    model.problemIEN = writebackContext.resourceId;
    model.enteredBy = writebackContext.duz[writebackContext.siteHash];

    validateUpdateInput(writebackContext.logger, model, errors);

    var retVal = _.size(errors) === 0 ? null : errors;
    return setImmediate(callback, retVal);
}

module.exports._validateAddInput = validateAddInput;
module.exports._validateUpdateInput = validateUpdateInput;

module.exports.update = update;
module.exports.add = add;
