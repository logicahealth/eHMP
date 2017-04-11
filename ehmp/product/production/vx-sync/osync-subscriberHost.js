'use strict';

require('./env-setup');

var format = require('util').format;
var cluster = require('cluster');
var _ = require('underscore');

var Worker = require(global.VX_JOBFRAMEWORK + 'worker');
var HandlerRegistry = require(global.VX_JOBFRAMEWORK + 'handlerRegistry');
var queueConfig = require(global.VX_JOBFRAMEWORK + 'queue-config.js');
var jobUtil = require(global.VX_UTILS + 'osync-job-utils');
var pollerUtils = require(global.VX_UTILS + 'poller-utils');
var config = require(global.VX_ROOT + 'worker-config');
var logUtil = require(global.VX_UTILS + 'log');
logUtil.initialize(config.osync.loggers);

var logger = logUtil.get('subscriberHost', 'host');

//////////////////////////////////////////////////////////////////////////////
//  EXECUTE ON STARTUP
//////////////////////////////////////////////////////////////////////////////

var options = pollerUtils.parseSubscriberOptions(logger, config.osync, 8770);
var workers = [];
var startup = null;

config.addChangeCallback(function(){
    logger.info('subscriberHost  config change detected. Stopping workers');
    _.each(workers, function(worker){
        worker.stop();
    });
    logger.info('subscriberHost  starting new workers');
    if (startup) {
        startup();
    }
}, false);

config.beanstalk = queueConfig.createFullBeanstalkConfig(config.osync.beanstalk);
logger.info('config.beanstalk: ' + JSON.stringify(config.beanstalk));

config.osync.vistaSites = config.vistaSites;

// var app = express();

// if only one profile with only one instance, then do not use node.fork:
if (cluster.isMaster) {
    // if (options.endpoint) {
    //     app.listen(options.port);
    //     logger.info('subscriberEndpoint() endpoint listening on port %s', options.port);
    // }

    if (options.processList.length === 1) {
        startup = startSubscriberHost.bind(null, logger, config.osync, options.port, _.first(options.processList));
        startup();
        return;
    }

    _.each(options.processList, function(profileName) {
        cluster.fork({
            osyncprofile: profileName
        });
    });
} else {
    startup = startSubscriberHost.bind(null, logger, config.osync, options.port, process.env.osyncprofile);
    startup();
}


//////////////////////////////////////////////////////////////////////////////
// NOTE: this file should not be cleaned out of dead code as there is much
//       work in progress which should be completed in sprint 7.E or 7.F
//      n Reich

function startSubscriberHost(logger, config, port, profile) {
    logger.info('starting osync using profile "%s"', profile);

    var profileJobTypes = config.handlerProfiles.profileCollection[profile];

    logger.info('handling %s job types: %j', profileJobTypes.length, profileJobTypes);

    var environment = pollerUtils.buildOsyncEnvironment(logger, config);
    var handlerRegistry = registerHandlers(logger, config, environment);

    workers = startWorkers(config, handlerRegistry, environment, profileJobTypes, true);


    // This starts an endpoint to allow pause, resume, reset, etc.
    // if (options.endpoint) {
    //     pollerUtils.buildSubscriberEndpoint('subscriberHost', app, logger, workers, []);
    // }
}


function registerHandlers(logger, config, environment) {
    var handlerRegistry = new HandlerRegistry(environment);

    handlerRegistry.register(logger, config, environment, jobUtil.opportunisticSyncRequestType(), require(global.OSYNC_HANDLERS + 'opportunistic-sync-request/opportunistic-sync-request'));
    handlerRegistry.register(logger, config, environment, jobUtil.activeUsersJobType(), require(global.OSYNC_HANDLERS + 'active-users/active-users'));
    handlerRegistry.register(logger, config, environment, jobUtil.admissionsJobType(), require(global.OSYNC_HANDLERS + 'admissions/admissions'));
    handlerRegistry.register(logger, config, environment, jobUtil.appointmentsJobType(), require(global.OSYNC_HANDLERS + 'appointments/appointments'));
    handlerRegistry.register(logger, config, environment, jobUtil.storeJobStatusJobType(), require(global.OSYNC_HANDLERS + 'store-job-status/store-job-status'));
    handlerRegistry.register(logger, config, environment, jobUtil.syncJobType(), require(global.OSYNC_HANDLERS + 'sync/sync'));
    handlerRegistry.register(logger, config, environment, jobUtil.validationJobType(), require(global.OSYNC_HANDLERS + 'validation/validation'));
    handlerRegistry.register(logger, config, environment, jobUtil.patientListJobType(), require(global.OSYNC_HANDLERS + 'patientlist/patientlist'));

    return handlerRegistry;
}


function startWorkers(config, handlerRegistry, environment, profileJobTypes, autostart) {
    // first 'normalize' the beanstalk connection properties
    // based on a key of address, port, and tubename

    var connectionMap = {};
    _.each(profileJobTypes, function(jobType) {
        if(!_.isUndefined(config.beanstalk.jobTypes[jobType]) && !_.isUndefined(config.beanstalk.jobTypes[jobType].host)) {
            var connectInfo = config.beanstalk.jobTypes[jobType];
            var beanstalkString = format('%s:%s/%s', connectInfo.host, connectInfo.port, connectInfo.tubename);
            connectionMap[beanstalkString] = connectInfo;
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
