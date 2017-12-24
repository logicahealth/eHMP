'use strict';

var _ = require('lodash');
var util = require('../common/util');
var activityHelper = require('./activity-management-event-handler-helper');
var activityRetry = require('./activity-management-event-retry-handler');
var rdk = require('../../core/rdk');
var pidValidator = rdk.utils.pidValidator;

var activityRequestType = 'activity-management-event';

var domainSpecificHandlers = {
    'ehmp-order': processLab,
    'ehmp-activity': processLab,
    'discharge': processDischarge,
    'default': processLab,
    'visit': processVisitForDischargeFollowup
};

function handle(log, config, environment, job, handlerCallback) {
    log = util.setupIdLogger(job, log);
    util.isValidRequest(job, activityRequestType, log, function(error) {
        if (error) {
            log.error('activity-management-event-handler.handle - isValidRequest returned an error: %s', error);
            return handlerCallback(error);
        }
        log.debug({
            activityJob: job
        }, 'activity-management-event-handler.handle - received activity management event');
        //Logging to show a job is being processed by the activity-management-handler.
        var jobId = job.jobId;
        var dataDomain = job.dataDomain;
        log.debug({
            jobId: jobId,
            dataDomain: dataDomain
        }, 'activity-management-event-handler.handle - handling job');

        var identifier = _.get(job, 'patientIdentifier.value', '');

        if (pidValidator.isSecondarySite(identifier)) {
            log.warn('Job contains secondarysite PID, %s, ignoring the order', job.patientIdentifier.value);
            return handlerCallback(null, null);
        }

        var isVprObject = util.isVPRObject(job.record.uid, activityRequestType, log);
        var referenceId = isVprObject ? job.record.uid : job.record.referenceId;
        log.debug('activity-handler job referenceId: ' + referenceId);

        if (!isVprObject && (_.isUndefined(referenceId) || _.isEmpty(referenceId))) {
            log.warn('ReferenceId is NULL for Non-VPR Order, ignoring the order because it\'s a draft.');
            return handlerCallback(null, null);
        }

        activityRetry.check(log, config, job, function(retryError, retryResponse) {
            if (retryError) {
                log.error('Fatal - Checking the activity management retry status failed.  Job has been lost.');
                return handlerCallback(retryError, null);
            }
            job = retryResponse;

            //use dataDomain to determine next steps
            if (domainSpecificHandlers.hasOwnProperty(dataDomain)) {
                return domainSpecificHandlers[dataDomain](log, config, environment, job, referenceId, isVprObject, handlerCallback);
            } else {
                return domainSpecificHandlers['default'](log, config, environment, job, referenceId, isVprObject, handlerCallback);
            }
        });
    });
}

function processLab(log, config, environment, job, referenceId, isVprObject, handlerCallback) {
    util.findClinicalObject(referenceId, job.record.patientUid, config, activityRequestType, log, true, function(error, response) {
        if (error) {
            log.error('activity-management-event-handler.handle - findClinicalObject returned the following error: %s', error);
            return handlerCallback(error);
        }

        if (_.isArray(response)) {
            response = activityHelper.cleanClinicalObjectResponseArray(response, log);
        }

        if (isVprObject && _.isEmpty(response)) {
            response = util.buildClinicalObject(job, log);
        } else if (isVprObject && !_.isEmpty(response)) {
            response.domain = 'ehmp-activity';
        } else if (_.isEmpty(response)) {
            log.debug('Clinical object for Non-VPR Object was not found in pJDS, ignoring the order');
            return handlerCallback(null, null);
        }

        if (!isVprObject && _.isUndefined(response.data)) {
            log.error('Clinical object response.data for Non-VPR Object was undefined, returning error.');
            return handlerCallback(null, null);
        } else if (_.isUndefined(response.data)) {
            response.data = {};
        }
        if (isVprObject) {
            response.data = _.defaultsDeep(response.data, job.record);
        }

        activityHelper.validateJobObject(response, log, function(error) {
            if (error) {
                log.error({
                    err: error,
                    validationTarget: response
                }, 'Job object did not validate, ignoring');
                return handlerCallback(null, null);
            }

            activityHelper.passOrderToProcessor(response, job, config, log, environment, function(error, aepResponse) {
                if (!error) {
                    if (_.isEmpty(aepResponse)) {
                        log.warn('activity-management-event-handler.processLab - No action taken by processor and no error returned');
                    } else {
                        log.debug({
                            response: aepResponse
                        }, 'activity-management-event-handler.processLab - Lab event has been handled by processor');
                    }
                }
                return handlerCallback(error, aepResponse);
            });
        });
    });
}

