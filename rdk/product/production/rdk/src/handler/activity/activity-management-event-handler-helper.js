'use strict';

var _ = require('lodash');
var activityEventProcess = require('../../resources/activitymanagement/activities/eventprocessor/activity-event-process-resource');
var activityRetry = require('./activity-management-event-retry-handler');

module.exports.cleanClinicalObjectResponseArray = function(response, log, handlerCallback) {
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
};

module.exports.validateJobObject = function(job, log, callback) {
    log.debug({
        validateJob: job
    }, 'activity-management-event-handler.validateJobObject');
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
        for (var j = 0; j < requiredFields.length; j++) {
            var fieldName = requiredFields[j];
            if (!_.isUndefined(jobObject[fieldName]) && (_.isNull(jobObject[fieldName]) || _.isEmpty(jobObject[fieldName]))) {
                log.warn('activity-management-event-handler.validateJobObject - model is missing a value for the %s field', fieldName);
                return callback('model is missing a value for the ' + fieldName + ' field');
            }
        }
    }

    return callback(null);
};

module.exports.passOrderToProcessor = function(record, job, config, log, environment, handlerCallback, callback) {
    var activityHandler = require('./activity-management-event-handler');
    log.debug('activity-management-event-handler.passOrderToProcessor - Starting passOrderToProcessor');

    if (!_.isObject(record)) {
        try {
            record = JSON.parse(record);
        } catch (error) {
            log.warn('passOrderToProcessor: Failed to parse record to JSON');
            return callback(error, null);
        }
    }

    var req = this.createRequestObject(record, config, log);
    var res = this.createResponseObject(log, function(error, body) {
        log.debug('sendToActivityProcessor: starting callback');
        if (!error) {
            if (!_.isObject(body)) {
                try {
                    body = JSON.parse(body);
                } catch (err) {
                    log.debug('sendToActivityProcessor: Failed to parse JSON');
                    return callback(err, null);
                }
            }

            log.debug({
                body: body
            }, 'activity-management-event-handler.passOrderToProcessor - after making request');
            return callback(null, body);
        }

        activityRetry.validateResponse(log, error, function(errorCode) {
            if (errorCode) {
                var errorText = '';
                switch (errorCode) {
                    case '0':
                        log.debug('Fatal - Error returned from Activity Event Processor did not have an error code.');
                        log.error(error);
                        return callback(error, null);

                    case '1':
                        log.debug('Transient - Error returned from Activity Event Processor is transient and will be requeued.');
                        log.warn(error);
                        activityHandler(log, config, environment, job, handlerCallback);
                        return callback(null, null);

                    case '2':
                        log.debug('Fatal - Error returned from Activity Event Processor is fatal and will be logged.');
                        log.error(error);
                        return callback(error, null);

                    default:
                        errorText = 'Fatal - An unknown error has occured while processing the response from the Activity Event Processor.';
                        break;
                }
                return callback(errorText, null);
            }
        });
    });

    log.debug('activity-management-event-handler.passOrderToProcessor - before making request');

    activityEventProcess.startActivityEvent(req, res);
};

module.exports.createRequestObject = function(record, config, log) {
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
    log.debug({
        request: req
    }, 'createRequestObject: returning req');
    return req;
};

module.exports.createResponseObject = function(log, callback) {
    var res = {
        headers: {},
        status: function(statusCode) {
            this.statusCode = statusCode;
            return this;
        },
        send: callback,
        set: function(key, value) {
            this.headers[key] = value;
            return this;
        },
        get: function(key) {
            return this.headers[key];
        },
        rdkSend: function(body) {
            if (_.isNull(body) || _.isUndefined(body)) {
                log.error('Error - Activity Event Processor return an empty or null body.');
                return this.send({
                    message: 'Error - Activity Event Processor return an empty or null body.'
                });
            }
            if (_.isObject(body) || this.get('Content-Type') === 'application/json') {
                if (_.isString(body)) {
                    try {
                        body = JSON.parse(body);
                    } catch (e) {
                        log.debug('Parsing application/json body from Activity Event Processor resulted in an error: ', e);
                        body = {
                            message: body
                        };
                    }
                }
                if ((!_.has(body, 'data') || !_.isObject(body.data)) && !_.has(body, 'message') &&
                    (_.isArray(body) || !_.isEmpty(body))) {
                    body = {
                        data: body
                    };
                }
            } else {
                body = {
                    message: String(body)
                };
            }

            return this.statusCode === 200 ? this.send(null, body) : this.send(body);
        }
    };

    log.debug({
        response: res
    }, 'createResponseObject: Returning res');
    return res;

};
