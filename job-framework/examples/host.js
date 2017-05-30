'use strict';

var format = require('util').format;
var _ = require('underscore');
var bunyan = require('bunyan');

var Worker = require('../src/worker');
var HandlerRegistry = require('../src/handler-registry');
var PublisherRouter = require('../src/publisher-router');
var ErrorPublisher = require('../src/error-publisher');
var QueueConfig = require('../src/queue-config');

var JobStatusUpdater = require('./job-status-updater');
var JobUtils = require('./job-utils');

var argv = require('yargs')
    .usage('Usage: --log-level <log-level>')
    .alias('l', 'log-level')
    .argv;

var config = require('./config');
var logger = require('bunyan').createLogger({
    name: 'host-logger',
    level: argv['log-level'] || 'warn'
});

var metrics = bunyan.createLogger({
    name: 'host-metrics',
    level: 'warn'
});

var errorRequestType = JobUtils.errorRequestType;
var startRequestType = JobUtils.startRequestType;
var completeRequestType = JobUtils.completeRequestType;

// call this utility to fill in the properties on each tube
config.beanstalk = QueueConfig.createFullBeanstalkConfig(config.beanstalk);

startHost(logger, config);

//////////////////////////////////////////////////////////////////////////////
//  EXECUTE ON STARTUP
//////////////////////////////////////////////////////////////////////////////

function startHost(logger, config) {
    var environment = buildEnvironment(logger, config);
    var handlerRegistry = registerHandlers(logger, config, environment);

    var profileJobTypes = _.keys(config.beanstalk.jobTypes);

    return startWorkers(config, handlerRegistry, environment, profileJobTypes);
}

function buildEnvironment(logger, config) {
    var environment = {
        jobStatusUpdater: {},
        publisherRouter: {},
        errorPublisher: {},
    };

    environment.jobStatusUpdater = new JobStatusUpdater(logger);
    environment.publisherRouter = new PublisherRouter(logger, config, metrics, environment.jobStatusUpdater);
    environment.errorPublisher = new ErrorPublisher(logger, config);

    return environment;
}

function registerHandlers(logger, config, environment) {
    var handlerRegistry = new HandlerRegistry(environment);
    handlerRegistry.register(logger, config, environment, errorRequestType, require('./error-request-handler'));
    handlerRegistry.register(logger, config, environment, startRequestType, require('./start-request-handler'));
    handlerRegistry.register(logger, config, environment, completeRequestType, require('./complete-request-handler'));

    return handlerRegistry;
}


function startWorkers(config, handlerRegistry, environment, profileJobTypes) {
    // first 'normalize' the beanstalk connection properties
    // based on a key of address, port, and tubename

    var connectionMap = {};
    _.each(profileJobTypes, function(jobType) {
        if (!_.isUndefined(config.beanstalk.jobTypes[jobType]) && !_.isUndefined(config.beanstalk.jobTypes[jobType].host)) {
            var connectInfo = config.beanstalk.jobTypes[jobType];
            var beanstalkString = format('%s:%s/%s', connectInfo.host, connectInfo.port, connectInfo.tubename);
            connectionMap[beanstalkString] = connectInfo;
            return;
        }

        logger.warn('host.startWorkers no beanstalk config found for job type %s', jobType);
    });

    var workers = _.map(connectionMap, function(beanstalkJobTypeConfig, beanstalkString) {
        logger.debug('host.startWorkers(): creating worker %s', beanstalkString);
        return new Worker(logger, beanstalkJobTypeConfig, metrics, handlerRegistry, environment.jobStatusUpdater, environment.errorPublisher, true);
    });

    _.each(workers, function(worker) {
        worker.start(function(err) {
            logger.info('Start worker %s:%s/%s', worker.beanstalkJobTypeConfig.host, worker.beanstalkJobTypeConfig.worker, this.beanstalkJobTypeConfig.tubename);
            if (err) {
                logger.error(err);
            }
        });
    });

    return workers;
}