'use strict';

var _ = require('lodash');
var moment = require('moment');
var rdk = require('../core/rdk');
var cache = rdk.patientCache;
var pidValidator = rdk.utils.pidValidator;

module.exports = function(req, res, next) {
    var config = req.app.config;

    req.logger.info('calling synchronize() interceptor');

    if ('interceptors' in config && 'synchronize' in config.interceptors && config.interceptors.synchronize.disabled) {
        req.logger.warn('synchronize disabled');
        return next();
    }

    var pid = req.param('pid');

    if (!pid) {
        req.logger.debug('no pid, skip sync');
        return next();
    } else if (pidValidator.isPidEdipi(pid)) {
        req.logger.warn('Synchronize interceptor was called for a type of pid that requires demographics information to sync--bailing out');
        return next();
    }

    var cacheKey = 'synchronize-interceptor' + pid;
    var cachedItem = cache.get(cacheKey);
    if(cachedItem) {
        req.logger.debug('synchronize interceptor: successful response cached for pid %s', pid);
        return next();
    }

    req.app.subsystems.jdsSync.getPatientStatus(pid, req, function(error, syncStatus) {
        if (error || !syncStatus || !syncStatus.data) {
            req.logger.warn(error, 'Error retrieving sync status; skipping');
            return next();
        }

        var latestOpenJobTimestamp, latestStampTime;
        var anyErrorJobs = false;
        _.each(syncStatus.data.jobStatus, function(job) {
            if (job.status === 'error') {
                anyErrorJobs = true;
            } else if (job.status !== 'completed') {
                var timestamp = Number(job.timestamp);
                if (!latestOpenJobTimestamp || latestOpenJobTimestamp < timestamp) {
                    latestOpenJobTimestamp = timestamp;
                }
            }
        });
        if (syncStatus.data.syncStatus && syncStatus.data.syncStatus.inProgress) {
            _.each(syncStatus.data.syncStatus.inProgress.sourceMetaStamp, function(item) {
                if (!latestStampTime || latestStampTime < item.stampTime) {
                    latestStampTime = item.stampTime;
                }
            });
        }

        var anyOpenJobs = !_.isUndefined(latestOpenJobTimestamp);
        var latestOpenJobAgo = latestOpenJobTimestamp && moment().diff(latestOpenJobTimestamp);
        var latestStampTimeAgo = latestStampTime && moment().diff(moment(String(latestStampTime), 'YYYYMMDDHHmmss'));

        // Commented out per Wendell for the case that a configuration issue (like missing HDR)
        // causes a continuous resync:
        // if (anyErrorJobs && !anyOpenJobs) {
        //     req.logger.info(syncStatus, 'Synchronize interceptor clearing patient ' + pid + ' because the sync status contains jobs with errors and no open jobs.');
        //     clearThenSyncPatient(pid, req, res, next);
        // } else if
        if (anyOpenJobs && latestOpenJobAgo > req.app.config.resync.openJobsTimeoutMillis) {
            req.logger.info(syncStatus, 'Synchronize interceptor clearing patient ' + pid + ' because the sync status contains open jobs that were all created longer than config.resync.openJobsTimeoutMillis ago.');
            clearThenSyncPatient(pid, req, res, next);
        } else if (!anyOpenJobs && latestStampTimeAgo > req.app.config.resync.inProgressTimeoutMillis) {
            req.logger.info(syncStatus, 'Synchronize interceptor clearing patient ' + pid + ' because the sync status contains no open jobs and its meta-stamp has been in progress for longer than config.resync.inProgressTimeoutMillis.');
            clearThenSyncPatient(pid, req, res, next);
        } else {
            syncPatient(pid, req, res, next);
        }
    });
};

function clearThenSyncPatient(pid, req, res, next) {
    req.logger.debug('Clearing, then synchronizing patient ' + pid);

    req.app.subsystems.jdsSync.clearPatient(pid, req, function(err, result) {
        req.logger.debug('start syncClear callback');
        if (err) {
            var status = _.isNumber(err) ? err : 500;
            result = result || err;
            res.status(status).rdkSend(result);
        } else {
            syncPatient(pid, req, res, next);
        }
    });
}

function syncPatient(pid, req, res, next) {
    req.logger.debug('Synchronizing patient ' + pid);

    var cacheKey = 'synchronize-interceptor' + pid;

    // Make sure the users logged in site is synced first
    var prioritySite = [];
    if((req.session.user || {}).site) {
        prioritySite.push(req.session.user.site);
    }

    req.app.subsystems.jdsSync.loadPatientPrioritized(pid, prioritySite, req, function(err, result) {
        req.logger.debug('start syncLoad callback');
        if (err) {
            if (err === 404){
                req.logger.debug('404 syncLoad');
                var resultData = result || '';
                res.status(404).rdkSend(resultData);
            }
            else {
                req.logger.error('Error synchronizing patient:');
                req.logger.error(err);
                res.status(500).rdkSend('There was an error processing your request. The error has been logged.');
            }
        } else if(!result) {
            req.logger.error('Empty response from sync subsystem');
            res.status(500).rdkSend('There was an error processing your request. The error has been logged.');
        } else if(!('data' in result) || result.status === 500) {
            req.logger.debug('Error response from sync subsystem:');
            req.logger.error(result);
            cache.put(cacheKey, true, 10 * 60 * 1000);
            next();
            //next();
            //req.logger.debug(result.data.items);
            //res.status(500).rdkSend('There was an error processing your request. The error has been logged.');
        } else if (result.status === 404) {
            req.logger.debug('404 syncLoad');
            res.status(result.status).rdkSend(result);
        } else {
            // relying on result.data.items to always have 1 element
            // @TODO Fix this logic here with new VX-Sync 2.0
            var responseShouldBeCached = true;
            req.logger.trace(result);
            // var responseShouldBeCached = _.every(result.data.items[0].syncStatusByVistaSystemId, function(site) {
            //     return site.syncComplete;
            // });
            if(responseShouldBeCached) {
                req.logger.debug('synchronize interceptor: caching syncLoad response');
                cache.put(cacheKey, true, 10 * 60 * 1000);
            } else {
                req.logger.debug('synchronize interceptor: not caching syncLoad response');
            }
            req.logger.debug('syncLoad - continue');
            next();
        }
    });
}
