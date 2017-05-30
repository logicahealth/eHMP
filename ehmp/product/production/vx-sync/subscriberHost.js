'use strict';

require('./env-setup');

var format = require('util').format;
var cluster = require('cluster');
var _ = require('underscore');

var Worker = require(global.VX_JOBFRAMEWORK).Worker;
var HandlerRegistry = require(global.VX_JOBFRAMEWORK).HandlerRegistry;
var objUtil = require(global.VX_UTILS + 'object-utils');
var jobUtil = require(global.VX_UTILS + 'job-utils');
var pollerUtils = require(global.VX_UTILS + 'poller-utils');
var config = require(global.VX_ROOT + 'worker-config');
var logUtil = require(global.VX_UTILS + 'log');
var moment = require('moment');
logUtil.initialize(config);

var logger = logUtil.get('subscriberHost', 'host');
var healthcheckUtils = require(global.VX_UTILS + 'healthcheck-utils');


// var JobStatusUpdater = require(global.VX_SUBSYSTEMS + 'jds/JobStatusUpdater');
// console.log('JobStatusUpdater')
// console.log(JobStatusUpdater)

// console.log()
// console.log('HandlerRegistry')
// console.log(HandlerRegistry)
// console.log()
// console.log('Worker')
// console.log(Worker)
// process.exit();
//////////////////////////////////////////////////////////////////////////////
//  EXECUTE ON STARTUP
//////////////////////////////////////////////////////////////////////////////

var options = pollerUtils.parseSubscriberOptions(logger, config);

var workers = [];
var startup = null;
var profile = options.profile;
var processName = process.env.VXSYNC_LOG_SUFFIX;
var processStartTime = moment().format('YYYYMMDDHHmmss');

// COMMENT OUT NOTE:   This was commented our rather than deleted.   Currently we do not want this module to
//                     be watching and handling config notification events.   Any change to config should
//                     be handled by a start and stop of this system.   But in the future if it was determined
//                     that this module should monitor for on the fly changes in config - the uncomment out
//                     this code.
//---------------------------------------------------------------------------------------------------------------
// config.addChangeCallback('subscribeHost.js', function() {
//     logger.info('subscriberHost  config change detected. Stopping workers');
//     _.each(workers, function(worker) {
//         worker.stop();
//     });
//     logger.info('subscriberHost  starting new workers');
//     if (startup) {
//         startup();
//     }
// }, false);

process.on('SIGURG', function() {
    logger.debug('subscriberHost process id ' + process.pid + ': Got SIGURG.');
    console.log('subscriberHost process id ' + process.pid + ': Got SIGURG.');
    pauseWorkers(workers);
    listenForShutdownReady(workers);

    //TODO: move time to wait into configuration
    setTimeout(timeoutOnWaitingForShutdownReady, 30000, workers).unref();
});

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
            vxsprofile: profileName
        });
    });
} else {
    console.log('process: %s  profile "%s"', process.pid, process.env.vxsprofile);
    startup = startSubscriberHost.bind(null, logger, config, options.port, profile);
    startup();
}

//////////////////////////////////////////////////////////////////////////////
// NOTE: this file should not be cleaned out of dead code as there is much
//       work in progress which should be completed in sprint 7.E or 7.F
// Steven Reich

function startSubscriberHost(logger, config, port, profile) {
    logger.info('starting vx-sync using profile "%s"', profile);

    var profileJobTypes = config.handlerProfiles.profileCollection[profile];

    logger.info('handling %s job types: %j', profileJobTypes.length, profileJobTypes);

    var environment = pollerUtils.buildEnvironment(logger, config);
    var handlerRegistry = registerHandlers(logger, config, environment);

    workers = startWorkers(config, handlerRegistry, environment, profileJobTypes, options.autostart, profile);

    healthcheckUtils.startHeartbeat(logger, config, environment, processName, profile, processStartTime);
}


