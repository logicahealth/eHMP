'use strict';

var async = require('async');
var inspect = require('util').inspect;

//---------------------------------------------------------------------------------------------
// Used to connect to beanstalk and tell beanstalk to use a single tube to publish messages.
//
// This function should be bound to a publisher instance before calling.
//---------------------------------------------------------------------------------------------
function connect(callback) {
    var publisher = this;

    async.series([
        publisher.client.connect.bind(publisher.client),
        publisher.client.use.bind(publisher.client, publisher.beanstalkJobTypeConfig.tubename)
    ], function(error) {
        callback(error);
    });
}

//---------------------------------------------------------------------------------------------
// Used to publish messages to a single tube on beanstalk.
//
// This function should be bound to a publisher instance before calling.
//---------------------------------------------------------------------------------------------
function publish(options, jobStatusUpdater, job, callback) {
    var publisher = this;

    publisher.metrics.info('Queued Beanstalk Job', {'tubeName':publisher.beanstalkJobTypeConfig.tubename, 'jobType':job.type, 'jobId':job.jobId});

    if (publisher.isConnecting) {
        publisher.logger.debug('publisher.publish(): isConnecting == true, SKIPPING publish() on "%s"', job.type);
        return setTimeout(publish.bind(publisher, options, jobStatusUpdater, job, callback), 500);
    }

    if (!publisher.isConnected) {
        publisher.logger.debug('publisher.publish() : attempting to (re)connect');

        publisher.connect(function(err) {
                if (err) {
                    return callbackWrapper(err);
                }
                publisher.client.put(options.priority, options.delay, options.ttr, JSON.stringify(job), callbackWrapper);
            }
        );
    } else {
        publisher.logger.debug('already connected');
        publisher.client.put(options.priority, options.delay, options.ttr, JSON.stringify(job), callbackWrapper);
    }

    function callbackWrapper(err, beanstalkJobId) {
        if (err) {
            publisher.logger.warn('publisher.publish():callbackWrapper() failed to publish job: %s %j', beanstalkJobId, err);
            return callback(err, beanstalkJobId);
        }

        publisher.logger.debug('published job [beanstalkJobId:%s]', beanstalkJobId);
        publisher.logger.debug('creating job state report', inspect(job));

        jobStatusUpdater.createJobStatus(job, function (error) {
            if (error) {
                return callback(error);
            }

            callback(err, beanstalkJobId);
        });
    }
}

module.exports.connect = connect;
module.exports.publish = publish;
