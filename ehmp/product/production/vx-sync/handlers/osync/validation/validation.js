'use strict';

var _ = require('lodash');
var errorUtil = require(global.VX_UTILS + 'error');
var nullUtil = require(global.VX_UTILS + 'null-utils');
var jobUtil = require(global.OSYNC_UTILS + 'osync-job-utils');
var jdsUtil = require(global.OSYNC_UTILS + 'jds-utils');
var patientIdUtil = require(global.VX_UTILS + 'patient-identifier-utils');

/**
 * Takes a job and validates all of the fields of that job to make sure it's a valid one.<br/>
 * Examples: job type and source are correct, patient exists and has correct identifiers.
 *
 * @param job The job to validate.
 * @returns {string} Error message if error occurred, null otherwise.
 */
function validate(job) {
    // Make sure we have the correct Job Type
    if (nullUtil.isNullish(job.type)) {
        return 'validation.validate: Could not find job type';
    }
    if (job.type !== 'validation') {
        return 'validation.validate: job type was not validation';
    }

    // Make sure the source is one of the 3 types we support.
    if (nullUtil.isNullish(job.source)) {
        return 'validation.validate: Could not find job source';
    }
    if (job.source !== 'appointments' && job.source !== 'admissions' && job.source !== 'patient lists') {
        return 'validation.validate: job source was not "appointments" , "admissions" or "patient lists"';
    }

    // Make sure the siteId is there
    if (nullUtil.isNullish(job.siteId)) {
        return 'validation.validate: Missing siteId';
    }

    // Finally, make sure there is a patient actually in there.
    if (nullUtil.isNullish(job.patient)) {
        return 'validation.validate: Could not find job patient';
    }
    if (nullUtil.isNullish(job.patient.icn) && nullUtil.isNullish(job.patient.dfn)) {
        return 'validation.validate: Missing dfn and icn for patient';
    }

    return null;
}

function handle(log, config, environment, job, handlerCallback) {
    log.debug('validation.handle : received request to save' + JSON.stringify(job));

    var error = validate(job);
    if (error) {
        return handlerCallback(error);
    }
    log.debug('validation-request.validate: validation ok for job: ' + JSON.stringify(job));

    // Check to see if patient exists in blacklist; if so, skip
    if (patientIdUtil.patientExistsIn(log, job.siteId, job.patient.icn, job.patient.dfn, jdsUtil.blacklist.patients)) {
        log.debug('validation.handle: patient ' + (nullUtil.isNullish(job.patient.icn) ? job.patient.dfn : job.patient.icn) + ' exists in blacklist');
        return handlerCallback();
    }

    // Check to see if patient in synced list; if so, skip
    if (patientIdUtil.patientExistsIn(log, job.siteId, job.patient.icn, job.patient.dfn, jdsUtil.patientsSynced.patients)) {
        log.debug('validation.handle: patient ' + (nullUtil.isNullish(job.patient.icn) ? job.patient.dfn : job.patient.icn) + ' exists in synced list');
        return handlerCallback();
    }

    // The patient is valid for osync; record this in the log.
    environment.validPatientsLog.info(JSON.stringify({"siteId": job.siteId, "patient": job.patient, "source": job.source}));

    // Create job for sync handler
    var syncJob = _.cloneDeep(job);
    syncJob.jobId = undefined;
    syncJob.jpid = undefined;
    var jobToPublish = jobUtil.createSyncJob(log, config, environment, syncJob);
    environment.publisherRouter.publish(jobToPublish, handlerCallback);
}

module.exports = handle;
