'use strict';
var _ = require('lodash');

// validate clinical note objects

module.exports.validateCreateModel = validateCreateModel;
module.exports.validateUpdateModel = validateUpdateModel;

function validateCreateModel(errorMessages, model, appConfig, callback) {
    if (!_.isObject(model)) {
        errorMessages.push('model is not an object');
        return;
    }

    if(model.domain !== 'ehmp-observation'){
        errorMessages.push('Observation Clinical Object has the wrong domain');
    }

    callback(errorMessages);
}

function validateUpdateModel(errorMessages, model, appConfig, callback) {
    callback(errorMessages);
}
