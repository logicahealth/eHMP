'use strict';

var _ = require('underscore');
var async = require('async');

//---------------------------------------------------------------------------------------------
// Used by vxsync framework worker object instances to manage the retrieval of beanstalk jobs
// from several tubes. It is expected that a worker binds itself to this function before
// the function is called.
//---------------------------------------------------------------------------------------------
function processQueue(jobProcessor, callback) {
    var worker = this;

    var baseTubeName = worker.beanstalkJobTypeConfig.tubename;
    var currentTubeIndex = -1;
    var previousTubeName = null;
    var tubeDetails = null;

    async.forever(
        function(next) {
            currentTubeIndex = currentTubeIndex + 1 >= worker.beanstalkJobTypeConfig.tubeDetails.length ? 0 : currentTubeIndex + 1;
            tubeDetails = worker.beanstalkJobTypeConfig.tubeDetails[currentTubeIndex];

            var tubeName = baseTubeName + (currentTubeIndex + 1);
            var ratio = tubeDetails.ratio;

            worker.logger.debug('process-multi-tube-strategy.processQueue(%s) started: %s', tubeName,!worker.paused);

            if (worker.paused) {
                worker.logger.debug('process-multi-tube-strategy.processQueue(): paused == true, SKIPPING _listen() on "%s"', tubeName);
                worker.readyToShutdown = true;
                return setTimeout(next, worker.pauseDelayMillis);
            }

            worker.readyToShutdown = false;

            async.series([
                watchTube.bind(worker, tubeName),
                ignoreTube.bind(worker, previousTubeName),
                retrieveJobForRatio.bind(worker, tubeName, ratio, jobProcessor)],
                function(error) {
                    if (error) {
                        worker.logger.error('process-multi-tube-strategy.processQueue(): error processing job on "%s" with error %j.', tubeName, error);
                        return setTimeout(next, 0, error);
                    }

                    previousTubeName = tubeName;
                    setTimeout(next, 0);
                }
            )
        },
        function(error) {
            callback(error);
        }
    );
}

function watchTube(tubeName, callback) {
    var worker = this;

    worker.client.watch(tubeName, function(error) {
        if (error) {
            worker.logger.error('process-multi-tube-strategy.watchTube() : error trying to watch tube %s', tubeName);
            return callback(error);
        }

        worker.logger.debug('process-multi-tube-strategy.watchTube() : Watching tube: %s', tubeName);
        return callback();
    });
}

function ignoreTube(tubeName, callback) {
    if (_.isNull(tubeName)) {
        return callback();
    }

    var worker = this;

    worker.client.ignore(tubeName, function(error) {
        if (error) {
            worker.logger.error('process-multi-tube-strategy.retrieveJobForRatio(): error trying to ignore %s tube', tubeName);
            return callback();
        }

        worker.logger.debug('process-multi-tube-strategy.retrieveJobForRatio(): ignoring %s tube', tubeName);

        callback();
    });
}

function retrieveJobForRatio(tubeName, ratio, jobProcessor, callback) {
    var worker = this;
    var retrieveCount = 0;

    async.whilst(
        function () { return ratio > retrieveCount; },
        function (loopCallback) {
            if (worker.paused) {
                worker.logger.debug('process-multi-tube-strategy.retrieveJobForRatio(): paused == true, SKIPPING _receiveJob() on "%s"', tubeName);
                worker.readyToShutdown = true;
                return setTimeout(loopCallback, worker.pauseDelayMillis);
            }

            worker.logger.debug('process-multi-tube-strategy.retrieveJobForRatio(%s): paused: %s; continuing...', tubeName, worker.paused);
            worker.readyToShutdown = false;

            retrieveCount++;

            retrieveJob.call(worker, jobProcessor, tubeName, function(error) {
                if (error === 'TIMED_OUT') {
                    retrieveCount = ratio + 1;      //force move to next tube on time out
                }
                setTimeout(loopCallback, 0);
            });
        },
        function () {
            callback();
        }
    );
}

function retrieveJob(jobProcessor, tubeName, callback) {
    var worker = this;

    worker.logger.debug('process-multi-tube-strategy.retrieveJob(%s) started: %s', tubeName, !worker.paused);

    worker.client.reserve_with_timeout(0, function(error, beanstalkJobId, beanstalkJobPayload) {
        if (error && error !== 'TIMED_OUT' && error !== 'DEADLINE_SOON') {
            worker.logger.error('process-multi-tube-strategy.retrieveJob(%s): error trying to reserve job with timeout. ERROR: %j', tubeName, error);
            return callback(error);
        }

        if (error === 'TIMED_OUT') {
            worker.logger.debug('process-multi-tube-strategy.retrieveJob(%s): Timeout trying to reserve job', tubeName);
            return callback(error);
        }

        worker.logger.debug('process-multi-tube-strategy.retrieveJob(%s): Received job with beanstalkJobId: %s', tubeName, beanstalkJobId);
        jobProcessor(beanstalkJobId, tubeName, beanstalkJobPayload, function() {
            worker.logger.debug('process-multi-tube-strategy.retrieveJob(%s): finished job %s, back to listening...', tubeName, beanstalkJobId);
            return callback();
        });
    });
}

module.exports.processQueue = processQueue;
