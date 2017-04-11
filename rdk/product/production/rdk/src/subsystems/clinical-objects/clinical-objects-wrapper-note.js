'use strict';

var _ = require('lodash');

// Clinical Objects come in as arrays with wrappers - this removes and stores that overhead inside of each array object
// PRECONDITION: Only accepts arrays (DO NOT PASS IN A SINGLETON WITHOUT AN ARRAY WRAPPER)
module.exports.returnClinicialObjectData = function(errorMessages, clinicalObjects) {
    if (errorMessages === undefined || errorMessages === null) {
        errorMessages = []; // Protect against bad argument
    }

    if (clinicalObjects === undefined) {
        errorMessages.push('ERROR: ClinicalObject::returnClinicialObjectData() called with undefined clinicalObjects argument.');
        return;
    } else if (clinicalObjects === null) {
        errorMessages.push('ERROR: ClinicalObject::returnClinicialObjectData() called with null clinicalObjects argument.');
        return;
    }

    for (var n = 0; n < clinicalObjects.length; n++) {
        if (clinicalObjects[n].data === null || clinicalObjects[n].data === undefined) {
            clinicalObjects[n].data = {}; // Protect against malformed database data
        }
        var replacement = _.pick(clinicalObjects[n], 'data').data;
        if (!_.isEmpty(replacement)){
            replacement.uid = clinicalObjects[n].uid;
        }
        replacement.clinicalObject = _.omit(clinicalObjects[n], 'data');
        clinicalObjects[n] = replacement;
    }

    return clinicalObjects;
};

module.exports.wrapCreateNote = function(errorMessages, writebackContext) {
    if (!_.isArray(errorMessages) || !_.isEmpty(errorMessages)) {
        return 'Please pass in an empty array for error messages as the first argument.';
    }
    if (!writebackContext || _.isNull(writebackContext)) {
        errorMessages.push('writebackContext is empty');
        return null;
    }
    if (!writebackContext.model || _.isNull(writebackContext.model)) {
        errorMessages.push('writebackContext.model is empty');
        return null;
    }
    var model = writebackContext.model;
    var clinicalObject = {
        patientUid: writebackContext.pid || errorMessages.push('writebackContext does not contain "pid"'),
        authorUid: model.authorUid || errorMessages.push('writebackContext.model does not contain "authorUid"'),
        domain: 'note',
        subDomain: 'tiu',
        visit: {
            location: model.locationIEN || errorMessages.push('writebackContext.model does not contain "locationIEN"'),
            serviceCategory: model.encounterServiceCategory || errorMessages.push('writebackContext.model does not contain "encounterServiceCategory"'),
            dateTime: model.encounterDateTime || errorMessages.push('writebackContext.model does not contain "encounterDateTime"')
        },
        ehmpState: 'draft',
        data: model
    };
    return _.isEmpty(errorMessages) ? clinicalObject : null;
};

module.exports.wrapUpdateNote = function(errorMessages, model) {
    if (!_.isArray(errorMessages) || !_.isEmpty(errorMessages)) {
        return 'Please pass in an empty array for error messages as the first argument.';
    }
    if (!model || _.isNull(model)) {
        errorMessages.push('model is empty');
        return null;
    }
    if (!model.clinicalObject || _.isNull(model.clinicalObject)) {
        errorMessages.push('model.clinicalObject is empty');
        return null;
    }
    var clinicalObject = model.clinicalObject;
    clinicalObject.data = _.omit(model, 'clinicalObject');
    return clinicalObject;
};
