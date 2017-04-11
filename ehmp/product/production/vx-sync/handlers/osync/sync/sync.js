'use strict';

var _ = require('lodash');
var request = require('request');
var nullUtil = require(global.VX_UTILS + 'null-utils');
var errorUtil = require(global.VX_UTILS + 'error');
var jobUtil = require(global.VX_UTILS + 'osync-job-utils');
var jdsUtil = require(global.VX_UTILS + 'jds-utils');

/**
 * Takes a job and validates all of the fields of that job to make sure it's a valid one.<br/>
 * Examples: job type and source are correct, patient exists and has correct identifiers.
 *
 * @param job The job to validate.
 * @returns {string} Error message if validation failed; null otherwise.
 */
function validate(job) {
    // Make sure we have the correct Job Type
    if (nullUtil.isNullish(job.type)) {
        return 'sync.validate: Could not find job type';
    }
    if (job.type !== 'sync') {
        return 'sync.validate: job type was not sync';
    }

    // Make sure the source is one of the 3 types we support.
    if (nullUtil.isNullish(job.source)) {
        return 'sync.validate: Could not find job source';
    }
    if (job.source !== 'appointments' && job.source !== 'admissions' && job.source !== 'patient lists') {
        return 'sync.validate: job source was not "appointments" , "admissions" or "patient lists"';
    }

    // Finally, make sure there is a patient actually in there.
    if (nullUtil.isNullish(job.patient)) {
        return 'sync.validate: Could not find job patient';
    }
    if (nullUtil.isNullish(job.patient.ien) && nullUtil.isNullish(job.patient.dfn)) {
        return 'sync.validate: Missing dfn and ien for patient';
    }

    return null;
}

/**
 * Takes the config and validates all of the fields of that config to make sure it's a valid one.<br/>
 * Examples: vxsync.syncUrl, vxsync.numToSyncSimultaneously, and vxsync.waitBetween are all correct.
 *
 * @param config The config to validate
 * @returns {string} Error message if validation failed; null otherwise.
 */
function validateConfig(config) {
    // Make sure we have the correct Job Type
    if (nullUtil.isNullish(config)) {
        return 'sync.validateConfig: Configuration cannot be null';
    }
    if (nullUtil.isNullish(config.syncUrl)) {
        return 'sync.validateConfig: syncUrl cannot be null';
    }

    return null;
}

/**
 * Validates that the response received from vxsync is a 202 status code.
 *
 * @param log The logger.
 * @param response The response to validate received a 202 status code.
 * @returns {boolean} True if no errors exist
 */
function confirmSyncSuccess(log, response) {
    if (nullUtil.isNullish(response) === false && (response.statusCode !== 200 && response.statusCode !== 202)) {
        log.warn('sync.confirmSyncSuccess: get didn\'t return a 200 or 202 response: ' + response.statusCode + '\nBody: ' + response.body);
        return false;
    }

    return true;
}

/**
 * Syncs a patient with vxsync.
 *
 * @param log The logger.
 * @param config Contains the url to append the ien to for syncing this patient.
 * @param patientIdentifier The patientIdentifier of the patient about to be synced.
 * @param callback The callback method you want invoked when either an error occurs or processing has finished
 * with syncing this specific patient.  If an error occurs, the first parameter of the callback will be populated with
 * a non-null value.
 */
function syncPatient(log, config, patientIdentifier, callback) {
    var options = {
        url: config.syncUrl,
        method: 'GET',
        json: true,
        qs: {}
    };

    options.qs[patientIdentifier.type] = patientIdentifier.value;
    options.qs['priority'] = config.syncPriority > 100 ? 100 : config.syncPriority < 1 ? 1 : config.syncPriority || 50;

    request.get(options, function(error, response) {
        if (error) {
            log.error('error in sync.syncPatient: ' + error);
            return callback(error);
        }

        if (confirmSyncSuccess(log, response, callback) === false) {
            return callback('invalid sync');
        }

        callback(null);
    }).on('error', function(error) {
        log.error('sync.syncPatient: ' + error);
        return callback(error);
    });
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
        return jobStatus.status !== 'error';
    });

    return !_.isUndefined(inProcessJob);
}

function checkPatientSyncStatus(logger, syncConfig, patientIdentifier, callback) {
    logger.debug('sync.checkPatientSyncStatus: Checking sync status for patient id %s.', patientIdentifier.value);

    var options = {
        url: syncConfig.statusUrl,
        method: 'GET',
        json: true,
        qs: {}};

    options.qs[patientIdentifier.type] = patientIdentifier.value;

    request.get(options, function(error, response, body) {
        if (error)  {
            logger.error('sync.checkPatientSyncStatus: Resync handler encountered an error trying to access sync endpoint: %s.', error);
            return callback(error);
        }

        if (response.statusCode === 200 && syncUnstable(body)) {
            logger.debug('sync.checkPatientSyncStatus: Sync for patient id %s still in progress.', patientIdentifier.value);
            return  callback('Sync still in progress.');
        } else if (response.statusCode !== 200 && !(response.statusCode === 404 && body.lastIndexOf('Patient identifier not found', 0) === 0)) {
            logger.error('sync.checkPatientSyncStatus: Error trying to access sync endpoint: %s.', body);
            return  callback('Error calling sync status endpoint. Status code: ' + response.statusCode + ' Error: ' + body);
        } else {
            logger.debug('sync.checkPatientSyncStatus: Patient sync complete for patient id %s.', patientIdentifier.value);
            return callback();
        }
    });
}

/**
 * Takes the patient and submits them in batches to be sent to vxsync.
 * @param log The logger.
 * @param config The configuration for this environment.
 * @param environment Currently unused.
 * @param job Contains a patient needing to be synced.
 * @param handlerCallback The callback method you want invoked when either an error occurs or processing has finished
 * with syncing this specific patient.  If an error occurs, the first parameter of the callback will be populated with
 * a non-null value.
 */
function handle(log, config, environment, job, handlerCallback) {
    log.debug('sync.handle : received request to save ' + JSON.stringify(job));

    var error = validate(job) || validateConfig(config);
    if (error) {
        return handlerCallback(error);
    }

    var patientIdentifier = {};

    if (jdsUtil.isIcn(job.patient.ien)) {
        patientIdentifier.type = 'icn';
        patientIdentifier.value = job.patient.ien;
    } else {
        patientIdentifier.type = 'pid';
        patientIdentifier.value = job.siteId + ';' + job.patient.dfn;
    }

    checkPatientSyncStatus(log, config, patientIdentifier, function(error) {
        if (error) {
            if (error === 'Sync still in progress.') {
                return handlerCallback(null, 'already started');
            } else {
                return handlerCallback(error);
            }
        }

        syncPatient(log, config, patientIdentifier, function(err) {
            if (err) {
                return handlerCallback(err);
            }

            var storeJob = _.cloneDeep(job);
            storeJob.jobId = undefined;
            storeJob.jpid = undefined;

            var jobToPublish = jobUtil.createStoreJobStatusJob(log, config, environment, storeJob);
            environment.publisherRouter.publish(jobToPublish, handlerCallback);
        });
    })
}

module.exports = handle;
