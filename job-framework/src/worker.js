'use strict';

var _ = require('underscore');

var BeanstalkClient = require('./beanstalk-client');
var Delay = require('./delay');
var jobProcessor = require('./process-job-strategies/job-processor');
var supportsMultiTubeConfig =  require('./supports-multi-tube-config');

function noop(callback) {
    if(arguments.length === 0) {
        return;
    }

    callback = arguments[arguments.length - 1];

    if(!_.isFunction(callback)) {
        return;
    }

    setTimeout(callback);
}

var noopErrorPublisher = {
    publishHandlerError: noop
};

var noopJobStatusUpdater = {
    createJobStatus: noop,
    completeJobStatus: noop,
    startJobStatus: noop,
    errorJobStatus: noop
};

/*
Variadic Function:
function(logger, beanstalkJobTypeConfig, metrics, handlerRegistry, jobStatusUpdater, errorPublisher)
function(logger, beanstalkJobTypeConfig, metrics, handlerRegistry, jobStatusUpdater, errorPublisher, start)
function(logger, beanstalkJobTypeConfig, metrics, handlerRegistry, jobStatusUpdater)
function(logger, beanstalkJobTypeConfig, metrics, handlerRegistry, jobStatusUpdater, start)
function(logger, beanstalkJobTypeConfig, metrics, handlerRegistry, errorPublisher)
function(logger, beanstalkJobTypeConfig, metrics, handlerRegistry, errorPublisher, start)
function(logger, beanstalkJobTypeConfig, metrics, handlerRegistry)
function(logger, beanstalkJobTypeConfig, metrics, handlerRegistry)

beanstalkJobTypeConfig parameters used:
    host
    port
    tubename
    timeout
    initMillis
    maxMillis
    incMillis

    logger: {
        trace: function() {},
        debug: function() {},
        info: function() {},
        warn: function() {},
        error: function() {},
        fatal: function() {},
    }

    beanstalkJobTypeConfig: {}

    mertrics: {
        trace: function() {},
        debug: function() {},
        info: function() {},
        warn: function() {},
        error: function() {},
        fatal: function() {},
    }

    handlerRegistry: {
        get: function(job) {}
    }

    jobStatusUpdater: {
        createJobStatus: function(job, callback) {},
        completeJobStatus: function(job, callback) {},
        startJobStatus: function(job, callback) {},
        errorJobStatus: function(job, handlerError, callback) {}
    }

    errorPublisher: {
        publishHandlerError: function(job, handlerError, errorType, callback) {}
    }

    start: true | false // must be a primitive boolean
*/
var Worker = function(logger, beanstalkJobTypeConfig, metrics, handlerRegistry, jobStatusUpdater, errorPublisher, start) {
    if (!(this instanceof Worker)) {
        return new Worker(logger, beanstalkJobTypeConfig, metrics, handlerRegistry, jobStatusUpdater, errorPublisher, start);
    }

    logger.debug('worker.Worker(%s)', beanstalkJobTypeConfig.tubename);

    var args = _.toArray(arguments);

    start = false;

    if(_.isBoolean(_.last(args))) {
        start = args.pop();
    }

    var last = _.last(args);
    errorPublisher = noopErrorPublisher;
    if(!_.isEmpty(last) && _.isFunction(last.publishHandlerError)) {
        logger.info('worker.Worker(%s) adding ErrorPublisher', beanstalkJobTypeConfig.tubename);
        errorPublisher = args.pop();
    }

    last = _.last(args);
    jobStatusUpdater = noopJobStatusUpdater;
    if(!_.isEmpty(last) && _.isFunction(last.createJobStatus) && _.isFunction(last.completeJobStatus) && _.isFunction(last.startJobStatus) && _.isFunction(last.errorJobStatus)) {
        logger.info('worker.Worker(%s) adding JobStatusUpdater', beanstalkJobTypeConfig.tubename);
        jobStatusUpdater = args.pop();
    }

    this.logger = logger;
    this.paused = !start;
    this.readyToShutdown = !start;
    this.handlerRegistry = handlerRegistry;
    this.metrics = metrics;

    this.beanstalkJobTypeConfig = beanstalkJobTypeConfig;
    this.client = undefined;
    this.jobStatusUpdater = jobStatusUpdater;
    this.errorPublisher = errorPublisher;
    this.pauseDelayMillis = 1000;

    this.delay = new Delay(this.beanstalkJobTypeConfig.delay);

    var processJob = jobProcessor.processJob.bind(this);
    this.processQueue = supportsMultiTubeConfig(this.logger, this.beanstalkJobTypeConfig) ?
        require('./process-job-strategies/process-multi-tube-strategy').processQueue.bind(this, processJob) :
        require('./process-job-strategies/process-single-tube-strategy').processQueue.bind(this, processJob);

    this.logger.debug('worker.Worker() %j', this.beanstalkJobTypeConfig);
};

