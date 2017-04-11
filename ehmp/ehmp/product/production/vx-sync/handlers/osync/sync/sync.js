'use strict';

var request = require('request');
var nullUtil = require(global.VX_UTILS + 'null-utils');
var moment = require('moment');
var blackListUtil = require(global.OSYNC_UTILS + 'blacklist-utils');
var inspect = require('util').inspect;
var format = require('util').format;
var patientIdUtils = require(global.VX_UTILS + 'patient-identifier-utils');

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
        return 'sync.validate: Missing dfn and icn for patient';
    }

    return null;
}

/**
 * Takes the osyncConfig and validates all of the fields of that config to make sure it's a valid one.<br/>
 * Examples: vxsync.syncUrl, vxsync.numToSyncSimultaneously, and vxsync.waitBetween are all correct.
 *
 * @param osyncConfig The config to validate
 * @returns {string} Error message if validation failed; null otherwise.
 */
function validateConfig(osyncConfig) {
    // Make sure we have the correct Job Type
    if (nullUtil.isNullish(osyncConfig)) {
        return 'sync.validateConfig: Configuration cannot be null';
    }
    if (nullUtil.isNullish(osyncConfig.syncUrl)) {
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
 * @param osyncConfig Contains the url to append the icn to for syncing this patient.
 * @param patientIdentifier The patientIdentifier of the patient about to be synced.
 * @param callback The callback method you want invoked when either an error occurs or processing has finished
 * with syncing this specific patient.  If an error occurs, the first parameter of the callback will be populated with
 * a non-null value.
 */
function syncPatient(log, osyncConfig, patientIdentifier, callback) {
    log.debug('sync.syncPatient(): entering method');
    var options = {
        url: osyncConfig.syncUrl,
        method: 'GET',
        json: true,
        qs: {}
    };

    options.qs[patientIdentifier.type] = patientIdentifier.value;
    options.qs.priority = osyncConfig.syncPriority > 100 ? 100 : osyncConfig.syncPriority < 1 ? 1 : osyncConfig.syncPriority || 50;

    var errorMessage;
    request.get(options, function(error, response) {

        if (error) {
            errorMessage = format('sync.syncPatient(): received error from sync endpoint: %s', inspect(error));
            log.error(errorMessage);
            return callback(errorMessage);
        }

        if (confirmSyncSuccess(log, response, callback) === false) {
            errorMessage = format('sync.syncPatient(): unexpected response from sync endpoint: %s', response ? response.statusCode: null);
            log.error(errorMessage);
            return callback(errorMessage);
        }

        callback(null);
    }).on('error', function(error) {
        errorMessage = format('sync.syncPatient: error event triggered during request: %s', inspect(error));
        log.error(errorMessage);
        return callback(errorMessage);
    });
}

function shouldSyncPatient(log, config, environment, job, patientIdentifier, callback){
    log.debug('sync.shouldSyncPatient(): entering method');

    var patient = job.patient;
    var siteId = job.siteId;

    // Check to see if patient exists in blacklist; if so, skip
    blackListUtil.isBlackListedPatient(log, environment, patient.dfn, siteId, function(error, result) {
        if (result) {
            log.debug('validation.handle: patient ' + (nullUtil.isNullish(patient.icn) ? patient.dfn : patient.icn) + ' exists in blacklist');
            return callback(null, false);
        }

        environment.jds.getSimpleSyncStatus(patientIdentifier, function(error, response, result){
            var errorMessage;
            if (error)  {
                errorMessage = format('sync.shouldSyncPatient: sync handler encountered an error trying to get simple sync status: %s.', inspect(error));
                log.error(errorMessage);
                return callback(errorMessage);
            }
            if(!response || (response.statusCode !== 200 && response.statusCode !== 404)){
                errorMessage = format('sync.shouldSyncPatient: sync handler encountered an unexpected response trying to get simple sync status: %s.', response ? response.statusCode: null);
                log.error(errorMessage);
                return callback(errorMessage);
            }

            var hasError;
            if(result){
                hasError = result.hasError;
            }

            if(response.statusCode === 404 || hasError){
                //Sync patient if previous sync has not been started on this patient or the previous sync is in an error state
                log.debug('sync.shouldSyncPatient: Ready to sync patient id %s. Sync status check result: statusCode: %s, hasError: %s', patientIdentifier.value, response.statusCode, hasError);
                callback(null, true);
            } else {
                //Don't sync patient if previous sync has been called on this patient and is not in error state
                log.debug('sync.shouldSyncPatient: Not calling sync for patient id %s because sync has previously been called for this patient and is not in error state. Sync status check result: statusCode: %s, hasError: %s', patientIdentifier.value, response.statusCode, hasError);
                callback(null, false);
            }
        });
    });
}

/**
 * Takes the patient and submits them in batches to be sent to vxsync.
 * @param log The logger.
 * @param osyncConfig The osync configuration for this environment.
 * @param environment Currently unused.
 * @param job Contains a patient needing to be synced.
 * @param handlerCallback The callback method you want invoked when either an error occurs or processing has finished
 * with syncing this specific patient.  If an error occurs, the first parameter of the callback will be populated with
 * a non-null value.
 */
function handle(log, osyncConfig, environment, job, handlerCallback) {
    log.debug('sync.handle() : Entering method with job: %s', JSON.stringify(job));

    var error = validate(job) || validateConfig(osyncConfig);
    if (error) {
        return handlerCallback(error);
    }

    var patientIdentifier = {};

    if (patientIdUtils.isIcn(job.patient.ien)) {
        patientIdentifier.type = 'icn';
        patientIdentifier.value = job.patient.ien;
    } else {
        patientIdentifier.type = 'pid';
        patientIdentifier.value = job.siteId + ';' + job.patient.dfn;
    }

    // The patient is sumbitted for osync; record this in the log.
    environment.validPatientsLog.info(JSON.stringify({
        'siteId': job.siteId,
        'patient': job.patient,
        'source': job.source
    }));

    shouldSyncPatient(log, osyncConfig, environment, job, patientIdentifier, function(error, readyToSync) {
        if (error) {
            log.error('sync.handle: Exiting with error returned by shouldSyncPatient: %s', inspect(error));
            return handlerCallback(error);
        }

        if(!readyToSync) {
            return handlerCallback(null, 'already started');
        }

        syncPatient(log, osyncConfig, patientIdentifier, function(err) {
            if (err) {
                log.error('sync.handle: Exiting with error returned by syncPatient: %s', inspect(error));
                return handlerCallback(err);
            }

            // Store information to the results log that we have requested a sync for this patient.
            //-------------------------------------------------------------------------------------
            storePatientInfoToResultsLog(log, environment, job, handlerCallback);
        });
    });
}

/**
 * Logs that a request was made to synchronize this patient.
 *
 * @param log The logger.
 * @param environment Currently unused.
 * @param job Contains a patient needing to be synced.
 * @param handlerCallback The callback method you want invoked when the information is successfully logged.
 * with syncing this specific patient.  If an error occurs, the first parameter of the callback will be populated with
 * a non-null value.
 */
function storePatientInfoToResultsLog(log, environment, job, handlerCallback) {
    log.debug('sync.storePatientInfoToResultsLog: received request to log ' + JSON.stringify(job));

    var saving = {'siteId': job.siteId, 'patient': job.patient, 'source': job.source, 'syncDate': moment().format()};

    environment.resultsLog.info(JSON.stringify(saving));

    log.debug('sync.storePatientInfoToResultsLog: saved ' + JSON.stringify(saving));

    handlerCallback(null);
}

module.exports = handle;
module.exports._storePatientInfoToResultsLog = storePatientInfoToResultsLog;
module.exports._shouldSyncPatient = shouldSyncPatient;
