'use strict';

//--------------------------------------------------------------------------------------------
// This is the code for the Event Prioritization Request Handler.
//
// Author: Les Westberg
//--------------------------------------------------------------------------------------------

var _ = require('underscore');
var jobUtil = require(global.VX_UTILS + 'job-utils');
var EventPriorityRulesEngine = require(global.VX_EVENTPRIORITYRULES + 'event-priority-rules-engine');
var objUtil = require(global.VX_UTILS + 'object-utils');


//---------------------------------------------------------------------------------------------
// Handler for Event Prioritization Request jobs.
//
// log: The bunyan logger to be used.
// config:  The configuration information (essentially worker-config.json)
// environment: Set of instances of shared objects that are used by handlers.
// handlerCallback: This is called when the job is done.  Its signature is:
//        function (err)
//            where:  err: Is the error if one occurs.
//---------------------------------------------------------------------------------------------
function handle(log, config, environment, job, handlerCallback) {
    log.debug('event-prioritization-request-handler.handle: received job %s', job);

    // If it is in the environment - then use that one.  Otherwise - create our instance of it.
    //------------------------------------------------------------------------------------------
    var rulesEngine = objUtil.getProperty(environment, 'eventPriorityRulesEngine');
    if (!_.isObject(rulesEngine)) {
        rulesEngine = new EventPriorityRulesEngine(log, config, environment);
    }

    rulesEngine.prioritize(job, function(err, resultJob) {
        if (err) {
            log.warn('event-prioritization-request-handler.handle:  Error occurred running prioritization rules.  Priority is remaining the same as the initial setting for this job.  error: %s; job: %j', err, job);
            resultJob = job;
        } else if (!_.isObject(resultJob)) {
            log.warn('event-prioritization-request-handler.handle:  Error occurred running prioritization rules.  Job was not returned.  Using the original job information.  job: %j', job);
            resultJob = job;
        }

        var record = resultJob.record;
        var meta = {
            jpid: resultJob.jpid,
            rootJobId: resultJob.rootJobId,
            priority: resultJob.priority,
            param: resultJob.param
        };
        if (resultJob.referenceInfo) {
            meta.referenceInfo = resultJob.referenceInfo;
        }
        var jobToPublish = jobUtil.createRecordEnrichment(resultJob.patientIdentifier, resultJob.dataDomain, record, meta);

        log.debug('event-prioritization-request-handler.handle: Publishing record enrichment job.  job: %j', jobToPublish);

        environment.publisherRouter.publish(jobToPublish, handlerCallback);
    });
}

module.exports = handle;
