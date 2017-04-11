'use strict';

var rdk = require('../../core/rdk');
var httpUtil = rdk.utils.http;
var dd = require('drilldown');
var util = require('util');
var querystring = require('querystring');
var _ = require('lodash');
var auditUtil = require('../../utils/audit');
var mask = require('./search-mask-ssn');
var maskPtSelectSsn = mask.maskPtSelectSsn;
var getLoc = mask.getLoc;
var pidValidator = rdk.utils.pidValidator;
var async = require('async');
var patientSearchResource = require('./patient-search-resource');

module.exports = performPatientSearch;
module.exports.parameters = {
    get: {
        pid: {
            required: true
        }
    }
};

function performPatientSearch(req, res) {
    req.logger.debug('pid.performPatientSearch entering method');
    req.audit.logCategory = 'SEARCH';

    var pid = req.param('pid');
    if (!pid) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing pid parameter');
    }

    var site = patientSearchResource.getSite(req.logger, 'pid.performPatientSearch', pid, req);
    if (site === null) {
        req.logger.error('pid.performPatientSearch ERROR couldn\'t obtain site');
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing site information from session or request');
    }

    req.logger.debug('pid.performPatientSearch retrieving patient data for ' + pid);
    auditUtil.addAdditionalMessage(req, 'searchCriteriaPid', util.format('pid=%s', pid));
    var jdsResource;
    if (pidValidator.isIcn(pid)) {
        req.logger.debug('pid.performPatientSearch single patient search: using icn');
        jdsResource = 'ICN';
    } else if (pidValidator.isEdipi(pid)) {
        req.logger.debug('pid.performPatientSearch single patient search: using edipi as pid');
        pid = site + ';' + pid;
        jdsResource = 'PID';
        //BH: Seems like a "pro forma" request--do we actually need to make it?
    } else if (pidValidator.isSiteDfn(pid)) {
        req.logger.debug('pid.performPatientSearch single patient search: using site;dfn');
        jdsResource = 'PID';
    } else {
        req.logger.error('pid.performPatientSearch single patient search: pid or icn not detected in "' + pid + '"');
        res.status(rdk.httpstatus.bad_request).rdkSend('Invalid Pid. Please pass either ICN or Primary Site ID.');
    }

    async.waterfall(
        [
            function(callback) {
                patientSearchResource.callVxSyncPatientSearch(req.logger, 'pid.performPatientSearch', req.app.config.vxSyncServer, req.app.config.jdsServer, site, jdsResource, pid, callback);
            },
            getLoc.bind(null, req)
        ],
        function(err, result) {
            result = maskPtSelectSsn(result);
            if (err) {
                if (err instanceof Error) {
                    return res.status(rdk.httpstatus.internal_server_error).rdkSend(err.message);
                } else {
                    return res.status(err.status || rdk.httpstatus.internal_server_error).rdkSend(err.message || err);
                }
            }
            if (!_.isObject(result)) {
                return res.status(rdk.httpstatus.internal_server_error).rdkSend(result);
            }
            req.logger.debug('pid.performPatientSearch returning result');
            return res.status(rdk.httpstatus.ok).rdkSend(result);
        });
}
