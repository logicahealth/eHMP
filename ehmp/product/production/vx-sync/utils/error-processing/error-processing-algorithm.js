'use strict';

require('../../env-setup');

/**
 *  This module contains the logic to process error records. There is a single entry point function (processErrorRecords).
 *
 *  Design: https://wiki.vistacore.us/pages/viewpage.action?pageId=23826497
 */

var _ = require('underscore');
var async = require('async');

var objUtil = require(global.VX_UTILS + 'object-utils');
var PublisherRouter = require(global.VX_JOBFRAMEWORK).PublisherRouter;

/**
 * Single entry point for all error record processing.
 *
 * @param errorRecords - an array of one or more errors records to process
 * @param processingContext - contains objects and processing directives used during error processing
 * @param callback - returns an error if an unexpected error occurs or undefined results. processing results are
 *                   found in the processing context.
 */
function processErrorRecords(errorRecords, processingContext, callback) {
    var resubmit = processErrorRecord.bind(null, processingContext);

    processingContext.logger.debug('error-processing-algorithm.processErrorRecords: processing started.');

    async.eachLimit(errorRecords, 10, resubmit, function(error) {
        if (error) {
            processingContext.logger.error('error-processing-algorithm.processErrorRecords: Unexpected error: %j.', error);
            return callback('Unexpected error: ' + error);
        }

        processingContext.logger.debug('error-processing-algorithm.processErrorRecords: processing complete.');
        callback();
    });
}

/**
 * Processes a single error record. Processing status is stored in the processingContext using the errors and results
 * arrays.
 *
 * @param processingContext - contains all directives and objects needed for error processing
 * @param errorRecord - error record to process
 * @param callback - always returns undefined results. actual processing results are in the processingContext object.
 */
function processErrorRecord(processingContext, errorRecord, callback) {
    if (maxRetriesReached(processingContext, errorRecord)) {
        processingContext.logger.debug('error-processing-algorithm.processErrorRecords: Successfully processed error record %s with status: Max retries reached.', errorRecord.uid);
        processingContext.results.push('Successfully processed error record ' +  errorRecord.uid + ' with status: Max retries reached.');
        return setTimeout(callback, 0);
    }

    var tasks = [lockErrorJob, publishErrorJob];

    if (processingContext.keepRecord) {
        processingContext.logger.debug('error-processing-algorithm.processErrorRecord: Keep record flag set so error records will not be deleted during this error process run.');
        tasks.push(deleteLock);
    } else {
        tasks.push(deleteErrorJob);
    }

    async.applyEachSeries(tasks, processingContext, errorRecord, function(error) {
        if (error && error !== 'SKIP') {
            processingContext.errors.push('Error processing record ' + errorRecord.uid + ' with error: ' + JSON.stringify(error));

            deleteLock(processingContext, errorRecord, function(err) {
                if (err) {
                    processingContext.logger.error('error-processing-algorithm.processErrorRecord: Error removing lock for record %s with error: %j.', errorRecord.uid, err);
                    processingContext.errors.push('Error removing lock for record ' + errorRecord.uid + ' with error: ' + JSON.stringify(err));
                }

                return callback();
            });
        } else if (error && error === 'SKIP') {
            processingContext.results.push('Successfully processed error record ' + errorRecord.uid + ' with status: Skipped.');

            callback();
        } else {
            processingContext.logger.debug('error-processing-algorithm.processErrorRecords: Successfully processed error record %s with status: Processing complete.', errorRecord.uid);
            processingContext.results.push('Successfully processed error record ' +  errorRecord.uid + ' with status: Processing complete.');

            callback();
        }
    });
}

/**
 * Checks to see if the error record job has already been processed the configured maximum number of times. This check
 * can be overridden by the ignoreRetry directive.
 *
 * @param processingContext - contains configuration object and processing directives
 * @param errorRecord - error record to compare its retryCount to retry maximum
 * @returns {boolean} - returns true if the maximum number of retries has been reached and false if has not
 */
