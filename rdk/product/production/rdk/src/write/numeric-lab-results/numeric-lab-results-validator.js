'use strict';

var _ = require('lodash');

module.exports.saveNoteObject = function(writebackContext, callback) {
    var error = null; // set if there is an error validating
    if (writebackContext && writebackContext.model) {
        if (_.isEmpty(writebackContext.model.referenceId)) {
            error = 'Missing Reference ID';
        }
        if (_.isEmpty(writebackContext.model.patientUid)) {
            error = 'Missing Patient UID';
        }
        if (_.isEmpty(writebackContext.model.authorUid)) {
            error = 'Missing Author UID';
        }
        if (_.isEmpty(writebackContext.model.visit)) {
            error = 'Missing Visit Context';
        } else {
            if (_.isEmpty(writebackContext.model.visit.location)) {
                error = 'Missing Visit Location';
            }
            if (_.isEmpty(writebackContext.model.visit.serviceCategory)) {
                error = 'Missing Visit Service Category';
            }
            if (_.isEmpty(writebackContext.model.visit.dateTime)) {
                error = 'Missing Visit dateTime';
            }
        }
    } else {
        error = 'Invalid save note object request';
    }
    return setImmediate(callback, error);
};
