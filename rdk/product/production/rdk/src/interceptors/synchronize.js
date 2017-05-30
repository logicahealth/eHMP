'use strict';

var _ = require('lodash');
var moment = require('moment');

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
intercept._waitForFullPatientSync = waitForFullPatientSync;
intercept._isSyncExistsDelayAtTimeout = isSyncExistsDelayAtTimeout;
intercept._isOneSiteCompleted = isOneSiteCompleted;
intercept._isEverySiteInError = isEverySiteInError;

/*
function intercept(req, res, next)

For testing purposes, you can inject a jdsSync instance in the req parameter:
req.jdsSync = { // test implementation object }.
*/
function intercept(req, res, next) {
    req.logger.debug('synchronize.intercept()');

    var config = req.app.config;
    var logger = req.logger;

    var jdsSync = req.jdsSync || _.get(req, ['app', 'subsystems', 'jdsSync']);

    // This is the "mySite" (if any)
    var mySite = _.get(req, ['session', 'user', 'site'], null);

    // This is the maximum amount of time that is allowed to pass without an update
    // to a job status or metastamp before the job is considered to have stalled.
    var inactivityTimeoutMillis = config.resync.inactivityTimeoutMillis || 1000 * 60 * 60 * 24;

    // This is the amount of time between calls to the sync endpoint. This is because
    // we don't want to call sync every time, but we need to call it often enough to
    // ensure that secondary data can't get too stale. VxSync doesn't duplicate sync
    // requests (i.e. multiple sync requests on the same patient at the same time),
    // but too many calls close together can degrade performance.
    var lastSyncMaxIntervalMillis = config.resync.lastSyncMaxIntervalMillis || 1000 * 60 * 10;

    // This is the minimum amount of time that must pass before the existence of a "hasError"
    // attribute in the sync status for "MySite" causes a new sync. Errors within less than than
    // that interval of time will cause the interceptor to return with the standard error response.
    var errorCooldownMinIntervalMillis = config.resync.errorCooldownMinIntervalMillis || 1000 * 60;

    if (isInterceptorDisabled(config)) {
        logger.warn('synchronize.intercept() interceptor disabled');
        return next();
    }

    // Note: Strictly speaking, this is not a 'pid' the way VxSync defines that term.
    // It is just a general 'patient-identifier'.
    var pid = _.get(req, 'query.pid') || _.get(req, 'body.pid') || _.get(req, 'params.pid');

    if (!pid) {
        logger.debug('synchronize.intercept() no "pid" query parameter, skip sync');
        return next();
    }

    // Synchronizing a patient on an EDIPI or ICN type identifier means that the
    // sync interceptor will wait for the first site to complete before returning.
    if (isEdipi(pid) || isIcn(pid)) {
        logger.debug('synchronize.intercept(%s) "pid" value was an EDIPI or ICN. Waiting for full patient sync', pid);
        return waitForFirstSitePatientSync(logger, config, jdsSync, pid, req, res, next);
    }

    jdsSync.getPatientStatusSimple(pid, req, function(error, syncStatus) {
        logger.debug({
            status: syncStatus
        }, 'synchronize.intercept() called jdsSync.getPatientStatusSimple(%s) for first patient sync status check', pid);

        // 1. on error, next()
        if (error || _.isEmpty(syncStatus) || _.isEmpty(syncStatus.data) || (syncStatus.data.error && syncStatus.data.error.code !== 404)) {
            logger.warn(error, 'synchronize.intercept() Error retrieving simple sync status for patient: %s; skipping', pid);
            return next();
        }

        // 2. patient not found, therefore, it should be synchronized
        if (syncStatus.data.error && syncStatus.data.error.code === 404) {
            logger.warn(error, 'synchronize.intercept() Patient not found, synchronizing: %s;', pid);
            return syncPatient(config, logger, jdsSync, pid, mySite, req, res, next);
        }

        // 3. if sync for mySite is complete, check to be sure that sync() doesn't need to be called.
        var mySiteSynchComplete = _.get(syncStatus, ['data', 'sites', mySite, 'syncCompleted']);
        if (mySiteSynchComplete) {
            if (isSyncLastUpdateTimeoutExceeded(syncStatus.data, lastSyncMaxIntervalMillis)) {
                logger.info(syncStatus, 'synchronize.intercept() Patient [%s] synched for site [%s], but exceeded timeout, resynching patient', pid, mySite);
                return syncPatient(config, logger, jdsSync, pid, mySite, req, res, next);
            }

            logger.info('synchronize.intercept() Patient [%s] is synched for site [%s] and syncPatient() does not need to be called', pid, mySite);
            return next();
        }

        // 4. if there is an error in the sync status for mySite, check to sync again or just return an error
        var errorInSite = _.get(syncStatus, ['data', 'sites', mySite, 'hasError'], false);
        if (errorInSite) {
            logger.info('synchronize.intercept() An error in site [%s] sync status for patient [%s]', mySite, pid);
            if (isErrorCooldownTimeoutExceeded(syncStatus.data, errorCooldownMinIntervalMillis)) {
                logger.info('synchronize.intercept() An error in site [%s] for patient [%s], cooldown exceeded, resynching patient', mySite, pid);
                return syncPatient(config, logger, jdsSync, pid, mySite, req, res, next);
            }

            logger.info('synchronize.intercept() An error in site [%s] for patient [%s], cooldown exceeded, returning error message', mySite, pid);
            return res.status(500).rdkSend('There was an error processing your request. The error has been logged.');
        }

        // 5. if the sync has been inactive too long, clearAndSync()
        if (!syncStatus.data.syncCompleted && isSyncLastUpdateTimeoutExceeded(syncStatus.data, inactivityTimeoutMillis)) {
            logger.info('synchronize.intercept() The activity timeout was exceeded, clearing and resynching patient [%s]', pid);
            return clearThenSyncPatient(config, logger, jdsSync, pid, mySite, req, res, next);
        }

        // 6. if the sync for mySite is not complete and sync is not "stuck", wait for sync on mySite to complete
        if (!mySiteSynchComplete && !isSyncLastUpdateTimeoutExceeded(syncStatus.data, inactivityTimeoutMillis)) {
            logger.info('synchronize.intercept() Patient [%s] sync already in progress--awaiting completion', pid);
            return waitForPatientSync(config, logger, jdsSync, pid, mySite, req, res, next);
        }

        // 7. In all other cases, sync the patient (note: this will use 'mySite' to determine completion)
        logger.info(syncStatus, 'synchronize.intercept() Calling sync for patient: ', pid);
        syncPatient(config, logger, jdsSync, pid, mySite, req, res, next);
    });
}