function maxRetriesReached(processingContext, errorRecord) {
    if (processingContext.ignoreRetry) {
        processingContext.logger.debug('error-processing-algorithm.maxRetriesReached: Ignore retry set for error record: %s', errorRecord.uid);
        return false;
    }

    var retryLimit = objUtil.getProperty(processingContext, 'config', 'error-processing', 'errorRetryLimit') || 3;

    var jobRetryCount = objUtil.getProperty(errorRecord, 'job', 'retryCount') || 0;

    return jobRetryCount >= retryLimit;
}

/**
 * Used to lock an error record before processing the error record.
 *
 * @param processingContext - contains the jdsClient to use to lock record
 * @param errorRecord - error record to lock
 * @param callback - error or undefined. if JDS returns an error then it returns an error of 'SKIP' which indicates that
 *                   this error record is being processed already and processing for this error record should be stopped.
 */
function lockErrorJob(processingContext, errorRecord, callback) {

    processingContext.jdsClient.lockErrorRecord(errorRecord.uid, function(error) {
        if (error && objUtil.getProperty(error, 'message') && error.message.indexOf('Record already locked') >= 0) {
            processingContext.logger.debug('error-processing-algorithm.lockErrorJob: Skipping processing of error record %s because it is already being processed.', errorRecord.uid);
            return callback('SKIP');
        }

        if (error) {
            processingContext.logger.error('error-processing-algorithm.lockErrorJob: Error locking error record %s with error: %j.', errorRecord.uid, error);
            return callback(error);
        }

        callback();
    });
}

/**
 * This function publishes the job in the error record to beanstalk if it is a job error
 * and the deleteOnly directive is false.
 *
 * @param processingContext - contains configuration object and processing directives
 * @param errorRecord - error record that may contain a job to publish to beanstalk
 * @param callback - returns error or undefined results
 */
function publishErrorJob(processingContext, errorRecord, callback) {
    if ( _.isUndefined(errorRecord.job)) {
        processingContext.logger.debug('error-processing-algorithm.publishErrorJob: Skipping publish of error record %s because it is not job error.', errorRecord.uid);
        return setTimeout(callback, 0);
    }

    if (processingContext.deleteOnly) {
        processingContext.logger.debug('error-processing-algorithm.publishErrorJob: Skipping publish of error record %s because delete only flag is set.', errorRecord.uid);
        return setTimeout(callback, 0);
    }

    incrementRetryCount(errorRecord);

    var publishingConfiguration;
    try {
        publishingConfiguration = getPublishConfiguration(processingContext, errorRecord);
    }
    catch(e) {
        processingContext.logger.error('error-processing-algorithm.publishErrorJob: Error publishing error record %s with error: %s', errorRecord.uid, e.message);
        return setTimeout(callback, 0, 'Unable to publish error record job because of invalid configuration. Error: ' + e.message);
    }

    var publisherRouter = new PublisherRouter(processingContext.logger, publishingConfiguration, processingContext.environment.metrics, processingContext.environment.jobStatusUpdater);

    publisherRouter.publish(errorRecord.job, function(error) {
        publisherRouter.close();

        if (error) {
            processingContext.logger.error('error-processing-algorithm.publishErrorJob: Error publishing error record %s with error: %j.', errorRecord.uid, error);
            return callback(error);
        }

        processingContext.logger.debug('error-processing-algorithm.publishErrorJob: Job published. jobId: %s, jobsToPublish: %j', errorRecord.job.jobId, errorRecord.job);

        callback();
    });
}

function incrementRetryCount(errorRecord) {
    errorRecord.job.retryCount = objUtil.getProperty(errorRecord, 'job', 'retryCount') ? errorRecord.job.retryCount + 1 : 1;
}

/**
 * Create a deep copy of the configuration and update the config.beanstalk node with the vxsync environment for the
 * error record job. This function throws reference errors if the require configuration is not found in the error
 * record or in the configuration object.
 *
 * @param processingContext - contains configuration object to copy and update
 * @param errorRecord - contains the job type and vxsync environment name that the job was processed on
 * @returns {*} updated copy of configuration object
 */
