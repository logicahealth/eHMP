'use strict';

require('../../../env-setup');

var _ = require('lodash');
var moment = require('moment');
var nullUtil = require(global.VX_UTILS + 'null-utils');
var jobUtil = require(global.VX_UTILS + 'osync-job-utils');
var jdsUtil = require(global.VX_UTILS + 'jds-utils');

function handle(log, config, environment, job, handlerCallback) {
    log.debug('store-job-status.handle : received request to save ' + JSON.stringify(job));
    var result = true;
    var key = "osyncstatus";

    if (_.isNull(job.type) || _.isUndefined(job.type)) {
        log.error('store-job-status.handle: Could not find job type');
        handlerCallback('store-job-status.handle: Could not find job type');
        return;
    }
    else if (job.type !== 'store-job-status') {
        log.error('store-job-status.handle: job type was not store-job-status');
        handlerCallback('store-job-status.handle: job type was not store-job-status');
        return;
    }

    // Append the new status
    var saving = {"siteId": job.siteId, "patient": job.patient, "source": job.source, "syncDate": moment().format()};
    jdsUtil.patientsSynced.patients.push(saving);

    environment.resultsLog.info(JSON.stringify(saving));

    log.debug('store-job-status.handle: saved ' + JSON.stringify(saving));
    log.debug('osyncstatus size is now ' + jdsUtil.patientsSynced.patients.length);

    handlerCallback(null, result);
}

module.exports = handle;
