'use strict';
var async = require('async');
var rdk = require('../../core/rdk');
var httpUtil = rdk.utils.http;
var sensitivityUtils = rdk.utils.sensitivity;
var _ = require('lodash');
var rulesEngine = require('../pdp/rules-engine');
var rules = require('../pdp/patient-access-policy-rules').rules;
var userPolicyBuilder = require('./user-policy-builder');

function getPatient(obj, patientCallback) {
    var pid = obj.pid || _.result(obj, 'interceptorResults.patientIdentifiers.originalID', '');
    if (_.isEmpty(pid)) {
        obj.logger.warn('No patient could be identified to authorize against.');
        return setImmediate(patientCallback, {
            message: 'PEP: Unable to process request. Pid not found.',
            code: rdk.httpstatus.forbidden
        });
    }
    var buildPatientPolicyData = function(err, response, patients) {
        if (err) {
            return patientCallback({
                message: 'PEP: Unable to process request.',
                code: rdk.httpstatus.internal_server_error
            });
        }
        if (!_.isObject(patients)) {
            return patientCallback({
                message: 'PEP: Unable to process request. Parser error.',
                code: rdk.httpstatus.internal_server_error
            });
        }
        return patientCallback(null, patients);
    };
    // Trigger the JDS fetch and run the check for sensitive data on a patient and finally run the pep paths can be as follows:
    // http://10.2.2.110:9080/data/index/pt-select-icn/?range=5123456789V027402
    // http://10.2.2.110:9080/data/index/pt-select-pid/?range=9E7A;18
    var httpConfig = {
        cacheTimeout: 15 * 60 * 1000,
        timeout: 5000,
        logger: obj.logger,
        baseUrl: obj.app.config.jdsServer.baseUrl,
        json: true,
        url: '/data/index/pt-select-' + (_.contains(pid, ';') ? 'pid' : 'icn') + '?range=' + pid
    };
    httpUtil.get(httpConfig, buildPatientPolicyData);
}

/**
 * Handler used to determine if the session user has the needed access for the current request.
 *
 * @param req       current request that contain user session
 * @param res       response
 * @param callback  final processing callback
 */
module.exports = function(req, res, callback) {
    req.audit.sensitive = 'false';
    getPatient(req, function(err, result) {
        if (err) {
            return callback(err);
        }
        var userPatientAccessPermission = userPolicyBuilder(req, result);
        userPatientAccessPermission.resourceConfigItemRel = _.result(req, '_resourceConfigItem.rel', '');
        userPatientAccessPermission.patientPid = req.pid || _.result(req, 'interceptorResults.patientIdentifiers.originalID', '');
        userPatientAccessPermission.isPatientCentric = _.result(req, '_resourceConfigItem.isPatientCentric', false);
        rulesEngine.executeRules(rules, userPatientAccessPermission, function(results) {
            req.logger.debug('PEP Patient Access: ' + results.code + ' pep response received.');
            if (results.code === 'Permit') {
                return callback(null, results);
            } else if (results.code === 'BreakGlass') {
                res.header('BTG', results.reason);
                return callback({
                    message: results.text,
                    code: rdk.httpstatus.permanent_redirect
                }, null);
            } else {
                return callback({
                    message: results.text,
                    code: rdk.httpstatus.forbidden
                }, null);
            }
        });
    });
};
module.exports.maskSensitive = function(obj, callback) {
    if (!(obj.items && obj.logger && obj.app && obj.audit)) {
        var error = 'Missing required data.';
        return callback(error);
    }
    var items = ((obj.items || {}).data || {}).items || obj.items || [];
    async.eachSeries(items, function(item, done) {
        //Setup request object for patient centric search
        obj.pid = item.icn || item.pid;
        //Run pep subsystem check on each patient
        getPatient(obj, function(err, patients) {
            if (err) {
                return callback(err);
            }
            var userPermission = userPolicyBuilder(obj, patients);
            userPermission.resourceConfigItemRel = _.result(obj, '_resourceConfigItem.rel', '');
            userPermission.patientPid = obj.pid || _.result(obj, 'interceptorResults.patientIdentifiers.originalID', '');
            userPermission.isPatientCentric = _.result(obj, '_resourceConfigItem.isPatientCentric', false);
            rulesEngine.executeRules(rules, userPermission, function(results) {
                if (results.code === 'Permit') {
                    item = sensitivityUtils.removeSensitiveFields(item, results);
                    return done();
                } else if (results.code === 'BreakGlass') {
                    item = sensitivityUtils.hideSensitiveFields(item, results);
                    item.sensitive = true;
                    return done();
                } else {
                    return done({
                        message: results.text,
                        code: rdk.httpstatus.forbidden
                    }, null);
                }
            });
        });
    }, function done(error) {
        callback(error, obj.items);
    });
};
//used for testing only
module.exports._getPatient = getPatient;
