'use strict';
var _ = require('lodash');

// validate clinical order objects
module.exports.validateModel = validateModel;

function validateModel(errorMessages, model, appConfig, callback) {
    if (!_.isObject(model)) {
        errorMessages.push('model is not an object');
        return;
    }
    if (model.domain !== 'ehmp-activity') {
        errorMessages.push('Clinical Object has the wrong domain');
    } else {
        if (!_.includes(['consult'], model.subDomain)) {
            errorMessages.push('Invalid SubDomain');
        }
        if (!_.isEmpty(model.referenceId)) {
            errorMessages.push('Consult Order should not have a referenceId');
        }
    }

    callback(errorMessages);
}
