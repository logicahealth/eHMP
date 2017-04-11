'use strict';
var _ = require('lodash');

module.exports = function(req, res, next) {
    /**
     * validates req.site property. if doesnt exist, expected to not need it for incoming req resource call
     * Expected interceptor order: before 'synchronize', 'convertpid' and 'operationalDataCheck'
     */
    var config = req.app.config;

    if ('interceptors' in config && 'assignRequestSite' in config.interceptors && config.interceptors.assignRequestSite.disabled) {
        req.logger.warn('assignRequestSite disabled');
        return next();
    }
    if (!req.site) {
        if (!_.isEmpty(_.result(req, 'interceptorResults.patientIdentifiers.siteDfn', ''))) {
            req.site = req.interceptorResults.patientIdentifiers.siteDfn;
        } else if (!_.isEmpty(_.result(req, 'session.user.site', ''))) {
            req.site = req.session.user.site;
        } else if (!_.isEmpty(_.result(req, 'app.config.vistaSites', {}))) {
            req.site = _.keys(req.app.config.vistaSites)[0];
        }
    }
    if (!req.site) {
        req.logger.debug('Request Site Property not assigned');
    }
    return next();
};
