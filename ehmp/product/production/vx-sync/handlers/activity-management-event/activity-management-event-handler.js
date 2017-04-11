'use strict';

// var _ = require('underscore');
var errorUtil = require(global.VX_UTILS + 'error');
var jobUtil = require(global.VX_UTILS + 'job-utils');

function handle(log, config, environment, job, handlerCallback) {
    log.debug('activity-management-event-handler.handle - received activity management event (%j)', job);

    if (!_isValidRequest(job, log, handlerCallback)) {
        return;
    }
    // @TODO, add the logic to handle the activity management event here
    // invoke handler callback
    return handlerCallback();
}

function _isValidRequest (job, log, handlerCallback) {
    if (!job) {
        log.warn('activity-management-event-handler._isValidRequest : Job was null or undefined');
        setTimeout(handlerCallback, 0, errorUtil.createFatal('No job given to handle'));
        return false;
    }
    if (!job.type || job.type !== jobUtil.activityManagementEventType()){
        log.warn('activity-management-event-handler._isValidRequest : invalid Job Type');
        setTimeout(handlerCallback, 0, errorUtil.createFatal('Incorrect job type', job.type), job);
        return false;
    }
    //@TODO add more parameter checking here.
    return true;
}

module.exports = handle;
module.exports._isValidRequest = _isValidRequest; // for unittest
