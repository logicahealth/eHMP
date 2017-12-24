'use strict';

require('../env-setup');

var _ = require('underscore');
var async = require('async');
var util = require('util');

var objUtil = require(global.VX_UTILS + 'object-utils');
var errorProcessingApi = require(global.VX_UTILS + 'error-processing/error-processing-api');

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
    this.ignoreSeverity = objUtil.getProperty(config, 'error-processing', 'profiles', name, 'ignoreSeverity') || false;
    this.jobTypes = objUtil.getProperty(config, 'error-processing', 'profiles', name, 'jobTypes') || [];
    this.limit = objUtil.getProperty(config, 'error-processing', 'jdsGetErrorLimit') || 1000;
    this.paused = true;
    this._loopDelayMillis = objUtil.getProperty(config, 'error-processing', 'profiles', name, 'loopDelayMillis') || 10000;
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

        async.eachSeries(self.jobTypes, processSingleJobType.bind(self), function(error) {
            if (error) {
                self.logger.error('Error processing errors jobTypes for "%s"', self.name);
            } else {
                self.logger.info('Processed errors for jobTypes for "%s"', self.name);
            }

            loop();
        });
    });
};

function processSingleJobType(jobType, callback) {
    /*jshint validthis:true */
    var constraints = {
        index: 'vxsyncerr-jobType-classification-severity',
        range: buildRange(jobType, this.ignoreSeverity),
        filter: buildFilter(this.config),
        limit: this.limit
    };
    var errorProcessingContext = errorProcessingApi.ErrorProcessingContext(this.logger, this.config, this.environment, constraints);

    errorProcessingApi.submitByBatchQuery(errorProcessingContext, callback);
}

function buildRange(jobType, ignoreSeverity) {
    var jobTypeString = '';

    if (!_.isEmpty(jobType)) {
        jobTypeString += util.format('"%s"', jobType);
    }

    jobTypeString += util.format('>"%s"', CLASSIFICATION);

    if (!ignoreSeverity) {
        jobTypeString += util.format('>"%s"', SEVERITY);
    }

    return jobTypeString;
}

function buildFilter(config) {
    var retryMax = objUtil.getProperty(config, 'error-processing', 'errorRetryLimit') || 3;
    return 'lt(job.retryCount,' + retryMax + ')';
}

module.exports = ErrorProcessor;