function processDischarge(log, config, environment, job, referenceId, isVprObject, handlerCallback) {
    //no clinical object lookup (or domain/subDomain manipulation based on lookup) is required for discharge
    var eventProcessorJob = util.buildClinicalObject(job, log);

    //default clinical object builder will populate visit.dateTime from alternate data field - override with value specific to discharge events
    eventProcessorJob.visit.dateTime = _.get(job, 'record.visit.dateTime', _.get(job, 'record.stay.arrivalDateTime'));

    //if deceased status is not available, assume it is false
    eventProcessorJob.data.deceased = _.get(job, 'record.deceased', false);

    //parse authorUid from primaryProvider or providers section as available when not defined
    var authorUid = _.get(job, 'record.authorUid', _.get(job, 'record.primaryProvider.providerUid'));
    if (_.isNull(authorUid) || _.isUndefined(authorUid)) {
        var providers = _.get(job, 'record.providers', []);
        _.each(providers, function(provider) {
            if (provider && provider.providerUid) {
                if (provider.primary || (_.isNull(authorUid) || _.isUndefined(authorUid))) {
                    authorUid = provider.providerUid;
                }
            }
        });
    }

    if (!_.isNull(authorUid)) {
        eventProcessorJob.authorUid = authorUid;
    }

    activityHelper.validateJobObject(eventProcessorJob, log, function(error) {
        if (error) {
            log.error({
                err: error,
                validationTarget: eventProcessorJob
            }, 'Job object did not validate, ignoring');
            return handlerCallback(null, null);
        }

        activityHelper.passOrderToProcessor(eventProcessorJob, job, config, log, environment, function(error, aepResponse) {
            if (!error) {
                if (_.isEmpty(aepResponse)) {
                    log.warn('activity-management-event-handler.processDischarge - No action taken by processor and no error returned');
                } else {
                    log.debug({
                        response: aepResponse
                    }, 'activity-management-event-handler.processDischarge - Discharge event has been handled by processor');
                }
            }
            return handlerCallback(error, aepResponse);
        });
    });
}

function processVisitForDischargeFollowup(log, config, environment, job, referenceId, isVprObject, handlerCallback) {
    //no clinical object lookup (or domain/subDomain manipulation based on lookup) is required for discharge
    var eventProcessorJob = util.buildClinicalObject(job, log);

    activityHelper.validateJobObject(eventProcessorJob, log, function(error) {
        if (error) {
            log.error({
                err: error,
                validationTarget: eventProcessorJob
            }, 'Job object did not validate, ignoring');
            return handlerCallback(null, null);
        }

        activityHelper.passOrderToProcessor(eventProcessorJob, job, config, log, environment, handlerCallback, function(error, aepResponse) {
            if (!error) {
                if (_.isEmpty(aepResponse)) {
                    log.warn('activity-management-event-handler.processVisit - No action taken by processor and no error returned');
                } else {
                    log.debug({
                        response: aepResponse
                    }, 'activity-management-event-handler.processVisit - Discharge event has been handled by processor');
                }
            }
            return handlerCallback(error, aepResponse);
        });
    });
}

module.exports = handle;
