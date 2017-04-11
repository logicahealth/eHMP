'use strict';

var _ = require('lodash');
var util = require('../common/util');
var activityHelper = require('./activity-management-event-handler-helper');
var activityRetry = require('./activity-management-event-retry-handler');

var activityRequestType = 'activity-management-event';

function handle(log, config, environment, job, handlerCallback) {
    util.isValidRequest(job, activityRequestType, log, function(error) {
        if (error) {
            log.warn('activity-management-event-handler.handle - isValidRequest returned an error: %s', error);
            return handlerCallback(error);
        }
        log.debug({
            activityJob: job
        }, 'activity-management-event-handler.handle - received activity management event');
        //Logging to show a job is being processed by the activity-management-handler.
        var jobId = job.jobId;
        var dataDomain = job.dataDomain;
        log.warn({
            jobId: jobId,
            dataDomain: dataDomain
        }, 'activity-management-event-handler.handle - handling job');

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

        activityRetry.check(log, config, job, function(retryError, retryResponse) {
            if (retryError) {
                log.error('Fatal - Checking the activity management retry status failed.  Job has been lost.');
                return handlerCallback(retryError, null);
            }
            job = retryResponse;

            util.findClinicalObject(referenceId, job.record.patientUid, config, activityRequestType, log, true, function(error, response) {
                if (error) {
                    log.warn('activity-management-event-handler.handle - findClinicalObject returned the following error: %s', error);
                    return handlerCallback(error);
                }

                if (_.isArray(response)) {
                    response = activityHelper.cleanClinicalObjectResponseArray(response, log, handlerCallback);
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
                        return handlerCallback(null, null);
                    }

                    activityHelper.passOrderToProcessor(response, job, config, log, environment, handlerCallback, function(error, response) {
                        log.debug({
                            record: response
                        }, 'activity-management-event-handler.handle - VPR Object passed order to processor');
                        return handlerCallback(error, response);
                    });
                });
            });
        });
    });
}

module.exports = handle;
