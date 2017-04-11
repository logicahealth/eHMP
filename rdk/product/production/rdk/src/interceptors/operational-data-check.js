'use strict';
var _ = require('lodash');
var util = require('util');

var operationDataLoaded = {};

module.exports = function(req, res, next) {
    var config = req.app.config;

    req.logger.info('calling operationalDataCheck() interceptor');

    if ('interceptors' in config && 'operationalDataCheck' in config.interceptors && config.interceptors.operationalDataCheck.disabled) {
        req.logger.warn('operationalDataCheck disabled');
        return next();
    }

    if (!req.site) {
        req.logger.error({'req': req}, 'No request site property found on request object');
        return res.status(500).rdkSend('There was an error processing your request. The error and result have been logged.');
    }

    req.app.subsystems.jdsSync.getOperationalStatus(req.site, req, function(err, result) {
        req.logger.info('operationalDataCheck callback invoked');

        if (!(_.result(operationDataLoaded[req.site], true, false))) {
            req.logger.info('Used cached <true> operationalData value for site ' + req.site);
            return next();
        }

        if (err || !result) {
            req.logger.error({error: err}, 'Error getting operational status');
            res.status(500).rdkSend('There was an error processing your request. The error has been logged.');
        } else if (!('status' in result) || result.status === 500) {
            req.logger.error({result: result}, 'fetchoOperationalStatus error with result');
            res.status(500).rdkSend('There was an error processing your request. The error and result have been logged.');
        } else {
            if (result.data && result.data.inProgress) {
                req.logger.debug('Operational data not fully synchronized');
                res.status(503).rdkSend('Operational data has not been fully synchronized for this site.');
            } else {
                if (req.app.config.environment !== 'development') {
                    req.logger.debug('Operational data for %s has been loaded.', req.site);
                    operationDataLoaded[req.site] = true;
                }
                next();
            }
        }
    });
};
