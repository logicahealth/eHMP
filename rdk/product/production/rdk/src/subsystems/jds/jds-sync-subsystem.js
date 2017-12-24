'use strict';

let _ = require('lodash');
let rdk = require('../../core/rdk');
let httpUtil = rdk.utils.http;
let nullchecker = require('../../utils/nullchecker');
let checkStatus = require('./jds-sync-check-status');
let jdsSyncConfig = require('./jds-sync-config');
let isNullish = nullchecker.isNullish;
let isNotNullish = nullchecker.isNotNullish;

let isParsedToPositiveInteger = require('../../utils/integer-checker').isParsedToPositiveInteger;

module.exports.getSubsystemConfig = getSubsystemConfig;
module.exports.loadPatient = loadPatient;
module.exports.loadPatientPrioritized = loadPatientPrioritized;
module.exports.loadPatientForced = loadPatientForced;
module.exports.clearPatient = clearPatient;
module.exports.createSimpleStatusResult = createSimpleStatusResult;
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

const noSiteMessage = 'This patient\'s record is not yet accessible. Please try again in a few minutes. If it is still not accessible, please contact your HIMS representative and have the patient loaded into your local VistA.';

function getSubsystemConfig(app, logger) {
    return {
        healthcheck: {
            name: 'jdsSync',
            dependencies: ['authorization'],
            interval: 100000,
            check: function(callback) {
                let jdsConfig = {
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
    req.logger.debug('jds-sync-subsystem.loadPatient() pid: [%s], immediate? [%s]', pid, immediate);
    let config = jdsSyncConfig.configureWithPidParam('loadPatient', pid, req);
    doLoad(config, pid, immediate, null, req, callback);
}

function loadPatientPrioritized(pid, prioritySite, req, callback) {
    req.logger.debug('jds-sync-subsystem.loadPatientPrioritized() pid: [%s], prioritySite: [%s]', pid, prioritySite);
    let config = jdsSyncConfig.configureWithPidParam('loadPatient', pid, req);
    doLoad(config, pid, false, prioritySite, req, callback);
}

function loadPatientForced(pid, forcedSite, immediate, req, callback) {
    req.logger.debug('jds-sync-subsystem.loadPatientForced() pid: [%s], forcedSite: [%s], immediate? [%s]', pid, forcedSite, immediate);
    let config = jdsSyncConfig.configureWithPidParam('loadPatient', pid, req);
    jdsSyncConfig.addForcedParam(config, req, forcedSite);
    doLoad(config, pid, immediate, null, req, callback);
}

function clearPatient(pid, req, callback) {
    req.logger.debug('jds-sync-subsystem.clearPatient() pid: [%s]', pid);
    jdsSyncConfig.setupAudit(pid, req);

    let config = jdsSyncConfig.getSyncConfig('clearPatient', req);
    jdsSyncConfig.addPidParam(config, req, pid);

    // This call does not invoke the callback until an error
    // occurs or the patient has been completely cleared.
    httpUtil.post(config, function(error, response) {
        if (error) {
            req.logger.error({
                error: error
            }, `jds-sync-subsystem.clearPatient() pid: [${pid}]`);
            return callback(error);
        }

        // If clearPatient is called on a patient that does not exist in JDS,
        // JDS will return a response with status 404 and the message "Patient not found"
        if (response && response.statusCode === 404) {
            return callback(404, createErrorResponse(error, `pid: ${pid} not found.`));
        }

        if (response && 200 <= response.statusCode && response.statusCode <= 299) {
            return callback(null, createStandardResponse(200, `pid: ${pid} unsynced.`));
        }

        return callback(500, createErrorResponse(500, `An error has interrupted the patient synchronization process. Please report this error to your local help desk or system administrator: Patient ${pid} was not unsynced after a failed sync.`));
    });
}

// Used by patient-sync.js and patient-sync-resource.js
function getPatientStatus(pid, req, callback) {
    req.logger.debug('jds-sync-subsystem.getPatientStatus() pid: [%s]', pid);
    let config = jdsSyncConfig.configureWithPidParam('getPatientStatus', pid, req);
    req.logger.trace({
        config: config
    }, `jds-sync-subsystem.getPatientStatus() pid: [${pid}]`);
    httpUtil.get(config, syncStatusResultProcessor.bind(null, pid, callback, req));
}

// This is used by patient-sync-resource.js
// This function adds fields to the Simple Sync Status for compatibility
function getPatientDataStatusSimple(pid, req, callback) {
    req.logger.debug('jds-sync-subsystem.getPatientDataStatusSimple() pid: [%s]', pid);
    getPatientStatusSimple(pid, req, function(syncError, syncResult) {
        if (_.get(syncResult, 'error.code') === 404) {
            return callback(syncResult.error.code, syncResult);
        }

        if (_.get(syncResult, 'data.error.code') === 404) {
            return callback(syncResult.data.error.code, syncResult.data);
        }

        if (isNotNullish(syncError)) {
            let syncStatus = (syncResult && syncResult.status) || 500;
            let data = (syncResult && syncResult.data) || syncError;
            return callback(syncStatus, createErrorResponse(syncStatus, data));
        }

        if (syncResult.status !== 200) {
            return callback(syncResult.status || 500, createErrorResponse(syncResult.status, syncResult.data));
        }

        let status = createSimpleStatusResult(req.logger, _.keys(req.app.config.vistaSites), syncResult);

        return callback(undefined, {
            status: 200,
            data: status
        });
    });
}

function createSimpleStatusResult(logger, vistaSites, syncResult) {
    logger.debug('jds-sync-subsystem.createSimpleStatusResult()');

    let status = {};
    let sites = [];
    if (syncResult.data) {
        if (syncResult.data.sites) {
            sites = _.keys(syncResult.data.sites);
        }
        if (syncResult.data.latestSourceStampTime) {
            status.latestSourceStampTime = syncResult.data.latestSourceStampTime;
        }
        if (_.has(syncResult.data, 'solrSyncCompleted')) {
            status.isSolrSyncCompleted = syncResult.data.solrSyncCompleted;
        }
        if (_.has(syncResult.data, 'hasSolrError')) {
            status.hasSolrError = syncResult.data.hasSolrError;
        }
    }

    if (!_.isEmpty(sites)) {
        _.each(sites, function(site) {
            logger.debug(site);
            if (_.contains(vistaSites, site)) {
                status.VISTA = status.VISTA || {};
                status.VISTA[site] = checkStatus.getSiteSyncDataStatusSimple(syncResult.data.sites[site]);
                logger.debug('jds-sync-subsystem.createSimpleStatusResult(): getDataStatusSimple(): site status converted: %j', status.VISTA[site]);
            } else {
                status[site] = checkStatus.getSiteSyncDataStatusSimple(syncResult.data.sites[site]);
                logger.debug('jds-sync-subsystem.createSimpleStatusResult(): getDataStatusSimple(): site status converted: %j', status[site]);
            }
        });
    }

    status.allSites = syncResult.data.syncCompleted ? true : false;

    return status;
}

// This should only be used by the UI or in very
// special circumstances as it is an expensive call
function getPatientStatusDetail(pid, req, callback) {
    req.logger.debug('jds-sync-subsystem.getPatientStatusDetail() pid: [%s]', pid);
    let config = jdsSyncConfig.configureWithPidInPath('getPatientStatusDetail', pid, req);
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

    req.logger.debug('jds-sync-subsystem.getPatientStatusSimple() pid: [%s], siteList: [%s]', pid, siteList);

    let config = jdsSyncConfig.configureWithPidInPath('getPatientStatusSimple', pid, req);
    jdsSyncConfig.addSitesParam(config, siteList);

    req.logger.trace({
        config: config
    }, `jds-sync-subsystem.getPatientStatusSimple() pid: [${pid}], siteList: [${siteList}]`);

    httpUtil.get(config, syncStatusResultProcessor.bind(null, pid, callback, req));
}

function syncPatientDemographics(payload, req, callback) {
    req.logger.trace({
        demographics: payload
    }, 'jds-sync-subsystem.syncPatientDemographics()');
    req.logger.debug('jds-sync-subsystem.syncPatientDemographics()');

    // Need to setup 'pidToUse' because the audit and the vx-sync sync status
    // endpoint expect to see "pid=DOD;<edipi>", not "edipi=<edipi>".
    let pidToUse;
    if (payload.icn) {
        pidToUse = payload.icn;
    } else if (payload.edipi) {
        pidToUse = 'DOD;' + payload.edipi;
    }

    if (!pidToUse) {
        callback('ICN or EDIPI is required for syncing patients by demographics.');
        return;
    }

    req.logger.debug('jds-sync-subsystem.syncPatientDemographics() using pid: [%s]' + pidToUse);

    let config = jdsSyncConfig.configure('syncPatientDemographics', pidToUse, req);
    payload.pid = pidToUse;
    config.body = payload;
    httpUtil.post(config, function(error, response, body) {
        if (isNullish(body)) {
            req.logger.error({
                error: error
            }, `jds-sync-subsystem.syncPatientDemographics() error syncing patient using pid: [%${pidToUse}]`);
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
    req.logger.debug('jds-sync-subsystem.getOperationStatus() site: [%s]', site);
    let config = jdsSyncConfig.configure('getOperationalStatus', undefined, req);
    jdsSyncConfig.addSiteToPath(config, req, site);
    httpUtil.get(config, syncStatusResultProcessor.bind(null, null, callback, req));
}

// used in text-search.js and document-detail.js
function getPatientAllSites(pid, req, callback) {
    req.logger.debug('jds-sync-subsystem.getPatientAllSites() pid: [%s]', pid);
    let config = jdsSyncConfig.configureWithPidInPath('getPatientByPidAllSites', pid, req);
    httpUtil.get(config, syncStatusResultProcessor.bind(null, pid, callback, req));
}

function doLoad(config, pid, immediate, prioritySite, req, callback) {
    req.logger.debug('jds-sync-subsystem.doLoad() pid: [%s], prioritySite: [%s], immediate: [%s]', pid, prioritySite, immediate);

    if (_.isEmpty(prioritySite)) {
        prioritySite = [];
    } else if (!_.isArray(prioritySite)) {
        prioritySite = [prioritySite];
    }

    // call sync endpoint to start patient sync
    httpUtil.post(config, function(error, response, body) {
        if (error) {
            req.logger.error('jds-sync-subsystem.doLoad(): Error returned when starting sync for pid: [%s], prioritySite: [%s], error: %j', pid, prioritySite, error);
            return callback(500, createErrorResponse());
        }

        // If a sync patient is made for a patient that does not exist, VxSync will return
        // a response with status 400 and the message "Patient does not exist in Jds."
        if (response && response.statusCode === 400 || response.statusCode === 404) {
            req.logger.warn('jds-sync-subsystem.doLoad(): Sync called for a patient that does not exist for pid: [%s], prioritySite: [%s]', pid, prioritySite);
            return callback(404, createErrorResponse(404, noSiteMessage));
        }

        if (isNullish(body)) {
            req.logger.error('jds-sync-subsystem.doLoad(): Sync for pid: [%s], prioritySite: [%s] did not start sucessfully. Response status code was: %s, Error: %j', pid, prioritySite, response.statusCode, error);
            return callback(500, createErrorResponse());
        }

        req.logger.debug('jds-sync-subsystem.doLoad() pid: [%s], prioritySite: [%s], immediate? [%s]', pid, prioritySite, immediate);
        if (immediate) {
            req.logger.debug('jds-sync-subsystem.doLoad() pid: [%s], prioritySite: [%s] Sending response immediately after starting sync (not waiting for sync complete)');
            return getPatientStatusSimple(pid, req, function(error, simpleStatus) {
                if (isNullish(simpleStatus)) {
                    req.logger.error({
                        error: error
                    }, `jds-sync-subsystem.doLoad() Sync request error for pid: [${pid}], prioritySite: [${prioritySite}]`);
                    return callback(500, createErrorResponse());
                }

                simpleStatus.status = 201;
                req.logger.info('jds-sync-subsystem.doLoad() Sync request acknowledged for pid: [%s], prioritySite: [%s]', pid, prioritySite);
                return callback(error, simpleStatus);
            });
        }

        req.logger.trace(body);

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
    req.logger.debug('jds-sync-subsystem.waitForPatientLoad() pid: [%s], prioritySite: [%s]', pid, prioritySite);

    let startTime = process.hrtime();
    let settings = req.app.config.jdsSync.settings;
    let currentTime;
    let totalTimeMillis;

    // Define this function and then immediately invoke it via IIFE for a recursive loop
    (function checkSimpleStatus() {
        req.logger.debug('jds-sync-subsystem.waitForPatientLoad() checkSimpleStatus() pid: [%s], prioritySite: [%s]', pid, prioritySite);
        // We need to get the "full" simple status in case the patient does not have
        // data in the prioritySite, as in that case, we will need to interrogate the
        // sync data for the status of other sites.
        getPatientStatusSimple(pid, req, function(error, simpleStatus) {
            currentTime = process.hrtime(startTime);
            totalTimeMillis = Math.floor((currentTime[0] * 1e9 + currentTime[1]) / 1e6); // calculate how long since load started in milliseconds

            req.logger.debug({
                error: error,
                status: simpleStatus
            }, `jds-sync-subsystem.waitForPatientLoad() checkSimpleStatus() response pid: [${pid}], prioritySite: [${prioritySite}]`);

            // 1. general error attempting to query JDS (network, etc.)
            req.logger.debug('jds-sync-subsystem.waitForPatientLoad() 1. checkSimpleStatus() check errors while synching pid: [%s], prioritySite: [%s]', pid, prioritySite);
            if (error || !simpleStatus.data || simpleStatus.status >= 500) {
                req.logger.error({
                    error: error
                }, `jds-sync-subsystem.waitForPatientLoad() 1a. checkSimpleStatus() error pid: [${pid}], prioritySite: [${prioritySite}]`);

                return callback(500, createErrorResponse());
            }

            // 2. JDS returned an error record instead of a simple status
            req.logger.debug('jds-sync-subsystem.waitForPatientLoad() 2. checkSimpleStatus() check sync record while synching pid: [%s], prioritySite: [%s]', pid, prioritySite);
            if (simpleStatus.data.error) {
                req.logger.error({
                    error: simpleStatus.data.error
                }, `jds-sync-subsystem.waitForPatientLoad() 2a. checkSimpleStatus() error code pid: [${pid}], prioritySite: [${prioritySite}]`);

                if (simpleStatus.data.error.code === 404) {
                    return callback(404, createErrorResponse(404, noSiteMessage));
                }

                return callback(simpleStatus.data.error.code, createErrorResponse());
            }

            // 3. the sync is complete for the prioritySite or all sites if no value was passed in for prioritySite
            req.logger.debug('jds-sync-subsystem.waitForPatientLoad() 3. checkSimpleStatus() sync status for complete while synching pid: [%s], prioritySite: [%s]', pid, prioritySite);
            if (isSimpleSyncStatusComplete(simpleStatus.data, prioritySite)) {
                req.logger.info('jds-sync-subsystem.waitForPatientLoad() 3a. checkSimpleStatus() sync complete for pid: [%s], prioritySite: [%s], after %s milliseconds', pid, prioritySite, totalTimeMillis);
                return callback(null, simpleStatus);
            }

            // 4. if latestEnterpriseSyncRequestTimestamp is empty, this will not resolve, so return an error
            // This condition can happen when all of a patient's job history is deleted. Even
            // though the patient sync was complete, removing the job history will cause the
            // latestEnterpriseSyncRequestTimestamp field to contain an empty string (and the
            // sync status to be incomplete).
            req.logger.debug('jds-sync-subsystem.waitForPatientLoad() 4. checkSimpleStatus() pid: [%s], prioritySite: [%s], latestEnterpriseSyncRequestTimestamp: [%s]', pid, prioritySite, simpleStatus.data.latestEnterpriseSyncRequestTimestamp);
            if (!isParsedToPositiveInteger(simpleStatus.data.latestEnterpriseSyncRequestTimestamp)) {
                req.logger.error('jds-sync-subsystem.waitForPatientLoad() 4a. checkSimpleStatus() pid: [%s], prioritySite: [%s] latestEnterpriseSyncRequestTimestamp: [%s] is not an Integer', pid, prioritySite, simpleStatus.data.latestEnterpriseSyncRequestTimestamp);
                return callback(500, createErrorResponse());
            }

            // 5. the simple status contains a 'hasError' attribute with a value of 'true'
            req.logger.debug('jds-sync-subsystem.waitForPatientLoad() 5. checkSimpleStatus() check sync status for hasError while synching pid: [%s], prioritySite: [%s]', pid, prioritySite);
            if (isSimpleSyncStatusWithError(simpleStatus.data, prioritySite)) {
                req.logger.debug('jds-sync-subsystem.waitForPatientLoad() 5a. checkSimpleStatus() sync status hasError true while synching pid: [%s], prioritySite: [%s]', pid, prioritySite);
                return callback(500, createErrorResponse(500, `An error occurred during the synchronization of patient pid: [${pid}], prioritySite: [%{prioritySite}]`));
            }

            // 6. timeout while waiting to sync
            req.logger.debug('jds-sync-subsystem.waitForPatientLoad() 6. checkSimpleStatus() pid: [%s], prioritySite: [%s], sync time taken so far: %s milliseconds', pid, prioritySite, totalTimeMillis);
            if (totalTimeMillis > settings.timeoutMillis) {
                req.logger.error('jds-sync-subsystem.waitForPatientLoad() 6a. checkSimpleStatus() pid: [%s], prioritySite: [%s] is taking too long to sync. Waited %s milliseconds before giving up and return error 500', pid, prioritySite, totalTimeMillis);
                return callback(500, createErrorResponse());
            }

            // 7. still syncing, loop again
            req.logger.debug('jds-sync-subsystem.waitForPatientLoad() 7. checkSimpleStatus() pid: [%s], prioritySite: [%s], looping again', pid, prioritySite);
            setTimeout(checkSimpleStatus, settings.waitMillis);
        });
    })();
}

/*
Variadic Function:
isSimpleSyncStatusWithError(simpleSyncStatus)
isSimpleSyncStatusWithError(simpleSyncStatus, prioritySite)

Tests whether or not a sync has errors. If a prioritySite is passed
in and exists in the status, this function will return true only if
that site has an erro, regardless of the existence of errors in
other sites.

If no prioritySite is passed, or the site does not exist in the status,
then the function will return true only if EVERY site has an error.
*/
function isSimpleSyncStatusWithError(simpleSyncStatus, prioritySite) {
    if (_.isEmpty(simpleSyncStatus) || _.isEmpty(simpleSyncStatus.sites)) {
        return false;
    }

    // If prioritySite has a non-nullish non-empty value, and it exists
    // in the status, return its error value.
    if (!_.isEmpty(prioritySite) && _.has(simpleSyncStatus.sites, prioritySite)) {
        return !!simpleSyncStatus.sites[prioritySite].hasError;
    }

    if (simpleSyncStatus.hasError) {
        return true;
    }

    return _.every(simpleSyncStatus.sites, function(site) {
        return !!site.hasError;
    });
}

/*
Variadic Function:
isSimpleSyncStatusComplete(simpleSyncStatus)
isSimpleSyncStatusComplete(simpleSyncStatus, prioritySite)

Tests whether or not a sync is complete. If a prioritySite is passed
in and exists in the status, this function will only test the status
of that site and ignore the status of other sites (including the
presence of errors).

If no prioritySite is passed, or the site does not exist in the status,
then the function will return true if any site is complete.
*/
function isSimpleSyncStatusComplete(simpleSyncStatus, prioritySite) {
    if (_.isEmpty(simpleSyncStatus) || _.isEmpty(simpleSyncStatus.sites)) {
        return false;
    }

    // if the top-level syncComplete is true, then sync must be complete
    if (simpleSyncStatus.syncCompleted) {
        return true;
    }

    // No prioritySite value or it does not exist in the status,
    // so check if at least one site is complete
    if (_.isEmpty(prioritySite) || !_.has(simpleSyncStatus.sites, prioritySite)) {
        return _.some(simpleSyncStatus.sites, function(site) {
            return site.syncCompleted;
        });
    }

    // Check if the prioritySite is complete
    return simpleSyncStatus.sites[prioritySite].syncCompleted;
}

function syncStatusResultProcessor(pid, callback, req, error, response, data) {
    if (error) {
        req.logger.info('Sync status result error');
        req.logger.error(error);
        return callback(error, createErrorResponse(500, data || 'There was an error processing your request. The error has been logged. The sync status server could not be reached.'));
    }

    if (!response) {
        req.logger.info('Sync status result error');
        req.logger.error(error);
        return callback(error, createErrorResponse(500, data || 'There was an error processing your request. The error has been logged. The sync status response was empty.'));
    }

    if (response.statusCode === 404) {
        return callback(error, createErrorResponse(404, `pid ${pid} is unsynced`));
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
