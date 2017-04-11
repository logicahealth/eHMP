'use strict';

var clinicalObject = require('../../../subsystems/clinical-objects/clinical-objects-subsystem');

module.exports = function(writebackContext, callback) {
    if (writebackContext.model.ehmpState === 'draft') {
        if (writebackContext.model.uid) {
            clinicalObject.update(writebackContext.logger, writebackContext.appConfig,
                writebackContext.model.uid, writebackContext.model,
                function(err, model) {
                    if (err) {
                        return callback(err);
                    }
                    writebackContext.vprResponse = model;
                    return callback(null, writebackContext.vprResponse);
                });
        } else {
            clinicalObject.create(writebackContext.logger, writebackContext.appConfig,
                writebackContext.model,
                function(err, model) {
                    if (err) {
                        return callback(err);
                    }
                    writebackContext.vprResponse = model;
                    return callback(null, writebackContext.vprResponse);
                });
        }
    } else {
        return callback('Error: ehmpState is set as ' + writebackContext.model.ehmpState);
    }
};