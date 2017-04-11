'use strict';
var _ = require('lodash');
var noteObjectsValidator = require('./clinical-objects-note-objects');

// validate clinical note objects

module.exports.validateCreateModel = validateCreateModel;
module.exports.validateUpdateModel = validateUpdateModel;

function validateCreateModel(errorMessages, model, appConfig, callback) {
    if(model.subDomain !== 'tiu' && model.subDomain !== 'addendum' && model.subDomain !== 'noteObject'){
        errorMessages.push('Note Domain Clinical Object must have the subDomain of tiu, addendum, or noteObject');
        return;
    }

    if(model.subDomain === 'noteObject') {
        validateNoteObject(errorMessages, model);

    } else {
        validateNote(errorMessages, model);
    }

    callback(errorMessages);
}

function validateNote(errorMessages, model) {
    if (!_.isObject(model)) {
        errorMessages.push('model is not an object');
        return;
    }
    if(model.domain !== 'ehmp-note'){
        errorMessages.push('Note Clinical Object has the wrong domain');
    }
}

function validateNoteObject(errorMessages, model) {
    noteObjectsValidator.validateCreateModel(errorMessages, model);
}

function validateUpdateModel(errorMessages, model, appConfig, callback) {
    if (!_.isObject(model)) {
        errorMessages.push('model is not an object');
        return;
    }
    if(model.domain !== 'ehmp-note'){
        errorMessages.push('Note Clinical Object has the wrong domain');
    }

    callback(errorMessages);
}
