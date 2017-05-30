'use strict';

var _ = require('underscore');
var errorUtil = require(global.VX_UTILS + 'error');
var jobUtil = require(global.VX_UTILS + 'job-utils');
var timeUtil = require(global.VX_UTILS + 'time-utils');

function handle(log, config, environment, job, handlerCallback) {
    log.debug('hdr-sync-request-handler.handle: received request to HDR %j', job);

    if(!job || !job.type || !jobUtil.isValid(jobUtil.hdrSyncRequestType(), job) || job.type !== jobUtil.hdrSyncRequestType()) {
        log.debug('hdr-sync-request-handler.handle : job was invalid: %s', job);
        return setTimeout(handlerCallback, 0, errorUtil.createFatal('Invalid job', job));
    }

    // TODO: determine whether not having any domains defined is an error
    if(!config.hdr || _.isEmpty(config.hdr.domains)) {
        log.warn('hdr-sync-request-handler.handle : No domains configured for hdr');
        return setTimeout(handlerCallback);
    }

    var requestStampTime = timeUtil.createStampTime();

    log.debug('hdr-sync-request-handler.handle: Preparing domain jobs to be published.  requestStampTime: %s', requestStampTime);
    var filterDomains = _.filter(config.hdr.domains, function(domain) { return domain !== 'patient'; });
    var jobsToPublish = _.map(filterDomains, function(domain) {
        var meta = {
            jpid: job.jpid,
            rootJobId: job.rootJobId,
            priority: job.priority,
            param: job.param
        };
        if (job.referenceInfo) {
            meta.referenceInfo = job.referenceInfo;
        }
        return jobUtil.createHdrDomainSyncRequest(job.patientIdentifier, domain, requestStampTime, meta);
    });

    log.debug('hdr-sync-request-handler.handle: Publishing jobs.  jobsToPublish: %j', jobsToPublish);
    environment.publisherRouter.publish(jobsToPublish, handlerCallback);
}

module.exports = handle;