function waitForPatientSync(config, logger, jdsSync, pid, mySite, req, res, next) {
    logger.debug('synchronize.waitForPatientSync(%s) waiting for patient', pid);

    jdsSync.waitForPatientLoad(pid, mySite, req, function(error, result) {
        logger.debug('synchronize.waitForPatientSync(%s) start sync wait for patient callback', pid);
        if (error) {
            var status = _.isNumber(error) ? error : 500;
            return res.status(status).rdkSend(result || error);
        }

        next();
    });
}

function clearThenSyncPatient(config, logger, jdsSync, pid, mySite, req, res, next) {
    logger.debug('synchronize.clearThenSyncPatient(%s) Clearing, then synchronizing patient', pid);

    jdsSync.clearPatient(pid, req, function(error, result) {
        logger.debug('synchronize.clearThenSyncPatient(%s) start syncClear callback', pid);
        if (error) {
            var status = _.isNumber(error) ? error : 500;
            result = result || error;
            return res.status(status).rdkSend(result);
        }

        syncPatient(config, logger, jdsSync, pid, mySite, req, res, next);
    });
}

function syncPatient(config, logger, jdsSync, pid, mySite, req, res, next) {
    logger.debug('synchronize.syncPatient(%s) Synchronizing patient', pid);

    jdsSync.loadPatientPrioritized(pid, mySite, req, function(error, result) {
        logger.debug('synchronize.syncPatient() called jdsSync.loadPatientPrioritized(%s, %s)', pid, mySite);
        if (error) {
            if (error === 404) {
                logger.debug('synchronize.syncPatient() 404 syncLoad');
                return res.status(404).rdkSend(noSiteResponse);
            }

            logger.error('synchronize.syncPatient() Error synchronizing patient:');
            logger.error(error);
            return res.status(500).rdkSend('There was an error processing your request. The error has been logged.');
        }

        if (!result) {
            logger.error('synchronize.syncPatient() Empty response from sync subsystem');
            return res.status(500).rdkSend('There was an error processing your request. The error has been logged.');
        }

        if (!_.has(result, 'data') || result.status === 500) {
            logger.debug('synchronize.syncPatient() Error response from sync subsystem:');
            logger.error(result);

            return next();
        }

        if (result.status === 404) {
            logger.debug('synchronize.syncPatient() 404 syncLoad');
            return res.status(result.status).rdkSend(result);
        }

        logger.trace(result);

        logger.debug('synchronize.syncPatient() syncLoad - continue');
        next();
    });
}

