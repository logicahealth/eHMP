'use strict';

var async = require('async');
var _ = require('underscore');
var moment = require('moment');
var uuid = require('node-uuid');

var BeanstalkClient = require('./beanstalk-client');

function ErrorPublisher(logger, config, errorJobType) {
    if (!(this instanceof ErrorPublisher)) {
        return new ErrorPublisher(logger, config, errorJobType);
    }

    logger.debug('error-publisher.ErrorPublisher');

    this.logger = logger;
    this.errorJobType = errorJobType;
    this.client = undefined;
    this.isConnected = false;
    var beanstalkConfig = config.beanstalk;

    this.beanstalkConfig = beanstalkConfig.jobTypes['error-request'] || {};

    this.beanstalkConfig = _.defaults(this.beanstalkConfig, beanstalkConfig.repoUniversal, beanstalkConfig.repoDefaults, {
        usingDefaults: true
    });

    this.logger.debug('error-publisher.ErrorPublisher() %s:%s/%s', this.beanstalkConfig.host, this.beanstalkConfig.port, this.beanstalkConfig.tubename);
}

/*
Variadic Function:
connect(callback)
connect()
*/
ErrorPublisher.prototype.connect = function(callback) {
    this.logger.debug('error-publisher.connect()');
    var self = this;

    self.close();

    var host = self.beanstalkConfig.host;
    var port = self.beanstalkConfig.port;
    var tubename = self.beanstalkConfig.tubename;

    self.logger.debug('error-publisher.connect(): instantiate beanstalk %s:%s', host, port);
    self.client = new BeanstalkClient(self.logger, host, port);

    self.logger.debug('error-publisher.connect(): connecting to beanstalk %s:%s', host, port);

    async.series({
        connect: self.client.connect.bind(self.client),
        use: self.client.use.bind(self.client, tubename)
    }, function(error) {
        if (error) {
            self.logger.error('error-publisher.connect(): failed to connect client %j', error);
            self.close();
            if (callback) {
                callback(error);
            }
            return;
        }

        self.client.on('error', function(err) {
            self.logger.error('error-publisher.connect(): beanstalk client error %s:%s %j', err, host, port);
            self.close();
        });

        self.client.on('close', function() {
            self.logger.info('error-publisher.connect(): disconnected from beanstalk %s:%s', host, port);
            self.close();
        });

        self.isConnected = true;
        self.logger.debug('error-publisher.connect(): connected to beanstalk %s:%s', host, port);
        if (callback) {
            callback();
        }
    });
};

/*
Variadic Function:
publish = function(errorRecord, options, publishCallback)
publish = function(errorRecord, publishCallback)

options = {
    priority: number,
    delay: seconds,
    ttr: seconds
}

type: job | ?
job: the job/action that failed. will be a job if type === 'job'
error: the error string or object
*/
ErrorPublisher.prototype.publish = function(errorRecord, options, callback) {
    this.logger.debug('error-publisher.publish()');
    var self = this;

    // second parameter is optional
    if (arguments.length === 2) {
        callback = arguments[1];
        options = {};
    }

    options = _.defaults(options || {}, this.beanstalkConfig);

    // var put = self.client.put.bind(self.client, options.priority, options.delay, options.ttr);

    this.logger.debug('error-publisher.publish(): %s', errorRecord);

    if (!self.isConnected) {
        self.logger.debug('error-publisher.publish(): attempting to (re)connect');

        return self.connect(function(logger, error) {
            if (error) {
                return callback(error);
            }

            self.logger.debug('error-publisher.publish(): publishing on new connection');
            self.client.put(options.priority, options.delay, options.ttr, JSON.stringify(errorRecord), callback);
        });
    }


    self.logger.debug('error-publisher.publish(): publishing on existing connection');
    self.client.put(options.priority, options.delay, options.ttr, JSON.stringify(errorRecord), callback);
};


ErrorPublisher.prototype.close = function() {
    this.logger.debug('error-publisher.close()');
    this.isConnected = false;
    if (this.client) {
        this.client.end();
        this.client = undefined;
    }
};

/*
classification = 'job' | 'system'
*/
function createErrorRecord(errorJobType, classification, error) {
    return {
        jpid: uuid.v4(),
        type: errorJobType,
        classification: classification,
        timestamp: moment.utc().format(),
        error: error
    };
}

//------------------------------------------------------------------------------------------------
// This function creates an instance of an error record which occurred via a handler processing
// a job.
//
// job: The job associated with the error.
// error: The error that occurred.
// severity: The severity of the error.    (transient-exceptipn or fatal-exception)
//-----------------------------------------------------------------------------------------------
function createHandlerErrorRecord(errorJobType, job, error, severity) {
    var errorRecord = _.defaults({
        job: job,
        severity: severity
    }, createErrorRecord(errorJobType, 'job', error));

    return errorRecord;
}

/*
severity = 'fatal' | 'transient'
*/
ErrorPublisher.prototype.publishHandlerError = function(job, error, severity, callback) {
    this.logger.debug('error-publisher.publishHandlerError()');
    var errorRecord = createHandlerErrorRecord(this.errorJobType, job, error, severity);

    this.publish(errorRecord, callback);
};


/*
Variadic Function
function publishPollerError(vista, chunk, error, callback)
function publishPollerError(vista, error, callback)

chunk is JSON that triggered the error
*/
ErrorPublisher.prototype.publishPollerError = function(vista, chunk, error, callback) {
    this.logger.debug('error-publisher.publishPollerError()');

    if (arguments.length === 3) {
        chunk = undefined;
        error = arguments[1];
        callback = arguments[2];
    }

    var base = {
        system: vista
    };

    if (!_.isUndefined(chunk)) {
        base.chunk = chunk;
    }

    var errorRecord = _.defaults(base, createErrorRecord(this.errorJobType, 'poller', error));

    this.publish(errorRecord, callback);
};

/*
Variadic Function
function publishPollerError(vista, patientIdentifier, error, callback)
function publishPollerError(vista, error, callback)
*/
ErrorPublisher.prototype.publishSubsystemError = function(subsystem, patientIdentifier, error, callback) {
    this.logger.debug('error-publisher.publishSubsystemError()');

    if (arguments.length === 3) {
        patientIdentifier = undefined;
        error = arguments[1];
        callback = arguments[2];
    }

    var base = {
        system: subsystem
    };

    if (!_.isUndefined(patientIdentifier)) {
        base.patientIdentifier = patientIdentifier;
    }

    var errorRecord = _.defaults(base, createErrorRecord(this.errorJobType, 'system', error));

    this.publish(errorRecord, callback);
};


module.exports = ErrorPublisher;
ErrorPublisher._createErrorRecord = createErrorRecord;
ErrorPublisher._createHandlerErrorRecord = createHandlerErrorRecord;