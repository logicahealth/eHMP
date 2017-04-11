'use strict';

var _ = require('lodash');
var clinicalObject = require('../../../subsystems/clinical-objects/clinical-objects-subsystem');

var CREATE_ALLOWED_STATES = ['draft'];
var UPDATE_ALLOWED_STATES = ['draft', 'deleted'];

module.exports = function(writebackContext, callback) {

    var model = writebackContext.model;
    var isCreating = _.isEmpty(model.uid);
    var allowedStates = isCreating ? CREATE_ALLOWED_STATES : UPDATE_ALLOWED_STATES;

    if (allowedStates.indexOf(model.ehmpState) < 0) {
        return callback('Error: ehmpState is set as ' + model.ehmpState);
    }

    var responseHandler = function(err, resp) {
        if (!_.isEmpty(err)) {
            return callback(err);
        }
        writebackContext.vprResponse = resp;
        return callback(null);
    };

    if (isCreating) {
        clinicalObject.create(writebackContext.logger, writebackContext.appConfig, model, responseHandler);
    } else {
        clinicalObject.update(writebackContext.logger, writebackContext.appConfig, model.uid, model, responseHandler);
    }
};