// Perhaps a future version should use the jds-sync-subsystem.js
// implementation rather than including this here.
var standardErrorResponse = {
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
var noSiteResponse = {
    status: 404,
    data: {
        error: {
            code: 404,
            message: 'This patient\'s record is not yet accessible. Please try again in a few minutes. If it is still not accessible, please contact your HIMS representative and have the patient loaded into your local VistA.'
        }
    }
};

/*
Variadic Function
function waitForFullPatientSync(logger, config, pid, req, res, next, startTime)
function waitForFullPatientSync(logger, config, pid, req, res, next)

startTime: not included in the initial recursive call
*/
function waitForFullPatientSync(logger, config, jdsSync, pid, req, res, next, startTime) {
    logger.debug('synchronize.waitForFullPatientSync(%s) startTime: %s', pid, startTime);

    jdsSync.getPatientStatusSimple(pid, req, function(error, syncStatus) {
        logger.debug({
            status: syncStatus
        }, 'synchronize.waitForFullPatientSync(%s) called jdsSync.getPatientStatusSimple() for full sync', pid);

        // 1. error returned in callback
        if (error || _.isEmpty(syncStatus) || _.isEmpty(syncStatus.data) || (syncStatus.data.error && syncStatus.data.error.code !== 404)) {
            logger.warn(error, 'synchronize.waitForFullPatientSync(%s) Error retrieving simple sync status for patient, so skipping', pid);
            return next();
        }

        var now = Date.now();
        var loopDelayMillis = config.jdsSync.settings.waitMillis || 420000;
        var syncTimeoutMillis = config.jdsSync.settings.timeoutMillis || 420000;
        var syncExistsWaitDelayMillis = config.jdsSync.settings.syncExistsWaitDelayMillis || 30000;

        logger.debug('synchronize.waitForFullPatientSync(%s) loopDelayMillis=%s syncTimeoutMillis=%s syncExistsWaitDelayMillis=%s', pid, loopDelayMillis, syncTimeoutMillis, syncExistsWaitDelayMillis);

        // if sync has already started, try to use the earliest timestamp/stampTime for the
        // sync timeout calculation. Otherwise use the current time. Note that this should
        // only be relevant to the first invocation of waitForFullPatientSync() in the recursive
        // call stack.
        startTime = startTime || minMoment([new Date(),
            syncStatus.data.latestEnterpriseSyncRequestTimestamp,
            syncStatus.data.latestJobTimestamp,
            moment(syncStatus.data.latestSourceStampTime, 'YYYYMMDDHHmmss')
        ]).valueOf();

        // 2. 404 and 404-timeout exceeded: res.send(result.status, result.data)
        if (syncStatus.data.error && syncStatus.data.error.code === 404) {
            if (isSyncExistsDelayAtTimeout(startTime, syncExistsWaitDelayMillis)) {
                logger.warn('synchronize.waitForFullPatientSync(%s) Patient Sync for timeout waiting to get past 404 status', pid);
                return res.status(404).rdkSend(noSiteResponse);
                // return res.status(500).rdkSend(format('Sync timeout, no patient %s found in %s milliseconds', pid, syncExistsWaitDelayMillis));
            }

            logger.info('synchronize.waitForFullPatientSync(%s) Patient sync returned 404, continuing to wait', pid);
            return setTimeout(waitForFullPatientSync, loopDelayMillis, logger, config, jdsSync, pid, req, res, next, startTime);
        }

        // 3. Patient Sync complete: next()
        if (syncStatus.data.syncCompleted) {
            logger.info('synchronize.waitForFullPatientSync(%s) Sync complete for patient', pid);
            return next();
        }

        // 4. sync timeout exceeded: return standardErrorResponse
        if (now - startTime > syncTimeoutMillis) {
            logger.warn('synchronize.waitForFullPatientSync(%s) Timeout waiting for sync on patient', pid);
            return res.status(500).rdkSend(standardErrorResponse);
        }

        // 5. Sync/Job error: return interceptor(500, jdsUtils.standardErrorResponse);
        if (syncStatus.data.hasError) {
            logger.warn('synchronize.waitForFullPatientSync(%s) Sync had an error in status for patient', pid);
            return res.status(500).rdkSend(standardErrorResponse);
        }

        // 6. everything else: wait and test again
        logger.info('synchronize.waitForFullPatientSync(%s) Patient sync not yet complete, continuing to wait', pid);
        return setTimeout(waitForFullPatientSync, loopDelayMillis, logger, config, jdsSync, pid, req, res, next, startTime);
    });
}

/*
Variadic Function
function waitForFirstSitePatientSync(logger, config, pid, req, res, next, startTime)
function waitForFirstSitePatientSync(logger, config, pid, req, res, next)

startTime: not included in the initial recursive call
*/
function waitForFirstSitePatientSync(logger, config, jdsSync, pid, req, res, next, startTime) {
    logger.debug('synchronize.waitForFirstSitePatientSync(%s)', pid);

    jdsSync.getPatientStatusSimple(pid, req, function(error, syncStatus) {
        logger.debug({
            status: syncStatus
        }, 'synchronize.waitForFirstSitePatientSync(%s) called jdsSync.getPatientStatusSimple() for full sync', pid);
        // 1. error returned in callback
        if (error || _.isEmpty(syncStatus) || _.isEmpty(syncStatus.data) || (syncStatus.data.error && syncStatus.data.error.code !== 404)) {
            logger.warn(error, 'synchronize.waitForFirstSitePatientSync(%s) Error retrieving simple sync status for patient, so skipping', pid);
            return next();
        }

        var now = Date.now();
        var loopDelayMillis = config.jdsSync.settings.waitMillis;
        var syncTimeoutMillis = config.jdsSync.settings.timeoutMillis;
        var syncExistsWaitDelayMillis = config.jdsSync.settings.syncExistsWaitDelayMillis;

        // if sync has already started, try to use the earliest timestamp/stampTime for the
        // sync timeout calculation. Otherwise use the current time. Note that this should
        // only be relevant to the first invocation of waitForFirstSitePatientSync() in the
        // recursive call stack.
        startTime = startTime || minMoment([new Date(),
            syncStatus.data.latestEnterpriseSyncRequestTimestamp,
            syncStatus.data.latestJobTimestamp,
            moment(syncStatus.data.latestSourceStampTime, 'YYYYMMDDHHmmss')
        ]).valueOf();

        logger.debug('synchronize.waitForFirstSitePatientSync(%s) loopDelayMillis=%s syncTimeoutMillis=%s syncExistsWaitDelayMillis=%s', pid, loopDelayMillis, syncTimeoutMillis, syncExistsWaitDelayMillis);

        // 2. 404 and 404-timeout exceeded: res.send(result.status, result.data)
        if (syncStatus.data.error && syncStatus.data.error.code === 404) {
            if (isSyncExistsDelayAtTimeout(startTime, syncExistsWaitDelayMillis)) {
                logger.warn('synchronize.waitForFirstSitePatientSync(%s) Patient Sync for timeout waiting to get past 404 status', pid);
                return res.status(404).rdkSend(noSiteResponse);
            }

            logger.info('synchronize.waitForFirstSitePatientSync(%s) Patient sync returned 404, continuing to wait', pid);
            return setTimeout(waitForFirstSitePatientSync, loopDelayMillis, logger, config, jdsSync, pid, req, res, next, startTime);
        }

        // 3. Patient Sync complete: next()
        if (isOneSiteCompleted(syncStatus)) {
            logger.info('synchronize.waitForFirstSitePatientSync(%s) Sync complete for patient', pid);
            return next();
        }

        // 4. sync timeout exceeded before at least one site completed: return standardErrorResponse
        if (now - startTime > syncTimeoutMillis) {
            logger.warn('synchronize.waitForFirstSitePatientSync(%s) Timeout waiting for sync on patient', pid);
            return res.status(500).rdkSend(standardErrorResponse);
        }

        // 5. All sites are in Sync/Job error
        if (isEverySiteInError(syncStatus)) {
            logger.warn('synchronize.waitForFirstSitePatientSync(%s) Sync had an error every site status for patient', pid);
            return res.status(500).rdkSend(standardErrorResponse);
        }

        // 6. everything else: wait and test again
        logger.info('synchronize.waitForFirstSitePatientSync(%s) Patient sync not yet complete, continuing to wait', pid);
        return setTimeout(waitForFirstSitePatientSync, loopDelayMillis, logger, config, jdsSync, pid, req, res, next, startTime);
    });
}


function isOneSiteCompleted(simpleSyncStatus) {
    var data = _.get(simpleSyncStatus, 'data', {});

    if (data.syncCompleted) {
        return true;
    }

    return _.some(data.sites, function(site) {
        return site.syncCompleted;
    });
}

function isEverySiteInError(simpleSyncStatus) {
    var data = _.get(simpleSyncStatus, 'data', {});

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
    var value;

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

    var latestEnterpriseSyncRequestTimestamp = moment(status.latestEnterpriseSyncRequestTimestamp);
    var latestJobTimestamp = moment(status.latestJobTimestamp);
    var latestSourceStampTime = moment(status.latestSourceStampTime, 'YYYYMMDDHHmmss');

    var latestUpdateTime = maxMoment([latestEnterpriseSyncRequestTimestamp, latestJobTimestamp, latestSourceStampTime]);

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
    var deadline = now.subtract(inactivityTimeoutMillis, 'milliseconds');

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

    var latestEnterpriseSyncRequestTimestamp = moment(status.latestEnterpriseSyncRequestTimestamp);

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
    var deadline = now.subtract(errorCooldownMinIntervalMillis, 'milliseconds');

    return latestEnterpriseSyncRequestTimestamp.isBefore(deadline);
}
