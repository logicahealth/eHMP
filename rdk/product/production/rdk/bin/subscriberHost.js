'use strict';

var format = require('util').format;
var _ = require('underscore');
var bunyan = require('bunyan');
var nconf = require('nconf');
var path = require('path');
var express = require('express');

var Worker = require('job-framework').Worker;
var HandlerRegistry = require('job-framework').HandlerRegistry;
var PublisherRouter = require('job-framework').PublisherRouter;
var ErrorPublisher = require('job-framework').ErrorPublisher;
var QueueConfig = require('job-framework').QueueConfig;

var handler = require('../src/handler/activity/activity-management-event-handler');

var rdk = require('../src/core/rdk');
var pidValidator = rdk.utils.pidValidator;

var argv = require('yargs')
    .usage('Usage: --log-level <log-level>')
    .alias('l', 'log-level')
    .argv;

var configPath = path.join(__dirname, '..', 'config/activity_handler.json');
nconf
    .argv()
    .env()
    .file('conf', configPath);
var config = {};

var logger = require('bunyan').createLogger({
    name: 'host-logger',
    level: argv['log-level'] || nconf.get('log-level')
});

var metrics = bunyan.createLogger({
    name: 'host-metrics',
    level: 'warn'
});

var activityRequestType = 'activity-management-event';

// call this utility to fill in the properties on each tube
config.beanstalk = QueueConfig.createFullBeanstalkConfig(nconf.get('beanstalk'));
config.rdk = nconf.get('rdk');
config.jdsServer =  nconf.get('jdsServer');
config.generalPurposeJdsServer =  nconf.get('generalPurposeJdsServer');
config.jbpm = nconf.get('jbpm');
config.vistaSites = nconf.get('vistaSites');

var app = express();
app.config = config;
app.logger = logger;
pidValidator.initialize(app);

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
        errorPublisher: {}
    };

    environment.publisherRouter = new PublisherRouter(logger, config, metrics, environment.jobStatusUpdater);
    environment.errorPublisher = new ErrorPublisher(logger, config, 'error-request');

    return environment;
}

function registerHandlers(logger, config, environment) {
    var handlerRegistry = new HandlerRegistry(environment);
    handlerRegistry.register(logger, config, environment, activityRequestType, handler);

    return handlerRegistry;
}


function startWorkers(config, handlerRegistry, environment, profileJobTypes) {
    var worker = new Worker(logger, config.beanstalk.jobTypes[activityRequestType], metrics, handlerRegistry, environment.jobStatusUpdater, environment.errorPublisher, true);
    worker.start(function(err) {
        logger.info('Start worker %s:%s/%s', worker.beanstalkJobTypeConfig.host, worker.beanstalkJobTypeConfig.worker, this.beanstalkJobTypeConfig.tubename);
        if (err) {
            logger.error(err);
        }
    });

    return [worker];
}
