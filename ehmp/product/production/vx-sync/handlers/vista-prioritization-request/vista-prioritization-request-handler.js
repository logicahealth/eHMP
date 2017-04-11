'use strict';

var jobUtil = require(global.VX_UTILS + 'job-utils');

function handle(log, config, environment, job, handlerCallback) {
    log.debug('vista-prioritization-request-handler.handle : received request to HDR %s', job);

    var record = job.record;
    var meta = {
        jpid: job.jpid,
        rootJobId: job.rootJobId,
        param: job.param
    };
    var jobToPublish = jobUtil.createRecordEnrichment(job.patientIdentifier, job.dataDomain, record, meta);

    environment.publisherRouter.publish(jobToPublish, handlerCallback);
}

module.exports = handle;