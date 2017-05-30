'use strict';

require('./env-setup');

var format = require('util').format;
var cluster = require('cluster');
var _ = require('underscore');
var moment = require('moment');

var Worker = require(global.VX_JOBFRAMEWORK).Worker;
var HandlerRegistry = require(global.VX_JOBFRAMEWORK).HandlerRegistry;
var queueConfig = require(global.VX_JOBFRAMEWORK).QueueConfig;
var jobUtil = require(global.OSYNC_UTILS + 'osync-job-utils');
var objUtil = require(global.VX_UTILS + 'object-utils');
var pollerUtils = require(global.VX_UTILS + 'poller-utils');
var config = require(global.VX_ROOT + 'worker-config');
var logUtil = require(global.VX_UTILS + 'log');

logUtil.initialize(config, 'osync');

var logger = logUtil.get('subscriberHost', 'host');

//////////////////////////////////////////////////////////////////////////////
//  EXECUTE ON STARTUP
//////////////////////////////////////////////////////////////////////////////

var options = pollerUtils.parseSubscriberOptions(logger, config.osync, 8770);

var workers = [];
var startup = null;

// COMMENT OUT NOTE:   This was commented our rather than deleted.   Currently we do not want this module to
//                     be watching and handling config notification events.   Any change to config should
//                     be handled by a start and stop of this system.   But in the future if it was determined
//                     that this module shouild monitor for on the fly changes in config - the uncomment out
//                     this code.
//---------------------------------------------------------------------------------------------------------------
// config.addChangeCallback('osync-subscriberHost.js', function(){
//     logger.info('subscriberHost  config change detected. Stopping workers');
//     _.each(workers, function(worker){
//         worker.stop();
//     });
//     logger.info('subscriberHost  starting new workers');
//     if (startup) {
//         startup();
//     }
// }, false);

queueConfig.createFullBeanstalkConfig(config.osync.beanstalk);
logger.info('config.osync.beanstalk: ' + JSON.stringify(config.osync.beanstalk));

config.osync.vistaSites = config.vistaSites;

process.on('uncaughtException', function (err) {
    var now =  moment().format();
    logger.error('An uncaught exception occurred at: ' + now + '. The process is being terminated with error: ' + err);
    console.error('An uncaught exception occurred at: ' + now + '. The process is being terminated with error: ' + err.message);
    console.error(err.stack);
    process.exit(1);
});

// if only one profile with only one instance, then do not use node.fork:
if (cluster.isMaster) {
    if (options.processList.length === 1) {
        startup = startSubscriberHost.bind(null, logger, config, options.port, _.first(options.processList));
        startup();
        return;
    }

    _.each(options.processList, function(profileName) {
        cluster.fork({
            osyncprofile: profileName
        });
    });
} else {
    startup = startSubscriberHost.bind(null, logger, config, options.port, process.env.osyncprofile);
    startup();
}

function startSubscriberHost(logger, config, port, profile) {
    logger.info('starting osync using profile "%s"', profile);

    var profileJobTypes = config.osync.handlerProfiles.profileCollection[profile];

    logger.info('handling %s job types: %j', profileJobTypes.length, profileJobTypes);

    var environment = pollerUtils.buildOsyncEnvironment(logger, config);
    var handlerRegistry = registerHandlers(logger, config.osync, environment);

    workers = startWorkers(config.osync, handlerRegistry, environment, profileJobTypes, true, profile);
}


function registerHandlers(logger, config, environment) {
    var handlerRegistry = new HandlerRegistry(environment);

    handlerRegistry.register(config, jobUtil.admissionsJobType(), require(global.OSYNC_HANDLERS + 'admissions/admissions'));
    handlerRegistry.register(config, jobUtil.appointmentsJobType(), require(global.OSYNC_HANDLERS + 'appointments/appointments'));
    handlerRegistry.register(config, jobUtil.syncJobType(), require(global.OSYNC_HANDLERS + 'sync/sync'));
    handlerRegistry.register(config, jobUtil.patientListJobType(), require(global.OSYNC_HANDLERS + 'patientlist/patientlist'));

    return handlerRegistry;
}


function startWorkers(osyncConfig, handlerRegistry, environment, profileJobTypes, autostart, profile) {
    // first 'normalize' the beanstalk connection properties
    // based on a key of address, port, and tubename

    var defaultWorkerCount = objUtil.getProperty(osyncConfig, 'handlerProfiles', 'defaultWorkerCount');
    if (!defaultWorkerCount) {
        defaultWorkerCount = 1;
    }


    logger.debug('osync-subscriberHost.startWorkers: profile: %s; profileJobTypes: %j', profile, profileJobTypes);
    var connectionMap = {};
    _.each(profileJobTypes, function(jobSettings, jobType) {
        logger.debug('osync-subscriberHost.startWorkers: jobType: %j; jobSettings: %j', jobType, jobSettings);
        if(!_.isUndefined(osyncConfig.beanstalk.jobTypes[jobType]) && !_.isUndefined(osyncConfig.beanstalk.jobTypes[jobType].host)) {
            var workerCount;
            if ((jobSettings) && (jobSettings.workerCount) && (_.isNumber(jobSettings.workerCount)) && (jobSettings.workerCount >= 1)) {
                workerCount = jobSettings.workerCount;
            } else {
                workerCount = defaultWorkerCount;
                logger.info('osync-subscriberHost.startWorkers: Profile: %s and JobType: %s contained no valid workerCount setting in worker-config.json.  Using the default value of: %d', profile, jobType, defaultWorkerCount);
                logger.warn('osync-subscriberHost.startWorkers: Profile: %s and JobType: %s contained no valid workerCount setting in worker-config.json.  Using the default value of: %d', profile, jobType, defaultWorkerCount);
            }
            var connectInfo = osyncConfig.beanstalk.jobTypes[jobType];

            logger.debug('osync-subscriberHost.startWorkers: Creating %d workers for Profile: %s', workerCount, profile);
            _.times(workerCount, function(i) {
                var beanstalkString = format('%s:%s/%s/%d', connectInfo.host, connectInfo.port, connectInfo.tubename, i);
                connectionMap[beanstalkString] = connectInfo;
                logger.debug('osync-subscriberHost.startWorkers: Created worker for Profile: %s workerId: %s', profile, beanstalkString);
            });
        } else {
            logger.warn('subscriberHost.startWorkers no beanstalk config found for job type %s', jobType);
        }
    });

    var workers = _.map(connectionMap, function(beanstalkJobTypeConfig, beanstalkString) {
        logger.debug('subscriberHost.startWorkers(): creating worker %s', beanstalkString);
        return new Worker(logUtil.get('worker'), beanstalkJobTypeConfig, environment.metrics, handlerRegistry, environment.jobStatusUpdater, autostart);
    });

    _.each(workers, function(worker) {
        worker.start(function(err) {
            logger.info('Start worker %s:%s/%s', worker.beanstalkJobTypeConfig.host, worker.beanstalkJobTypeConfig.worker, this.beanstalkJobTypeConfig.tubename);
            if (err) {
                logger.error(err);
            }
        });
    });

    _.each(workers, function(worker) {
        worker.resume();
    });

    return workers;
}
