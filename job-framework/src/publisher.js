'use strict';

var async = require('async');
var _ = require('underscore');
var BeanstalkClient = require('./beanstalk-client');
var inspect = require('util').inspect;
var supportsMultiTubeConfig =  require('./supports-multi-tube-config');

function Publisher(logger, metrics, config, jobType) {
    if (!(this instanceof Publisher)) {
        return new Publisher(logger, metrics, config, jobType);
    }

    logger.debug('publisher.Publisher(%s)', jobType);

    this.logger = logger;
    this.metrics = metrics;
    this.client = undefined;
    this.queue = undefined;         //used by publisher-strategies/multiTubeStrategy
    this.jobType = jobType;
    this.isConnected = false;
    this.isConnecting = false;

    var beanstalkConfig = config.beanstalk;
    this.beanstalkJobTypeConfig = beanstalkConfig.jobTypes[jobType] ||
    _.defaults({}, beanstalkConfig.repoUniversal, beanstalkConfig.repoDefaults, {
        usingDefaults: true
    });

    this.publishStrategy = supportsMultiTubeConfig(this.logger, this.beanstalkJobTypeConfig) ?
        require('./publish-strategies/publish-multi-tube-strategy').createQueue(this) : require('./publish-strategies/publish-single-tube-strategy');

    this.logger.debug('publisher.Publisher(%s) %s:%s/%s', jobType, this.beanstalkJobTypeConfig.host, this.beanstalkJobTypeConfig.port, this.beanstalkJobTypeConfig.tubename);
}

/*
 Variadic Function:
 connect(callback)
 connect()
 */
Publisher.prototype.connect = function(callback) {
    this.isConnecting = true;
    this.isConnected = false;
    this.logger.debug('Publisher.connect()');

    var self = this;

    var host = self.beanstalkJobTypeConfig.host;
    var port = self.beanstalkJobTypeConfig.port;

    self.logger.debug('Publisher.connect() : instantiate beanstalk %s:%s/%s', host, port, this.jobType);
    self.client = new BeanstalkClient(self.logger, host, port);

    self.logger.debug('Publisher.connect() : connecting to beanstalkd %s:%s/%s', host, port, this.jobType);

    self.publishStrategy.connect.call(self, function(error) {
        if (error) {
            self.logger.debug('Publisher.connect() : failed to connect client %j', error);
            self.client = undefined;
            self.isConnecting = false;
            if (callback) {
                callback(error);
            }
            return;
        }

        self.client.on('error', function(err) {
            self.logger.warn('Publisher.connect() : beanstalk client error (%s) %j', self.jobType, err);
        });

        self.client.on('close', function() {
            self.isConnected = false;
            self.logger.info('Publisher.connect() : disconnected from beanstalkd (%s)', self.jobType);
            self.client = undefined;
        });

        self.isConnected = true;
        self.isConnecting = false;
        self.logger.debug('Publisher.connect() : connected to beanstalkd for (%s) @%s:%s', self.jobType, host, port);
        if (callback) {
            callback();
        }
    });
};

/*
 Variadic Function:
 publish = function(job, options, jobStatusUpdater, publishCallback)
 publish = function(job, jobStatusUpdater, publishCallback)

 options = {
    priority: number,
    delay: seconds,
    ttr: seconds
 }
 */
Publisher.prototype.publish = function(job, options, jobStatusUpdater, callback) {
    // second parameter is optional
    if (arguments.length === 3) {
        jobStatusUpdater = arguments[1];
        callback = arguments[2];
        options = {};
    }
    options = _.defaults(options || {}, this.beanstalkJobTypeConfig);

    this.logger.debug('publisher.publish() : %s %s', job.type, (job.dataDomain ? job.dataDomain : ''));

    this.publishStrategy.publish.call(this, options, jobStatusUpdater, job, callback);
};

// Only connect if not connected
Publisher.prototype.reconnect = function(callback) {
    if (this.isConnected) {
        return setTimeout(callback, 0);
    }

    this.logger.debug('publisher.reconnect() : attempting to (re)connect');
    this.connect(callback);
};

Publisher.prototype.close = function() {
    this.logger.debug('Publisher.close()');
    if (this.client) {
        this.client.end();
    }
};

module.exports = Publisher;
