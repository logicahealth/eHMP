'use strict';

var pepSubsystem = require('../../subsystems/pep/pep-subsystem');
var _ = require('lodash');
var now = require('performance-now');

function PepMetrics(method, url) {
    this.path =  method + ' ' + url;
    this.start = now();
}

PepMetrics.prototype.stop = function() {
    this.end = now();
    this.elapsedMilliseconds = this.end - this.start;
};

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

    var pepMetrics = new PepMetrics(req.method, req.originalUrl);

    var writeMetrics = function(err, result) {
        pepMetrics.stop();
        pepMetrics.error = err || '';
        pepMetrics.result = result || '';
        req.logger.info({'pep-metrics': pepMetrics}); // Write them in res-server.log file now
        
        if(err){
            return res.status(err.code).rdkSend(err.message);
        }

        next();
    };

    pepSubsystem.execute(req, res, writeMetrics);
};

//used for unit testing
module.exports._PepMetrics = PepMetrics;
module.exports._isDisabled = isDisabled;
