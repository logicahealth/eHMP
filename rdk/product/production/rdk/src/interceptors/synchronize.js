'use strict';

let _ = require('lodash');
let moment = require('moment');

let isParsedToPositiveInteger = require('../utils/integer-checker').isParsedToPositiveInteger;

var timerOptions = {
    roundTo: 5
};
// Perhaps a future version should use the jds-sync-subsystem.js
// implementation rather than including this here.
const standardErrorResponse = {
    status: 500,
    data: {
        error: {
            code: 500,
            message: 'There was an error processing your request. The error has been logged.'
        }
    }
};

// Perhaps a future version should use the jds-sync-subsystem.js
// implementation rather than including this here.
const noSiteResponse = {
    status: 404,
    data: {
        error: {
            code: 404,
            message: 'This patient\'s record is not yet accessible. Please try again in a few minutes. If it is still not accessible, please contact your HIMS representative and have the patient loaded into your local VistA.'
        }
    }
};

/*
function intercept(req, res, next)

For testing purposes, you can inject a jdsSync instance in the req parameter:
req.jdsSync = { // test implementation object }.

To write a test harness, you must provide the following:

req = {
    audit: {},
    session: {
        user: {
            site: 'SITE' // the 'mySite' value
        }
    },
    interceptors: {
        synchronize: {
            disabled: false
        }
    },
    param: function(key) {
        if(key === 'pid') {
            return 'SITE;3'; // the pid of the test patient
        }
    },
    params: {
        pid: 'SITE;3' // the pid of the test patient
    },
    logger: {
        trace: function() {},
        debug: function() {},
        info: function() {},
        warn: function() {},
        error: function() {},
        fatal: function() {},
    },
    app: {
        config: {
            resync: {
                inactivityTimeoutMillis: 1000 * 60 * 60 * 24,
                lastSyncMaxIntervalMillis: 1000 * 60 * 10,
                errorCooldownMinIntervalMillis: 1000 * 60
            },
            jdsSync: {
                settings: {
                    waitMillis: 1000,
                    timeoutMillis: 1000 * 60 * 7,
                    syncExistsWaitDelayMillis: 1000 * 30
                }
            },
            vxSyncServer: {
                baseUrl: 'http://IP           '
            },
            jdsServer: {
                baseUrl: 'http://IP             ',
                urlLengthLimit: 120
            }
        }
    },
    jdsSync: { // These are all implemented in jds-sync-subsystem.js
        getPatientStatusSimple: function(pid, req, callback) {},
        waitForPatientLoad: function(pid, mySite, req, callback) {},
        clearPatient: function(pid, req, callback) {},
        loadPatientPrioritized: function(pid, mySite, req, callback) {}
    }
}

res = {
    status: function(statusCode) {
        return {
            rdkSend: function(response) {};
        };
    }
}

*/
function intercept(req, res, next) {
    req.timers.start('syncronize_intercept', timerOptions);
    req.logger.debug('synchronize.intercept()');

    let config = req.app.config;
    let logger = req.logger;

    let jdsSync = req.jdsSync || _.get(req, ['app', 'subsystems', 'jdsSync']);

    // This is the "mySite" (if any)
    let mySite = _.get(req, ['session', 'user', 'site'], null);

    // This is the maximum amount of time that is allowed to pass without an update
    // to a job status or metastamp before the job is considered to have stalled.
    let inactivityTimeoutMillis = config.resync.inactivityTimeoutMillis || 1000 * 60 * 60 * 24;

    // This is the amount of time between calls to the sync endpoint. This is because
    // we don't want to call sync every time, but we need to call it often enough to
    // ensure that secondary data can't get too stale. VxSync doesn't duplicate sync
    // requests (i.e. multiple sync requests on the same patient at the same time),
    // but too many calls close together can degrade performance.
    let lastSyncMaxIntervalMillis = config.resync.lastSyncMaxIntervalMillis || 1000 * 60 * 10;

    // This is the minimum amount of time that must pass before the existence of a "hasError"
    // attribute in the sync status for "MySite" causes a new sync. Errors within less than than
    // that interval of time will cause the interceptor to return with the standard error response.
    let errorCooldownMinIntervalMillis = config.resync.errorCooldownMinIntervalMillis || 1000 * 60;
    if (isInterceptorDisabled(config)) {
        logger.warn('synchronize.intercept() interceptor disabled');
        req.timers.stop('syncronize_intercept');
        return next();
    }

    // Note: Strictly speaking, this is not a 'pid' the way VxSync defines that term.
    // It is just a general 'patient-identifier'.
    let pid = _.get(req, 'query.pid') || _.get(req, 'body.pid') || _.get(req, 'params.pid');

    if (!pid) {
        logger.debug('synchronize.intercept() no "pid" query parameter, skip sync');
        req.timers.stop('syncronize_intercept');
        return next();
    }

    // Synchronizing a patient on an EDIPI or ICN type identifier means that the
    // sync interceptor will wait for the first site to complete before returning.
    if (isEdipi(pid) || isIcn(pid)) {
        logger.debug('synchronize.intercept() "pid" value was an EDIPI or ICN. Waiting for pid: [%s] sync on at least one site', pid);
        return waitForFirstSitePatientSync(logger, config, jdsSync, pid, req, res, next);
    }

    jdsSync.getPatientStatusSimple(pid, req, function(error, syncStatus) {
        logger.trace({
            status: syncStatus
        }, `synchronize.intercept() called jdsSync.getPatientStatusSimple() for sync status check for pid: [${pid}], mySite: [${mySite}]`);
        logger.debug(`synchronize.intercept() called jdsSync.getPatientStatusSimple() for sync status check for pid: [${pid}], mySite: [${mySite}]`);

        // 1. on error, next()
        logger.debug('synchronize.intercept() 1. Check for error retrieving simple sync status for pid: [%s], mySite: [%s]', pid, mySite);
        if (error || _.isEmpty(syncStatus) || _.isEmpty(syncStatus.data) || (syncStatus.data.error && syncStatus.data.error.code !== 404)) {
            logger.warn({
                error: error
            }, `synchronize.intercept() 1a. Error retrieving simple sync status for pid: [${pid}], mySite: [${mySite}]; skipping`);
            req.timers.stop('syncronize_intercept');
            return next();
        }

        // 2. patient not found, therefore, it should be synchronized
        logger.info('synchronize.intercept() 2. Check for patient not found, synchronizing pid: [%s], mySite: [%s]', pid, mySite);
        if (syncStatus.data.error && syncStatus.data.error.code === 404) {
            logger.info('synchronize.intercept() 2a. Patient not found, synchronizing pid: [%s], mySite: [%s]', pid, mySite);
            return syncPatient(config, logger, jdsSync, pid, mySite, req, res, next);
        }

        // 3. if sync for mySite is complete, check to be sure that sync() doesn't need to be called
        logger.debug('synchronize.intercept() 3. check if patient pid: [%s], mySite: [%s] is synced, but exceeds timeout', pid, mySite);
        let mySiteSynchComplete = _.get(syncStatus, ['data', 'sites', mySite, 'syncCompleted']);
        if (mySiteSynchComplete) {
            if (isSyncLastUpdateTimeoutExceeded(syncStatus.data, lastSyncMaxIntervalMillis)) {
                logger.trace(syncStatus, 'synchronize.intercept() 3a. Patient pid: [%s], mySite: [%s] synced, but exceeded timeout, resyncing patient', pid, mySite);
                logger.info('synchronize.intercept() 3a. Patient pid: [%s], mySite: [%s] synced, but exceeded timeout, resyncing patient', pid, mySite);
                return syncPatient(config, logger, jdsSync, pid, mySite, req, res, next);
            }

            logger.info('synchronize.intercept() 3b. Patient pid: [%s], mySite: [%s] is synced and syncPatient() does not need to be called', pid, mySite);
            req.timers.stop('syncronize_intercept');
            return next();
        }

        // 4. if latestEnterpriseSyncRequestTimestamp is empty, clear and resync
        // Failing to clear the patient first can result in the VistA data not being synced.
        // This condition can happen when all of a patient's job history is deleted. Even
        // though the patient sync was complete, removing the job history will cause the
        // latestEnterpriseSyncRequestTimestamp field to contain an empty string (and the
        // sync status to be incomplete).
        logger.debug('jds-sync-subsystem.waitForPatientLoad() 4. checkSimpleStatus() check pid: [%s], prioritySite: [%s], latestEnterpriseSyncRequestTimestamp: [%s] is an integer', pid, mySite, syncStatus.data.latestEnterpriseSyncRequestTimestamp);
        if (!isParsedToPositiveInteger(syncStatus.data.latestEnterpriseSyncRequestTimestamp)) {
            logger.info('synchronize.intercept() 4a. latestEnterpriseSyncRequestTimestamp:[%s] is not an integer, clearing and resyncing pid: [%s], mySite: [%s]', syncStatus.data.latestEnterpriseSyncRequestTimestamp, pid, mySite);
            return clearThenSyncPatient(config, logger, jdsSync, pid, mySite, req, res, next);
        }

        // 5. if there is an error in the sync status for mySite, check to sync again or just return an error
        logger.info('synchronize.intercept() 5. Check for error found in site [%s] sync status for pid: [%s]', mySite, pid);
        let errorInSite = _.get(syncStatus, ['data', 'sites', mySite, 'hasError'], false);
        if (errorInSite) {
            if (isErrorCooldownTimeoutExceeded(syncStatus.data, errorCooldownMinIntervalMillis)) {
                logger.info('synchronize.intercept() 5a. An error found in site [%s] for pid: [%s], cooldown exceeded, resyncing patient', mySite, pid);
                return syncPatient(config, logger, jdsSync, pid, mySite, req, res, next);
            }

            logger.info('synchronize.intercept() 5b. An error found in site [%s] for pid: [%s], cooldown exceeded, returning error message', mySite, pid);
            return res.status(500).rdkSend('There was an error processing your request. The error has been logged.');
        }

        // 6. if the sync has been inactive too long, clearAndSync()
        logger.info('synchronize.intercept() 6. Check if the activity timeout was exceeded and patient should be cleared and resynced pid: [%s], mySite: [%s]', pid, mySite);
        if (!syncStatus.data.syncCompleted && isSyncLastUpdateTimeoutExceeded(syncStatus.data, inactivityTimeoutMillis)) {
            logger.info('synchronize.intercept() 6a. The activity timeout was exceeded, clearing and resyncing pid: [%s], mySite: [%s]', pid, mySite);
            return clearThenSyncPatient(config, logger, jdsSync, pid, mySite, req, res, next);
        }

        // 7. if the sync for mySite is not complete and sync is not "stuck", wait for sync on mySite to complete
        logger.info('synchronize.intercept() 7a. Check if patient pid: [%s], mySite: [%s] sync in progress normally and sync interceptor should continue to wait', pid, mySite);
        if (!mySiteSynchComplete && !isSyncLastUpdateTimeoutExceeded(syncStatus.data, inactivityTimeoutMillis)) {
            logger.info('synchronize.intercept() 7a. Patient pid: [%s], mySite: [%s] sync already in progress--awaiting completion', pid, mySite);
            return waitForPatientSync(config, logger, jdsSync, pid, mySite, req, res, next);
        }

        // 8. In all other cases, sync the patient (note: this will use 'mySite' to determine completion)
        logger.trace(syncStatus, 'synchronize.intercept() 8. Calling sync for pid: [%s], mySite: [%s]', pid, mySite);
        logger.info('synchronize.intercept() 8. Calling sync for pid: [%s], mySite: [%s]', pid, mySite);
        syncPatient(config, logger, jdsSync, pid, mySite, req, res, next);
    });
}


