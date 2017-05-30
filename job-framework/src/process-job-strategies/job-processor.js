'use strict';

var async = require('async');
var _ = require('underscore');
var uuid = require('node-uuid');

var errorBuilder = require('../error-builder');

var LOWEST_PRIORITY = 1;

//---------------------------------------------------------------------------------------------
// Used by vxsync framework worker object instances to handling process of a beanstalk job
// after it has been reserved. It is expected that a worker binds itself to this function before
// the function is called.
//---------------------------------------------------------------------------------------------
module.exports.processJob = function(beanstalkJobId, tubeName, beanstalkJobPayload, callback) {
    var worker = this;

    worker.logger.debug('job-processor.processJob(%s) beanstalkJobId: %s', tubeName, beanstalkJobId);

    var doTouch = function() {
        worker.client.touch(beanstalkJobId, function(err) {
            if (err) {
                return worker.logger.error('job-processor._processJob(%s) : touching error: beanstalkJobId %s, error: %s', tubeName, beanstalkJobId, err);
            }

            worker.logger.debug('job-processor.processJob(%s): touched job with beanstalkJobId %s', tubeName, beanstalkJobId);
        });
    };

    // Parse the job
    //--------------
    var response = parseJob(beanstalkJobPayload);
    if (response.error) {
        return destroyJobAndProcessError(response.error, worker, worker.logger, tubeName, beanstalkJobId, response.job, callback);
    }
    var job = response.job;         // We know this is good because if it was not, then parseJob would have had an error.

    // Create our child logger that we will use as our logger from this point.  It will associate all the log messages
    // from this point with any data in job.referenceInfo.
    //-----------------------------------------------------------------------------------------------------------------
    var childLogger = createChildLogger(worker.logger, job);

    var environment = worker.handlerRegistry.environment;
    var childEnvironment = createChildEnvironment(childLogger, environment);

    // Get the handler
    //----------------
    response = getHandler(worker, tubeName, job);
    if (response.error) {
        return destroyJobAndProcessError(response.error, worker, childLogger, tubeName, beanstalkJobId, job, callback);
    }
    var handler = response.handler;    // We know this is good because if it was not, then getHandler would have had an error.

    // Call the Handler
    //-----------------
    callHandler(worker, childLogger, childEnvironment, doTouch, job, handler, function (error, job) {
        if (error && !_.isUndefined(error.data) && error.data === 'START_FAILED') {
            childLogger.error('job-processor.processJob(%s): error starting job state. job put back on tube.:', tubeName, error);
            return releaseJob(worker, childLogger, beanstalkJobId, tubeName, callback);
        }

        if (error) {
            return destroyJobAndProcessError(error, worker, childLogger, tubeName, beanstalkJobId, job, callback);
        }

        return destroyJobAndProcessSuccess(worker, childLogger, tubeName, beanstalkJobId, job, callback);
    });
};

//-------------------------------------------------------------------------------------------------------------
// Create the child logger by extracting the referenceInfo along with jobId, rootJobId, and priority
// information from the job and creating the referenceInfo object.  Pass that to the method that
// creates the child logger so that all log messages done using that child logger will contain the
// referenceInfo data.
//
// logger: The logger to start with.
// job: The job that contains the information to use when creating the child logger.
// returns: The child logger based on that referenceInfo.
//-----------------------------------------------------------------------------------------------------------
function createChildLogger(logger, job) {
    var childLogger = logger;

    // If we have a referenceInfo object - use that as our basis set of properties and then we will
    // fill in the extra ones.
    //---------------------------------------------------------------------------------------------
    var referenceInfo;
    if ((_.isObject(job)) && (_.isObject(job.referenceInfo)) && (!_.isEmpty(job.referenceInfo))) {
        referenceInfo = JSON.parse(JSON.stringify(job.referenceInfo));  // Make a deep copy
    } else {
        referenceInfo = {};
    }

    if (job.rootJobId) {
        referenceInfo.rootJobId = job.rootJobId;
    }

    if (job.jobId) {
        referenceInfo.jobId = job.jobId;
    }

    if (job.priority) {
        referenceInfo.priority = job.priority;
    }

    // If there is no referenceInfo data - there is no need to create a child logger.
    //-------------------------------------------------------------------------------
    if (!_.isEmpty(referenceInfo)) {
        childLogger = logger.child(referenceInfo);
    }

    return childLogger;
}

