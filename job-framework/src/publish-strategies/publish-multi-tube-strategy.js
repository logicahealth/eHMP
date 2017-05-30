'use strict';

var async = require('async');
var _ = require('underscore');
var inspect = require('util').inspect;

//---------------------------------------------------------------------------------------------
// Used to create a async.queue on the worker instance.
// createQueue function must be called before calling publish.
//
// Note: This function returns a reference to this module.
//---------------------------------------------------------------------------------------------
function createQueue(publisher) {
    if (publisher.queue) {
        return;
    }

    publisher.queue = async.queue(publishWorker.bind(publisher), 1);

    function publishWorker(task, queueCallback) {
        if (!publisher.isConnected) {
            publisher.logger.debug('publisher.publish() : attempting to (re)connect');

            publisher.connect(function (err) {
                if (err) {
                    return executeCallbacks(err);
                }

                task(function (error, result) {
                    return executeCallbacks(error, result);
                });
            });
        } else {
            publisher.logger.debug('already connected');

            task(function(error, result) {
                return executeCallbacks(error, result);
            });
        }

        function executeCallbacks(error, result) {
            setTimeout(task.callback, 0, error, result);
            setTimeout(queueCallback);
        }
    }

    return this;        //returns reference to this module
}

//---------------------------------------------------------------------------------------------
// Used to connect to beanstalk.
//
// This function should be bound to a publisher instance before calling.
//---------------------------------------------------------------------------------------------
function connect(callback) {
    var publisher = this;

    publisher.client.connect(function(err) {
        if (err) {
            return callback(err);
        }
        callback();
    });
}

//---------------------------------------------------------------------------------------------
// Used to queue tasks to publish a job to one of several tubes bases on tube configuration
// and job priority.  Publish tasks need to be queued because:
//   1. two beanstalk commands (use, put) are required to publish a message to the correct tube
//   2. publisher support parallel publishing
// createQueue function must be called before calling publish.
//
// This function should be bound to a publisher instance before calling.
//---------------------------------------------------------------------------------------------
function publish(options, jobStatusUpdater, job, callback) {
    var publisher = this;

    var task = publishTask.bind(publisher, options, jobStatusUpdater, job);
    task.callback = callback;

    publisher.queue.push(task);
}

function publishTask(options, jobStatusUpdater, job, callback) {
    var publisher = this;
    var tubeName = getTubeName.call(publisher, job);

    publisher.metrics.info('Queued Beanstalk Job', {'tubeName':tubeName, 'jobType':job.type, 'jobId':job.jobId});

    async.series([
        publisher.client.use.bind(publisher.client, tubeName),
        publisher.client.put.bind(publisher.client, options.priority, options.delay, options.ttr, JSON.stringify(job))
    ], function(err, results) {
        var beanstalkJobId = results[1]; //result from doPublish task

        if (err) {
            publisher.logger.warn('publisher.publish(): failed to publish job: %s %j', beanstalkJobId, err);
            return callback(err, beanstalkJobId);
        }

        publisher.logger.debug('publisher.publish(): published job [beanstalkJobId:%s]', beanstalkJobId);
        publisher.logger.debug('publisher.publish(): creating job state report', inspect(job));

        jobStatusUpdater.createJobStatus(job, function(error) {
            if (error) {
                return callback(error);
            }

            return callback(null, beanstalkJobId);
        });
    });
}

function getTubeName(job) {
    var priority = getDefaultPriority(job);
    var tubeIndex = getTubeIndex(this.beanstalkJobTypeConfig, priority);

    return this.beanstalkJobTypeConfig.tubename + tubeIndex;
}

function getDefaultPriority(job) {
    var priority = job.priority || 1;

    if (priority < 1) { priority = 1}
    if (priority > 100) { priority = 100}

    return priority;
}

function getTubeIndex(beanstalkJobTypeConfig, priority) {
    var tubeIndex = findTubeIndexByPriority(beanstalkJobTypeConfig, priority);

    if (tubeIndex === -1) {
        var newPriority = _.chain(beanstalkJobTypeConfig.tubeDetails)
            .map(function(detail){ return [detail.priority.startValue, detail.priority.endValue]; })
            .flatten()
            .sortBy(function(num) {return num;})
            .reduce(function(memo, num){ return (Math.abs(num - priority) < Math.abs(memo - priority) ? num : memo); }, -100)
            .value();

        tubeIndex = findTubeIndexByPriority(beanstalkJobTypeConfig, newPriority);
    }

    return tubeIndex > 0 ? tubeIndex + 1 : 1;
}

function findTubeIndexByPriority(beanstalkJobTypeConfig, priority) {
    return _.findIndex(beanstalkJobTypeConfig.tubeDetails, function(detail) {
        return priority >= detail.priority.startValue && priority <= detail.priority.endValue;
    });
}

module.exports.createQueue = createQueue;
module.exports.connect = connect;
module.exports.publish = publish;

//Testing only
module.exports._getTubeIndex = getTubeIndex;
module.exports._getTubeName = getTubeName;