function waitForPatientSync(config, logger, jdsSync, pid, mySite, req, res, next) {
    req.timers.start('syncronize_waitForPatientSync', timerOptions);
    logger.debug('synchronize.waitForPatientSync() waiting for pid: [%s], mySite: [%s]', pid, mySite);

    jdsSync.waitForPatientLoad(pid, mySite, req, function(error, result) {
        logger.debug('synchronize.waitForPatientSync() start sync wait callback for pid: [%s], mySite: [%s]', pid, mySite);
        if (error) {
            let status = _.isNumber(error) ? error : 500;
            return res.status(status).rdkSend(result || error);
        }
        req.timers.stop('syncronize_waitForPatientSync');
        next();
    });
}

function clearThenSyncPatient(config, logger, jdsSync, pid, mySite, req, res, next) {
    req.timers.start('syncronize_clearPatient', timerOptions);
    logger.debug('synchronize.clearThenSyncPatient() Clearing, then synchronizing pid: [%s], mySite: [%s]', pid, mySite);

    jdsSync.clearPatient(pid, req, function(error, result) {
        logger.debug('synchronize.clearThenSyncPatient() start syncClear callback for pid: [%s], mySite: [%s]', pid, mySite);
        if (error) {
            let status = _.isNumber(error) ? error : 500;
            result = result || error;
            return res.status(status).rdkSend(result);
        }
        req.timers.stop('syncronize_clearPatient');
        syncPatient(config, logger, jdsSync, pid, mySite, req, res, next);
    });
}

