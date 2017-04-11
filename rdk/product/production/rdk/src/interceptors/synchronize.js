'use strict';

var _ = require('lodash');
var moment = require('moment');

module.exports = intercept;
intercept._isSyncLastUpdateTimeoutExceeded = isSyncLastUpdateTimeoutExceeded;
intercept._isInterceptorDisabled = isInterceptorDisabled;
intercept._maxMoment = maxMoment;
intercept._minMoment = minMoment;
intercept._getMySiteAsList = getMySiteAsList;
intercept._isPid = isPid;
intercept._isIcn = isIcn;
intercept._isEdipi = isEdipi;
intercept._clearThenSyncPatient = clearThenSyncPatient;
intercept._syncPatient = syncPatient;
intercept._waitForFullPatientSync = waitForFullPatientSync;
intercept._isSyncExistsDelayAtTimeout = isSyncExistsDelayAtTimeout;
intercept._isOneSiteCompleted = isOneSiteCompleted;
intercept._isEverySiteInError = isEverySiteInError;

intercept.JdsSyncAdapter = JdsSyncAdapter;

/*
function intercept(req, res, next)

For testing purposes, you can inject a jdsSync instance in the req parameter:
req.jdsSync = { // test implementation object }.
*/
function intercept(req, res, next) {
    req.logger.debug('synchronize.intercept()');

    var config = req.app.config;
    var logger = req.logger;

    var jdsSync = req.jdsSync || loadJds(logger, config, req);

    // This is the maximum amount of time that is allowed to pass without an update
    // to a job status or metastamp before the job is considered to have stalled.
    var inactivityTimeoutMillis = config.resync.inactivityTimeoutMillis || 1000 * 60 * 60 * 24;

    // This is the amount of time between calls to the sync endpoint. This is because
    // we don't want to call sync every time, but we need to call it often enough to
    // ensure that secondary data can't get too stale. VxSync doesn't duplicate sync
    // requests (i.e. multiple sync requests on the same patient at the same time),
    // but too many calls close together can degrade performance.
    var lastSyncMaxIntervalMillis = config.resync.lastSyncMaxIntervalMillis || 1000 * 60 * 10;

    if (isInterceptorDisabled(config)) {
        logger.warn('synchronize.intercept() interceptor disabled');
        return next();
    }

    // Note: Strictly speaking, this is not a 'pid' the way VxSync defines that term.
    // It is just a general 'patient-identifier'.
    var pid = req.params.pid || req.query.pid || req.body.pid;

    if (!pid) {
        logger.debug('synchronize.intercept() no "pid" query parameter, skip sync');
        return next();
    }

    // Synchronizing a patient on an EDIPI or ICN type identifier means that the
    // sync interceptor will wait for the entire patient file to synchronize.
    if (isEdipi(pid) || isIcn(pid)) {
        logger.debug('synchronize.intercept(%s) "pid" value was an EDIPI or ICN. Waiting for full patient sync', pid);
        return waitForFirstSitePatientSync(logger, config, jdsSync, pid, req, res, next);

        // As per DE6041, we are now waiting for only a single site to sync
        // for EDIPI/ICN syncs as these are the result of global searches.
        // return waitForFullPatientSync(logger, config, jdsSync, pid, req, res, next);
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
            return syncPatient(config, logger, jdsSync, pid, req, res, next);
        }

        // 3. if sync is complete, check to be sure that sync() doesn't need to be called.
        if (syncStatus.data.syncCompleted && !isSyncLastUpdateTimeoutExceeded(syncStatus.data, lastSyncMaxIntervalMillis)) {
            logger.info('synchronize.intercept() Patient [%s] is synched and syncPatient() does not need to be called', pid);
            return next();
        }

        // 4. if there is an error in the sync status, clearAndSync()
        if (syncStatus.data.hasError) {
            logger.info('synchronize.intercept() An error is indicated in the sync status, clearing and resynching patient [%s]', pid);
            return syncPatient(config, logger, jdsSync, pid, req, res, next);
            // return clearThenSyncPatient(config, logger, jdsSync, pid, req, res, next);
        }

        // 5. if the sync has been inactive too long, clearAndSync()
        if (!syncStatus.data.syncCompleted && isSyncLastUpdateTimeoutExceeded(syncStatus.data, inactivityTimeoutMillis)) {
            logger.info('synchronize.intercept() The activity timeout was exceeded, clearing and resynching patient [%s]', pid);
            return clearThenSyncPatient(config, logger, jdsSync, pid, req, res, next);
        }

        // 6. if the sync is in progress and not "stuck", wait for sync to complete
        if (!syncStatus.data.syncCompleted && !isSyncLastUpdateTimeoutExceeded(syncStatus.data, inactivityTimeoutMillis)) {
            logger.info('synchronize.intercept() Patient [%s] sync already in progress--awaiting completion', pid);
            return waitForPatientSync(config, logger, jdsSync, pid, req, res, next);
        }

        // 7. In all other cases, sync the patient.
        logger.info(syncStatus, 'synchronize.intercept() Calling sync for patient: ', pid);
        syncPatient(config, logger, jdsSync, pid, req, res, next);
    });
}


