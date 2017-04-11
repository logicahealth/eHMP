'use strict';

var jobUtil = require(global.VX_UTILS + 'job-utils');

function handle(log, config, environment, job, handlerCallback) {
    log.debug('pgd-to-vpr-xform-handler.handle : received request to PGD xform %s', job);

    var jobToPublish = jobUtil.createRecordEnrichment(job.patientIdentifier, job.dataDomain, job.record, job);
    environment.publisherRouter.publish(jobToPublish, handlerCallback);
}

module.exports = handle;