function syncPatient(config, logger, jdsSync, pid, mySite, req, res, next) {
    req.timers.start('syncronize_syncPatient', timerOptions);
    logger.debug('synchronize.syncPatient() Synchronizing pid: [%s], mySite: [%s]', pid, mySite);

    jdsSync.loadPatientPrioritized(pid, mySite, req, function(error, result) {
        logger.debug('synchronize.syncPatient() called jdsSync.loadPatientPrioritized() for pid: [%s], mySite: [%s]', pid, mySite);
        if (error) {
            if (error === 404) {
                logger.debug('synchronize.syncPatient() 404 syncLoad for pid: [%s], mySite: [%s]', pid, mySite);
                return res.status(404).rdkSend(noSiteResponse);
            }

            logger.error('synchronize.syncPatient() Error synchronizing pid: [%s], mySite: [%s]', pid, mySite);
            logger.error('synchronize.syncPatient() %j', error);
            return res.status(500).rdkSend('There was an error processing your request. The error has been logged.');
        }

        if (!result) {
            logger.error('synchronize.syncPatient() Empty response from sync subsystem for pid: [%s], mySite: [%s]', pid, mySite);
            return res.status(500).rdkSend('There was an error processing your request. The error has been logged.');
        }

        if (!_.has(result, 'data') || result.status === 500) {
            logger.error('synchronize.syncPatient() Error response from sync subsystem for `pid: [%s], mySite: [%s]`', pid, mySite);
            logger.error('synchronize.syncPatient() %j', result);
            req.timers.stop('syncronize_syncPatient');
            return next();
        }

        if (result.status === 404) {
            logger.debug('synchronize.syncPatient() 404 syncLoad for pid: [%s], mySite: [%s]', pid, mySite);
            return res.status(result.status).rdkSend(result);
        }

        logger.trace(result);

        logger.debug('synchronize.syncPatient() syncLoad for pid: [%s], mySite: [%s] - continue', pid, mySite);
        req.timers.stop('syncronize_syncPatient');
        next();
    });
}


