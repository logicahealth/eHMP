'use strict';

var _ = require('lodash');

/**
 * Check if job has retry key is set in job.  If not add it and return the job.
 * If it is, check if it is greater than or equal to config limit and return a
 * fatal error if it is.  Otherwise add one to the count and return the job.
 * @param  {Object}   log      Bunyan Logger Object
 * @param  {Object}   config   Config Object
 * @param  {Object}   job      Job to check
 * @param  {Function} callback Callback that expects error, response
 * @return {String|Object}     Error String|Job Object
 */
module.exports.check = function(log, config, job, callback) {
    log.debug('Validating Activity Managment job for retry key.');
    if (_.isUndefined(job.record.activityRetry)) {
        log.debug('Retry Check Debug - Job Retry count not set, adding key and returning.');
        job.record.activityRetry = 0;
        return callback(null, job);
    }

    if (job.record.activityRetry >= config.activityManagementJobRetryLimit) {
        log.debug('Fatal Retry Check Error - Job Retry count is greater than or equal to config limit.');
        return callback('Fatal - Retry Check Error Job Retry count is greater than or equal to config limit.');
    }

    log.debug('Retry Check Debug - Adding one to Job Retry count.');
    job.record.activityRetry += 1;
    return callback(null, job);
};

/**
 * Validate the error response from the Activity Event Processor and determine
 * if there was an error code and what type of error it was.
 * @param  {Object}   log      Instance of Bunyan Logger
 * @param  {Object}   response Error returned from Activity Event Processor
 * @param  {Function} callback Function that accepts error as its input
 * @return {String|Integer}    Error String if the error is not an object or the
 *                             type | Integer number based on error code.
 */
module.exports.validateResponse = function(log, error, callback) {
    //Validate the Error Response is an object
    if (!_.isObject(error)) {
        log.debug('Fatal Retry Validation Error - Error response is not an object');
        return callback('Fatal - Error from Activity Event Processor was not an object.');
    }

    //Validate the Error Response has a message key
    if (_.isUndefined(error.message)) {
        log.debug('Fatal Retry Validation Error - Error response does not have a message to validate.');
        return callback('Fatal - Error from Activity Event Processor does not have a message to validate.');
    }

    var errorMsg = error.message;
    //Validate the Error Response has an error code
    if (_.isString(errorMsg) && '-' !== errorMsg.substring(4, 5)) {
        log.debug('Fatal Retry Validation Error - Error response does not have an error code.');
        return callback('0');
    }

    //Validate if the Error Response is a transient error code.
    if (_.isString(errorMsg) && '1' === errorMsg.substring(0, 1) && '-' === errorMsg.substring(4, 5)) {
        log.debug('Transient Retry Validation Error - Error response returned an error with a transient code.');
        return callback('1');
    }

    //Validate if the Error Response is a fatal error code.
    if (_.isString(errorMsg) && '2' === errorMsg.substring(0, 1) && '-' === errorMsg.substring(4, 5)) {
        log.debug('Fatal Retry Validation Error - Error response returned an error with a fatal code.');
        return callback('2');
    }
};
