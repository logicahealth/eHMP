'use strict';

var _ = require('lodash');
var async = require('async');
var util = require('util');
var S = require('string');
var rdk = require('../../core/rdk');
var httpUtil = rdk.utils.http;
var nullchecker = require('../../utils/nullchecker');
var checkStatus = require('./jds-sync-check-status');
var jdsSyncConfig = require('./jds-sync-config');
var patientSearchResource = require('../../resources/patient-search/patient-search-resource');
var pidValidator = rdk.utils.pidValidator;
var isNullish = nullchecker.isNullish;
var isNotNullish = nullchecker.isNotNullish;

module.exports.getSubsystemConfig = getSubsystemConfig;
module.exports.loadPatient = loadPatient;
module.exports.loadPatientPrioritized = loadPatientPrioritized;
module.exports.loadPatientForced = loadPatientForced;
module.exports.clearPatient = clearPatient;
module.exports.getPatientStatus = getPatientStatus;
module.exports.getPatientStatusSimple = getPatientStatusSimple;
module.exports.getPatientStatusDetail = getPatientStatusDetail;
module.exports.getPatientDataStatusSimple = getPatientDataStatusSimple;
module.exports.isSimpleSyncStatusWithError = isSimpleSyncStatusWithError;
module.exports.isSimpleSyncStatusComplete = isSimpleSyncStatusComplete;
module.exports.waitForPatientLoad = waitForPatientLoad;
module.exports.syncPatientDemographics = syncPatientDemographics;
module.exports.getOperationalStatus = getOperationalStatus;
module.exports.getPatientAllSites = getPatientAllSites;
module.exports.createStandardResponse = createStandardResponse;
module.exports.createErrorResponse = createErrorResponse;
module.exports._syncStatusResultProcessor = syncStatusResultProcessor;

var noSiteMessage = 'This patient\'s record is not yet accessible. Please try again in a few minutes. If it is still not accessible, please contact your HIMS representative and have the patient loaded into your local VistA.';

function getSubsystemConfig(app, logger) {
    return {
        healthcheck: {
            name: 'jdsSync',
            dependencies: ['authorization'],
            interval: 100000,
            check: function(callback) {
                var jdsConfig = {
                    timeout: 5000,
                    baseUrl: app.config.jdsServer.baseUrl,
                    url: '/ping',
                    logger: logger
                };

                httpUtil.get(jdsConfig, function(err) {
                    if (err) {
                        return callback(false);
                    }
                    callback(true);
                });
            }
        }
    };
}

function loadPatient(pid, immediate, req, callback) {
    req.logger.debug('jds-sync-subsystem.loadPatient() pid: %s', pid);
    var config = jdsSyncConfig.configureWithPidParam('loadPatient', pid, req);
    doLoad(config, pid, immediate, null, req, callback);
}

function loadPatientPrioritized(pid, prioritySite, req, callback) {
    req.logger.debug('jds-sync-subsystem.loadPatientPrioritized() pid: %s', pid);
    var config = jdsSyncConfig.configureWithPidParam('loadPatient', pid, req);
    doLoad(config, pid, false, prioritySite, req, callback);
}

function loadPatientForced(pid, forcedSite, immediate, req, callback) {
    req.logger.debug('jds-sync-subsystem.loadPatientForced() pid: %s', pid);
    var config = jdsSyncConfig.configureWithPidParam('loadPatient', pid, req);
    jdsSyncConfig.addForcedParam(config, req, forcedSite);
    doLoad(config, pid, immediate, null, req, callback);
}

function clearPatient(pid, req, callback) {
    req.logger.debug('jds-sync-subsystem.clearPatient() pid: %s', pid);
    jdsSyncConfig.setupAudit(pid, req);

    var config = jdsSyncConfig.getSyncConfig('clearPatient', req);
    jdsSyncConfig.addPidParam(config, req, pid);

    // This call does not invoke the callback until an error
    // occurs or the patient has been completely cleared.
    httpUtil.post(config, function(error, response) {
        if (error) {
            req.logger.error(error);
            return callback(error);
        }

        // If clearPatient is called on a patient that does not exist in JDS,
        // JDS will return a response with status 404 and the message "Patient not found"
        if (response && response.statusCode === 404) {
            return callback(404, createErrorResponse(error, 'pid ' + pid + ' not found.'));
        }

        if (response && 200 <= response.statusCode && response.statusCode <= 299) {
            return callback(null, createStandardResponse(200, 'pid ' + pid + ' unsynced.'));
        }

        return callback(500, createErrorResponse(500, util.format('An error has interrupted the patient synchronization process. Please report this error to your local help desk or system administrator: Patient %s was not unsynced after a failed sync.', pid)));
    });
}

