'use strict';

var _ = require('lodash');
var ValidationErrors = {
    NOERROR: 0,
    TRANSIENT: 1,
    FATAL: 2
};

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
    log.debug('Validating Activity Management job for retry key.');

    if (_.isUndefined(job.record.activityRetry)) {
        log.debug('Retry Check Debug - Job Retry count not set, adding key and returning.');
        //Will get incremented to zero if there is a transient error later
        job.record.activityRetry = -1;
        return callback(null, job);
    }

    if (job.record.activityRetry >= config.activityManagementJobRetryLimit) {
        log.error('Fatal Retry Check Error - Job Retry count is greater than or equal to config limit.');
        return callback('Fatal - Retry Check Error Job Retry count is greater than or equal to config limit.');
    }

    return callback(null, job);
};

/**
 * Validate the error response from the Activity Event Processor and determine
 * if there was an error code and what type of error it was.
 * @param  {Object}   log      Instance of Bunyan Logger
 * @param  {Object}   errorMsg Error returned from Activity Event Processor
 * @return {Integer}    Integer number based on error code. 0 = Fatal, Unknown origin. 1 = Transient, retry the job. 2 = Fatal, Known reason.
 */
module.exports.validateResponse = function(log, errorMsg) {
    if (!_.isString(errorMsg)) {
        log.debug('Fatal Retry Validation Error - Error response was not a string.');
        return ValidationErrors.NOERROR;
    }

    //Validate if the Error Response is a transient error code.
    //Example format: '101 - Error Reason'
    if ('1' === errorMsg.substring(0, 1) && '-' === errorMsg.substring(4, 5)) {
        log.debug('Transient Retry Validation Error - Error response returned an error with a transient code.');
        return ValidationErrors.TRANSIENT;
    }

    //Validate if the Error Response is a fatal error code.
    //Example format: '201 - Error Reason'
    if ('2' === errorMsg.substring(0, 1) && '-' === errorMsg.substring(4, 5)) {
        log.debug('Fatal Retry Validation Error - Error response returned an error with a fatal code.');
        return ValidationErrors.FATAL;
    }

    log.debug('Fatal Retry Validation Error - Error response does not have an error code.');
    return ValidationErrors.NOERROR;
};

module.exports.ValidationErrors = ValidationErrors;
