/**
 * Created by alexluong on 4/29/15.
 */

'use strict';

var _ = require('lodash');
var rdk = require('../core/rdk');
var http = rdk.utils.http;
var nullchecker = rdk.utils.nullchecker;
var pidValidator = rdk.utils.pidValidator;

/**
 * Requires 'pid' parameter as icn|dfn|siteDfn
 * Uses jds jpid to convert: /vpr/jpid/:pid
 * Builds req.interceptorResults.patientIdentifiers with the corresponding pids for the CURRENT SITE and sets that on the req.audit.patientIdentifiers
 *     => { icn, siteDfn|siteVhic, dfn|vhic }
 * Recommended interceptor order: after 'synchronize' - jpid is only populated for a patient when the patient is synchronized
 */

module.exports = function(req, res, next) {
    req.logger.info('convertPid interceptor invoked');

    var pid = _.result(req, 'query.pid') || _.result(req, 'params.pid') || _.result(req, 'body.pid') || '';   //req.params('pid') is deprecated in Express
    if (nullchecker.isNullish(pid)) {
        return next();
    }

    var jdsResource = '/vpr/jpid';
    if (pidValidator.isDfn(pid)) {
        pid = req.session.user.site + ';' + pid;
    }
    req.logger.info('jpid search using pid [%s]', pid);

    var jdsPath = jdsResource + '/' + pid;
    var options = _.extend({}, req.app.config.jdsServer, {
        url: jdsPath,
        logger: req.logger,
        json: true
    });

    req.interceptorResults.patientIdentifiers = {
        originalID: pid
    };

    http.get(options, function(error, response, result) {
        if (error) {
            req.interceptorResults.patientIdentifiers.error = 'Error performing search - ' + error.toString();
            req.logger.debug(req.interceptorResults.patientIdentifiers);
            return next();
        }

        var patientIdentifiers = result.patientIdentifiers;
        if (!patientIdentifiers) {
            req.interceptorResults.patientIdentifiers.error = 'Convert pid failed for ['+pid+'] - pid may be invalid';
            req.logger.debug(req.interceptorResults.patientIdentifiers);
            return next();
        }
        _.each(patientIdentifiers, function(pid) {
            req.logger.debug(req.logger.debug('START: Pid is %s',pid));
            if (pidValidator.isIcn(pid)) {
                req.interceptorResults.patientIdentifiers.icn = pid;
            } else if (pidValidator.isSiteDfn(pid) && pidValidator.isCurrentSite(_.result(req, 'session.user.site', ''), pid)) {
                req.interceptorResults.patientIdentifiers.siteDfn = pid;
                req.interceptorResults.patientIdentifiers.dfn = pid.split(';')[1];
            } else if (pidValidator.isVhic(pid)) {
                req.logger.debug(req.logger.debug('START: Vhic pid is %s', pid));
                req.interceptorResults.patientIdentifiers.siteVhic = pid;
                req.interceptorResults.patientIdentifiers.vhic = pid.split(';')[1];
            } else if (pidValidator.isPidEdipi(pid)) {
                req.interceptorResults.patientIdentifiers.pidEdipi = pid;
                req.interceptorResults.patientIdentifiers.edipi = pid.split(';')[1];
            } else if (pidValidator.isEdipi(pid)) {
                req.interceptorResults.patientIdenfifiers.edipi = pid;
                req.interceptorResults.patientIdenfifiers.pidEdipi = 'DOD;' + pid;
            }
        });

        req.logger.debug(req.interceptorResults.patientIdentifiers);
        req.audit.patientIdentifiers = req.interceptorResults.patientIdentifiers;
        next();
    });
};