/*
Variadic Function
function waitForFirstSitePatientSync(logger, config, pid, req, res, next, startTime)
function waitForFirstSitePatientSync(logger, config, pid, req, res, next)

startTime: not included in the initial recursive call
*/
function waitForFirstSitePatientSync(logger, config, jdsSync, pid, req, res, next, startTime) {
    req.timers.start('synchronize_waitForFirstSitePatientSync', timerOptions);
    logger.debug('synchronize.waitForFirstSitePatientSync() pid: [%s]', pid);

    jdsSync.getPatientStatusSimple(pid, req, function(error, syncStatus) {
        logger.trace({
            status: syncStatus
        }, `synchronize.waitForFirstSitePatientSync() called jdsSync.getPatientStatusSimple() for pid: [${pid}] for first site`);

        // 1. error returned in callback
        logger.debug('synchronize.waitForFirstSitePatientSync() 1. Check for error retrieving simple sync status for pid: [%s]', pid);
        if (error || _.isEmpty(syncStatus) || _.isEmpty(syncStatus.data) || (syncStatus.data.error && syncStatus.data.error.code !== 404)) {
            logger.warn({
                error: error
            }, `synchronize.waitForFirstSitePatientSync() 1a. Error retrieving simple sync status for pid: [${pid}], so skipping`);
            req.timers.stop('synchronize_waitForFirstSitePatientSync');
            return next();
        }

        let now = Date.now();
        let loopDelayMillis = config.jdsSync.settings.waitMillis;
        let syncTimeoutMillis = config.jdsSync.settings.timeoutMillis;
        let syncExistsWaitDelayMillis = config.jdsSync.settings.syncExistsWaitDelayMillis;

        // if sync has already started, try to use the earliest timestamp/stampTime for the
        // sync timeout calculation. Otherwise use the current time. Note that this should
        // only be relevant to the first invocation of waitForFirstSitePatientSync() in the
        // recursive call stack.
        startTime = startTime || minMoment([new Date(),
            syncStatus.data.latestEnterpriseSyncRequestTimestamp,
            syncStatus.data.latestJobTimestamp,
            moment(syncStatus.data.latestSourceStampTime, 'YYYYMMDDHHmmss')
        ]).valueOf();

        logger.debug('synchronize.waitForFirstSitePatientSync() pid: [%s] loopDelayMillis=%s syncTimeoutMillis=%s syncExistsWaitDelayMillis=%s', pid, loopDelayMillis, syncTimeoutMillis, syncExistsWaitDelayMillis);

        // 2. 404 and 404-timeout exceeded: res.send(result.status, result.data)
        logger.debug('synchronize.waitForFirstSitePatientSync() 2. Check for patient not found, pid: [%s]', pid);
        if (syncStatus.data.error && syncStatus.data.error.code === 404) {
            if (isSyncExistsDelayAtTimeout(startTime, syncExistsWaitDelayMillis)) {
                logger.warn('synchronize.waitForFirstSitePatientSync() 2a. Patient Sync for pid: [%s], timeout waiting to get past 404 status', pid);
                return res.status(404).rdkSend(noSiteResponse);
            }

            logger.info('synchronize.waitForFirstSitePatientSync() 2b. Patient sync for [%s] returned 404, continuing to wait', pid);
            return setTimeout(waitForFirstSitePatientSync, loopDelayMillis, logger, config, jdsSync, pid, req, res, next, startTime);
        }

        // 3. Patient Sync complete: next()
        logger.info('synchronize.waitForFirstSitePatientSync() 3. Check if sync complete for at least one site for pid: [%s]', pid);
        if (isOneSiteCompleted(syncStatus)) {
            logger.info('synchronize.waitForFirstSitePatientSync() 3a. Sync complete for at least one site for pid: [%s]', pid);
            req.timers.stop('synchronize_waitForFirstSitePatientSync');
            return next();
        }

        // 4. if latestEnterpriseSyncRequestTimestamp is empty, this will not resolve, so return an error
        // This condition can happen when all of a patient's job history is deleted. Even
        // though the patient sync was complete, removing the job history will cause the
        // latestEnterpriseSyncRequestTimestamp field to contain an empty string (and the
        // sync status to be incomplete).
        logger.debug('synchronize.waitForFirstSitePatientSync() 4. pid: [%s], latestEnterpriseSyncRequestTimestamp: [%s]', pid, syncStatus.data.latestEnterpriseSyncRequestTimestamp);
        if (!isParsedToPositiveInteger(syncStatus.data.latestEnterpriseSyncRequestTimestamp)) {
            logger.error('synchronize.waitForFirstSitePatientSync() 4a. checkSimpleStatus() pid: [%s], latestEnterpriseSyncRequestTimestamp: [%s] is not an Integer', pid, syncStatus.data.latestEnterpriseSyncRequestTimestamp);
            return res.status(500).rdkSend(standardErrorResponse);
        }

        // 5. sync timeout exceeded before at least one site completed: return standardErrorResponse
        logger.info('synchronize.waitForFirstSitePatientSync() 5. Check for timeout while waiting for at least one site to complete for sync on pid: [%s]', pid);
        if (now - startTime > syncTimeoutMillis) {
            logger.warn('synchronize.waitForFirstSitePatientSync() 5a. Timeout waiting for at least one site to complete for sync on pid: [%s]', pid);
            return res.status(500).rdkSend(standardErrorResponse);
        }

        // 6. All sites are in Sync/Job error
        logger.info('synchronize.waitForFirstSitePatientSync() 6. Check if sync had an error every site status for pid: [%s]', pid);
        if (isEverySiteInError(syncStatus)) {
            logger.warn('synchronize.waitForFirstSitePatientSync() 6a. Sync had an error every site status for pid: [%s]', pid);
            return res.status(500).rdkSend(standardErrorResponse);
        }

        // 7. everything else: wait and test again
        logger.info('synchronize.waitForFirstSitePatientSync() 7. Patient sync for [%s] not yet complete for at least one site, continuing to wait', pid);
        return setTimeout(waitForFirstSitePatientSync, loopDelayMillis, logger, config, jdsSync, pid, req, res, next, startTime);
    });
}


