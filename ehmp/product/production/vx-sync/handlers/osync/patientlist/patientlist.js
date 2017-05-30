'use strict';

var _ = require('underscore');

var jobUtil = require(global.OSYNC_UTILS + 'osync-job-utils');

/**
 * Handle a patient list job containing one user. For that user - get their list of patients,
 * and send a sync request for each one on the list.
 *
 * @param log The bunyan logger where log messages will be sent.
 * @param osyncConfig The osync node of the config file.
 * @param environment This contains handles to shared objects and resources.
 * @param job The job containing a user for which a patient list will be retrieverd
 *            and a sync requested.
 * @param handlerCallback The callback to call when we are done.  The signature is:
 *            function(error)
 *            where:
 *              error is the error that occurred
 */
function handle(log, osyncConfig, environment, job, handlerCallback) {
    log.debug('patientlist.handle: Received request to sync for active users: %j', job);

    // Validate the job and make sure all the needed items are present.
    //-----------------------------------------------------------------
    var errorMessage = validate(job);
    if (errorMessage) {
        return handlerCallback(errorMessage);
    }

    // Set this up so that we can override for unit tests.
    //----------------------------------------------------
    var patientListVistaRetriever = null;
    if (environment.patientListVistaRetriever) {
        patientListVistaRetriever = environment.patientListVistaRetriever;
    } else {
        patientListVistaRetriever = require(global.OSYNC_UTILS + 'patient-list-vista-retriever');
    }

    patientListVistaRetriever.getPatientListForOneUser(log, osyncConfig, job.user, function(error, patients) {
        if (error) {
            return handlerCallback(error);
        }

        createAndPublishPatientSyncJobs(log, environment, patients, job, function(error) {
            if (error) {
                return handlerCallback(error);
            }

            log.debug('patientlist.handle: Finished processing for active user: %j', job.user);
            return handlerCallback(null);
        });
    });
}

/**
 * Takes a job and validates all of the fields of that job to make sure it's a valid one.<br/>
 * Examples: job type and source are correct, patients exist and have correct identifiers.
 *
 * @param job The job to validate.
 * @returns {string} Error message if validation failed; null otherwise.
 */
function validate(job) {

    if (!_.isObject(job)) {
        return 'patientlist.validate: Job did not exist.';
    }

    if (!job.type) {
        return 'patientlist.validate: Could not find job type';
    }

    // Make sure the job sent to us is a patientlist
    if (job.type !== 'patientlist') {
        return 'patientlist.validate: job type was not patientlist';
    }

    if (!_.isObject(job.user)) {
        return 'patientlist.validate: User did not exist in the job.';
    }

    if (!job.user.id) {
        return 'patientlist.validate: User id was not in the job.';
    }

    if (!job.user.site) {
        return 'patientlist.validate: Site was not in the job.';
    }

    return null;
}


/**
 * Create jobs for each of the patients and publish them to the sync tube.
 *
 * @param log The bunyan logger where log messages will be sent.
 * @param environment This contains handles to shared objects and resources.
 * @param patients An array of patient objects.
 * @param job The job that gets passed to the sync job.
 * @param callback The callback to call when we are done.  The signature is:
 *            function(error)
 *            where:
 *              error is the error that occurred
 */
function createAndPublishPatientSyncJobs(log, environment, patients, job, callback) {

    // See if we have any jobs to publish
    //-----------------------------------
    if (_.isEmpty(patients)) {
        return callback(null);
    }

    var jobsToPublish = createPatientSyncJobs(log, patients, job);
    log.debug('patientlist.handle: Publishing jobs to oSync sync handler.  jobsToPublish: %j', jobsToPublish);

    environment.publisherRouter.publish(jobsToPublish, function(error) {
        if (error) {
            return callback(error);
        }

        return callback(null);
    });
}



/*
 * Create the sync jobs - one for each patient.
 *
 * @param log The bunyan logger where log messages will be sent.
 * @param patients The array of patient objects for which jobs will be created.
 * @param job The job that gets passed into the sync job.
 * @returns {[jobs]} This returns an array of sync jobs - one for each patient.
 */
function createPatientSyncJobs(log, patients, job) {
    var patientSyncJobs = [];

    _.each(patients, function(patient) {
        var meta = {
            'source': 'patient lists',
            'patient': patient,
            'siteId': patient.siteId
        };
        if (job.referenceInfo) {
            meta.referenceInfo = job.referenceInfo;
        }
        var patientSyncJob = jobUtil.createSyncJob(log, meta);
        patientSyncJobs.push(patientSyncJob);
    });

    return patientSyncJobs;
}

module.exports = handle;
module.exports._validate = validate;
module.exports._createAndPublishPatientSyncJobs = createAndPublishPatientSyncJobs;
module.exports._createPatientSyncJobs = createPatientSyncJobs;
