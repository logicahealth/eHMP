'use strict';

require('./env-setup');

var _ = require('underscore');

var ErrorProcessor = require(global.VX_ERROR_PROCESSING + 'error-processor');
var pollerUtils = require(global.VX_UTILS + 'poller-utils');
var config = require(global.VX_ROOT + 'worker-config');
var logUtil = require(global.VX_UTILS + 'log');
var moment = require('moment');
logUtil.initialize(config);

var logger = logUtil.get('errorProcessorHost', 'host');
var healthcheckUtils = require(global.VX_UTILS + 'healthcheck-utils');

//////////////////////////////////////////////////////////////////////////////
//  EXECUTE ON STARTUP
//////////////////////////////////////////////////////////////////////////////
var options = pollerUtils.parseErrorProcessorOptions(logger, config);
var processors = [];
var startup = null;
var processName = process.env.VXSYNC_LOG_SUFFIX;
var processStartTime = moment().format('YYYYMMDDHHmmss');

// COMMENT OUT NOTE:   This was commented our rather than deleted.   Currently we do not want this module to
//                     be watching and handling config notification events.   Any change to config should
//                     be handled by a start and stop of this system.   But in the future if it was determined
//                     that this module shouild monitor for on the fly changes in config - the uncomment out
//                     this code.
//---------------------------------------------------------------------------------------------------------------
// config.addChangeCallback('errorProcessorHost.js', function() {
//     logger.info('errorProcessorHost  config change detected. Stopping workers');
//     _.each(processors, function(processor) {
//         processor.stop();
//     });
//     logger.info('errorProcessorHost  starting new workers');
//     if (startup) {
//         startup();
//     }
// }, false);

process.on('SIGURG', function() {
    logger.debug('errorProcessorHost process id ' + process.pid + ': Got SIGURG.');
    console.log('errorProcessorHost process id ' + process.pid + ': Got SIGURG.');
    pauseProcessors(processors);
    listenForShutdownReady(processors);

    //FUTURETODO: move time to wait into configuration
    setTimeout(timeoutOnWaitingForShutdownReady, 30000, processors).unref();
});

startup = startErrorProcessorHost.bind(null, logger, config, options.profiles, options.autostart);
startup();


function startErrorProcessorHost(logger, config, profiles, autostart) {
    logger.info('starting error processing');
    logger.info('running %s profiles: %j', profiles.length, profiles);

    var environment = pollerUtils.buildEnvironment(logger, config);

    startProcessors(config, environment, profiles, autostart);

    healthcheckUtils.startHeartbeat(logger, config, environment, processName, profiles, processStartTime);
}


function startProcessors(config, environment, processors, autostart) {
    var processorList = _.map(processors, function(processorName) {
        logger.debug('errorProcessorHost.startProcessors(): creating error-processor %s', processorName);
        return new ErrorProcessor(logUtil.get('error-processor'), config, environment, processorName);
    });

    if (autostart) {
        _.each(processorList, function(processor) {
            processor.start(function(err) {
                logger.info('Start processor %s', processor.name);
                if (err) {
                    logger.error(err);
                }
            });
        });
    }

    return processorList;
}

function pauseProcessors(processorList) {
    logger.info('errorProcessorHost process id ' + process.pid + ': pausing processors.');
    console.log('errorProcessorHost process id ' + process.pid + ': pausing processors.');
    _.each(processorList, function(processor) {
        processor.pause();
    });
}

function listenForShutdownReady(processorList) {
    var readyToShutdown = _.every(processorList, function(processor) {
        return processor.isReadyToShutdown();
    });

    var remainingProcessors = getListOfProcessorsNotReadyForShutdown(processorList);

    if (!readyToShutdown) {
        logger.info('errorProcessorHost process id ' + process.pid + ': Still waiting for processors to finish current job. Remaining processors: %s', remainingProcessors);
        console.log('errorProcessorHost process id ' + process.pid + ': Still waiting for processors to finish current job. Remaining processors: %s', remainingProcessors);
        setTimeout(listenForShutdownReady, 1000, processorList);
    } else {
        logger.info('errorProcessorHost process id ' + process.pid + ': Shutting down!');
        console.log('errorProcessorHost process id ' + process.pid + ': Shutting down!');
        process.exit(0);
    }
}

function getListOfProcessorsNotReadyForShutdown(processors) {
    var remainingProcessors = _.filter(processors, function(processor) {
        return !processor.isReadyToShutdown();
    });

    var remainingProcessorNames = _.map(remainingProcessors, function(processor) {
        return processor.name;
    });

    return remainingProcessorNames;
}

//Quits process if processors are taking too long to finish
//Displays list of processors that will be interrupted
function timeoutOnWaitingForShutdownReady(processors) {
    var remainingWorkers = _.filter(processors, function(worker) {
        return !worker.isReadyToShutdown();
    });

    var remainingWorkerNames = _.map(remainingWorkers, function(worker) {
        return worker.getTubeName();
    });

    logger.error('errorProcessorHost process id ' + process.pid + ': Timeout on waiting for processors to finish current jobs. Interrupting processors: %s', remainingWorkerNames);
    console.log('errorProcessorHost process id ' + process.pid + ': Timeout on waiting for processors to finish current jobs. Interrupting processors: %s', remainingWorkerNames);
    process.exit(1);
}