function isOneSiteCompleted(simpleSyncStatus) {
    let data = _.get(simpleSyncStatus, 'data', {});

    if (data.syncCompleted) {
        return true;
    }

    return _.some(data.sites, function(site) {
        return site.syncCompleted;
    });
}

function isEverySiteInError(simpleSyncStatus) {
    let data = _.get(simpleSyncStatus, 'data', {});

    if (_.isEmpty(data.sites)) {
        return false;
    }

    return _.every(data.sites, function(site) {
        return site.hasError;
    });
}


function isInterceptorDisabled(config) {
    return _.has(config, 'interceptors') && _.has(config.interceptors, 'synchronize') && config.interceptors.synchronize.disabled === true;
}

function isPid(id) {
    return !_.isEmpty(id) && /^[0-9a-fA-F]{4};[0-9]+$/.test(id);
}

function isIcn(id) {
    return !_.isEmpty(id) && /\w+V\w+/.test(id);
}

function isEdipi(id) {
    return !_.isEmpty(id) && /^DOD;\d+/.test(id);
}


/*
Returns the earliest moment or undefined if the items in the moments array
are not valid Date/timestamp/moment objects. Note the value returned is a
moment object.
*/
function minMoment(moments) {
    return fetchMomentByCriterium(moment.prototype.isBefore, moments);
}


