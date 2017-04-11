'use strict';

var _ = require('underscore');
var async = require('async');
var request = require('request');
var errorUtil = require(global.VX_UTILS + 'error');
var jobUtil = require(global.VX_UTILS + 'job-utils');
var loadPatient = require('./load-patient');
var syncDemoPatient = require('./demographics-sync');
var getDemoPatient = require('./get-patient-demographics');
var idUtil = require(global.VX_UTILS + 'patient-identifier-utils');

function handle(logger, config, environment, job, handlerCallback) {
    logger.debug('Resync handler started for job: j%.', job);

    if (!jobUtil.isValid(jobUtil.resyncRequestType(), job)) {
        logger.error('resync-request-handler.handle: Invalid resync request message for job: j%.', job);
        handlerCallback(errorUtil.createFatal('Invalid message. Resync request handler aborted.', job));
    }

    return async.applyEachSeries(
        [checkPatientSyncStatus, addDemographics.bind(undefined, environment), clearPatient, determineSyncMethod(job.patientIdentifier)],
        logger, config.syncRequestApi, job,
        function(error) {
            return processResults(logger, environment, config, job, handlerCallback, error);
        });
}

function addDemographics(environment, logger, config, job, callback) {
    if (_.isUndefined(job.demographics) && idUtil.isIcn(job.patientIdentifier.value) || idUtil.isDod(job.patientIdentifier.value)) {
        return getDemoPatient.loadDemographics(environment, logger, job, callback);
    }

    return callback();
}

function determineSyncMethod(patientIdentifier) {
 return idUtil.isIcn(patientIdentifier.value) || idUtil.isDod(patientIdentifier.value) ? syncDemoPatient : loadPatient;
}

//Stable - all domains synced for all sites (syncStatus.inProgress is undefined) and
//         no open jobs in progress (jobStatus array empty)
//Stable - all domains synced for all sites (syncStatus.inProgress is undefined) and
//         jobs in error status only (jos in jobStatus with error status)
//Unstable - one or more domain syncs still in progress (syncStatus.inProgress is NOT undefined) and/ or
//           there are open jobs (jobs in jobStatus with status other than error)
function syncUnstable(statusResponse) {
    if (!_.isUndefined(statusResponse.syncStatus.inProgress)) {
        return true;
    }

    var inProcessJob = _.find(statusResponse.jobStatus, function(jobStatus) {
            return jobStatus.status !== 'error' && jobStatus.type !== 'resync-request';
    });

    return !_.isUndefined(inProcessJob);
}

function checkPatientSyncStatus(logger, syncConfig, job, callback) {
    var patientIdentifier = job.patientIdentifier;

    logger.debug('resync-request-handler.checkPatientSyncStatus: Checking sync status for patient id %s.', patientIdentifier.value);

    var options = {
        url: syncConfig.protocol + '://' + syncConfig.host + ':' + syncConfig.port + syncConfig.patientStatusPath,
        method: 'GET',
        json: true,
        qs: {}};

    options.qs[patientIdentifier.type] = patientIdentifier.value;

    request.get(options, function(error, response, body) {
        if (error)  {
            logger.error('resync-request-handler.checkPatientSyncStatus: Resync handler encountered an error trying to access sync endpoint: %s.', error);
            return callback(error);
        }

        if (response.statusCode === 200 && syncUnstable(body)) {
            logger.debug('resync-request-handler.checkPatientSyncStatus: Sync for patient id %s still in progress.', patientIdentifier.value);
            return  callback('Sync still in progress.');
        } else if (response.statusCode !== 200 && !(response.statusCode === 404 && body.lastIndexOf('Patient identifier not found', 0) === 0)) {
            logger.error('resync-request-handler.checkPatientSyncStatus: Error trying to access sync endpoint: %s.', body);
            return  callback('Error calling sync status endpoint. Status code: ' + response.statusCode + ' Error: ' + body);
        } else {
            logger.debug('resync-request-handler.checkPatientSyncStatus: Patient sync complete for patient id %s.', patientIdentifier.value);
            return callback();
        }
    });
}

function clearPatient(logger, syncConfig, job, callback) {
    var patientIdentifier = job.patientIdentifier;

    logger.debug('resync-request-handler.clearPatient: Clearing patient for patient id %s.', patientIdentifier.value);

    var options = {
        url: syncConfig.protocol + '://' + syncConfig.host + ':' + syncConfig.port + syncConfig.patientUnsyncPath,
        method: 'POST',
        qs: {}};

    options.qs[patientIdentifier.type] = patientIdentifier.value;

    request.post(options, function(error, response, body) {
        if (error)  {
            logger.error('resync-request-handler.clearPatient: Error trying to access clear patient endpoint: %s.', error);
            return callback(error);
        }

        if (response.statusCode === 202 || response.statusCode === 404) {
            logger.debug('resync-request-handler.clearPatient: Successfully cleared patient for patient id %s.', patientIdentifier.value);
            return callback();
        } else {
            logger.error('resync-request-handler.clearPatient: Error trying to call clear patient endpoint: %s.', body);
            return  callback('Error calling clear patient endpoint. Status code: ' + response.statusCode + ' Error: ' + body);
        }

    });
}

function processResults(logger, environment, config, job, handlerCallback, error) {
    if (error) {
        var newJob = jobUtil.createResyncRequest(job.patientIdentifier, job);
        newJob.retryCount = _.result(job, 'retryCount', -1) + 1;

        if (newJob.retryCount <= config.retrySync.maxRetries) {
            logger.debug('resync-request-handler.processResults: Requeuing job as: %j.', newJob);
            return environment.publisherRouter.publish(newJob, function(error) {
                if (error) {
                    logger.error('resync-request-handler.processResults: New job %j failed to publish with error %s.', newJob, error);
                    return handlerCallback(errorUtil.createFatal(error));
                } else {
                    return handlerCallback(null, 'success');
                }
            });
        } else {
            logger.error('resync-request-handler.processResults: Maximum retries %d for %j reached for this patient. Job will not be requeued for retry.', config.retrySync.maxRetries, job);
            return handlerCallback(errorUtil.createFatal(error + ' Maximum retries reached.'));
        }
    } else {
        return handlerCallback(null, 'success');
    }

}

module.exports = handle;
module.exports._syncInProgress = syncUnstable;
