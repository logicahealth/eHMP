'use strict';

var JobUtils = require('./job-utils');

function handle(logger, config, environment, job, handlerCallback) {
    logger.info('start-request-handler.handle(): received start-request', job);

    if (job.error) {
        logger.error(job, 'start-request-handler.handle(): start-request job error', job);
        return environment.jobStatusUpdater.errorJobStatus(job, job.error, handlerCallback);
    }

    var jobToPublish = JobUtils.create(JobUtils.completeRequestType);
    logger.info(job, 'start-request-handler.handle(): complete-request job created and sent to publisher', jobToPublish);
    environment.publisherRouter.publish(jobToPublish, function(error) {
        if(error) {
            return environment.jobStatusUpdater.errorJobStatus(job, error, handlerCallback);
        }

        environment.jobStatusUpdater.startJobStatus(job, handlerCallback);
    });
}

module.exports = handle;