'use strict';

var _ = require('underscore');
// var errorUtil = require(global.VX_UTILS + 'error');
var jobUtil = require(global.VX_UTILS + 'job-utils');
var pidUtil = require(global.VX_UTILS + 'patient-identifier-utils');
var path = require('path');
// var format = require('util').format;

function handle(log, config, environment, job, handlerCallback) {
    log.debug('publish-vx-data-change-request-handler.handle - received request to vx change (%s) %s', job.dataDomain, job);

    var meta = {
        jpid: job.jpid,
        rootJobId: job.rootJobId,
        param: job.param
    };
    if (job.referenceInfo) {
        meta.referenceInfo = job.referenceInfo;
    }

    if (_.isUndefined(config.publishTubes) || _.isEmpty(config.publishTubes)){
        log.debug('publish-vx-data-change-request-handler.handle - no tube to publish');
        return handlerCallback();
    }

    var notifyTubes = [];
    if (_.isArray(config.publishTubes)) {
        // if publish tubes is an array, then no filter
        notifyTubes = config.publishTubes;
    }
    else {
        // Filter out the pre-configured tubes based on eventFilter
        _.each(config.publishTubes, function(tubeConfig, tubeName){
            // if there is not eventFilter field or the field is empty, just return
            if (!tubeConfig.eventFilter || _.isEmpty(tubeConfig.eventFilter)){
                notifyTubes.push(tubeName);
                return;
            }
            var isSubscribedJob = true;
            if (tubeConfig.eventFilter.generic) {
                // handle generic events filter
                var sites = tubeConfig.eventFilter.generic.sites;
                var domains = tubeConfig.eventFilter.generic.domains;
                isSubscribedJob = (_filterJobBySites(job, sites) && _filterJobByDomains(job, domains));
                if (!isSubscribedJob) {
                    return;
                }
            }
            if (tubeConfig.eventFilter.customized) {
                // handle customized event filter
                try {
                    var customizedFilter = require(path.join(__dirname, tubeConfig.eventFilter.customized));
                    if ( customizedFilter(job, log, config, environment) ) {
                        notifyTubes.push(tubeName);
                        return;
                    }
                }
                catch (err) {
                    log.warn('publish-vx-data-change-request-handler.handle - error: %s', err);
                    return;
                }
            }
            if (isSubscribedJob) {
                notifyTubes.push(tubeName);
                return;
            }

        });
    }

    var jobsToPublish = _.map(notifyTubes, function(tubeName){
        log.warn('publish-vx-data-change-request-handler publishing job to tube ' + tubeName + ' pid: ' + job.patientIdentifier.value + ' domain: ' + job.dataDomain);
        return jobUtil.create(tubeName, job.patientIdentifier, job.dataDomain, job.record, null, null, meta);
    });
    if(jobsToPublish.length > 0) {
        environment.publisherRouter.publish(jobsToPublish, handlerCallback);
    } else {
        handlerCallback();
    }
}

function _filterJobByDomains(job, domains) {
    if (!job) {
        return false; // do not notify empty job
    }
    if (!domains || _.isEmpty(domains)) {
        return true;  // if no domain is specified, notify the job
    }
    // job must have a dataDomain field
    if (!job.dataDomain) {
        return false; // do not notify if no domain is specified in job and domains to filter is not empty
    }
    if (_.contains(domains, job.dataDomain)) { // notify if dataDomain is in specified domains
        return true;
    }
    return false;
}

function _filterJobBySites(job, sites) {
    if (!job) {
        return false; // do not notify empty job
    }
    if (!sites || _.isEmpty(sites)) {
        return true;  // if no sites is specified, notify the job
    }
    // job must have a patient identifier field or record has a pid field
    var pid = pidUtil.extractPidFromJob(job);
    if (!pid && job.record && job.record.pid) {
        pid = job.record.pid;
    }
    if (!pid) {
        return false;
    }
    if (_.contains(sites, pidUtil.extractSiteFromPid(pid))) { // notify if dataDomain is in specified domains
        return true;
    }
    return false;
}

module.exports = handle;