function waitForPatientSync(config, logger, jdsSync, pid, req, res, next) {
    logger.debug('synchronize.waitForPatientSync(%s) waiting for patient', pid);

    var prioritySite = getMySiteAsList(req);

    jdsSync.waitForPatientLoad(pid, prioritySite, req, function(error, result) {
        logger.debug('synchronize.waitForPatientSync(%s) start sync wait for patient callback', pid);
        if (error) {
            var status = _.isNumber(error) ? error : 500;
            return res.status(status).rdkSend(result || error);
        }

        next();
    });
}

function clearThenSyncPatient(config, logger, jdsSync, pid, req, res, next) {
    logger.debug('synchronize.clearThenSyncPatient(%s) Clearing, then synchronizing patient', pid);

    jdsSync.clearPatient(pid, req, function(error, result) {
        logger.debug('synchronize.clearThenSyncPatient(%s) start syncClear callback', pid);
        if (error) {
            var status = _.isNumber(error) ? error : 500;
            result = result || error;
            return res.status(status).rdkSend(result);
        }

        syncPatient(config, logger, jdsSync, pid, req, res, next);
    });
}

function syncPatient(config, logger, jdsSync, pid, req, res, next) {
    logger.debug('synchronize.syncPatient(%s) Synchronizing patient', pid);

    // Make sure the user's logged in site ('mySite') is synced first
    var prioritySite = getMySiteAsList(req);

    // This is here to ensure that the setTimeout call on the response object
    // in r1.2 is maintained.
    if (jdsSync.version_1_2) {
        var timeoutMillis = Number(config.jdsSync.settings.timeoutMillis || 300000) + 3000;
        logger.debug({
            timeout: timeoutMillis
        }, 'synchronize.syncPatient(%s) Overriding response timeout to account for patient sync for version r1.2', pid);
        res.setTimeout(timeoutMillis);
    }

    jdsSync.loadPatientPrioritized(pid, prioritySite, req, function(error, result) {
        logger.debug('synchronize.syncPatient() called jdsSync.loadPatientPrioritized(%s, %s)', pid, prioritySite);
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

    if (jdsSync.version_1_2) {
        var timeoutMillis = Number(config.jdsSync.settings.timeoutMillis || 300000) + 3000;
        logger.debug({
            timeout: timeoutMillis
        }, 'synchronize.waitForFullPatientSync(%s) Overriding response timeout to account for patient sync for version r1.2', pid);
        res.setTimeout(timeoutMillis);
    }

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

        // 3. 404 and 404-timeout exceeded: res.send(result.status, result.data)
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

    if (jdsSync.version_1_2) {
        var timeoutMillis = Number(config.jdsSync.settings.timeoutMillis || 300000) + 3000;
        logger.debug({
            timeout: timeoutMillis
        }, 'synchronize.waitForFirstSitePatientSync(%s) Overriding response timeout to account for patient sync for version r1.2', pid);
        res.setTimeout(timeoutMillis);
    }

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

function getMySiteAsList(req) {
    if (req && req.session && req.session.user && req.session.user.site) {
        return [req.session.user.site];
    }

    return [];
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
Returns the last moment that passes the funct test or undefined if the
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

    if (latestUpdateTime.isBefore(deadline)) {
        return true;
    }

    return false;
}



/****************************************************************************/
/*                    r1.2/r2.0 compatibility code start                    */
/****************************************************************************/
var adaptedJdsSync;

function loadAdaptedJdsSync(logger, config) {
    logger.debug('synchronize.loadAdaptedJdsSync() Attempting to return required jdsSubsystem, so this must be version r1.2');
    // In r1.2 the jdsSync subsystem must be required. In this case, require
    // it and wrap with an adapter object that has the same interface as the
    // r2.0 version of the jds sync subsystem. If the require fails, then
    // print a nice message and rethrow the error

    if (adaptedJdsSync) {
        return adaptedJdsSync;
    }

    try {
        var jdsSync = require('../subsystems/jdsSync/jdsSync');
        adaptedJdsSync = new JdsSyncAdapter(logger, config, jdsSync);
        return adaptedJdsSync;
    } catch (e) {
        logger.error('synchronize.loadAdaptedJdsSync() The synchronize interceptor was unable to perform require(\'../subsystems/jdsSync/jdsSync\')');
        throw e;
    }
}

function loadJds(logger, config, req) {
    logger.debug('synchronize.loadJds()');

    // In r2.0, the jdsSync subsystem is pre-loaded by the rdk framework and
    // inserted into the req.app.subsystems context. Extract and return that.
    if (req && req.app && req.app.subsystems && req.app.subsystems.jdsSync && _.isFunction(req.app.subsystems.jdsSync.getPatientStatusSimple)) {
        logger.debug('synchronize.loadJds() Using jdsSync from req.app.subsystems, so this must be version r2.0 or later');
        return req.app.subsystems.jdsSync;
    }

    // In r1.2 the jdsSync subsystem must be required. In this case, require
    // it and wrap with an adapter object that has the same interface as the
    // r2.0 version of the jds sync subsystem. If the require fails, then
    // print a nice message and rethrow the error
    logger.debug('synchronize.loadJds() loading the adapted JdsSync');
    return loadAdaptedJdsSync(logger, config);
}
/****************************************************************************/
/*                     r1.2/r2.0 compatibility code end                     */
/****************************************************************************/


/****************************************************************************/
/*                        JdsSyncAdapter Class Start                        */
/****************************************************************************/
// This class takes an instance of the r1.2 jdsSync subsystem and
// adapts it to the r2.0 interface as necessary for the sync interceptor.
function JdsSyncAdapter(logger, config, jdsSync) {
    this.logger = logger;
    this.config = config;
    this.jdsSync = jdsSync;
    this.version_1_2 = true;
}


JdsSyncAdapter.prototype.clearPatient = function(pid, req, callback) {
    this.logger.debug('synchronize JdsSyncAdapter.clearPatient(%s)', pid);

    // Since this is being called with a callback in this interceptor, this call should never require
    // a value for 'res'.
    var res;

    var clearConfig = this.config.jdsSync.syncPatientClear;
    this.jdsSync._doClear(null, clearConfig, pid, req, res, callback);
};


JdsSyncAdapter.prototype.loadPatientPrioritized = function(pid, prioritySite, req, callback) {
    this.logger.debug('synchronize JdsSyncAdapter.loadPatientPrioritized(%s, %s)', pid, prioritySite);

    // Since this is being called with a callback interceptor, this call should never require
    // a value for 'res' except for calling res.setTimeout(timeoutMillis), so we will use a
    // dummy object.
    // This is related to r1.2 necessitating the setTimeout() function of the response
    // object being called. This is now handled elsewhere.
    var res = {
        setTimeout: function() {}
    };

    // The 'next' function is never called in the r1.2 implementation of jdsSync, so use
    // an undefined value.
    var next;

    var syncConfig = this.config.jdsSync.syncPatientLoad;
    this.jdsSync._doLoad(this.jdsSync._syncStatusResultProcessor, syncConfig, pid, false, 'userSelect', prioritySite, null, req, res, next, callback);
};

/*
Variadic Function:
function(pid, siteList, req, callback)
function(pid, req, callback)
*/
JdsSyncAdapter.prototype.getPatientStatusSimple = function(pid, req, callback) {
    this.logger.debug('synchronize JdsSyncAdapter.getPatientStatusSimple(%s)', pid);
    this.jdsSync._getSimpleSyncStatus(pid, req, callback);
};
/****************************************************************************/
/*                         JdsSyncAdapter Class End                         */
/****************************************************************************/
