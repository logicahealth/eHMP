'use strict';

function handle(logger, config, environment, job, handlerCallback) {
    logger.info('error-request-handler.handle(): received error record', job);
    logger.error(job, 'error-request-handler.handle(): error job handled');
    setTimeout(handlerCallback);
}

module.exports = handle;
