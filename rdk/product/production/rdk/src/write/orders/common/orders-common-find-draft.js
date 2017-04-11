'use strict';

var clinicalObject = require('../../../subsystems/clinical-objects/clinical-objects-subsystem');

/**
 * Finds all draft orders with a specific patientUid and authorUid
 */
module.exports = function(writebackContext, callback) {

    writebackContext.model.domain = 'order';
    writebackContext.model.ehmpState = 'draft';

    clinicalObject.find(writebackContext.logger, writebackContext.appConfig,
        writebackContext.model, writebackContext.loadReference,
        function(err, model) {
            if (err) {
                return callback(err);
            }
            writebackContext.vprResponse = model;
            return callback(null, writebackContext.vprResponse);
        });

};