function registerHandlers(logger, config, environment) {
    var jmeadowsDomains = config.jmeadows.domains;
    var hdrDomains = config.hdr.domains;
    var handlerRegistry = new HandlerRegistry(environment);
    var hdrSites = config.hdr.hdrSites;

    handlerRegistry.register(config, jobUtil.errorRequestType(), require(global.VX_HANDLERS + 'error-request/error-request-handler'));

    handlerRegistry.register(config, jobUtil.enterpriseSyncRequestType(), require(global.VX_HANDLERS + 'enterprise-sync-request/enterprise-sync-request-handler'));
    handlerRegistry.register(config, jobUtil.vistaOperationalSubscribeRequestType(), require(global.VX_HANDLERS + 'operational-data-subscription/operational-data-subscription-handler'));

    _.each(config.vistaSites, function(site, vistaId) {
        handlerRegistry.register(vistaId, config, jobUtil.vistaSubscribeRequestType(vistaId), require(global.VX_HANDLERS + 'vista-subscribe-request/vista-subscribe-request-handler'));
    });

    _.each(hdrSites, function(site, siteId) {
        handlerRegistry.register(siteId, config, jobUtil.vistahdrSubScribeRequestType(siteId), require(global.VX_HANDLERS + 'vista-subscribe-request/vista-subscribe-request-handler'));
    });

    handlerRegistry.register(config, jobUtil.hdrSyncRequestType(), require(global.VX_HANDLERS + 'hdr-sync-request/hdr-sync-request-handler'));
    handlerRegistry.register(config, jobUtil.vlerSyncRequestType(), require(global.VX_HANDLERS + 'vler-sync-request/vler-sync-request-handler'));
    handlerRegistry.register(config, jobUtil.pgdSyncRequestType(), require(global.VX_HANDLERS + 'pgd-sync-request/pgd-sync-request-handler'));
    handlerRegistry.register(config, jobUtil.jmeadowsSyncRequestType(), require(global.VX_HANDLERS + 'jmeadows-sync-request/jmeadows-sync-request-handler'));

    handlerRegistry.register(config, jobUtil.vlerXformVprType(), require(global.VX_HANDLERS + 'vler-to-vpr-xform/vler-to-vpr-xform-handler'));
    handlerRegistry.register(config, jobUtil.pgdXformVprType(), require(global.VX_HANDLERS + 'pgd-to-vpr-xform/pgd-to-vpr-xform-handler'));

    _.each(jmeadowsDomains, function(domain) {
        handlerRegistry.register(config, jobUtil.jmeadowsDomainSyncRequestType(domain), require(global.VX_HANDLERS + 'jmeadows-sync-domain-request/jmeadows-sync-domain-request-handler'));
        handlerRegistry.register(config, jobUtil.jmeadowsDomainXformVprType(domain), require(global.VX_HANDLERS + 'jmeadows-xform-domain-vpr/jmeadows-xform-domain-vpr-handler'));
    });

    _.each(hdrDomains, function(domain) {
        handlerRegistry.register(config, jobUtil.hdrDomainSyncRequestType(domain), require(global.VX_HANDLERS + 'hdr-sync-domain-request/hdr-sync-domain-request-handler'));
        handlerRegistry.register(config, jobUtil.hdrDomainXformVprType(domain), require(global.VX_HANDLERS + 'hdr-xform-domain-vpr/hdr-xform-domain-vpr-handler'));
    });

    handlerRegistry.register(config, jobUtil.jmeadowsPdfDocumentTransformType(), require(global.VX_HANDLERS + 'jmeadows-document/jmeadows-pdf-document-transform-handler'));
    handlerRegistry.register(config, jobUtil.jmeadowsDocRetrievalType(), require(global.VX_HANDLERS + 'jmeadows-document/jmeadows-pdf-request-handler'));

    handlerRegistry.register(config, jobUtil.jmeadowsCdaDocumentConversionType(), require(global.VX_HANDLERS + 'jmeadows-document/jmeadows-cda-document-conversion-handler'));

    handlerRegistry.register(config, jobUtil.recordEnrichmentType(), require(global.VX_HANDLERS + 'record-enrichment-request/record-enrichment-request-handler'));

    handlerRegistry.register(config, jobUtil.eventPrioritizationRequestType(), require(global.VX_HANDLERS + 'event-prioritization-request/event-prioritization-request-handler'));

    handlerRegistry.register(config, jobUtil.vistaRecordProcessorRequestType(), require(global.VX_HANDLERS + 'vista-record-processor/vista-record-processor-handler'));

    handlerRegistry.register(config, jobUtil.operationalDataStoreType(), require(global.VX_HANDLERS + 'operational-data-store-request/operational-data-store-request-handler'));

    handlerRegistry.register(config, jobUtil.storeRecordType(), require(global.VX_HANDLERS + 'store-record-request/store-record-request-handler'));
    handlerRegistry.register(config, jobUtil.solrRecordStorageType(), require(global.VX_HANDLERS + 'solr-record-storage/solr-record-storage-handler'));
    handlerRegistry.register(config, jobUtil.publishVxDataChangeType(), require(global.VX_HANDLERS + 'publish-vx-data-change-request/publish-vx-data-change-request-handler'));

    handlerRegistry.register(config, jobUtil.resyncRequestType(), require(global.VX_HANDLERS + 'resync-request/resync-request-handler'));
    handlerRegistry.register(config, jobUtil.recordUpdateType(), require(global.VX_HANDLERS + 'record-update/record-update-handler'));

    handlerRegistry.register(config, jobUtil.patientRecordRetirementType(), require(global.VX_HANDLERS + 'patient-record-retirement/patient-record-retirement-handler'));

    return handlerRegistry;
}


