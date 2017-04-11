'use strict';

require('../env-setup');

var util = require('util');
var _ = require('underscore');
var async = require('async');

var objUtil = require(global.VX_UTILS + 'object-utils');

var SEVERITY = 'transient-exception';
var CLASSIFICATION = 'job';


/*
name - name of error profile
    There should be an "error-processing" section in worker-config.json
    with a key that matches this value. within this section, there should
    be two keys: "loopDelayMillis" and "jobTypes". The latter should be
    an array of jobTypes handled by this processor. In addition, there
    should be a file in this directory with the name of <name>-checker.js
    which has a single function. This function should perform a system
    check to determine whether or not the jobTypes in the <name> profile
    should be processed.
*/
function ErrorProcessor(logger, config, environment, name) {
    this.logger = logger;
    this.config = config;
    this.environment = environment;
    this.name = name;
    this.ignoreSeverity = objUtil.getProperty(config, 'error-processing', name, 'ignoreSeverity') || false;
    this.jobTypes = objUtil.getProperty(config, 'error-processing', name, 'jobTypes') || [];
    this.limit = objUtil.getProperty(config, 'error-processing', 'jdsGetErrorLimit') || 1000;
    this.paused = true;
    this._loopDelayMillis = objUtil.getProperty(config, 'error-processing', name, 'loopDelayMillis') || 10000;
    this.readyToShutdown = true;

    this.logger.debug('ErrorProcessor.ErrorProcessor() jobTypes: %s', this.jobTypes);

    var self = this;

    var systemChecker = './' + name + '-checker';

    try {
        this.checkReprocess = require(systemChecker).bind(null, logger, config);
        this.logger.info('ErrorProcessor.ErrorProcessor() System checker "%s" loaded for "%s"', systemChecker, this.name);
    } catch (error) {
        self.logger.error('ErrorProcessor.ErrorProcessor() No system-checker "%s" found for "%s"', systemChecker, this.name);
        self.checkReprocess = function(callback) {
            self.logger.error('ErrorProcessor.ErrorProcessor() No system-checker "%s" found for "%s". Returning false', systemChecker, this.name);
            setTimeout(callback, 0, null, false);
        };
    }
}

ErrorProcessor.prototype.isReadyToShutdown = function() {
    this.logger.debug('ErrorProcessor().isReadyToShutdown: %s', this.readyToShutdown);
    return this.readyToShutdown;
};

ErrorProcessor.prototype.start = function() {
    this.logger.debug('ErrorProcessor.start()');
    this.paused = false;
    this._run();
};

ErrorProcessor.prototype.stop = function(callback) {
    this.logger.debug('ErrorProcessor.stop()');
    this.paused = true;
    callback = callback || _.noop;
    callback();
};

ErrorProcessor.prototype.resume = function() {
    this.logger.debug('ErrorProcessor.resume()');
    this.paused = false;
};

ErrorProcessor.prototype.pause = function() {
    this.logger.debug('ErrorProcessor.pause()');
    this.paused = true;
};

ErrorProcessor.prototype._run = function() {
    this.logger.debug('ErrorProcessor._run()');
    var self = this;

    var loop = function() {
        setTimeout(self._run.bind(self), self._loopDelayMillis);
    };

    this.readyToShutdown = this.paused;
    if (this.paused) {
        return loop();
    }

    this.checkReprocess(function(error, result) {
        if (error) {
            self.logger.error('Error checking status for "%s": %j', self.name, error);
            return loop();
        }

        self.logger.debug('Status %s for "%s"', result, self.name);

        if (!result) {
            return loop();
        }

        // 1. iterate through this.jobTypes
        var processEach = fetchAndProcessErrors.bind(null, self.logger, self.config, self.environment, self.ignoreSeverity, self.limit);
        async.eachSeries(self.jobTypes, processEach, function(error) {
            if (error) {
                self.logger.error('Error processing errors jobTypes for "%s"', self.name);
                return loop();
            }

            self.logger.info('Processed errors for jobTypes for "%s"', self.name);
            loop();
        });
    });
};

// Callbacks do not return errors so that processing can continue
function fetchAndProcessErrors(logger, config, environment, ignoreSeverity, limit, jobType, callback) {
    logger.debug('ErrorProcessor.fetchAndProcessErrors() %s', jobType);

    var items = [];

    async.doWhilst(function(whileCallback) {
        // 2. get errors
        // Since this is background, do in series to keep connections/load on JDS low
        findErrorsByJobType(logger, config, environment.jds, jobType, ignoreSeverity, limit, function(error, result) {
            if (error) {
                logger.error('Error finding errors from JDS for "%s"', jobType);
                return whileCallback(error);
            }

            items = _.isArray(result) ? result : [];

            var resubmit = resubmitError.bind(null, logger, config, environment);
            async.eachSeries(items, resubmit, function(error) {
                if (error) {
                    logger.error('Error processing errors for jobType "%s"', jobType);
                    return whileCallback(error);
                }

                logger.info('Processed errors for jobType "%s"', jobType);
                whileCallback();
            });
        });
    }, function() {
       return items.length !== 0;
    }, function(error) {
        if (error) {
            logger.error('ErrorProcessor.fetchAndProcessErrors(): Error: %s', error);
            return callback();
        }
        logger.info('Processed ALL errors for jobType "%s"', jobType);
        callback();
    });
}

// Callbacks do not return errors so that processing can continue
function resubmitError(logger, config, environment, errorRecord, callback) {
    logger.debug('ErrorProcessor.resubmitError() %j', errorRecord);

    environment.publisherRouter.publish(errorRecord.job, function(error) {
        if (error) {
            logger.error('error-processor.resubmitError(): publisher error: %s', error);
            return callback(null, util.format('Unable to publish message %s: %s', errorRecord.id, error));
        }

        logger.debug('error-processor.resubmitError(): job published, complete status. jobId: %s, jobsToPublish: %j', errorRecord.job.jobId, errorRecord.job);

        environment.jds.deleteErrorRecordById(errorRecord.id, function(error) {
            if (error) {
                logger.error('error-processor.resubmitError(): unable to delete job %s after submitting: %s', errorRecord.id, error);
                return callback(null, util.format('Unable to delete job %s after submitting: %s', errorRecord.id, error));
            }

            logger.debug('error-processor.resubmitError(): deleted job %s after submitting', errorRecord.id);
            callback();
        });
    });
}

function findErrorsByJobType(logger, config, jdsClient, jobType, ignoreSeverity, limit, callback) {
    logger.debug('error-finder.findErrorsByJobType() jobType: "%s"', jobType);
    var filter = buildFilter(jobType, ignoreSeverity, limit);

    jdsClient.findErrorRecordsByFilter(filter, callback);
}

function buildFilter(jobType, ignoreSeverity, limit) {
    var jobTypeString = '';

    if (!ignoreSeverity) {
        jobTypeString += util.format('eq("severity","%s"),', SEVERITY);
    }

    jobTypeString += util.format('eq("classification","%s")', CLASSIFICATION);

    if (!_.isEmpty(jobType)) {
        jobTypeString += util.format(',eq("jobType","%s")', jobType);
    }

    jobTypeString += '&limit=' + (limit || 1000);

    return jobTypeString;
}


module.exports = ErrorProcessor;
ErrorProcessor._buildFilter = buildFilter;
ErrorProcessor._resubmitError = resubmitError;
ErrorProcessor._findErrorsByJobType = findErrorsByJobType;
ErrorProcessor._fetchAndProcessErrors = fetchAndProcessErrors;