/*
Returns the earliest moment or undefined if the items in the moments array
are not valid Date/timestamp/moment objects. Note the value returned is a
moment object.
*/
function maxMoment(moments) {
    return fetchMomentByCriterium(moment.prototype.isAfter, moments);
}


/*
Returns the last moment that passes the func test or undefined if the
items in the moments array are not valid Date/timestamp/moment objects.
Note the value returned is a moment object.
*/
function fetchMomentByCriterium(func, moments) {
    if (_.isUndefined(moments) || _.isNull(moments)) {
        return;
    }

    moments = !_.isArray(moments) ? [moments] : moments;
    let value;

    _.each(moments, function(momentObj) {
        if (moment.isDate(momentObj) || _.isNumber(momentObj)) {
            momentObj = moment(momentObj);
        }

        if (moment.isMoment(momentObj) && momentObj.isValid() && (_.isUndefined(value) || func.call(momentObj, value))) {
            value = momentObj;
        }
    });

    return value;
}

/*
Variadic Function:
function isSyncExistsDelayAtTimeout(startTime, syncExistsWaitDelayMillis, now) {
function isSyncExistsDelayAtTimeout(startTime, syncExistsWaitDelayMillis) {

startTime: a millisecond timestamp value similar to what is returned by Date.now()

syncExistsWaitDelayMillis: a millisecond value.

now: a millisecond timestamp value similar to what is returned by Date.now()
If now is not included or is not a number, this function will generate a value
using Date.now()
*/
function isSyncExistsDelayAtTimeout(startTime, syncExistsWaitDelayMillis, now) {
    if (!_.isNumber(now)) {
        now = Date.now();
    }

    return now - startTime > syncExistsWaitDelayMillis;
}

