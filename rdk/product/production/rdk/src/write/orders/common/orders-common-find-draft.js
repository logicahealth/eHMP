'use strict';

var clinicalObject = require('../../../subsystems/clinical-objects/clinical-objects-subsystem');

/**
 * Finds all draft orders with a specific patientUid and authorUid
 */
module.exports = function(writebackContext, callback) {
    var logger = writebackContext.logger;
    var model = writebackContext.model;
    var appConfig = writebackContext.appConfig;
    var loadReference = writebackContext.loadReference;

    clinicalObject.find(logger, appConfig, model, loadReference, function(err, response) {
        if (isClinicalObjectNotFound(err)) {
            err = undefined;
            response = {};
        }
        if (err) {
            return callback(err);
        }
        writebackContext.vprResponse = response;
        return callback(null, response);
    });

};

function isClinicalObjectNotFound(err) {
    return (err && (err.length === 1) && (err[0] === clinicalObject.CLINICAL_OBJECT_NOT_FOUND)) ? true : false;
}