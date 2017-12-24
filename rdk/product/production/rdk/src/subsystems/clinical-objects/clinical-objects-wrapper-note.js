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
        if (!_.isEmpty(replacement)) {
            replacement.uid = clinicalObjects[n].uid;
        }
        replacement.clinicalObject = _.omit(clinicalObjects[n], 'data');
        clinicalObjects[n] = replacement;
    }

    return clinicalObjects;
};

module.exports.returnClinicalObjectAddenda = function(errorMessages, clinicalObjects) {
    if (!_.isArray(errorMessages)) {
        errorMessages = [];
    }

    if (clinicalObjects === undefined) {
        errorMessages.push('ERROR: ClinicalObject::returnClinicialObjectData() called with undefined clinicalObjects argument.');
        return;
    } else if (clinicalObjects === null) {
        errorMessages.push('ERROR: ClinicalObject::returnClinicialObjectData() called with null clinicalObjects argument.');
        return;
    }

    for (var n = 0; n < clinicalObjects.length; n++) {
        if (clinicalObjects[n].addendum === null || clinicalObjects[n].addendum === undefined) {
            clinicalObjects[n].addendum = {}; // Protect against malformed database data
        }
        var replacement = _.pick(clinicalObjects[n], 'addendum').addendum;
        if (!_.isEmpty(replacement)) {
            replacement.uid = clinicalObjects[n].uid;
        }
        replacement.clinicalObject = _.omit(clinicalObjects[n], 'addendum');
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

    /*  For a patient with a site identifier, the format is
        "urn:va:patient:[site]:[dfn]:[dfn]” (e.g. "urn:va:patient:SITE:3:3")
        For a patient with only an ICN identifier the format is
        "urn:va:patient:VLER:[icn-value]:[icn-value]” (e.g. "urn:va:patient:VLER:45679V45679:45679V45679")
    */
    var dfn = writebackContext.interceptorResults.patientIdentifiers.dfn;
    var patientUid = 'urn:va:patient:' + writebackContext.interceptorResults.patientIdentifiers.site + ':' + dfn + ':' + dfn;
    var model = writebackContext.model;
    var clinicalObject = {
        patientUid: patientUid || errorMessages.push('failed to build patientUid from writebackContext'),
        authorUid: model.authorUid || errorMessages.push('writebackContext.model does not contain "authorUid"'),
        domain: 'ehmp-note',
        subDomain: 'tiu',
        visit: {
            location: model.locationUid || errorMessages.push('writebackContext.model does not contain "locationUid"'),
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

module.exports.wrapCreateAddendum = function(errorMessages, writebackContext) {
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
    /*  For a patient with a site identifier, the format is
        "urn:va:patient:[site]:[dfn]:[dfn]” (e.g. "urn:va:patient:SITE:3:3")
        For a patient with only an ICN identifier the format is
        "urn:va:patient:VLER:[icn-value]:[icn-value]” (e.g. "urn:va:patient:VLER:45679V45679:45679V45679")
    */
    var dfn = writebackContext.interceptorResults.patientIdentifiers.dfn;
    var patientUid = 'urn:va:patient:' + writebackContext.interceptorResults.patientIdentifiers.site + ':' + dfn + ':' + dfn;
    var model = writebackContext.model;
    var clinicalObject = {
        patientUid: patientUid || errorMessages.push('failed to build patientUid from writebackContext'),
        authorUid: model.authorUid || errorMessages.push('writebackContext.model does not contain "authorUid"'),
        domain: 'ehmp-note',
        subDomain: 'addendum',
        visit: {
            location: model.locationUid || errorMessages.push('writebackContext.model does not contain "locationUid"'),
            serviceCategory: model.encounterServiceCategory || errorMessages.push('writebackContext.model does not contain "encounterServiceCategory"'),
            dateTime: model.encounterDateTime || errorMessages.push('writebackContext.model does not contain "encounterDateTime"')
        },
        referenceId: writebackContext.referenceId || errorMessages.push('writebackContext does not contain "referenceId"'),
        ehmpState: 'draft',
        data: {},
        addendum: model
    };
    return _.isEmpty(errorMessages) ? clinicalObject : null;
};

module.exports.wrapUpdateAddendum = function(errorMessages, model) {
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
    clinicalObject.addendum = _.omit(model, 'clinicalObject');
    return clinicalObject;
};
