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
nconf.required(['log-level', 'beanstalk', 'jdsServer', 'generalPurposeJdsServer', 'jbpm', 'vistaSites', 'activityManagementJobRetryLimit', 'oracledb']);

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

var ACTIVITY_REQUEST_TYPE = 'activity-management-event';
var ERROR_REQUEST_TYPE = 'error-request';

// call this utility to fill in the properties on each tube
config.beanstalk = QueueConfig.createFullBeanstalkConfig(nconf.get('beanstalk'));
config.jdsServer = nconf.get('jdsServer');
config.generalPurposeJdsServer = nconf.get('generalPurposeJdsServer');
config.jbpm = nconf.get('jbpm');
config.oracledb = nconf.get('oracledb');
config.vistaSites = nconf.get('vistaSites');
config.activityManagementJobRetryLimit = nconf.get('activityManagementJobRetryLimit');
config.defaultWorkerCount = nconf.get('defaultWorkerCount');
config.beanstalk.handlerJobTypes = nconf.get('beanstalk').handlerJobTypes;
config.appDynamicsProfile = nconf.get('appDynamicsProfile');

if (config.appDynamicsProfile) {
    logger.debug('appDynamicsProfile object detected on configuration - requiring appdynamics');
    require('appdynamics').profile(config.appDynamicsProfile);
}

var app = express();
app.config = config;
app.logger = logger;
pidValidator.initialize(app);

kill.logKill(app, null);
logger.warn('Activity handler starting. Log level: %s', logLevel);
logger.info('UV_THREADPOOL_SIZE = %s', process.env.UV_THREADPOOL_SIZE);

startHost(logger, config);

//////////////////////////////////////////////////////////////////////////////
//  EXECUTE ON STARTUP
//////////////////////////////////////////////////////////////////////////////

function startHost(logger, config) {
    logger.debug('rdk-activity-handler.startHost()');

    var environment = buildEnvironment(logger, config);
    var handlerRegistry = registerHandlers(logger, config, environment);

    var handlerJobTypes = config.beanstalk.handlerJobTypes;

    return startWorkers(config, handlerRegistry, environment, handlerJobTypes);
}

function buildEnvironment(logger, config) {
    logger.debug('rdk-activity-handler.buildEnvironment()');

    var environment = {
        jobStatusUpdater: {},
        publisherRouter: {},
        errorPublisher: {}
    };

    //publish will try to update the job's status in jds but we don't need to do that here
    environment.jobStatusUpdater.createJobStatus = function(job, callback) { return callback(null); };

    environment.publisherRouter = new PublisherRouter(logger, config, metrics, environment.jobStatusUpdater);
    environment.errorPublisher = new ErrorPublisher(logger, config, ERROR_REQUEST_TYPE);

    return environment;
}

function registerHandlers(logger, config, environment) {
    var handlerRegistry = new HandlerRegistry(environment);
    handlerRegistry.register(config, ACTIVITY_REQUEST_TYPE, handler);
    return handlerRegistry;
}

function validConnectInfo(connectInfo) {
    var valid = false;
    if (!_.isUndefined(connectInfo) && !_.isNull(connectInfo) && !_.isUndefined(connectInfo.host) && !_.isNull(connectInfo.host) &&
        !_.isUndefined(connectInfo.port) && !_.isNull(connectInfo.port) && !_.isUndefined(connectInfo.tubename) && !_.isNull(connectInfo.tubename)) {
        valid = true;
    }
    return valid;
}

function startWorkers(config, handlerRegistry, environment, handlerJobTypes) {
    logger.debug('rdk-activity-handler.startWorkers(): handlerJobTypes: %s', handlerJobTypes);

    var defaultWorkerCount = config.defaultWorkerCount;
    if (!defaultWorkerCount) {
        logger.warn('Activity handler contained no valid defaultWorkerCount setting in config, setting it to 1');
        defaultWorkerCount = 1;
    }

    var connectionMap = {};
    _.each(handlerJobTypes, function(jobType) {
        logger.debug('rdk-activity-handler.startWorkers(): create workers for job type: "%s"', jobType);

        var connectInfo = config.beanstalk.jobTypes[jobType];
        if (validConnectInfo(connectInfo)) {
            var workerCount;

            if (connectInfo.workerCount && _.isNumber(connectInfo.workerCount) && (connectInfo.workerCount >= 1)) {
                workerCount = connectInfo.workerCount;
            } else {
                workerCount = defaultWorkerCount;
                logger.warn({
                    defaultWorkerCount: defaultWorkerCount
                }, 'activityHandler.startWorkers: Not a valid workerCount setting in config. Using the default value');
            }

            logger.debug({
                workerCount: workerCount,
                jobType: jobType
            }, 'activityHandler.startWorkers: Creating workers for jobType');

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
        }, 'rdk-activity-handler.startWorkers(): create %s worker(s) for tube: "%s"', beanstalkJobTypeConfig.workerCount, beanstalkJobTypeConfig.tubename);

        return new Worker(logger, beanstalkJobTypeConfig, metrics, handlerRegistry, environment.jobStatusUpdater, environment.errorPublisher, true);
    });

    _.each(workers, function(worker) {
        worker.start(function(err) {
            logger.info({
                beanstalkJobTypeConfig: worker.beanstalkJobTypeConfig
            }, 'rdk-activity-handler.startWorkers(): Started worker with config ');
            if (err) {
                logger.error(err);
            }
        });
    });

    return workers;
}
