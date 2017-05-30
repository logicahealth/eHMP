'use strict';

function handle(logger, config, environment, job, handlerCallback) {
    logger.debug('complete-request-handler.handle(): received complete-request', job);

    if (job.error) {
        logger.error(job, 'complete-request-handler.handle(): complete-request job error', job);
        return environment.jobStatusUpdater.errorJobStatus(job, job.error, handlerCallback);
    }

    logger.debug(job, 'complete-request-handler.handle(): complete-request job processed', job);
    environment.jobStatusUpdater.completeJobStatus(job, handlerCallback);
}

module.exports = handle;