//---------------------------------------------------------------------------------------------------------------
// Creates the child environment that will be passed to each handler.
// Takes in a child logger and creates childInstances of applicable environment classes.
// This allows the handlers' calls to the shared environment classes to log the referenceInfo properly.
// Other environment variables that do not require childInstances will be retained in the child environment.
//---------------------------------------------------------------------------------------------------------------
function createChildEnvironment(childLogger, environment){
    if(!environment){
        return null;
    }

    var childEnvironment = {};

    if(environment.vistaClient){
        childEnvironment.vistaClient = environment.vistaClient.childInstance(childLogger);
    }

    if(environment.jds){
        childEnvironment.jds = environment.jds.childInstance(childLogger);
    }

    if(environment.mvi){
        childEnvironment.mvi = environment.mvi.childInstance(childLogger);
    }

    if(environment.publisherRouter){
        childEnvironment.publisherRouter = environment.publisherRouter.childInstance(childLogger);
    }

    if(environment.solr){
        childEnvironment.solr = environment.solr.childInstance(childLogger);
    }

    return _.defaults(childEnvironment, environment);
}


//---------------------------------------------------------------------------------------------------------------
// This function destroys the job and processes a successful completion of a job.
//
// worker: A handle to the worker object.
// logger: The logger to write messages to.
// tubeName: The name of the tube where the job came from.
// beansstalkJobId: The job ID as used by beanstalk for this job.
// job: The job that was being worked on.
// callback: The callback handler to call when things are done.  Error handling is really done here by
//           logging.  So once the error is logged, then the callback should be called without errors.
//----------------------------------------------------------------------------------------------------------------
function destroyJobAndProcessSuccess(worker, logger, tubeName, beanstalkJobId, job, callback ) {
    destroyJob(worker, logger, beanstalkJobId, tubeName, job, function() {
        worker.jobStatusUpdater.completeJobStatus(job, function(jobStatusError) {
            if (jobStatusError) {
                logger.error('job-processor.destroyJobAndProcessSuccess: tubeName: %s; error completing job status: ', tubeName, jobStatusError);
            }
            callback();
        });
    });
}


//---------------------------------------------------------------------------------------------------------------
// This function destroys the job and processes an error completion of a job.
//
// error: The error that triggered the call to this method.
// worker: A handle to the worker object.
// logger: The logger to write messages to.
// tubeName: The name of the tube where the job came from.
// beansstalkJobId: The job ID as used by beanstalk for this job.
// job: The job that was being worked on.
// callback: The callback handler to call when things are done.  Error handling is really done here by
//           logging.  So once the error is logged, then the callback should be called without errors.
//----------------------------------------------------------------------------------------------------------------
function destroyJobAndProcessError(error, worker, logger, tubeName, beanstalkJobId, job, callback ) {
    destroyJob(worker, logger, beanstalkJobId, tubeName, job, function() {
        processError(worker, logger, job, tubeName, error, function(processError) {
            if (processError) {
                logger.error('job-processor.destroyJobAndProcessError: tubeName: %s; error saving error state:', tubeName, processError);
            }
            callback();
        });
    });
}

//---------------------------------------------------------------------------------
// Parses JSON from beanstalk job. This returns the parsed job and if there is an
// error, then it returns the error.
//
// beanstalkJobPayload: The job from beanstalk.
// returns: A response object that will look as follows:
//             {
//                job: <The Job Object>,
//                error: <The Error Object>
//             }
//          Either of the fields may be undefined if they do not exist.  So there can
//          be a job without an error, a job with an error, or an error without a job.
//---------------------------------------------------------------------------------
function parseJob(beanstalkJobPayload) {
    // This is a vxsync-job, NOT a beanstalkJob
    var response = {};

    try {
        response.job = JSON.parse(beanstalkJobPayload);
    } catch (parseError) {
        response.error = errorBuilder.createFatal('Job invalid format');
        response.job = {type: 'unknown'};
        return response;
    }

    if (_.isUndefined(response.job.type) || _.isNull(response.job.type)) {
        response.error = errorBuilder.createFatal('No job type for job');
        response.job = {type: 'unknown'};
        return response;
    }

    return response;
}

//---------------------------------------------------------------------------------
// This method gets the handler that can process the job.
//
// worker: A handle to the worker.
// tubeName: The name of the tube being watched by this worker.
// job: The job being processed.
// returns: A response object that looks as follows:
//            {
//               handler: <TheHandler>,
//               error: <The Error Object>
//            }
//          Either of the fields may be undefined if they do not exist.  So there can
//          be a handler without an error, a handler with an error, or an error without a handler.
//---------------------------------------------------------------------------------
function getHandler(worker, tubeName, job) {
    worker.metrics.info('Dequeued Beanstalk Job',{'tubeName':tubeName, 'jobType':job.type, 'jobId':job.jobId});

    var response = {};

    response.handler = worker.handlerRegistry.get(job);

    if (!response.handler) {
        response.error = errorBuilder.createFatal('No handler for job');
    }

    return response;
}