/*
Variadic Function:
function isSyncLastUpdateTimeoutExceeded(status, inactivityTimeoutMillis, now)
function isSyncLastUpdateTimeoutExceeded(status, inactivityTimeoutMillis)

This function checks an all-sites simple patient sync status to determine
if the sync has "stalled". The sync is considered to have stalled if the
interval between now and the last time update (i.e. the latest value of
all of the non-site time values: job timestamp and metaStampTime) exceeds
the value of 'inactivityTimeoutMills'.

status: This should be a general simple patient sync status (i.e. not site-specific).

now: This should be either a number value (e.g. Date().getTime()) or a Date object.
In any other instance, the value of now will be the current date/time.
*/
function isSyncLastUpdateTimeoutExceeded(status, inactivityTimeoutMillis, now) {
    if (_.isEmpty(status)) {
        return false;
    }

    let latestEnterpriseSyncRequestTimestamp = moment(status.latestEnterpriseSyncRequestTimestamp);
    let latestJobTimestamp = moment(status.latestJobTimestamp);
    let latestSourceStampTime = moment(status.latestSourceStampTime, 'YYYYMMDDHHmmss');

    let latestUpdateTime = maxMoment([latestEnterpriseSyncRequestTimestamp, latestJobTimestamp, latestSourceStampTime]);

    if (!latestUpdateTime) {
        return false;
    }

    if (moment.isDate(now) || _.isNumber(now)) {
        now = moment(now);
    } else {
        now = moment();
    }

    // deadline is the latest time for the last update without the
    // interceptor considering the patient sync to have stalled.
    let deadline = now.subtract(inactivityTimeoutMillis, 'milliseconds');

    return latestUpdateTime.isBefore(deadline);
}

/*
Variadic Function:
function isErrorCooldownTimeoutExceeded(status, errorCooldownMinIntervalMillis, now)
function isErrorCooldownTimeoutExceeded(status, errorCooldownMinIntervalMillis)

This function checks a simple patient sync status to determine if the cooldown period
since the sync was started has passed.

status: This should be a simple patient sync status.

now: This should be either a number value (e.g. Date().getTime()) or a Date object.
In any other instance, the value of now will be the current date/time.
*/
function isErrorCooldownTimeoutExceeded(status, errorCooldownMinIntervalMillis, now) {
    if (_.isEmpty(status)) {
        return false;
    }

    let latestEnterpriseSyncRequestTimestamp = moment(status.latestEnterpriseSyncRequestTimestamp);

    if (latestEnterpriseSyncRequestTimestamp < 1) {
        return false;
    }

    if (moment.isDate(now) || _.isNumber(now)) {
        now = moment(now);
    } else {
        now = moment();
    }

    // deadline is the latest time for the last update without the
    // interceptor considering the patient sync to have stalled.
    let deadline = now.subtract(errorCooldownMinIntervalMillis, 'milliseconds');

    return latestEnterpriseSyncRequestTimestamp.isBefore(deadline);
}


module.exports = intercept;
intercept._isSyncLastUpdateTimeoutExceeded = isSyncLastUpdateTimeoutExceeded;
intercept._isErrorCooldownTimeoutExceeded = isErrorCooldownTimeoutExceeded;
intercept._isInterceptorDisabled = isInterceptorDisabled;
intercept._maxMoment = maxMoment;
intercept._minMoment = minMoment;
intercept._isPid = isPid;
intercept._isIcn = isIcn;
intercept._isEdipi = isEdipi;
intercept._clearThenSyncPatient = clearThenSyncPatient;
intercept._syncPatient = syncPatient;
intercept._waitForFirstSitePatientSync = waitForFirstSitePatientSync;
intercept._isSyncExistsDelayAtTimeout = isSyncExistsDelayAtTimeout;
intercept._isOneSiteCompleted = isOneSiteCompleted;
intercept._isEverySiteInError = isEverySiteInError;
intercept._standardErrorResponse = standardErrorResponse;
intercept._noSiteResponse = noSiteResponse;
