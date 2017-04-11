'use strict';

var async = require('async');
var pdpFactory = require('./pep-handler-factory');

function getSubsystemConfig(app, logger) {
    return {
        healthcheck: {
            name: 'pep',
            interval: 5000,
            check: function(callback) {
                return callback(true);
            }
        }
    };
}
module.exports.getSubsystemConfig = getSubsystemConfig;
/**
 * Pep subsystem calls one or more pdp rule sets based on configuration. A rules set is wrapped by a pdp handler.
 *
 * @param req       a request with a pid
 * @param res       the response which could be sent (short circuited) from this subsystem if there is an error
 * @param callback  next function in handler chain
 */
module.exports.execute = function(obj, res, callback) {
    async.applyEach(pdpFactory.build(obj), obj, res, callback);
};