//---------------------------------------------------------------------------------
// Calls handler function for specific job. The callback will return either an error
// and job (for logging) or the results of the handler function and the job.
//
// callback: function (error, job) - This is the async.waterfall call
//           back handler.  The async.waterfall will absorb the error parameter
//           and the results of this callback.
//             error: The error for async.waterfall to trigger it to stop or continue.
//             job: Beanstalk job to process.
//---------------------------------------------------------------------------------
function callHandler(worker, logger, environment, touchBack, job, handler, callback) {

    worker.jobStatusUpdater.startJobStatus(job, function(startJobError) {
        if (startJobError) {
            logger.warn('job-processor.callHandler(): Unable to start job status for job: %J', job);
            return callback(errorBuilder.createFatal(startJobError, 'START_FAILED'), job);
        }

        worker.metrics.info('Handler Processing',{
            'timer':'start',
            'patientIdentifier': job.patientIdentifier,
            'process':process.pid,
            'jobType':job.type,
            'domain':job.dataDomain,
            'jobId':job.jobId,
            'rootJobId':job.rootJobId
        });

        try {
            handler(logger, environment, job, function(handlerError) {
                worker.metrics.info('Handler Processing'+(handlerError?' in error':''),{
                    'timer':'stop',
                    'patientIdentifier': job.patientIdentifier,
                    'process':process.pid,
                    'jobType':job.type,
                    'domain':job.dataDomain,
                    'jobId':job.jobId,
                    'rootJobId':job.rootJobId
                });
                return callback(handlerError, job);
            }, touchBack);
        } catch (e) {
            logger.error('job-processor.callHandler(): Exception in job: %j', e);
            return callback(errorBuilder.createFatal(e), job);
        }
    });
}

//---------------------------------------------------------------------------------------------------------------
// Publish an error and update the job status.
//
// worker: A handle to the worker.
// logger: A handle to the logger.  Note it is separated out from worker because it may carry referenceInfo.
// job: The job that is being worked on.
// tubeName: The tube that this worker uses.
// handlerError: The error that occurred.
// callback: The call back handler when we are done.   It is expected that the call back signature is:
//         function(error)
//         Where:  error is an error of it has occurred while processing the error.
//---------------------------------------------------------------------------------------------------------------
function processError(worker, logger, job, tubeName, handlerError, callback) {
    var errorType = handlerError.type ? handlerError.type : errorBuilder.transient; // default to be transient

    logger.debug('job-processor.processError(%s) job: %J', tubeName, job);

    worker.errorPublisher.publishHandlerError(job, handlerError, errorType, function() {
        worker.jobStatusUpdater.errorJobStatus(job, handlerError, function(errorJobError) {
            if (errorJobError) {
                logger.warn('job-processor.processError(%s): Unable to save error job status for job: %J', tubeName, job);
                return callback(errorJobError);
            }
            return callback();
        });
    });
}

//----------------------------------------------------------------------------------------------------------------
// This method releases the job in beanstalk and makes it available for another handler.
//
// worker: A handle to the worker.
// logger: A handle to the logger.
// beanstalkJobId: The jobId that beanstalk knows this job by.
// tubeName: The name of the tube where the job came from.
// callback: The call back handler to call when this is done.  It is expected that this callback handler will
//           not return errors.   Errors will only be logged.
//-----------------------------------------------------------------------------------------------------------------
function releaseJob(worker, logger, beanstalkJobId, tubeName, callback) {
    logger.debug('job-processor.release(%s) beanstalkJobId: %s', tubeName, beanstalkJobId);

    worker.client.release(beanstalkJobId, LOWEST_PRIORITY, 30, function(error) {
        if (error) {
            logger.warn('job-processor.release(): tubeName: %s; Unable to release job: %s', tubeName, beanstalkJobId);
            return callback();
        }
        logger.debug('job-processor.release(): tubeName: %s; Job has been released. job: %s', tubeName, beanstalkJobId);
        return callback();
    });
}

//----------------------------------------------------------------------------------------------------------------
// This method destroys the job from beanstalk.
//
// worker: A handle to the worker.
// logger: A handle to the logger.
// tubeName: The name of the tube where the job came from.
// job: The job that is being destroyed.
// callback: The call back handler to call when this is done.  It is expected that this callback handler will
//           not return errors.   Errors will only be logged.
//-----------------------------------------------------------------------------------------------------------------
function destroyJob(worker, logger, beanstalkJobId, tubeName, job, callback) {
    logger.debug('job-processor.destroyJob: Destroy Job: tubeName: %s; beanstalkJobId: %s; job.type: %s', tubeName, beanstalkJobId, job.type);

    worker.client.destroy(beanstalkJobId, function(error) {
        if (error) {
            logger.warn('job-processor.destroyJob(): tubeName: %s;  Unable to destroy job: %s', tubeName, beanstalkJobId);
            return callback();
        }
        logger.debug('job-processor.destroyJob() tubeName: %s; job has been destroyed: %s', tubeName, beanstalkJobId);
        return callback();
    });
}

module.exports._steps = {
    createChildEnvironment: createChildEnvironment
};