// Used by patient-sync.js and patient-sync-resource.js
function getPatientStatus(pid, req, callback) {
    req.logger.debug('jds-sync-subsystem.getPatientStatus() pid: %s', pid);
    var config = jdsSyncConfig.configureWithPidParam('getPatientStatus', pid, req);
    req.logger.trace({
        config: config
    }, 'getPatientStatus');
    httpUtil.get(config, syncStatusResultProcessor.bind(null, pid, callback, req));
}

// This is used by patient-sync-resource.js
// This function adds fields to the Simple Sync Status for compatibility
function getPatientDataStatusSimple(pid, req, callback) {
    req.logger.debug('jds-sync-subsystem.getPatientDataStatusSimple() pid: %s', pid);
    getPatientStatusSimple(pid, req, function(syncError, syncResult) {
        if (_.get(syncResult, 'error.code') === 404) {
            return callback(syncResult.error.code, syncResult);
        }

        if (_.get(syncResult, 'data.error.code') === 404) {
            return callback(syncResult.data.error.code, syncResult.data);
        }

        if (isNotNullish(syncError)) {
            var syncStatus = (syncResult && syncResult.status) || 500;
            var data = (syncResult && syncResult.data) || syncError;
            return callback(syncStatus, createErrorResponse(syncStatus, data));
        }

        if (syncResult.status !== 200) {
            return callback(syncResult.status || 500, createErrorResponse(syncResult.status, syncResult.data));
        }

        var status = {};
        var vistaSites = _.keys(req.app.config.vistaSites);
        var sites = [];
        if (syncResult.data) {
            if (syncResult.data.sites) {
                sites = _.keys(syncResult.data.sites);
            }
            if (syncResult.data.latestSourceStampTime) {
                status.latestSourceStampTime = syncResult.data.latestSourceStampTime;
            }
        }

        if (!_.isEmpty(sites)) {
            _.each(sites, function(site) {
                req.logger.debug(site);
                if (_.contains(vistaSites, site)) {
                    status.VISTA = status.VISTA || {};
                    status.VISTA[site] = checkStatus.getSiteSyncDataStatusSimple(syncResult.data.sites[site]);
                    req.logger.debug('getDataStatusSimple: site status converted: %j', status.VISTA[site]);
                } else {
                    status[site] = checkStatus.getSiteSyncDataStatusSimple(syncResult.data.sites[site]);
                    req.logger.debug('getDataStatusSimple: site status converted: %j', status[site]);
                }
            });
        }

        status.allSites = syncResult.data.syncCompleted ? true : false;

        return callback(undefined, {
            status: 200,
            data: status
        });
    });
}

// This should only be used by the UI or in very
// special circumstances as it is an expensive call
function getPatientStatusDetail(pid, req, callback) {
    req.logger.debug('jds-sync-subsystem.getPatientStatusDetail() pid: %s', pid);
    var config = jdsSyncConfig.configureWithPidInPath('getPatientStatusDetail', pid, req);
    jdsSyncConfig.addParam('detailed', 'true', config);
    httpUtil.get(config, syncStatusResultProcessor.bind(null, pid, callback, req));
}


/*
Variadic Function:
function getPatientStatusSimple(pid, siteList, req, callback)
function getPatientStatusSimple(pid, req, callback)
*/
function getPatientStatusSimple(pid, siteList, req, callback) {
    /*  START Variadic Function disambiguation code */
    if (arguments.length === 3) {
        siteList = [];
        req = arguments[1];
        callback = arguments[2];
    }

    if (_.isUndefined(siteList) || _.isNull(siteList)) {
        siteList = [];
    } else if (!_.isArray(siteList)) {
        siteList = [siteList];
    }
    /*  END Variadic Function disambiguation code */

    req.logger.debug('jds-sync-subsystem.getPatientStatusSimple() pid: %s, siteList: %s', pid, siteList);

    var config = jdsSyncConfig.configureWithPidInPath('getPatientStatusSimple', pid, req);
    jdsSyncConfig.addSitesParam(config, siteList);

    req.logger.trace({
        config: config
    }, 'getPatientStatusSimple()');

    httpUtil(config, syncStatusResultProcessor.bind(null, pid, callback, req));
}

