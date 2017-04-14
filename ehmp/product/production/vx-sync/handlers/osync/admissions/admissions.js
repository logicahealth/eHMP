'use strict';

var _ = require('lodash');
var async = require('async');
var errorUtil = require(global.VX_UTILS + 'error');
var nullUtils = require(global.VX_UTILS + 'null-utils');
var parseRpcResponseAdmissions = require(global.OSYNC_UTILS + 'patient-sync-utils').parseRpcResponseAdmissions;
var jobUtil = require(global.OSYNC_UTILS + 'osync-job-utils');

/**
 * Takes a job and validates all of the fields of that job to make sure it's a valid one.
 *
 * @param job The job to validate.
 * @returns {string} Error message if validation failed; null otherwise.
 */
function validateJob(job) {
    // Make sure that the job has the correct job type
    if (!job.type) {
        return 'admissions.validate: Could not find job type';
    }
    // Make sure the job sent to us is an admission-request
    if (job.type !== 'admissions') {
        return 'admissions.validate: job type was not admissions';
    }
    // Make sure that the job sent contains a site
    if (!job.siteId) {
        return 'admissions.validate: Could not find job site';
    }
    return null;
}

/**
 * validate the configuration to ensure that all required RPC information exists
 *
 * @param config The config to validate.
 * @returns {string} Error message if validation failed; null otherwise.
 */
function validateConfig(config, site) {
    if (nullUtils.isNullish(config)) {
        return 'admissions.handle: Invalid configuration passed';
    }

    if (nullUtils.isNullish(config.vistaSites)) {
        return 'admissions.handle: No VistA site configuration found';
    }

    if (nullUtils.isNullish(config.vistaSites[site])) {
        return 'admissions.handle: No RPC configuration for site ' + site;
    }

    if (nullUtils.isNullish(config.rpcContext)) {
        return 'admissions.handle: No RPC context found in configuration';
    }
}

/**
 * Parse the VistA Admission RPC Response and publish Jobs to the oSync patient validation tube
 *
 * @param log The logger for the process
 * @param config The worker-config
 * @param environment The environment object that contains publisherRouter
 * @param job The source job
 * @param data The RAW RPC Response from VistA
 * @returns {string} Error message if processing failed; null otherwise.
 */
function processVistaAdmissionResponse(log, config, environment, job, data, callback) {
    // Parse the response from the RPC into something that we can iterate over
    parseRpcResponseAdmissions(log, data, function createPatientJobs(err, patients) {
        log.debug('admissions.handle: RPC Response %j', patients);
        if (err) {
            log.error('admissions.handle: Unable to parse the admissions for site: %s error: %s', job.siteId, err);
            return callback('admissions.handle: Unable to parse the admissions for site ' + job.siteId + 'error: ' + err);
        }

        async.eachSeries(patients, function publishPatientJobs(patient, cb) {
            log.debug('admissions.handle: Processing patient %j', patient);

            var singlePatientJob = _.cloneDeep(job);
            singlePatientJob.source = 'admissions';
            singlePatientJob.patient = patient;
            singlePatientJob.siteId = job.siteId;
            singlePatientJob.jobId = undefined;
            singlePatientJob.jpid = undefined;

            var jobToPublish = jobUtil.createSyncJob(log, singlePatientJob);
            environment.publisherRouter.publish(jobToPublish, function (error) {
                if (error) {
                    return cb(error);
                }
                return cb(null);
            });
        }, function handleAsyncError(err) {
            if (err) {
                return callback(err);
            }
            return callback(null);
        });
    });
}

/**
 * Publish jobs for patients that have admissions at the site specified in the job
 *
 * @param log
 * @param config
 * @param environment
 * @param job
 * @param handlerCallback
 * @returns {*}
 */
function handle(log, config, environment, job, handlerCallback) {
    log.debug('admissions.handle : received request to process %j', job);

    var error = validateJob(job);
    if (error) {
        log.error(error);
        return handlerCallback(errorUtil.createFatal(error));
    }

    var site = job.siteId;

    error = validateConfig(config, site);
    if (error) {
        log.error(error);
        return handlerCallback(errorUtil.createFatal(error));
    }

    var configVistaSites = config.vistaSites;
    var rpcConfig = configVistaSites[site];
    rpcConfig.context = config.rpcContext;

    environment.vistaClient.fetchAdmissionsForSite(site, function (error, data) {
        if (error) {
            log.error('admissions.handle: Unable to retrieve admissions from site: %s. error: %s data: %s', site, error, data);
            return handlerCallback(errorUtil.createFatal('admissions.handle: Unable to retrieve admissions from site ' + site + 'error: ' + error));
        }

        if (nullUtils.isNullish(data) || _.isEmpty(data)) {
            log.info('admissions.handle: No admissions to process for site %s', site);
            // Return success, we called the RPC and there are no admissions to process
            return handlerCallback(null);
        }

        // Process the VistA Admission Response and publish the jobs to beanstalk
        processVistaAdmissionResponse(log, config, environment, job, data, function (error) {
            if (error) {
                return handlerCallback(errorUtil.createFatal(error));
            }
            return handlerCallback(null);
        });
    });
}

module.exports = handle;
