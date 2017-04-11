'use strict';

var _ = require('lodash');
var rdk = require('../../core/rdk');
var RdkTimer = rdk.utils.RdkTimer;
var RdkError = rdk.utils.RdkError;
var pepSubsystem = require('../../subsystems/pep/pep-subsystem');


function isDisabled(config) {
    return _.result(config, 'interceptors.pep.disabled', false);
}


/**
 * Check for authorization via policy decision point
 *
 * @namespace pep
 * @param {Object} req The request object
 * @param {Object} res The response object
 * @param {Function} next A callback function
 * @return {undefined} || Error
 */
module.exports = function(req, res, next) {

    if (isDisabled(req.app.config)) {
        req.logger.warn('PEP: pep authorization disabled');
        return next();
    }

    req.logger.info('PEP: pep authorization invoked');

    var pepMetrics = new RdkTimer({
        'name': 'elapsedAuthorization',
        'start': true
    });

    var writeMetrics = function(err, result) {
        pepMetrics.error = err || '';
        pepMetrics.result = result || '';
        pepMetrics.log(req.logger, {
            'stop': true
        });

        if (err) {
            //TODO convert pep to use RdkErrors
            return res.status(err.code).rdkSend(err.message);
        }

        next();
    };

    pepSubsystem.execute(req, res, writeMetrics);
};

//used for unit testing
module.exports._isDisabled = isDisabled;