function getPublishConfiguration(processingContext, errorRecord) {
    if (_.isUndefined(objUtil.getProperty(processingContext, 'config', 'vxsyncEnvironments'))) {
        throw new ReferenceError('Configuration does not contain the vxsyncEnvironments.');
    }

    if (_.isUndefined(objUtil.getProperty(errorRecord, 'vxsyncEnvironmentName'))) {
        throw new ReferenceError('Error record does not contain the vxsyncEnvironmentName property.');
    }

    var config = JSON.parse(JSON.stringify(processingContext.config));
    var jobEnvironment = errorRecord.vxsyncEnvironmentName;
    var vxsyncEnvironment = config.vxsyncEnvironments[jobEnvironment];

    if (_.isUndefined(vxsyncEnvironment)) {
        throw new ReferenceError('Configuration does not contain expected job vxsync environment: ' + jobEnvironment + '.');
    }

    var jobType = errorRecord.jobType;

    if (_.isUndefined(objUtil.getProperty(vxsyncEnvironment, 'vxsync', 'beanstalk', 'jobTypes', jobType))) {
        if (_.isUndefined(objUtil.getProperty(vxsyncEnvironment, 'osync', 'beanstalk', 'jobTypes', jobType))) {
            throw new ReferenceError('Environment configuration ' + jobEnvironment + ' does not contain expected job type ' + jobType + '.');
        } else {
            config.beanstalk = vxsyncEnvironment.osync.beanstalk;
        }
    } else {
        config.beanstalk = vxsyncEnvironment.vxsync.beanstalk;
    }

    return config;
}

/**
 * Deletes an error record from the JDS error store if processing was successful.
 *
 * @param processingContext - contains processing directives and jdsClient used to delete error
 * @param errorRecord - error record to delete from the JDS error store
 * @param callback - returns error or undefined results
 */
function deleteErrorJob(processingContext, errorRecord, callback) {
    processingContext.jdsClient.deleteErrorRecordByUid(errorRecord.uid, function(error, response, result) {
        if (error) {
            processingContext.logger.error('error-processing-algorithm.deleteErrorJob: Error deleting error record %s with error: %j.', errorRecord.uid, error);
            return callback(error);
        }

        if (response.statusCode !== 200) {
            processingContext.logger.error('error-processing-algorithm.deleteErrorJob: Error deleting record %s with JDS error: %j.', errorRecord.uid, result);
            return callback(result);
        }

        callback();
    });
}

/**
 * Remove lock on an error record. This should only be called if there was error during error processing.
 *
 * @param processingContext - contains jdsClient used to remove lock
 * @param errorRecord - error record to remove lock
 * @param callback - returns error or undefined results
 */
function deleteLock(processingContext, errorRecord, callback) {

    processingContext.jdsClient.unlockErrorRecord(errorRecord.uid, function(error, response, result) {
        if (error) {
            processingContext.logger.error('error-processing-algorithm.deleteLock: Error unlocking error record %s with error: %j.', errorRecord.uid, error);
            return callback(error);
        }

        if (response.statusCode !== 200) {
            processingContext.logger.error('error-processing-algorithm.deleteLock: Error unlocking error record %s with JDS error: %j.', errorRecord.uid, result);
            return callback(result);
        }

        callback();
    });
}

module.exports.processErrorRecords = processErrorRecords;

module.exports._deleteErrorJob = deleteErrorJob;
module.exports._deleteLock = deleteLock;
module.exports._getPublishConfiguration = getPublishConfiguration;
module.exports._incrementRetryCount = incrementRetryCount;
module.exports._lockErrorJob = lockErrorJob;
module.exports._maxRetriesReached = maxRetriesReached;
module.exports._processErrorRecord = processErrorRecord;
module.exports._processErrorRecords = processErrorRecords;
module.exports._publishErrorJob = publishErrorJob;
