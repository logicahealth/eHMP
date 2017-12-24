/*jslint node: true */
'use strict';

var _ = require('underscore');
var errorUtil = require(global.VX_UTILS + 'error');
var jobUtil = require(global.VX_UTILS + 'job-utils');
var async = require('async');
var uuid = require('node-uuid');

function handle(log, config, environment, job, handlerCallback, touchBack) {
    log.debug('store-record-request-handler.handle: Received request to store record (%s) %j', job.dataDomain, job);

    if (!jobUtil.isValid(jobUtil.storeRecordType(), job)) {
        log.warn('store-record-request-handler.handle: Invalid job received.  Job: %j', job);
        return handlerCallback(errorUtil.createFatal('Invalid format for job', job));
    } else {
        log.debug('store-record-request-handler.handle: Valid job received');
    }

    realStoreRecord(log, environment, job.dataDomain, job.patientIdentifier, job.record, handlerCallback, touchBack, true, job);
}

function storeRecord(log, environment, domain, patientIdentifier, record, callback) {
    realStoreRecord(log, environment, domain, patientIdentifier, record, callback, function() {}, false);
}

function realStoreRecord(log, environment, domain, patientIdentifier, record, callback, touchBack, calledByHandler, job) {
    if (_.isUndefined(record)) {
        log.error('store-record-request-handler.handle: Missing record.  Record: %j', record);
        return callback(errorUtil.createFatal('Missing record', record));
    }
    if (_.isUndefined(record.uid)) {
        log.error('store-record-request-handler.handle: Missing uid.  Record: %j', record);
        return callback(errorUtil.createFatal('Missing UID', record));
    }
    if (_.isUndefined(record.stampTime)) {
        log.error('store-record-request-handler.handle: Missing stampTime.  Record: %j', record);
        return callback(errorUtil.createFatal('Missing stampTime', record));
    }
    if (_.isUndefined(record.pid) && _.isUndefined(record.icn)) {
        log.error('store-record-request-handler.handle: Missing patient identifier.  Record: %j', record);
        return callback(errorUtil.createFatal('Missing patient identifier', record));
    }

    var tasks = [
        storeJds.bind(null, log, environment, record),
        callTouchBack.bind(null, touchBack)
    ];

    if(calledByHandler){
        tasks.push(publish.bind(null, environment, patientIdentifier, domain, record, job));
    }

    log.debug('store-record-request-handler.handle: Storing to JDS: %j', record);
    async.series(tasks, function(error) {
        log.debug('store-record-request-handler.handle: Completed call to async.series.  error: %s', error);
        if (error) {
            if (error.message) {
                var errorMessage = error.message;
                if (errorMessage.error) {
                    errorMessage = errorMessage.error.errors;
                }

                log.error('store-record-request-handler.handle: Unable to store record.  error: %j', errorMessage);
                return callback(errorUtil.createTransient('Unable to store record', errorMessage));
            }
            log.error('store-record-request-handler.handle: Unable to handle publish vx data change.  error: %j', error);
            return callback(errorUtil.createTransient('Unable to handle publish vx data change', error));
        }

        log.debug('store-record-request-handler.handle: Exiting final callback.');
        callback(null, 'success');
    });
}

function storeJds(log, environment, record, callback) {
    var metricsObj = {
        'uid': record.uid,
        'pid': record.pid,
        'process': uuid.v4(),
        'timer': 'start'
    };
    environment.metrics.warn('Store record in JDS', metricsObj);
    metricsObj.timer = 'stop';

    environment.jds.storePatientData(record, function(error, response, body) {
        log.debug('store-record-request-handler.handle: JDS response code: %s', (response ? response.statusCode : undefined));
        if (error) {
            environment.metrics.warn('Store record in JDS in Error', metricsObj);
            // Only log the response here as it contains the body and any statusCodes, etc.
            log.error('store-record-request-handler.handle: Error encountered when storing to JDS. error: %j; response: %j; record: %j', error, response, record);
            return callback(error);
        } else if (response.statusCode !== 201) {
            environment.metrics.warn('Store record in JDS in Error', metricsObj);
            // Only log the response here as it contains the body and any statusCodes, etc.
            log.error('store-record-request-handler.handle: Unexpected statusCode received when storing to JDS. error: (no error received); response: %j; record: %j', response, record);
        } else {
            environment.metrics.warn('Store record in JDS', metricsObj);
            // Only log the response here as it contains the body and any statusCodes, etc.
            log.debug('store-record-request-handler.handle: JDS STORED RECORD!  error: (no error received); response: %j; record: %j', response, record);
        }

        return callback();
    });
}

function callTouchBack(touchBack, callback) {
    if (_.isFunction(touchBack)) {
        touchBack();
    }
    callback();
}

function publish(environment, patientIdentifier, domain, record, job, callback) {
    var meta = {
        jobId: job.jobId,
        rootJobId: job.rootJobId,
        priority: job.priority
    };
    if(job.referenceInfo){
        meta.referenceInfo = job.referenceInfo;
    }

    var jobsToPublish = [
        jobUtil.createPublishVxDataChange(patientIdentifier, domain, record, meta),
        jobUtil.createSolrRecordStorage(patientIdentifier, domain, record, meta)
    ];
    environment.publisherRouter.publish(jobsToPublish, callback);
}

module.exports = handle;
module.exports.store = storeRecord;