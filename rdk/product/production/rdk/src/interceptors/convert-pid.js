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

    var pid = _.result(req, 'query.pid') || _.result(req, 'params.pid') || _.result(req, 'body.pid') || ''; //req.params('pid') is deprecated in Express
    if (nullchecker.isNullish(pid)) {
        return next();
    }

    var jdsResource = '/vpr/jpid';
    if (pidValidator.isDfn(pid)) {
        pid = req.session.user.site + ';' + pid;
    }
    var uid = '';
    var splitPid = '';
    var site = '';
    var dfn = '';
    if (pidValidator.isIcn(pid)) {
        uid = 'urn:va:patient:icn:' + pid + ':' + pid;
    } else if (pidValidator.isSiteDfn(pid)) {
        splitPid = pid.split(';');
        site = splitPid[0];
        dfn = splitPid[1];
        uid = 'urn:va:patient:' + site + ':' + dfn + ':' + dfn;
    } else if (pidValidator.isVhic(pid)) {
        uid = 'urn:va:patient:icn:' + pid + ':' + pid;
    } else if (pidValidator.isPidEdipi(pid)) {
        splitPid = pid.split(';');
        dfn = splitPid[1];
        uid = 'urn:va:patient:DOD:' + dfn + ':' + dfn;
    } else if (pidValidator.isEdipi(pid)) {
        uid = 'urn:va:patient:DOD' + pid + ':' + pid;
    }
    req.logger.info('jpid search using pid [%s]', pid);

    var jdsPath = jdsResource + '/' + pid;
    var options = _.extend({}, req.app.config.jdsServer, {
        url: jdsPath,
        logger: req.logger,
        json: true
    });

    req.interceptorResults.patientIdentifiers = {
        originalID: pid,
        uid: uid
    };

    http.get(options, function(error, response, result) {
        if (error) {
            req.interceptorResults.patientIdentifiers.error = 'Error performing search - ' + error.toString();
            req.logger.debug(req.interceptorResults.patientIdentifiers);
            return next();
        }

        var patientIdentifiers = result.patientIdentifiers;
        req.interceptorResults.patientIdentifiers.uids = [];
        if (!patientIdentifiers) {
            req.interceptorResults.patientIdentifiers.error = 'Convert pid failed for [' + pid + '] - pid may be invalid';
            req.logger.debug(req.interceptorResults.patientIdentifiers);
            return next();
        }
        req.interceptorResults.patientIdentifiers.primarySites = [];
        req.interceptorResults.patientIdentifiers.allSites = [];

        _.each(patientIdentifiers, function(pid) {
            req.logger.debug(req.logger.debug('START: Pid is %s', pid));
            var splitPid = pid.split(';');
            var site = splitPid[0];
            var dfn = splitPid[1];
            var uid = 'urn:va:patient:' + site + ':' + dfn + ':' + dfn;
            if (pidValidator.isIcn(pid)) {
                req.interceptorResults.patientIdentifiers.icn = pid;
                uid = 'urn:va:patient:icn:' + pid + ':' + pid;
            } else if (pidValidator.isSiteDfn(pid) && pidValidator.isCurrentSite(_.result(req, 'session.user.site', ''), pid)) {
                req.interceptorResults.patientIdentifiers.siteDfn = pid;
                req.interceptorResults.patientIdentifiers.dfn = dfn;
            } else if (pidValidator.isVhic(pid)) {
                req.logger.debug(req.logger.debug('START: Vhic pid is %s', pid));
                req.interceptorResults.patientIdentifiers.siteVhic = pid;
                req.interceptorResults.patientIdentifiers.vhic = dfn;
                uid = 'urn:va:patient:icn:' + pid + ':' + pid;
            } else if (pidValidator.isPidEdipi(pid)) {
                req.interceptorResults.patientIdentifiers.pidEdipi = pid;
                req.interceptorResults.patientIdentifiers.edipi = dfn;
                uid = 'urn:va:patient:DOD:' + dfn + ':' + dfn;
            } else if (pidValidator.isEdipi(pid)) {
                req.interceptorResults.patientIdentifiers.edipi = pid;
                req.interceptorResults.patientIdentifiers.pidEdipi = 'DOD;' + pid;
                uid = 'urn:va:patient:DOD:' + pid + ':' + pid;
            }
            req.interceptorResults.patientIdentifiers.uids.push(uid);

            if(pidValidator.isSiteDfn(pid) && pidValidator.isPrimarySite(pid)){
                 req.interceptorResults.patientIdentifiers.primarySites = req.interceptorResults.patientIdentifiers.primarySites.concat(pid);
            }
            if(!pidValidator.isIcn(pid)){
                req.interceptorResults.patientIdentifiers.allSites = req.interceptorResults.patientIdentifiers.allSites.concat(pid);
            }
            req.logger.debug({allIdentifiers: req.interceptorResults.patientIdentifiers.primarySites});
        });

        req.logger.debug(req.interceptorResults.patientIdentifiers);
        req.audit.patientIdentifiers = req.interceptorResults.patientIdentifiers;
        next();
    });
};