function syncPatientDemographics(payload, req, callback) {
    req.logger.debug({
        demographics: payload
    }, 'jds-sync-subsystem.syncPatientDemographics()');

    // Need to setup 'pidToUse' because the audit and the vx-sync sync status
    // endpoint expect to see "pid=DOD;<edipi>", not "edipi=<edipi>".
    var pidToUse;
    if (payload.icn) {
        pidToUse = payload.icn;
    } else if (payload.edipi) {
        pidToUse = 'DOD;' + payload.edipi;
    }

    if (!pidToUse) {
        callback('ICN or EDIPI is required for syncing patients by demographics.');
        return;
    }

    req.logger.debug('jds-sync-subsystem.syncPatientDemographics() using pid: ' + pidToUse);

    var config = jdsSyncConfig.configure('syncPatientDemographics', pidToUse, req);
    payload.pid = pidToUse;
    config.body = payload;
    httpUtil.post(config, function(loaderr, response, loadres) {
        if (isNullish(loadres)) {
            req.logger.error(loaderr);
            callback(500, createErrorResponse());
            return;
        }

        getPatientStatusSimple(pidToUse, req, function(err, syncStatus) {
            if (syncStatus && syncStatus.status < 300) {
                syncStatus.status = 201;
            }

            return callback(err, syncStatus);
        });
    });
}

function getOperationalStatus(site, req, callback) {
    req.logger.debug('jds-sync-subsystem.getOperationStatus() site: %s', site);
    var config = jdsSyncConfig.configure('getOperationalStatus', undefined, req);
    jdsSyncConfig.addSiteToPath(config, req, site);
    httpUtil.get(config, syncStatusResultProcessor.bind(null, null, callback, req));
}

// used in text-search.js and document-detail.js
function getPatientAllSites(pid, req, callback) {
    req.logger.debug('jds-sync-subsystem.getPatientAllSites() pid: %s', pid);
    var config = jdsSyncConfig.configureWithPidInPath('getPatientByPidAllSites', pid, req);
    httpUtil.get(config, syncStatusResultProcessor.bind(null, pid, callback, req));
}

function doLoad(config, pid, immediate, prioritySite, req, callback) {
    req.logger.debug('jds-sync-subsystem.doLoad() pid: %s, immediate: %s, prioritySite: %s', pid, immediate, prioritySite);

    if (_.isEmpty(prioritySite)) {
        prioritySite = [];
    } else if (!_.isArray(prioritySite)) {
        prioritySite = [prioritySite];
    }

    // call sync endpoint to start patient sync
    httpUtil.post(config, function(loaderr, response, loadres) {
        if (loaderr) {
            req.logger.error(loaderr);
            return callback(500, createErrorResponse());
        }

        // If a sync patient is made for a patient that does not exist, VxSync will return
        // a response with status 400 and the message "Patient does not exist in Jds."
        if (response && response.statusCode === 400 || response.statusCode === 404) {
            return callback(404, createErrorResponse(404, noSiteMessage));
        }

        if (isNullish(loadres)) {
            req.logger.error(loaderr || 'Sync for patient %s did not start sucessfully. Response status code was: %s', pid, response.statusCode);
            return callback(500, createErrorResponse());
        }

        req.logger.debug('return immediately? ' + immediate);
        if (immediate) {
            req.logger.debug('Sending response immediately after starting sync (not waiting for sync complete)');
            return getPatientStatusSimple(pid, req, function(error, simpleStatus) {
                if (isNullish(simpleStatus)) {
                    req.logger.error(error, 'Sync request error');
                    return callback(500, createErrorResponse());
                }

                simpleStatus.status = 201;
                req.logger.info('Sync request acknowledged');
                return callback(error, simpleStatus);
            });
        }

        req.logger.trace(loadres);

        waitForPatientLoad(pid, prioritySite, req, callback);
    });
}

