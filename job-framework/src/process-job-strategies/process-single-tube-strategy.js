'use strict';

var async = require('async');

//---------------------------------------------------------------------------------------------
// Used by vxsync framework worker object instances to manage the retrieval of beanstalk jobs
// from a single tube. It is expected that a worker binds itself to this function before
// the function is called.
//---------------------------------------------------------------------------------------------
function processQueue(jobProcessor, callback) {
    var worker = this;
    var tubeName = worker.beanstalkJobTypeConfig.tubename;

    worker.logger.debug('process-single-tube-strategy.processQueue(%s) started: %s', tubeName,!worker.paused);

    if (worker.paused) {
        worker.logger.debug('process-single-tube-strategy.processQueue(): paused == true, SKIPPING _listen() on "%s"', tubeName);
        worker.readyToShutdown = true;
        return setTimeout(processQueue.bind(worker, jobProcessor, callback), worker.pauseDelayMillis);
    } else {
        worker.readyToShutdown = false;
    }

    worker.client.watch(tubeName, function(error) {
        if (error) {
            worker.logger.warn('process-single-tube-strategy.processQueue: error trying to watch tube %s', tubeName);
            return callback(error);
        }

        worker.logger.debug('process-single-tube-strategy.processQueue: Watching tube: %s', tubeName);

        async.forever(
            function(next) {
                if (worker.paused) {
                    worker.logger.debug('process-single-tube-strategy.retrieveJob(): paused == true, SKIPPING _receiveJob() on "%s"', tubeName);
                    worker.readyToShutdown = true;
                    return setTimeout(next, worker.pauseDelayMillis);
                }

                worker.logger.debug('process-single-tube-strategy.retrieveJob(%s): paused: %s; continuing...', tubeName, worker.paused);
                worker.readyToShutdown = false;

                retrieveJob.call(worker, jobProcessor, function() {
                    setTimeout(next, 0);
                });
            },
            function(error) {
                callback(error);
            }
        );
    });
}

function retrieveJob(jobProcessor, callback) {
    var worker = this;
    var tubeName = worker.beanstalkJobTypeConfig.tubename;

    worker.logger.debug('process-single-tube-strategy.retrieveJob(%s) started: %s', tubeName, !worker.paused);

    worker.client.reserve_with_timeout(worker.beanstalkJobTypeConfig.timeout, function(error, beanstalkJobId, beanstalkJobPayload) {
        if (error && error !== 'TIMED_OUT' && error !== 'DEADLINE_SOON') {
            worker.logger.warn('process-single-tube-strategy.retrieveJob(%s): error trying to reserve job with timeout. ERROR: %j', tubeName, error);
            return callback();
        }

        if (error === 'TIMED_OUT') {
            worker.logger.debug('process-single-tube-strategy.retrieveJob(%s): Timeout trying to reserve job', tubeName);
            return callback();
        }

        worker.logger.debug('process-single-tube-strategy.retrieveJob(%s): Reserved job with beanstalkJobId: %s', tubeName, beanstalkJobId);
        jobProcessor(beanstalkJobId, tubeName, beanstalkJobPayload, function() {
            worker.logger.debug('process-single-tube-strategy.retrieveJob(%s): finished job %s, back to listening...', tubeName, beanstalkJobId);
            return callback();
        });
    });
}

module.exports.processQueue = processQueue;
