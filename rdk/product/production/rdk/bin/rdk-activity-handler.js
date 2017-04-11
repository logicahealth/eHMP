#!/usr/bin/env node

'use strict';

var format = require('util').format;
var _ = require('lodash');
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
var kill = require('../src/core/factory-components/rdk-signals');
var pidValidator = rdk.utils.pidValidator;

nconf.argv().env(); //config priority: command line arguments, env variables, config file (if specified), default config file
var suppliedConfig = nconf.get('config');
var defaultConfigPath = path.join(__dirname, '..', 'config/activity_handler.json');
nconf.file(suppliedConfig || defaultConfigPath);
nconf.required(['log-level', 'beanstalk', 'jdsServer', 'generalPurposeJdsServer', 'jbpm', 'vistaSites', 'activityManagementJobRetryLimit']);

var config = {};
var logLevel = nconf.get('log-level');

var logger = require('bunyan').createLogger({
    name: 'host-logger',
    level: logLevel
});

var metrics = bunyan.createLogger({
    name: 'host-metrics',
    level: 'warn'
});

var connectionPool = require('../src/utils/oracle-connection-pool');

var activityRequestType = 'activity-management-event';

// call this utility to fill in the properties on each tube
config.beanstalk = QueueConfig.createFullBeanstalkConfig(nconf.get('beanstalk'));
config.jdsServer = nconf.get('jdsServer');
config.generalPurposeJdsServer = nconf.get('generalPurposeJdsServer');
config.jbpm = nconf.get('jbpm');
config.vistaSites = nconf.get('vistaSites');
config.activityManagementJobRetryLimit = nconf.get('activityManagementJobRetryLimit');

var app = express();
app.config = config;
app.logger = logger;
pidValidator.initialize(app);

kill.logKill(app, null);
logger.warn('Activity handler starting. Log level: %s', logLevel);
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
