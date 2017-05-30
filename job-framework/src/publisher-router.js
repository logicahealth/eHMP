'use strict';

var inspect = require('util').inspect;
var _ = require('underscore');
var async = require('async');

var errorBuilder = require('./error-builder');
var Publisher = require('./publisher');

function PublisherRouter(logger, config, metrics, jobStatusUpdater, PublisherClass) {
    if(!(this instanceof PublisherRouter)) {
        return new PublisherRouter(logger, config, metrics, PublisherClass);
    }

    this.logger = logger;
    this.logger.debug('publisher-router.PublisherRouter() : Enter');
    this.metrics = metrics;
    this.config = config;
    this.logger.debug('publisher-router.PublisherRouter: config.parallelPublish: %s', config.parallelPublish);

    this.jobStatusUpdater = jobStatusUpdater;

    // This parameter is for unit testing, otherwise just leave it undefined.
    this.PublisherClass = PublisherClass || Publisher;

    this.logger.debug('publisher-router.PublisherRouter() ');
    // this.logger.debug(inspect(config, { depth: null }))
    this.publishers = {};
}

PublisherRouter.prototype.childInstance = function(childLog) {
    var jsu = this.jobStatusUpdater;
    if (_.isFunction(jsu.childInstance)) {
        jsu = jsu.childInstance(childLog);
    }
    var newInstance = new PublisherRouter(childLog, this.config, this.metrics, jsu, this.PublisherClass);

    newInstance.publishers = this.publishers;
    return newInstance;
};

/*
Variadic function:
publish(jobs, options, callback)
publish(jobs, callback)
*/
PublisherRouter.prototype.publish = function(jobs, options, callback) {
    this.logger.debug('publisher-router.publish(): Enter');
    this.logger.debug(inspect(jobs));
    // this.logger.trace(beanstalkConfig);

    // second parameter is optional
    if (arguments.length === 2) {
        callback = arguments[1];
        options = {};
    }

    if (!_.isArray(jobs)) {
        jobs = [jobs];
    }

    var self = this;
    var asyncTasks = _.map(jobs, function(job) {
        var publisher = self.getPublisherForJob(job);
        return publisher.publish.bind(publisher, job, options, self.jobStatusUpdater);
    });

    // when this is just an unlimited parallel, the pollerHost will try to publish entirely too many
    // jobs and DDoS the beanstalkd client/server such that connections fail due to an 'EMFILE' error
    //async.series(asyncTasks, function(err, results) {
    async.parallelLimit(asyncTasks, self.config.parallelPublish || 20, function(err, results) {        if (err) {
            self.logger.debug('publisher-router.publish(): failed to publish job(s) [%s]', err);
            return callback(errorBuilder.createTransient(err));
        }
        self.logger.debug(inspect(results));
        self.logger.debug('publisher-router.publish(): publish job(s) complete [count=%s]', results.length);
        return callback(null, results);
    });
};


PublisherRouter.prototype.getPublisherForJob = function(job) {
    var self = this;
    self.logger.debug('publisher-router.getPublisherForJob(): %s', job.type);
    self.logger.debug(inspect(job));

    if (_.isEmpty(job)) {
        return;
    }

    var type = job.type;

    // TODO: What if there is no publisher for the job?
    var publisher = self.publishers[type];
    if (!publisher) {
        self.logger.debug('publisher-router.getPublisherForJob(): publisher not already created / in cache, creating publisher [%s]', type);
        publisher = new self.PublisherClass(self.logger, self.metrics, self.config, type);
        self.publishers[type] = publisher;
    }

    return publisher;
};

PublisherRouter.prototype.close = function() {
    this.logger.debug('publisher-router.close()');
    _.each(this.publishers, function(publisher) {
        publisher.close();
    });
};

module.exports = PublisherRouter;
