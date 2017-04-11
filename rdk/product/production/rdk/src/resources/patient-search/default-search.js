'use strict';

var async = require('async');
var RpcClient = require('vista-js').RpcClient;
var searchUtil = require('./results-parser');
var searchMaskSsn = require('./search-mask-ssn');
var rdk = require('../../core/rdk');
var httpUtil = rdk.utils.http;
var _ = require('lodash');
var formatSinglePatientSearchCommonFields = searchUtil.formatSinglePatientSearchCommonFields;
var sensitivityUtils = rdk.utils.sensitivity;
var RdkTimer = rdk.utils.RdkTimer;
var jdsConstants = require('../../subsystems/jds/jds-subsystem.js').constants;

var MAX_JDS_URL_SIZE = jdsConstants.MAX_JDS_URL_SIZE;
var JDS_RANGE_DELIMITER = jdsConstants.JDS_RANGE_DELIMITER;

module.exports.getMyCPRS = function(req, res) {
    req.logger.debug('default-search.getMyCPRS entering method');
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
            req.logger.debug('default-search.getMyCPRS returning result');
            return res.status(rdk.httpstatus.ok).rdkSend(result);
        }
    );
};

/**
 * Gets the user's My CPRS List from VistA.
 *
 * @param {Object} config - The config object which contains details for connecting to VistA.
 * @param {Object} request - The request object.
 * @param {Object} response - The response object.
 * @param {function} callback - The function to call once the My CPRS List has been obtained.
 */
function getDefaultSearchPrefs(config, request, response, callback) {
    var vistaTimer = new RdkTimer({
        'name': 'myCprsListVistATimer',
        'start': true
    });
    RpcClient.callRpc(request.logger, config, 'HMPCRPC RPC', {
        '"command"': 'getDefaultPatientList'
    }, function(err, result) {
        vistaTimer.log(request.logger, {
            'stop': true
        });
        try {
            result = JSON.parse(result);
            return callback(null, result);
        } catch (e) {
            return callback(err || result);
        }
    });
}

/**
 * Parses the list of patients that get returned from VistA. Calls JDS to get
 * patient demographic information.
 *
 * @param {Object} request - The request object.
 * @param {Object} response - The response object.
 * @param {Object} resultList - The list of patient's on the user's My CPRS List.
 * @param {function} callback - The function to call once all the data has been processed.
 */
function parsePatientList(request, response, resultList, callback) {
    var cprsList = resultList.data.patients || [];
    var hasDGAccess = _.result(request, 'session.user.dgSensitiveAccess', 'false') === 'true';
    var jdsBaseUrl = request.app.config.jdsServer.baseUrl + '/data/index/pt-select-pid/?range=';
    var remainingUrlSpace = MAX_JDS_URL_SIZE - getStringSize(jdsBaseUrl);
    var patientIdRange = [];
    var jdsUrls = [];

    if (cprsList.length <= 0) {
        callback(null, {
            'data': {
                'items': cprsList
            }
        });
    } else {
        // Since we need to call JDS to get demographics for each patient in the My CPRS List,
        // construct ranged JDS URLs that are no more than 1024 bytes so we can minimize the
        // number of times we have to call JDS.
        async.each(cprsList, function(patient, urlBuilderCallback) {
            var sizeOfPatientId = getStringSize(patient.pid) + getStringSize(JDS_RANGE_DELIMITER);

            var pidIndex = _.findIndex(patientIdRange, function(id) {
              return id === patient.pid;
            });

            // If the pid has not been added already, add it to a JDS URL
            if (pidIndex === -1) {
                 // If there's enough space to add another pid to the JDS URL, do it,
                // otherwise add the completed URL on the queue and start a new one
                if (remainingUrlSpace >= sizeOfPatientId) {
                    patientIdRange.push(patient.pid);
                    remainingUrlSpace -= sizeOfPatientId;
                } else {
                    jdsUrls.push(jdsBaseUrl+patientIdRange);
                    // Reset so we can build a new range of patient ids for the next URL
                    patientIdRange = [];
                    remainingUrlSpace = MAX_JDS_URL_SIZE - getStringSize(jdsBaseUrl);
                }
            }

            urlBuilderCallback();
        }, function(err) {
            if (err) {
                callback(err);
            } else {
                jdsUrls.push(jdsBaseUrl+patientIdRange);

                var jdsFunctions = [];

                // Build an array of functions to make each JDS call so we can iterate through N of them
                async.each(jdsUrls, function(jdsUrl, functionsArrayCallback) {
                    var jdsFunction = function (callback){
                        callJDSWithRange(request, jdsUrl, cprsList, hasDGAccess, callback);
                    };
                    jdsFunctions.push(jdsFunction);
                    functionsArrayCallback();
                }, function(err) {
                    if (err) {
                        callback(err);
                    }
                    // Execute the calls to JDS to get patient demographics
                    async.parallel(jdsFunctions,
                    function(err, results) {
                        if (err) {
                            callback(err);
                        }

                        // Merge the results from all the JDS calls into a single object
                        var finalResults = [];
                        _.forEach(results, function(result) {
                            finalResults = finalResults.concat(result);
                        });

                        callback(null, {
                            'data': {
                                'items': finalResults
                            }
                        });
                    });
                });
            }
        });
    }
}

