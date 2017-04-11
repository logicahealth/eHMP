'use strict';

var _ = require('underscore');
var lo = require('lodash');
var url = require('url');
var request = require('request');
var format = require('util').format;
var util = require('../common/util');
var activityEventProcess = require('../../resources/activitymanagement/activities/eventprocessor/activity-event-process-resource');

var activityRequestType = 'activity-management-event';

function handle(log, config, environment, job, handlerCallback) {
    util.isValidRequest(job, activityRequestType, log, function (error) {
        if (error) {
            log.warn('activity-management-event-handler.handle - isValidRequest returned an error: %s', error);
            return handlerCallback(error);
        }
        log.debug({activityJob: job}, 'activity-management-event-handler.handle - received activity management event');
        //Logging to show a job is being processed by the activity-management-handler.
        var jobId = job.jobId;
        var jobStatus = job.status;
        var dataDomain = job.dataDomain;
        log.warn({jobId: jobId, dataDomain: dataDomain}, 'activity-management-event-handler.handle - handling job');

        if (util.isSecondarySitePid(job, log)) {
            log.debug('Job contains secondarysite PID, %s, ignoring the order', job.patientIdentifier.value);
            return handlerCallback(null, null);
        }

        var isVprObject = util.isVPRObject(job.record.uid, activityRequestType, log);
        var referenceId = isVprObject ? job.record.uid : job.record.referenceId;

        if (!isVprObject && (_.isUndefined(referenceId) || _.isEmpty(referenceId))) {
            log.debug('ReferenceId is NULL for Non-VPR Order, ignoring the order because it\'s a draft.');
            return handlerCallback(null, null);
        }

        util.findClinicalObject(referenceId, job.record.patientUid, config, activityRequestType, log, true, function (error, response) {
            if (error) {
                log.warn('activity-management-event-handler.handle - findClinicalObject returned the following error: %s', error);
                return handlerCallback(error);
            }

            if (_.isArray(response)) {
                response = cleanClinicalObjectResponseArray(response, log, handlerCallback);
            }

            if (isVprObject && _.isEmpty(response)) {
                response = util.buildClinicalObject(job, log);
            } else if (isVprObject && !_.isEmpty(response)) {
                response.domain = 'ehmp-activity';
            } else if (_.isEmpty(response)) {
                log.debug('Clinical object for Non-VPR Object was not found in pJDS, ignoring the order');
                return handlerCallback(null, null);
            }

            var newRecord = isVprObject ? response : job.record;
            if (_.isUndefined(newRecord.data)) {
                newRecord.data = {};
            }
            var recordData = isVprObject ? job.record : response.data;
            newRecord.data = lo.defaultsDeep(newRecord.data, recordData);

            validateJobObject(newRecord, log, function(error) {
                if (error) {
                    return handlerCallback(null, null);
                }

                passOrderToProcessor(newRecord, config, log, function (error, response) {
                    log.debug({record: newRecord}, 'activity-management-event-handler.handle - VPR Object passed order to processor');
                    return handlerCallback(error, response);
                });
            });
        });
    });
}

function cleanClinicalObjectResponseArray(response, log, handlerCallback) {
    var ehmpOrderResponse;
    _.each(response, function(object) {
        if ('ehmp-order' === object.domain) {
            ehmpOrderResponse = object;
        }
    });
    if (_.isEmpty(ehmpOrderResponse)) {
        log.warn('Response did not contain an object with domain equal to ehmp-order');
        return handlerCallback(null, null);
    }
    return ehmpOrderResponse;
}

function validateJobObject(job, log, callback) {
    log.debug({validateJob: job}, 'activity-management-event-handler.validateJobObject');
    var clinicalObjectRequiredFields = ['domain', 'subDomain', 'uid', 'ehmpState', 'authorUid', 'patientUid', 'visit'];
    var visitClinicalObjectRequiredFields = ['dateTime'];
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
        for( var j = 0; j < requiredFields.length; j++) {
            var fieldName = requiredFields[j];
            if (!_.isUndefined(jobObject[fieldName]) && (_.isNull(jobObject[fieldName]) || _.isEmpty(jobObject[fieldName]))) {
                log.warn('activity-management-event-handler.validateJobObject - model is missing a value for the %s field', fieldName);
                return callback('model is missing a value for the ' + fieldName + ' field');
            }
        }
    }

    return callback(null);
}

function passOrderToProcessor(record, config, log, callback) {
    log.debug('activity-management-event-handler.passOrderToProcessor - Starting passOrderToProcessor');

    if (!_.isObject(record)) {
        try {
            record = JSON.parse(record);
        } catch (error) {
            log.debug('passOrderToProcessor: Failed to parse record to JSON');
            return callback(error, null);
        }
    }

    var req = createRequestObject(record, config, log);
    var res = createResponseObject(log, function (body) {
        log.debug('sendToActivityProcessor: starting callback');

        if (!_.isObject(body)) {
            try {
                body = JSON.parse(body);
            } catch (err) {
                log.debug('sendToActivityProcessor: Failed to parse JSON');
                return callback(err, null);
            }
        }
        if (body.status !== 200) {
            return callback(body.message, null);
        }

        log.debug({body: body}, 'activity-management-event-handler.passOrderToProcessor - after making request');
        return callback(null, body);

    });

    log.debug('activity-management-event-handler.passOrderToProcessor - before making request');

    activityEventProcess.startActivityEvent(req, res);
}

function createRequestObject(record, config, log) {
    var req = {
        body: record,
        method: 'POST',
        app: {
            config: config
        },
        json: true,
        logger: log,
        audit: {},
        session: { //fake user session for jbpm dummy authentication
            user: {
                site: 'site',
                duz: {
                    'site': 'aep_user'
                }
            }
        }
    };
    log.debug({request: req}, 'createRequestObject: returning req');
    return req;
}

function createResponseObject(log, callback) {
    var res = {
        headers: {},
        status: function(statusCode) { this.statusCode = statusCode; return this; },
        send: callback,
        set: function(key, value) { this.headers[key] = value; return this; },
        get: function(key) { return this.headers[key]; },
        rdkSend: function(body) {
            if (this.statusCode === 204) {
                return this.send(undefined);
            }
            if (_.isNull(body) || _.isUndefined(body)) {
                body = {};
            } else if (_.isObject(body) || this.get('Content-Type') === 'application/json') {
                if (_.isString(body)) {
                    try {
                        body = JSON.parse(body);
                    } catch (e) {
                        body = {message: body};
                    }
                }
                if ((!_.has(body, 'data') || !_.isObject(body.data)) && !_.has(body, 'message') &&
                    (_.isArray(body) || !_.isEmpty(body))) {
                    body = {data: body};
                }
            } else {
                body = {message: String(body)};
            }
            body.status = this.statusCode ? this.statusCode : 200;
            return this.send(body);
        }
    };

    log.debug({response: res}, 'createResponseObject: Returning res');
    return res;

}

module.exports = handle;
module.exports.passOrderToProcessor = passOrderToProcessor;
module.exports.cleanClinicalObjectResponseArray = cleanClinicalObjectResponseArray;
module.exports.validateJobObject = validateJobObject;
module.exports.createRequestObject = createRequestObject;
module.exports.createResponseObject = createResponseObject;
