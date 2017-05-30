'use strict';

require('../../env-setup');

var _ = require('underscore');

var inspect = require(global.VX_UTILS + 'inspect');
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');

function JobStatusUpdater(logger, config, jdsClient) {
    if (!(this instanceof JobStatusUpdater)) {
        return new JobStatusUpdater(logger, config, jdsClient);
    }

    logger.debug('JobStatusUpdater.JobStatusUpdate()');

    this.jdsClient = jdsClient || new JdsClient(logger, config);
    this.logger = logger;
    this.config = config;
}

JobStatusUpdater.prototype.childInstance = function(log) {
    return new JobStatusUpdater(log, this.config, this.jdsClient.childInstance(log));
};

JobStatusUpdater.prototype.storeMetaStampErrorEvent = function(job, callback) {
    var storeEventInfo = {
        'uid': job.record.uid,
        'eventStamp': job.record.stampTime,
        'type': job.type === 'solr-record-storage' ? 'solrError' : 'syncError'
    };

    var self = this;

    self.jdsClient.setEventStoreStatus(job.record.pid, storeEventInfo, function(error, response, body) {
        self.logger.debug('JobStatusUpdater.storeMetaStampErrorEvent: Response from setEventStoreStatus: error: %s, response: %j, result: %j', error, response, body);
        if (error) {
            self.logger.error('JobStatusUpdater.storeMetaStampErrorEvent: An error occurred.  error: %s; ', error);
            return callback(error, response, body);
        }
        if ((response) && (response.statusCode !== 201)) {
            self.logger.error('JobStatusUpdater.storeMetaStampErrorEvent: Response status code was not correct. response: %j; result: %j', response, body);
        }
        return callback(error, response, job);
    });
};

JobStatusUpdater.prototype.writeStatus = function(jobState, callback) {
    var self = this;

    if (!_.isObject(jobState)) { return callback('Invalid job state'); }
    if (_.isUndefined(jobState.timestamp) || jobState.status !== 'created') {
        jobState.timestamp = Date.now().toString();
    }

    if (_.isUndefined(jobState.rootJobId) && jobState.type === 'enterprise-sync-request') {
        jobState.rootJobId = jobState.jobId;
    }

    if (jobState.status !== 'error') {
        if (_.isUndefined(jobState.jpid) || _.isUndefined(jobState.rootJobId)) {
            self.logger.debug('JobStatusUpdater.writeStatus: No jpid or rootJobId');
            return callback(null, 'no job state for jobs not started by a user');
        }
        if (!_.isUndefined(jobState.record) || !_.isUndefined(jobState['event-uid'])) {
            self.logger.debug('JobStatusUpdater.writeStatus: Job has a record, covered by metastamp, don\'t record job state');
            return callback(null, 'record job');
        }
    }

    self.jdsClient.saveJobState(jobState, function(error, response, result) {
        self.logger.debug('JobStatusUpdater.writeStatus: Response from saveJobState: error: %s, response: %j, result: %j', error, response, result);
        if (error) {
            self.logger.debug('JobStatusUpdater.writeStatus: An error occurred.  error: %s; response: %j; result: %j', error, response, result);
            return callback(error, response, result);
        }
        if ((response) && (response.statusCode !== 200)) {
            self.logger.error('JobStatusUpdater.writeStatus: Response status code was not correct. error: %s; response: %j; result: %j', error, response, result);
        }
        return callback(error, response, jobState);
    });
};

JobStatusUpdater.prototype.errorJobStatus = function(job, error, callback) {
    job.status = 'error';
    job.error = error;

    this.logger.debug(inspect(job));

    if (_.has(this.config, 'trackErrorsByMetastamp') && _.contains(this.config.trackErrorsByMetastamp, job.type)) {
        this.storeMetaStampErrorEvent(job, callback);
    } else {
        this.writeStatus(job, callback);
    }
};

JobStatusUpdater.prototype.createJobStatus = function(job, callback) {
    var self = this;
    job.status = 'created';

    self.logger.debug(inspect(job));

    this.writeStatus(job, callback);
};

JobStatusUpdater.prototype.startJobStatus = function(job, callback) {
    var self = this;
    job.status = 'started';
    self.logger.debug(inspect(job));
    this.writeStatus(job, callback);
};

JobStatusUpdater.prototype.completeJobStatus = function(job, callback) {
    var self = this;
    job.status = 'completed';
    self.logger.debug('JobStatusUpdater.completeJobStatus: Saving job: %s', inspect(job));
    this.writeStatus(job, callback);
};

module.exports = JobStatusUpdater;

JobStatusUpdater._tests = {
    _writeStatus: JobStatusUpdater.prototype.writeStatus,
    _errorJobStatus: JobStatusUpdater.prototype.errorJobStatus,
    _createJobStatus: JobStatusUpdater.prototype.createJobStatus,
    _startJobStatus: JobStatusUpdater.prototype.startJobStatus,
    _completeJobStatus: JobStatusUpdater.prototype.completeJobStatus
};