/**
 * Executes the specified JDS call and merges the results with the user's My CPRS List data
 * that was returned from VistA.
 *
 * @param {Object} request - The request object.
 * @param {String} url - The JDS url to call.
 * @param {Object} cprsList - The list of patient's on the user's My CPRS List.
 * @param {boolean} hasDGAccess - Whether or not the user has DGAccess
 * @param {function} callback - The function to call once all the data has been processed.
 */
function callJDSWithRange(request, url, cprsList, hasDGAccess, callback) {
    var searchOptions = {
        url: url,
        logger: request.logger,
        json: true,
        site: request.session.user.site
    };
    var jdsTimer = new RdkTimer({
        'name': 'myCprsListJDSTimer',
        'start': true
    });
    httpUtil.get(searchOptions, function(error, response, result) {
        jdsTimer.log(request.logger, {
            'stop': true
        });

        if (error) {
            callback(error);
        }

        if (_.result(result, 'data.items', []).length > 0) {
            for (var cprsListIndex = 0; cprsListIndex < cprsList.length; cprsListIndex += 1) {
                var cprsPatient = cprsList[cprsListIndex];

                var jdsPatient = _.findWhere(result.data.items, {
                    pid: cprsPatient.pid
                });

                if (!_.isUndefined(jdsPatient)) {
                    jdsPatient = sensitivityUtils.removeSensitiveFields(jdsPatient);
                    if (jdsPatient.sensitive && !hasDGAccess) {
                        jdsPatient = sensitivityUtils.hideSensitiveFields(jdsPatient);
                    }
                    jdsPatient = cleanJDSPatientAttributes(jdsPatient);
                    jdsPatient = searchUtil.transformPatient(jdsPatient, false);

                    if (cprsPatient.roomBed) {
                        jdsPatient.roomBed = cprsPatient.roomBed;
                    }
                    if (cprsPatient.locationName) {
                        jdsPatient.locationName = cprsPatient.locationName;
                    }
                    if (cprsPatient.appointment) {
                        jdsPatient.appointment = cprsPatient.appointment;
                    }

                    jdsPatient = formatSinglePatientSearchCommonFields(jdsPatient, hasDGAccess);

                    cprsList[cprsListIndex] = jdsPatient;
                }
            }
        }

        callback(null, cprsList);
    });
}

function cleanJDSPatientAttributes(patient) {
    var JDSPatientAttributeWhitelist = ['birthDate', 'displayName', 'familyName', 'fullName', 'genderCode', 'genderName', 'givenNames', 'icn', 'localId', 'pid', 'roomBed', 'sensitive', 'ssn', 'summary'];
    var cleanedPatient = _.pick(patient, JDSPatientAttributeWhitelist);
    return cleanedPatient;
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

/**
 * Calculates the size of a string in bytes.
 *
 * @param {String} string - The string.
 * @return The size of the string, in bytes.
 */
function getStringSize(string) {
    return encodeURI(string).split(/%..|./).length - 1;
}

// below: _ exports for unit testing only
module.exports._getVistaConfig = getVistaConfig;