Worker.prototype.start = function() {
    this.logger.debug('worker.start() %s:%s/%s', this.beanstalkJobTypeConfig.host, this.beanstalkJobTypeConfig.port, this.beanstalkJobTypeConfig.tubename);
    this._connect();
};

Worker.prototype.stop = function(callback) {
    this.logger.debug('worker.stop() %s:%s/%s', this.beanstalkJobTypeConfig.host, this.beanstalkJobTypeConfig.port, this.beanstalkJobTypeConfig.tubename);
    this.paused = true;
    callback = callback || _.noop;
    this._clearClient();

    callback();
};

Worker.prototype.updateRegistry = function(handlerRegistry) {
    this.handlerRegistry = handlerRegistry;
};

Worker.prototype.resume = function() {
    this.logger.debug('worker.resume()');
    this.paused = false;
};

Worker.prototype.pause = function() {
    this.logger.debug('worker.pause(%s)', this.beanstalkJobTypeConfig.tubename);
    this.paused = true;
};

Worker.prototype.getStatus = function() {
    this.logger.debug('worker.getStatus()');

    return {
        tube: this.beanstalkJobTypeConfig.host + ':' + this.beanstalkJobTypeConfig.port + '/' + this.beanstalkJobTypeConfig.tubename,
        status: this.paused ? 'paused' : 'running',
        pid: process.pid
    };
};

Worker.prototype.isReadyToShutdown = function() {
    var tubename = this.getTubeName();
    this.logger.debug('worker(%s).isReadyToShutdown: %s', tubename, this.readyToShutdown);
    return this.readyToShutdown;
};

Worker.prototype.getTubeName = function() {
    if (!this.beanstalkJobTypeConfig) {
        return null;
    }

    return this.beanstalkJobTypeConfig.tubename;
};

//////////////////////////////////////////////////////////////////////////////////////////
// Below here are "private" methods
//////////////////////////////////////////////////////////////////////////////////////////

Worker.prototype._connect = function() {
    this.logger.debug('worker._connect(%s) started: %s', this.getTubeName(), !this.paused);

    var self = this;

    self.delay.increment();
    var timeout = self.delay.currentMillis;
    var _connect = self._connect.bind(self);

    self.client = new BeanstalkClient(self.logger, self.beanstalkJobTypeConfig.host, self.beanstalkJobTypeConfig.port);
    self.client.connect(function(error) {
        if (error) {
            self.logger.warn('worker._connect(%s) Unable to connect to beanstalk. ERROR: %j', self.getTubeName(), error);
            return setTimeout(_connect, timeout);
        }

        self.client.on('error', function(error) {
            self.logger.warn('worker._connect(%s) error with connection. ERROR: %j', self.getTubeName(), error);
            self._clearClient();
            setTimeout(_connect, timeout);
        });

        self.client.on('close', function(error) {
            self.logger.warn('worker._connect(%s) connection closed. ERROR: %j', self.getTubeName(), error);
            self._clearClient();
            setTimeout(_connect, timeout);
        });

        self.delay.reset();

        self.processQueue(function(error) {
            if (error) {
                self.logger.warn('worker._connect(%s) Unable to connect to beanstalk. ERROR: %j', self.getTubeName(), error);
                self._clearClient();
                setTimeout(_connect, timeout);
            }
        });
    });
};

Worker.prototype._clearClient = function() {
    this.logger.debug('worker._clearClient(%s)', this.getTubeName());
    if (this.client) {
        this.client.removeAllListeners();
        this.client.end();
    }
};

module.exports = Worker;
Worker._noop = noop;
Worker._noopErrorPublisher = noopErrorPublisher;
Worker._noopJobStatusUpdater = noopJobStatusUpdater;