/*
req - HTTP request object. It must have the following:
{
    logger: {},     // bunyan logger object
    app: {
        config: {   // RDK configuration object
            jdsSync: {
                settings: {}
            }
        }
    }
}
*/
function waitForPatientLoad(pid, prioritySite, req, callback) {
    req.logger.debug('jds-sync-subsystem.waitForPatientLoad() pid: %s, prioritySite: %s', pid, prioritySite);

    var startTime = process.hrtime();
    var settings = req.app.config.jdsSync.settings;
    var currentTime;
    var totalTime;

    // Define this function and then immediately invoke it via IIFE for a recursive loop
    (function checkSimpleStatus() {
        getPatientStatusSimple(pid, prioritySite, req, function(error, simpleStatus) {
            req.logger.debug('jds-sync-subsystem.waitForPatientLoad() check errors while synching pid: %s, prioritySite: %s', pid, prioritySite);
            req.logger.debug({
                error: error
            }, {
                status: simpleStatus
            }, 'jds-sync-subsystem.waitForPatientLoad() pid: %s, prioritySite: %s', pid, prioritySite);
            // a general error attempting to query JDS (network, etc.)
            if (error || !simpleStatus.data || simpleStatus.status !== 200) {
                req.logger.error({
                    error: error
                }, 'jds-sync-subsystem.waitForPatientLoad() pid: %s, prioritySite: %s', pid, prioritySite);

                return callback(500, createErrorResponse());
            }


            // JDS returned an error record instead of a simple status
            req.logger.debug('jds-sync-subsystem.waitForPatientLoad() check sync record while synching pid: %s, prioritySite: %s', pid, prioritySite);
            if (simpleStatus.data.error) {
                req.logger.error({
                    error: simpleStatus.data.error
                }, 'jds-sync-subsystem.waitForPatientLoad() pid: %s, prioritySite: %s', pid, prioritySite);

                if (simpleStatus.data.error.code === 404) {
                    return callback(404, createErrorResponse(404, noSiteMessage));
                }

                return callback(500, createErrorResponse());
            }

            // the simple status contains a 'hasError' attribute with a value of 'true'
            req.logger.debug('jds-sync-subsystem.waitForPatientLoad() sync status for hasError while synching pid: %s, prioritySite: %s', pid, prioritySite);
            if (isSimpleSyncStatusWithError(simpleStatus.data)) {
                return callback(500, createErrorResponse(500, 'An error occurred during the synchronization of patient pid: ' + pid));
            }

            req.logger.debug('jds-sync-subsystem.waitForPatientLoad() sync status for complete while synching pid: %s, prioritySite: %s', pid, prioritySite);
            if (isSimpleSyncStatusComplete(simpleStatus.data)) {
                req.logger.info({
                    pid: pid,
                    totalTime: totalTime
                }, 'Sync complete');

                req.logger.debug('jds-sync-subsystem.waitForPatientLoad() sync complete for pid: %s, prioritySite: %s', pid, prioritySite);
                return callback(null, simpleStatus);
            }

            currentTime = process.hrtime(startTime);
            totalTime = (currentTime[0] * 1e9 + currentTime[1]) / 1e6; // calculate how long since load started in milliseconds
            req.logger.debug('jds-sync-subsystem.waitForPatientLoad() pid: %s, prioritySite: %s, sync time taken so far: %s', pid, prioritySite, totalTime);

            if (totalTime > settings.timeoutMillis) {
                req.logger.error(pid + ' is taking too long to sync. Waited (milliseconds): %s before giving up and return error 500', totalTime);
                return callback(500, createErrorResponse());
            }

            setTimeout(checkSimpleStatus, settings.waitMillis);
        });
    })();
}

function isSimpleSyncStatusWithError(simpleSyncStatus) {
    if (_.isEmpty(simpleSyncStatus)) {
        return false;
    }

    if (simpleSyncStatus.hasError) {
        return true;
    }

    if (_.isEmpty(simpleSyncStatus.sites)) {
        return false;
    }

    return _.some(simpleSyncStatus.sites, function(site) {
        return site.hasError;
    });
}

function isSimpleSyncStatusComplete(simpleSyncStatus) {
    if (_.isEmpty(simpleSyncStatus)) {
        return false;
    }

    if (_.has(simpleSyncStatus, 'syncCompleted') && !simpleSyncStatus.syncCompleted) {
        return false;
    }

    return _.every(simpleSyncStatus.sites, function(site) {
        return site.syncCompleted;
    });
}

function syncStatusResultProcessor(pid, callback, req, error, response, data) {
    if (error) {
        return callback(error, createErrorResponse(500, data));
    }

    if (!response) {
        return callback(error, createErrorResponse(500, data));
    }

    if (response.statusCode === 404) {
        return callback(error, createErrorResponse(404, util.format('pid %s is unsynced', pid)));
    }

    if (response.statusCode === 200 || response.statusCode === 202) {
        req.logger.trace({
            syncResponse: response
        }, 'sync status result');

        return callback(error, {
            status: response.statusCode,
            data: data
        });
    }

    return callback(error, createErrorResponse(response.statusCode, data));
}

function createErrorResponse(status, data) {
    status = status || 500;
    if (data && _.isEmpty(data)) {
        data = undefined;
    }

    if (_.isObject(data)) {
        return {
            status: status,
            data: data
        };
    }

    return {
        status: _.isNumber(status) ? status : 500,
        data: {
            error: {
                code: status,
                message: data || 'There was an error processing your request. The error has been logged.'
            }
        }
    };
}

function createStandardResponse(status, message) {
    return {
        status: status,
        data: {
            data: {
                code: status,
                message: message
            }
        }
    };
}
