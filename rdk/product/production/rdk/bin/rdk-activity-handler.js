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

var activityRequestType = 'activity-management-event';

// call this utility to fill in the properties on each tube
config.beanstalk = QueueConfig.createFullBeanstalkConfig(nconf.get('beanstalk'));
config.jdsServer = nconf.get('jdsServer');
config.generalPurposeJdsServer = nconf.get('generalPurposeJdsServer');
config.jbpm = nconf.get('jbpm');
config.vistaSites = nconf.get('vistaSites');
config.activityManagementJobRetryLimit = nconf.get('activityManagementJobRetryLimit');
config.defaultWorkerCount = nconf.get('defaultWorkerCount');

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
    handlerRegistry.register(config, activityRequestType, handler);

    return handlerRegistry;
}

function validConnectInfo(connectInfo) {
    var valid = false;
    if (!_.isUndefined(connectInfo) && !_.isNull(connectInfo) && !_.isUndefined(connectInfo.host) && !_.isNull(connectInfo.host)
        && !_.isUndefined(connectInfo.port) && !_.isNull(connectInfo.port) && !_.isUndefined(connectInfo.tubename) && !_.isNull(connectInfo.tubename)) {
        valid = true;
    }
    return valid;
}

function startWorkers(config, handlerRegistry, environment, profileJobTypes) {

    var defaultWorkerCount = config.defaultWorkerCount;

    if (!defaultWorkerCount) {
        logger.warn('Activity handler contained no valid defaultWorkerCount setting in config, setting it to 1');
        defaultWorkerCount = 1;
    }
    var connectionMap = {};
    _.each(profileJobTypes, function(jobType) {
        var connectInfo = config.beanstalk.jobTypes[jobType];
        if (validConnectInfo(connectInfo)) {
            var workerCount;
            if (connectInfo.workerCount && _.isNumber(connectInfo.workerCount) && (connectInfo.workerCount >= 1)) {
                workerCount = connectInfo.workerCount;
            } else {
                workerCount = defaultWorkerCount;
                logger.debug({
                    defaultWorkerCount: defaultWorkerCount
                }, 'activityHandler.startWorkers: Not a valid  workerCount setting in config. Using the default value ');
                logger.warn({
                    defaultWorkerCount: defaultWorkerCount
                }, 'activityHandler.startWorkers: Not a valid  workerCount setting in config. Using the default value ');
            }

            logger.debug({
                workerCount: workerCount,
                jobType: jobType
            }, 'activityHandler.startWorkers: Creating workers for jobType ');
            _.times(workerCount, function(i) {
                var beanstalkString = format('%s:%s/%s/%d', connectInfo.host, connectInfo.port, connectInfo.tubename, i);
                connectionMap[beanstalkString] = connectInfo;
                logger.debug({
                    jobType: jobType,
                    workerId: beanstalkString
                }, 'activityHandler.startWorkers: Determined worker config');
            });
        } else {
            logger.warn({
                jobType: jobType
            }, 'activityHandler.startWorkers no beanstalk config found for job type ');
        }
    });

    var workers = _.map(connectionMap, function(beanstalkJobTypeConfig, beanstalkString) {
        logger.debug({
            beanstalkString: beanstalkString
        }, 'activityHandler.startWorkers(): creating worker ');
        return new Worker(logger, beanstalkJobTypeConfig, metrics, handlerRegistry, environment.jobStatusUpdater, environment.errorPublisher, true);
    });

    _.each(workers, function(worker) {
        worker.start(function(err) {
            logger.info({
                beanstalkJobTypeConfig: worker.beanstalkJobTypeConfig
            }, 'activityHandler.startWorkers(): Started worker with config ');
            if (err) {
                logger.error(err);
            }
        });
    });
    return workers;
}
