'use strict';

var _ = require('underscore');
var async = require('async');

var patientListVistaRetriever = require(global.OSYNC_UTILS + 'patient-list-vista-retriever');
var jobUtil = require(global.OSYNC_UTILS + 'osync-job-utils');
var nullUtils = require(global.VX_UTILS + 'null-utils');

/**
 * Takes a job and validates all of the fields of that job to make sure it's a valid one.<br/>
 * Examples: job type and source are correct, patients exist and have correct identifiers.
 *
 * @param job The job to validate.
 * @returns {string} Error message if validation failed; null otherwise.
 */
function validate(job) {
    // make sure we have the correct jobtype
    if (nullUtils.isNullish(job.type)) {
        return 'patientlist.validate: Could not find job type';
    }

    // Make sure the job sent to us is a patientlist
    if (job.type !== 'patientlist') {
        return 'patientlist.validate: job type was not patientlist';
    }

    if (job.users && _.isArray(job.users)) {
        for (var i = 0; i < job.users.length; i++) {
            var u = job.users[i];
            if (nullUtils.isNullish(u)) {
                return 'patientlist.validate: a user was null';
            }
            if (nullUtils.isNullish(u.site) || nullUtils.isNullish(u.id)) {
                return 'patientlist.validate: a user was null or empty';
            }
        }
    }

    return null;
}

function publishSingleValidationMessage(log, config, environment, patient, callback) {
    var singlePatientJob = {};
    singlePatientJob.source = 'patient lists';
    singlePatientJob.patient = patient;
    singlePatientJob.siteId = patient.siteId;
    singlePatientJob.jobId = undefined;
    singlePatientJob.jpid = undefined;

    var jobToPublish = jobUtil.createValidationJob(log, config, environment, singlePatientJob);
    environment.publisherRouter.publish(jobToPublish, function(error) {
        if (error) {
            return callback(error);
        }

        setTimeout(callback, (config.delay && _.isNumber(config.delay)) ? config.delay : 500);
    });

}

function handle(log, config, environment, job, handlerCallback) {
    log.debug('patientlist.handle: Received request to sync for active users: %j', job);

    var errorMessage = validate(job);
    if (errorMessage) {
        return handlerCallback(errorMessage);
    }

    async.eachSeries(job.users, function(user, callback) {
        patientListVistaRetriever.getPatientListForOneUser(log, config, user, function(error, patientList) {
            if (error) {
                return callback(error);
            }

            async.eachSeries(patientList, function(patient, cb) {
                log.debug('patientlist.handle: Processing %j', patient);

                publishSingleValidationMessage(log, config, environment, patient, function(err) {
                    if (err) {
                        return cb(err);
                    }
                    cb();
                });
            }, function(err) {
                if (err) {
                    return callback(err);
                }

                log.debug('patientlist.handle: Finished processing for active user %s at site %', user.id, user.site);
                setTimeout(callback, 0);
            });
        });
    }, function(err) {
        if (err) {
            return handlerCallback(err);
        }

        handlerCallback();
    });
}

module.exports = handle;
