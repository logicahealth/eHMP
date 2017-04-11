'use strict';
var rdk = require('../../core/rdk');
var util = require('util');
var _ = require('lodash');
var auditUtil = require('../../utils/audit');
var mask = require('./search-mask-ssn');
var maskPtSelectSsn = mask.maskPtSelectSsn;
var pidValidator = rdk.utils.pidValidator;
var patientSearchResource = require('./patient-search-resource');
var globalSearch = require('./global-search');
var lastWorkspace = require('./last-workspace');

module.exports = {
    performPatientSearch: function(req, res) {
        performPatientSearch(req, res);
    },
    performPatientSearchWithCallback: function(req, res, pid, callback, maskSSN) {
        performPatientSearch(req, res, pid, callback, maskSSN || false);
    }
};
module.exports.parameters = {
    get: {
        pid: {
            required: true,
            description: 'patient id'
        }
    }
};

function performPatientSearch(req, res, otherPid, internalCallback, maskSSN) {
    req.audit.logCategory = 'SEARCH';
    var pid = otherPid || req.param('pid');
    req.logger.debug('Performing pid.performPatientSearch with PID value: "%s"', pid);
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
    var vxSyncPid = '';
    var useVxSyncPid = false;
    if (pidValidator.isIcn(pid)) {
        req.logger.debug('pid.performPatientSearch single patient search: using icn');
        jdsResource = 'ICN';
    } else if (pidValidator.isPidEdipi(pid)) {
        req.logger.debug('pid.performPatientSearch single patient search: using pidedipi as pid');
        jdsResource = 'PID';
        vxSyncPid = site + ';' + pid;
        useVxSyncPid = true;
    } else if (pidValidator.isEdipi(pid)) {
        req.logger.debug('pid.performPatientSearch single patient search: using edipi as pid');
        pid = 'DOD;' + pid;
        vxSyncPid = site + ';' + pid;
        useVxSyncPid = true;
        jdsResource = 'PID';
        req.logger.debug('pid.performPatientSearch edipi ' + pid);
    } else if (pidValidator.isSiteDfn(pid)) {
        req.logger.debug('pid.performPatientSearch single patient search: using site;dfn');
        jdsResource = 'PID';
    } else {
        req.logger.error('pid.performPatientSearch single patient search: pid or icn not detected in PID: "%s"', pid);
        return res.status(rdk.httpstatus.bad_request).rdkSend('Invalid Pid. Please pass either ICN or Primary Site ID.');
    }

    var processPatientGlobalSearch = function(err, result) {
        if (err) {
            /*If code is called internally with a callback, call callback with null*/
            if (!_.isUndefined(internalCallback)) {
                return internalCallback(err, null);
            }
            req.logger.error({
                error: err
            }, 'Error performing global patient search');
            return res.status(rdk.httpstatus.internal_server_error).rdkSend('There was an error processing your request. The error has been logged.');
        }
        if (!result) {
            /*If code is called internally with a callback, call callback with null*/
            if (!_.isUndefined(internalCallback)) {
                return internalCallback({
                    code: 500,
                    message: 'There was an error processing your request. The error has been logged.'
                }, null);
            }
            req.logger.trace({
                req: req,
                patientPID: pid
            }, 'Error performing global search for patient demographic information');
            return res.status(rdk.httpstatus.internal_server_error).rdkSend('There was an error processing your request. The error has been logged.');
        }
        req.logger.trace({
            result: result
        }, 'Returned patient from global search');
        var patientObj = {
            'pid': pid,
            'ssn': result.ssn,
            'birthDate': result.birthDate,
            'sensitive': result.sensitive,
            'isMVIOrigin': true
        };
        if (pidValidator.isIcn(pid) || pidValidator.isPidEdipi(pid)) {
            patientObj.icn = pid;
            patientObj.fullName = result.fullName;
            patientObj.displayName = result.fullName;
            patientObj.genderName = result.genderName.toUpperCase();
        }
        req.audit.sensitive = result.sensitive;
        var patientsObj = {
            data: {
                items: [patientObj]
            }
        };
        return checkLastWorkspace(req, res, pid, patientsObj, internalCallback);
    }

    var processPatientSelect = function(err, result) {
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
        if (!_.isEmpty(_.result(result, 'data.items', {}))) {
            req.logger.trace({
                result: result
            }, 'pid.performPatientSearch returning result');
            if (maskSSN) {
                result = maskPtSelectSsn(result);
            }
            return checkLastWorkspace(req, res, pid, result, internalCallback);
        }
        /* Patient was not found in JDS or VXSync/VistA, check MVI to get demographics */
        globalSearch._getPatientDemographicWithICN(req, res, pid, processPatientGlobalSearch);
    }

    patientSearchResource.callJDSPatientSearch(req, 'pid.performPatientSearch', site, jdsResource, pid, function(err, result) {
        var errorReasonCode = _.result(err, 'message.error.errors[0].reason', undefined);
        var jdsStatus = _.result(err, 'status', null);
        /**
         * If JPID or Demographics not found
         * or if JDS had an error or went down
         * call VxSync CallPatientSearch 
         **/
        if (jdsStatus === 400 && (errorReasonCode === 224 || errorReasonCode === 225) || jdsStatus === 500) {
            var pidToUse = pid;
            if (useVxSyncPid === true) {
                pidToUse = vxSyncPid;
            }
            var searchOptions = {
                site: site,
                searchType: jdsResource,
                searchString: pidToUse
            };
            patientSearchResource.callPatientSearch(req, 'pid.performPatientSearch', req.app.config.jdsServer, searchOptions, processPatientSelect);
        } else if (jdsStatus) {
            return processPatientSelect(jdsStatus, result);
        } else {
            return processPatientSelect(null, result);
        }
    });
}

function checkLastWorkspace(req, res, pid, patient, internalCallback) {
    req.logger.debug('pid.performPatientSearch Check for last workspace');
    lastWorkspace.getLastWorkspaceWithCallback(req, res, pid, function(resultObj) {
        req.logger.debug('pid.performPatientSearch returning result');
        if (!_.isEmpty(_.result(resultObj, 'data', []))) {
            patient.workspaceContext = resultObj.data[0].workspaceContext;
        }
        if (!_.isUndefined(internalCallback)) {
            return internalCallback(null, patient);
        } else {
            return res.status(rdk.httpstatus.ok).rdkSend(patient);
        }
    });
}