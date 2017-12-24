'use strict';

var _ = require('lodash');
var activityEventProcess = require('../../resources/activitymanagement/activities/eventprocessor/activity-event-process-resource');
var activityRetry = require('./activity-management-event-retry-handler');
var uuid = require('node-uuid');

module.exports.cleanClinicalObjectResponseArray = function(response, log) {
    var ehmpOrderResponse = _.find(response, {domain: 'ehmp-order'});

    if (_.isEmpty(ehmpOrderResponse)) {
        log.warn('Response did not contain an object with domain equal to ehmp-order');
    }

    return ehmpOrderResponse;
};

module.exports.validateJobObject = function(job, log, callback) {
    log.debug({
        validateJob: job
    }, 'activity-management-event-handler.validateJobObject');
    var clinicalObjectRequiredFields = ['domain', 'subDomain', 'uid', 'ehmpState', 'authorUid', 'patientUid', 'visit'];
    var visitClinicalObjectRequiredFields = ['location', 'serviceCategory', 'dateTime'];
    var requiredFieldsArray = [clinicalObjectRequiredFields, visitClinicalObjectRequiredFields];

    if (_.isUndefined(job.visit)) {
        log.warn('activity-management-event-handler.validateJobObject - job does not have a visit key');
        return callback('job does not have a visit key');
    }

    for (var i = 0; i < requiredFieldsArray.length; i++) {
        var jobObject;
        var requiredFields = requiredFieldsArray[i];
        if (clinicalObjectRequiredFields === requiredFields) {
            jobObject = job;
        } else if (visitClinicalObjectRequiredFields === requiredFields) {
            jobObject = job.visit;
        }
        for (var j = 0; j < requiredFields.length; j++) {
            var fieldName = requiredFields[j];
            var requiredValue = jobObject[fieldName];
            if (!_.isUndefined(requiredValue) && !_.isNumber(requiredValue) && (_.isNull(requiredValue) || _.isEmpty(requiredValue))) {
                log.warn('activity-management-event-handler.validateJobObject - model is missing a value for the %s field', fieldName);
                return callback('model is missing a value for the ' + fieldName + ' field');
            }
        }
    }

    return callback(null);
};

module.exports.passOrderToProcessor = function(record, job, config, log, environment, callback) {
    log.debug('activity-management-event-handler.passOrderToProcessor - Starting passOrderToProcessor');

    if (_.isString(record)) {
        try {
            record = JSON.parse(record);
        } catch (error) {
            log.warn('passOrderToProcessor: Failed to parse record to JSON');
            return callback(error, null);
        }
    }

    log.debug('activity-management-event-handler.passOrderToProcessor - before making request');

    activityEventProcess.startActivityEvent(record, log, config, function(error, body) {
        if (!error) {

            if (_.isString(body)) {
                try {
                    body = JSON.parse(body);
                } catch (parseErr) {
                    log.error({
                        body: body,
                        parseErr: parseErr
                    }, 'activity-management-event-handler.passOrderToProcessor - Unable to deserialize startActivityEvent response');
                    return callback(parseErr, null);
                }
            }

            log.debug({
                body: body
            }, 'activity-management-event-handler.passOrderToProcessor - after making request');
            return callback(null, body);
        }

        if (_.isObject(error) && error.hasOwnProperty('message')) {
            error = error.message; //convert from Error object to expected String type so that validateResponse can parse it correctly
        }

        switch (activityRetry.validateResponse(log, error)) {
            case activityRetry.ValidationErrors.TRANSIENT:
                log.error('Transient - Error returned from Activity Event Processor is transient and will be re-queued. ' + error);
                return publishRetry(log, environment, job, callback);
            case activityRetry.ValidationErrors.FATAL:
                log.error('Fatal - Error returned from Activity Event Processor is fatal and will be logged. ' + error);
                return callback(error, null);
            case activityRetry.ValidationErrors.NOERROR:
                log.error('Fatal - Error returned from Activity Event Processor did not have an error code.' + error);
                return callback(error, null);
            default:
                return callback('Fatal - An unknown error has occured while processing the response from the Activity Event Processor.', null);
        }
    });

    function publishRetry(log, environment, job, callback) {
        var newJob = {
            type: 'activity-management-event',
            timestamp: String(Date.now()),
            patientIdentifier: job.patientIdentifier,
            dataDomain: job.dataDomain,
            record: job.record,
            jobId: uuid.v4(),
            referenceInfo: job.referenceInfo
        };
        newJob.rootJobId = newJob.jobId;

        //Will be set to -1 if 1st time processing this job in activity-management-event-retry-handler.check()
        newJob.record.activityRetry = job.record.activityRetry + 1;

        return environment.publisherRouter.publish(newJob, function (error) {
            if (error) {
                var errorText = 'Fatal - Error re-queueing job with error: ' + error;
                log.error(errorText + ' job: %j', job);

                return callback(errorText);
            } else {
                return callback(null, 'Re-queued job');
            }
        });
    }
};
