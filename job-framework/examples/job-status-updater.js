'use strict';

var ErrorBuilder = require('../src/error-builder');

function JobStatusUpdater(logger) {
    if (!(this instanceof JobStatusUpdater)) {
        return new JobStatusUpdater(logger);
    }

    this.logger = logger;
    this.logger.debug('job-status-updater.JobStatusUpdater');
}

JobStatusUpdater.prototype.createJobStatus = function(job, callback) {
    this.logger.debug('job-status-updater.createJobStatus()', job);
    this.logger.info('job-status-updater.createJobStatus(): Job Created', job);
    setTimeout(callback);
};

JobStatusUpdater.prototype.completeJobStatus = function(job, callback) {
    this.logger.debug('job-status-updater.completeJobStatus()', job);
    this.logger.info('job-status-updater.completeJobStatus(): Job Complete', job);
    setTimeout(callback);
};

JobStatusUpdater.prototype.startJobStatus = function(job, callback) {
    this.logger.debug('job-status-updater.startJobStatus()', job);
    this.logger.info('job-status-updater.startJobStatus(): Job Started', job);
    setTimeout(callback);
};

JobStatusUpdater.prototype.errorJobStatus = function(job, handlerError, callback) {
    this.logger.debug('job-status-updater.errorJobStatus()', job);
    this.logger.info('job-status-updater.errorJobStatus(): Job Error: %s', handlerError, job);
    setTimeout(callback, 0, ErrorBuilder.createTransient(job.error, job));
};

module.exports = JobStatusUpdater;