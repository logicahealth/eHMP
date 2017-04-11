'use strict';

var _ = require('lodash');
var clinicalObject = require('../../../subsystems/clinical-objects/clinical-objects-subsystem');

function isClinicalObjectNotFound(err) {
    return ((_.isArray(err)) && (err.length === 1) && (err[0] === clinicalObject.CLINICAL_OBJECT_NOT_FOUND));
}

module.exports = function(writebackContext, callback) {
    var logger = writebackContext.logger;
    var appConfig = writebackContext.appConfig;
    var uid = writebackContext.resourceId;
    var loadReference = writebackContext.loadReference;
    clinicalObject.read(logger, appConfig, uid, loadReference, function(err, resp) {
        if (isClinicalObjectNotFound(err)) {
            err = null;
            resp = {};
        }
        if (err) {
            return callback(err);
        }
        writebackContext.vprResponse = resp;
        return callback(null);
    });
};