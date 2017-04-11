'use strict';

var async = require('async');
var RpcClient = require('vista-js').RpcClient;
var searchUtil = require('./results-parser');
var searchMaskSsn = require('./search-mask-ssn');
var rdk = require('../../core/rdk');
var _ = require('lodash');

module.exports.getMyCPRS = function(req, res) {
    req.logger.debug('default search invoked');
    var config = getVistaConfig(req);
    async.waterfall(
        [
            getDefaultSearchPrefs.bind(this, config, req, res),
            parsePatientList.bind(this, req, res),
            function(response, callback) {
                var auth = req.app.subsystems.authorization;
                var authObj = {
                    items: response,
                    logger: req.logger,
                    audit: req.audit,
                    app: req.app,
                    session: req.session,
                    sensitiveCheck: true
                };
                auth.execute(authObj, callback);
            }
        ],
        function(err, result) {
            if (err) {
                if (err instanceof Error) {
                    return res.status(rdk.httpstatus.internal_server_error).rdkSend(err.message);
                } else {
                    return res.status(rdk.httpstatus.ok).rdkSend(err);
                }
            }

            if (!_.isObject(result)) {
                return res.status(rdk.httpstatus.internal_server_error).rdkSend(result);
            }
            return res.status(rdk.httpstatus.ok).rdkSend(result);
        }
    );
};

function getDefaultSearchPrefs(config, request, response, callback) {
    RpcClient.callRpc(request.logger, config, 'HMPCRPC RPC', {
        '"command"': 'getDefaultPatientList'
    }, function(err, result) {
        try {
            result = JSON.parse(result);
            return callback(null, result);
        } catch (e) {
            return callback(err || result);
        }
    });
}

function parsePatientList(request, response, resultList, callback) {
    var list = resultList.data.patients || [];
    var parsedList = [];
    var callCount = 0;
    async.each(list, function(patient, done) {
        var currentCall = ++callCount;
        var patientAttr = patient.pid.split(';');
        getDemographics(request, patientAttr[1], patientAttr[0], function(result) {
            if (result !== undefined && result !== null && result !== {}) {
                if (patient.roomBed) {
                    result.roomBed = patient.roomBed;
                }
                if (patient.locationName) {
                    result.locationName = patient.locationName;
                }
                if (patient.appointment) {
                    result.appointment = patient.appointment;
                }
                if(result.ssn) {
                    result.ssn = searchMaskSsn.maskSsn(result.ssn);
                }
            }
            parsedList[currentCall - 1] = result;
            done();
            request.logger.debug('call ' + currentCall + ' completed with ' + patientAttr[0]);
        });
    }, function(err) {
        if (err) {
            callback(err);
        } else {
            callback(null, {
                'data': {
                    'items': parsedList
                }
            });
        }
    });
}

function getDemographics(request, patientId, site, callback) {
    if (patientId === null) {
        return callback(null);
    }
    request.app.subsystems.jdsSync.getPatient(site + ';' + patientId, request, function(err, data) {
        if (err) {
            request.logger.warn('An error occurred retrieving patient ' + site + ';' + patientId);
            return callback(null);
        }
        request.logger.debug('Received response:');
        request.logger.debug(data);

        var patient = {};
        if (data.data && data.data.data) {
            data = data.data;
        }
        if (data.data && data.data.currentItemCount && data.data.items) {
            if (data.data.currentItemCount >= 1) {
                patient = data.data.items[0];
                patient = searchUtil.transformPatient(patient);
            }
        } else {
            request.logger.warn('Unable to find patient ' + site + ';' + patientId);
        }
        return callback(patient);
    });
}

function getVistaConfig(request) {
    //get user's site
    var site = request.session.user.site;
    //extract vista site configuration
    if (!request.app.config.vistaSites[site]) {
        request.logger.error('No Vista Site configuration found for user ' + request.session.user.accessCode + ' at site ' + site);
    }

    //merge them together
    var config = searchUtil.merge(request.app.config.rpcConfig, request.app.config.vistaSites[site]);
    config.siteCode = site;
    config.accessCode = request.session.user.accessCode;
    config.verifyCode = request.session.user.verifyCode;
    return config;
}


// below: _ exports for unit testing only
module.exports._getVistaConfig = getVistaConfig;
