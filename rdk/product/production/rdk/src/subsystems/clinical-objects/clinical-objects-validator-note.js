'use strict';
var _ = require('lodash');

// validate clinical note objects

module.exports.validateCreateModel = validateCreateModel;
module.exports.validateUpdateModel = validateUpdateModel;

function validateCreateModel(errorMessages, model) {
    if (!_.isObject(model)) {
        errorMessages.push('model is not an object');
        return;
    }
}

function validateUpdateModel(errorMessages, model) {

}
