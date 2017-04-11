'use strict';

//---------------------------------------------------------------------------------------------------
// This is the handler for processing jobs of type: vista-record-processor-request.
//
// Author:  Les Westberg
//---------------------------------------------------------------------------------------------------

// var _ = require('underscore');
var errorUtil = require(global.VX_UTILS + 'error');
var jobUtil = require(global.VX_UTILS + 'job-utils');
var VistaRecordProcessor = require(global.VX_HANDLERS + 'vista-record-processor/VistaRecordProcessor');


//---------------------------------------------------------------------------------------------------
// This is called when the beanstalkd worker receives a Job that this handler has been configured
// to process.
//
// log - The logger to be used to log messages.
// config - The configuration information that was established for this environment.
// enviroment - The environment settiongs.
// job - The Job that is being processed.
// handlerCallBack - The call back that should be called when this job is completed.
//---------------------------------------------------------------------------------------------------
function handle(log, config, environment, job, handlerCallback) {
    log.debug('vista-record-processor-handler.handle: received request to vista-record-processor.  job: %j', job);

    if (!job) {
        log.warn('vista-record-processor-handler.handle : Job was null or undefined');
        return setTimeout(handlerCallback, 0, errorUtil.createFatal('No job given to handle'));
    }

    if (!job.type || job.type !== jobUtil.vistaRecordProcessorRequestType()) {
        log.warn('vista-record-processor-handler.handle : job type was invalid: %s', job.type);
        return setTimeout(handlerCallback, 0, errorUtil.createFatal('Incorrect job type', job.type), job);
    }

    if (!jobUtil.isValid(jobUtil.vistaRecordProcessorRequestType(), job)) {
        log.warn('vista-record-processor-handler.handle : job was invalid jpid=%s', job.jpid);
        return setTimeout(handlerCallback, 0, errorUtil.createFatal('Invalid job', job.type), job);
    }

    var vistaRecordProcessor = new VistaRecordProcessor(log, config, environment);
    vistaRecordProcessor.processBatch(job.record, function(error, response) {
        log.debug('vista-record-processor-handler-handler.handle: Completed processing job.  jobId: %s, error: %s, response: %s', job.jobId, error, response);

        if (error) {
            environment.errorPublisher.publishHandlerError(job, error, 'fatal', function() {
                return handlerCallback(error, response);
            });
        } else {
            return handlerCallback(null, null);
        }
    });
}

module.exports = handle;