function startWorkers(config, handlerRegistry, environment, profileJobTypes, autostart, profile) {
    // first 'normalize' the beanstalk connection properties
    // based on a key of address, port, and tubename

    var defaultWorkerCount = objUtil.getProperty(config, 'handlerProfiles', 'defaultWorkerCount');
    if (!defaultWorkerCount) {
        defaultWorkerCount = 1;
    }

    logger.debug('subscriberHost.startWorkers: profile: %s; profileJobTypes: %j', profile, profileJobTypes);
    var connectionMap = {};
    _.each(profileJobTypes, function(jobSettings, jobType) {
        logger.debug('subscriberHost.startWorkers: jobType: %j; jobSettings: %j', jobType, jobSettings);
        if (!_.isUndefined(config.beanstalk.jobTypes[jobType]) && !_.isUndefined(config.beanstalk.jobTypes[jobType].host)) {
            var workerCount;
            if ((jobSettings) && (jobSettings.workerCount) && (_.isNumber(jobSettings.workerCount)) && (jobSettings.workerCount >= 1)) {
                workerCount = jobSettings.workerCount;
            } else {
                workerCount = defaultWorkerCount;
                logger.info('subscriberHost.startWorkers: Profile: %s and JobType: %s contained no valid workerCount setting in worker-config.json.  Using the default value of: %d', profile, jobType, defaultWorkerCount);
                logger.warn('subscriberHost.startWorkers: Profile: %s and JobType: %s contained no valid workerCount setting in worker-config.json.  Using the default value of: %d', profile, jobType, defaultWorkerCount);
            }
            var connectInfo = config.beanstalk.jobTypes[jobType];

            logger.debug('subscriberHost.startWorkers: Creating %d workers for Profile: %s', workerCount, profile);
            _.times(workerCount, function(i) {
                var beanstalkString = format('%s:%s/%s/%d', connectInfo.host, connectInfo.port, connectInfo.tubename, i);
                connectionMap[beanstalkString] = connectInfo;
                logger.debug('subscriberHost.startWorkers: Created worker for Profile: %s workerId: %s', profile, beanstalkString);
            });
        } else {
            logger.warn('subscriberHost.startWorkers no beanstalk config found for job type %j', jobType);
        }
    });

    var workers = _.map(connectionMap, function(beanstalkJobTypeConfig, beanstalkString) {
        logger.debug('subscriberHost.startWorkers(): creating worker %s', beanstalkString);
        return new Worker(logUtil.get('worker'), beanstalkJobTypeConfig, environment.metrics, handlerRegistry, environment.jobStatusUpdater, environment.errorPublisher, autostart);
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

function pauseWorkers(workers) {
    logger.info('subscriberHost process id ' + process.pid + ': pausing workers.');
    console.log('subscriberHost process id ' + process.pid + ': pausing workers.');
    _.each(workers, function(worker) {
        worker.pause();
    });
}

function listenForShutdownReady(workers) {
    var readyToShutdown = _.every(workers, function(worker) {
        return worker.isReadyToShutdown();
    });

    var remainingWorkers = getListOfWorkersNotReadyForShutdown(workers);

    if (!readyToShutdown) {
        logger.info('subscriberHost process id ' + process.pid + ': Still waiting for workers to finish current job. Remaining workers: %s', remainingWorkers);
        console.log('subscriberHost process id ' + process.pid + ': Still waiting for workers to finish current job. Remaining workers: %s', remainingWorkers);
        setTimeout(listenForShutdownReady, 1000, workers);
    } else {
        logger.info('subscriberHost process id ' + process.pid + ': Shutting down!');
        console.log('subscriberHost process id ' + process.pid + ': Shutting down!');
        process.exit(0);
    }
}

function getListOfWorkersNotReadyForShutdown(workers) {
    var remainingWorkers = _.filter(workers, function(worker) {
        return !worker.isReadyToShutdown();
    });

    var remainingWorkerNames = _.map(remainingWorkers, function(worker) {
        return worker.getTubeName();
    });

    return remainingWorkerNames;
}

//Quits process if workers are taking too long to finish
//Displays list of workers that will be interrupted
function timeoutOnWaitingForShutdownReady(workers) {
    var remainingWorkers = _.filter(workers, function(worker) {
        return !worker.isReadyToShutdown();
    });

    var remainingWorkerNames = _.map(remainingWorkers, function(worker) {
        return worker.getTubeName();
    });

    logger.error('subscriberHost process id ' + process.pid + ': Timeout on waiting for workers to finish current jobs. Interrupting workers: %s', remainingWorkerNames);
    console.log('subscriberHost process id ' + process.pid + ': Timeout on waiting for workers to finish current jobs. Interrupting workers: %s', remainingWorkerNames);
    process.exit(1);
}
