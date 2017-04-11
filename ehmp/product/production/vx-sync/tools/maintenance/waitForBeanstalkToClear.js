'use strict';

//-------------------------------------------------------------------------
// This module will monitor the beanstalk stats until all messages
// have been pulled from beanstalk and processed.  If it finds that
// it appears to be waiting for some messages that are not moving, then
// it will pull all of the remaining messages, write them to the error log,
// and basically force the clearing of all messages.
//
// @Author: Les Westberg
//--------------------------------------------------------------------------

require('../../env-setup');
var _ = require('underscore');
var adminUtils = require(global.VX_TOOLS + 'beanstalk/admin-utils');
var config = require(global.VX_ROOT + 'worker-config');
var logger = require('bunyan').createLogger({
	name: 'waitForBeanstalkToClear',
	level: 'debug'
});

var ErrorPublisher = require(global.VX_JOBFRAMEWORK).ErrorPublisher;
var errorWriter = require(global.VX_HANDLERS + 'error-request/jds-error-writer').createErrorRecordWriter(logger, config);
var inspect = require(global.VX_UTILS + 'inspect');
var BeanstalkClient = require(global.VX_JOBFRAMEWORK).BeanstalkClient;
var util = require('util');
var async = require('async');
var timeUtil = require(global.VX_UTILS + 'time-utils');


var argv = require('yargs')
  .usage('Usage: $0 [options...]')
  .demand(['wait'])
  .describe('host', 'IP Address of the machine where the beanstalk is running.')
  .describe('port', 'Port for beanstalk. (NOT the beanstalk admin tool)')
  .describe('wait', 'The number of seconds to wait for beanstalk to clear.')
  .argv;

console.log('**** config: %j', config);

var host;
if (_.isString(argv.host)) {
	host = argv.host;
} else if ((_.isObject(config)) && (_.isObject(config.beanstalk)) && (_.isObject(config.beanstalk.repoDefaults)) && (_.isString(config.beanstalk.repoDefaults.host))){
	host = config.beanstalk.repoDefaults.host;
}

var port;
if (_.isNumber(argv.port)) {
	port = argv.port;
} else if (_.isNumber(config.beanstalk.repoDefaults.port)){
	port = config.beanstalk.repoDefaults.port;
}

console.log('Beanstalk using host: %s; port: %s', host, port);

if ((!_.isString(host)) || (!_.isNumber(port))) {
	console.log('Host and Port are required.  It must either be passed in or come from worker-config.');
	process.exit();
}


var waitTimeInMilli = argv.wait;
var iterationCount = 0;
var startTimeInMilli = Date.now();
console.log('Started watching beanstalk.  startTimeInMilli: %s', startTimeInMilli);

//---------------------------------------------------------------------------------
// This function makes a recursive call to fetch the overall beanstalk stats.  If
// it finds that all jobs have been processed, it stops the recursive call.  If it
// finds that there are still jobs being worked, then it will wait a short time and
// call this function recusrively to check again.  If the amount of time checking
// passes the waitTimeInMilli, then it will stop its recursion and give an error.
//
// logger:  The logger to use to log messages.
// host: The IP address for beanstalk
// port: The port that beanstalk is listening on.
// waitTimeInMillis: The amount of milliseconds to keep checking.
// callback:  function (error, message)
//        where:  error: null if there is no error, and the text identifying the
//                       error if one occurs.
//                message: The message to be printed.
//---------------------------------------------------------------------------------
function recursiveFetchStats(logger, host, port, waitTimeInMilli, callback) {
	console.log('Entered recursiveFetchStats:   Iteration %s', iterationCount++);

	adminUtils.fetchStats(logger, host, port, function(error, result) {
		console.log('Returned from adminUtils.fetchStats...');
		if (error) {
			error = adminUtils.formatResult(error, false);
			return callback('ERR_FROM_ADMIN_UTILS_FETCH_STATS', error);
		}
		if ((_.isEmpty(result)) || (_.isEmpty(result.stats))) {
			return callback('ERR_NO_RESULTS_FROM_ADMIN_UTILS_FETCH_STATS', 'No result was returned.');
		}

		console.log(adminUtils.formatResult(result, false));

		var totalJobsReceived = 0;
		var totalJobsDeleted = 0;
		var totalJobsReady = 0;
		var totalJobsReserved = 0;
		var totalJobsDelayed = 0;
		var totalJobsBuried = 0;
		if (_.isNumber(result.stats['cmd-put'])) {
			totalJobsReceived = result.stats['cmd-put'];
		}
		if (_.isNumber(result.stats['cmd-delete'])) {
			totalJobsDeleted = result.stats['cmd-delete'];
		}
		if (_.isNumber(result.stats['current-jobs-ready'])) {
			totalJobsReady = result.stats['current-jobs-ready'];
		}
		if (_.isNumber(result.stats['current-jobs-reserved'])) {
			totalJobsReserved = result.stats['current-jobs-reserved'];
		}
		if (_.isNumber(result.stats['current-jobs-delayed'])) {
			totalJobsDelayed = result.stats['current-jobs-delayed'];
		}
		if (_.isNumber(result.stats['current-jobs-buried'])) {
			totalJobsBuried = result.stats['current-jobs-buried'];
		}

		// If beanstalk has never received anything, we are OK to go.
		//--------------------------------------------------------------------
		if ((totalJobsReceived === 0)  && (totalJobsDeleted === 0) && (totalJobsReady === 0) &&
			(totalJobsReserved === 0) && (totalJobsDelayed === 0) && (totalJobsBuried === 0)) {
			return callback(null, 'Beanstalk has never received any jobs...');
		}

		// This is a state we should never see - where beanstalk claims it received no jobs, but there are
		// some showing up in some of the stats.
		//-------------------------------------------------------------------------------------------------
		if ((totalJobsReceived === 0) && ((totalJobsDeleted !== 0) || (totalJobsReady !== 0) ||
			(totalJobsReserved !== 0) || (totalJobsDelayed !== 0) || (totalJobsBuried !== 0))) {
			return callback('ERR_STATS_INCONSISTENT', 'Beanstalk is in invalid state - claims no jobs in some stats and yet some jobs in other stats.');
		}

		// Now that we know we have some jobs - lets see what our state really is...
		//----------------------------------------------------------------------------
		var jobsSittingInBeanstalk = totalJobsReceived - totalJobsDeleted;

		if (jobsSittingInBeanstalk === 0) {
			return callback(null, 'Beanstalk has processed all jobs...');
		}

		if (jobsSittingInBeanstalk !== 0) {
			var currentTimeInMilli = Date.now();

			// See if we have reached our time limit...
			//-----------------------------------------
			if ((currentTimeInMilli - startTimeInMilli) > waitTimeInMilli) {
				return callback('ERR_WAIT_TIME_EXCEEDED', 'We have passed our wait time and beanstalk is still not clean.   Shutting down anyways.');
			// We still have time to wait - so check again.
			//----------------------------------------------
			} else {
				console.log('Beanstalk has some unfinished work.  Checking again in 2 seconds...');
				return setTimeout(recursiveFetchStats, 2000, logger, host, port, waitTimeInMilli, callback);
			}
		}

	});
}

//-------------------------------------------------------------------------------------------------------------
// This function will store the job to the log.
//
// tubeName: The name of the beanstalk tube.
// jobType the type of job ('DELAYED', 'READY', 'BURIED')
// beanstalkJobId: The jobId of the beanstalk Job.
// beanstalkJobPayload: The job itself.
// callback: The call back handler: function (error)
//-------------------------------------------------------------------------------------------------------------
function storeJobToLog(tubeName, jobType, beanstalkJobId, beanstalkJobPayload, callback) {
	console.log('storeJobToLog: entered method.  tubeName: %s; jobType:%s; beanstalkJobId: %s, beanstalkJobPayload: %s', tubeName, jobType, beanstalkJobId, beanstalkJobPayload);

	var error = util.format('Draining \'%s\'job from tube \'%s\' to prepare for shutdown of system.  This job is being saved for future reference.', jobType, tubeName);
	console.log('typeof beanstalkJobPayload is ', typeof beanstalkJobPayload);
	// if (_.isString(beanstalkJobPayload)) {
	// 	console.log('beanstalkJobPayload is a string.  Converting it to an object.');
	try {
		beanstalkJobPayload = JSON.parse(beanstalkJobPayload);
		console.log('Successfully converted beanstalkJobPayload to JSON object.  beanstalkJobPayload: %j', beanstalkJobPayload);
	} catch (e) {
		beanstalkJobPayload = { job: beanstalkJobPayload };
		console.log('Failed to convert beanstalkJobPayload to object.  beanstalkJobPayload: %j', beanstalkJobPayload);
	}
	// }
	var handlerErrorRecord = ErrorPublisher._createHandlerErrorRecord(beanstalkJobPayload, error, 'transient-exception');
	var errorStampTime = timeUtil.createStampTime();
	handlerErrorRecord.timestamp = errorStampTime;
	console.log('Created error record.  handlerErrorRecord: %j', handlerErrorRecord);

	errorWriter(handlerErrorRecord, function(error, result) {
		if (error) {
			console.log('Error occurred writing error record.  error: %j; result: %j; beanstalkJobId: %s; handlerErrorRecord: %j', error, result, beanstalkJobId, handlerErrorRecord);
		} else {
			console.log('Successfully wrote error record.  beanstalkJobId: %s; handlerErrorRecord: %j', beanstalkJobId, handlerErrorRecord);
		}

		return callback(null);		// We do not want to stop the processing if we cannot write the error - so return null.
	});

}

//-------------------------------------------------------------------------------------------------------------------
// Pull buried jobs, store the job into the error log (in JDS), and then delete the job.   Do this recursively until
// all buried jobs have been processed from the tube.
//
// client: Beanstalk Client
// tubeName: The name of the tube where jobs will be drained.
// callback: The call back handler to call when this is completed.  function (error)
//------------------------------------------------------------------------------------------------------------------
function recursiveProcessBuriedJob(client, tubeName, callback) {
    client.peek_buried(function(error, beanstalkJobId) {
    	// If we have timed out - assume there are no jobs left to reserve...  Stop the recursion.
    	//-----------------------------------------------------------------------------------------
        if ((error) && (error === 'TIMED_OUT')) {
        	console.log('peek_buried timed out - no more ready jobs for this tube: %s', tubeName);
            return callback(null);
        }

        if ((error) && (error === 'DEADLINE_SOON')) {
        	console.log('Beanstalk sent DEADLINE_SOON error for tube: %s.  Processing is done for this tube.', tubeName);
            return callback(null);
        }

        if (error) {
        	console.log('Beanstalk sent error when calling peek_buried: %s for tube: %s.  Processing is done for this tube.', error, tubeName);
            return callback(null);
        }

        if (!beanstalkJobId) {
        	console.log('Beanstalk returned without error when calling peek_buried - but there was no beanstalkJobId returned for tube: %s.  Checking again.', tubeName);
        	return setTimeout(recursiveProcessBuriedJob, 0, client, tubeName. callback);
        }

        // If we got here - we have a job to work with...   Send it to the log and then delete it...
        //------------------------------------------------------------------------------------------
        client.peek(beanstalkJobId, function(error, receivedBeanstalkJobId, beanstalkJobPayload) {
        	console.log('Returned from peek for buried job.  beanstalkJobId: %s; receivedBeanstalkJobId: %s; beanstalkJobPayload: %j', beanstalkJobId, receivedBeanstalkJobId, beanstalkJobPayload);

        	if (error) {
        		console.log('Beanstalk failed to retrieve buried job.  Checking for another job.  error: %s; beanstalkJobId: %s', error, beanstalkJobId);
	        	return setTimeout(recursiveProcessBuriedJob, 0, client, tubeName. callback);
        	}

        	if (!beanstalkJobPayload) {
        		console.log('Beanstalk attempted to retrieve buried job and it was not returned.  Checking for another job.  error: %s; beanstalkJobId: %s', error, beanstalkJobId);
	        	return setTimeout(recursiveProcessBuriedJob, 0, client, tubeName. callback);
        	}

        	// If we got here - we have a job - so lets process it.
        	//-----------------------------------------------------
	        storeJobToLog(tubeName, 'BURIED', beanstalkJobId, beanstalkJobPayload, function (error) {
	        	if (error) {
	        		console.log('Failed to store buried job in error log: beanstalkJobId: %s, beanstalkJobPayload: %s.  Continuing to process jobs.', beanstalkJobId, beanstalkJobPayload);
	        	} else {
	        		console.log('Stored buried job in error log: beanstalkJobId: %s, beanstalkJobPayload: %s.  Continuing to process jobs.', beanstalkJobId, beanstalkJobPayload);
	        	}

	        	client.destroy(beanstalkJobId, function (error) {
	        		if (error) {
		        		console.log('Failed to delete buried job from beanstalk: beanstalkJobId: %s, beanstalkJobPayload: %s.  Continuing to process jobs.', beanstalkJobId, beanstalkJobPayload);
	        		}

		        	return setTimeout(recursiveProcessBuriedJob, 0, client, tubeName, callback);
	        	});
	        });
        });
    });
}

//--------------------------------------------------------------------------------------------------------------
// Reserve, store the job into the error log (in JDS), and then delete the job.   Do this recursively until
// all jobs have been processed from the tube.
//
// client: Beanstalk Client
// tubeName: The name of the tube where jobs will be drained.
// callback: The call back handler to call when this is completed.  function (error)
//--------------------------------------------------------------------------------------------------------------
function recursiveProcessDelayedJob(client, tubeName, callback) {
    client.peek_delayed(function(error, beanstalkJobId) {
    	// If we have timed out - assume there are no jobs left to reserve...  Stop the recursion.
    	//-----------------------------------------------------------------------------------------
        if ((error) && (error === 'TIMED_OUT')) {
        	console.log('Reserve timed out - no more ready jobs for this tube: %s', tubeName);
            return callback(null);
        }

        if ((error) && (error === 'DEADLINE_SOON')) {
        	console.log('Beanstalk sent DEADLINE_SOON error for tube: %s.  Processing is done for this tube.', tubeName);
            return callback(null);
        }

        if (error) {
        	console.log('Beanstalk sent error when calling peek_delayed: %s for tube: %s.  Processing is done for this tube.', error, tubeName);
            return callback(null);
        }

        if (!beanstalkJobId) {
        	console.log('Beanstalk returned without error when calling peek_delayed - but there was no beanstalkJobId returned for tube: %s.  Checking again.', tubeName);
        	return setTimeout(recursiveProcessDelayedJob, 0, client, tubeName. callback);
        }

        // If we got here - we have a job to work with...   Send it to the log and then delete it...
        //------------------------------------------------------------------------------------------
        client.peek(beanstalkJobId, function(error, receivedBeanstalkJobId, beanstalkJobPayload) {
        	console.log('Returned from peek for delayed job.  beanstalkJobId: %s; receivedBeanstalkJobId: %s; beanstalkJobPayload: %j', beanstalkJobId, receivedBeanstalkJobId, beanstalkJobPayload);

        	if (error) {
        		console.log('Beanstalk failed to retrieve delayed job.  Checking for another job.  error: %s; beanstalkJobId: %s', error, beanstalkJobId);
	        	return setTimeout(recursiveProcessDelayedJob, 0, client, tubeName. callback);
        	}

        	if (!beanstalkJobPayload) {
        		console.log('Beanstalk attempted to retrieve delayed job and it was not returned.  Checking for another job.  error: %s; beanstalkJobId: %s', error, beanstalkJobId);
	        	return setTimeout(recursiveProcessDelayedJob, 0, client, tubeName. callback);
        	}

        	// If we got here - we have a job - so lets process it.
        	//-----------------------------------------------------
	        storeJobToLog(tubeName, 'DELAYED', beanstalkJobId, beanstalkJobPayload, function (error) {
	        	if (error) {
	        		console.log('Failed to store delayed job in error log: beanstalkJobId: %s, beanstalkJobPayload: %s.  Continuing to process jobs.', beanstalkJobId, beanstalkJobPayload);
	        	} else {
	        		console.log('Stored delayed job in error log: beanstalkJobId: %s, beanstalkJobPayload: %s.  Continuing to process jobs.', beanstalkJobId, beanstalkJobPayload);
	        	}

	        	client.destroy(beanstalkJobId, function (error) {
	        		if (error) {
		        		console.log('Failed to delete delayed job from beanstalk: beanstalkJobId: %s, beanstalkJobPayload: %s.  Continuing to process jobs.', beanstalkJobId, beanstalkJobPayload);
	        		}

		        	return setTimeout(recursiveProcessDelayedJob, 0, client, tubeName, callback);
	        	});
	        });
        });
    });
}


//--------------------------------------------------------------------------------------------------------------
// Reserve, store the job into the error log (in JDS), and then delete the job.   Do this recursively until
// all jobs have been processed from the tube.
//
// client: Beanstalk Client
// tubeName: The name of the tube where jobs will be drained.
// callback: The call back handler to call when this is completed.  function (error)
//--------------------------------------------------------------------------------------------------------------
function recursiveProcessReadyJob(client, tubeName, callback) {
    client.reserve_with_timeout(3, function(error, beanstalkJobId, beanstalkJobPayload) {
    	// If we have timed out - assume there are no jobs left to reserve...  Stop the recursion.
    	//-----------------------------------------------------------------------------------------
        if ((error) && (error === 'TIMED_OUT')) {
        	console.log('Reserve timed out - no more ready jobs for this tube: %s', tubeName);
            return callback(null);
        }

        if ((error) && (error === 'DEADLINE_SOON')) {
        	console.log('Beanstalk sent DEADLINE_SOON error for tube: %s.  Processing is done for this tube.', tubeName);
            return callback(null);
        }

        if (error) {
        	console.log('Beanstalk sent error: %s for tube: %s.  Processing is done for this tube.', error, tubeName);
            return callback(null);
        }

        if (!beanstalkJobId) {
        	console.log('Beanstalk returned without error - but there was no beanstalkJobId returned for tube: %s.  Checking again.', tubeName);
        	return setTimeout(recursiveProcessReadyJob, 0, client, tubeName. callback);
        }

        if (!beanstalkJobPayload) {
        	console.log('Beanstalk returned without error - but there was no beanstalkJobPayload returned for tube: %s.  beanstalkJobId: %s.  Checking again.', tubeName, beanstalkJobId);
        	return setTimeout(recursiveProcessReadyJob, 0, client, tubeName, callback);
        }

        // If we got here - we have a job to work with...   Send it to the log and then delete it...
        //------------------------------------------------------------------------------------------
        storeJobToLog(tubeName, 'READY', beanstalkJobId, beanstalkJobPayload, function (error) {
        	if (error) {
        		console.log('Failed to store ready job in error log: beanstalkJobId: %s, beanstalkJobPayload: %s.  Continuing to process jobs.', beanstalkJobId, beanstalkJobPayload);
        	} else {
        		console.log('Stored ready job in error log: beanstalkJobId: %s, beanstalkJobPayload: %s.  Continuing to process jobs.', beanstalkJobId, beanstalkJobPayload);
        	}

        	client.destroy(beanstalkJobId, function (error) {
        		if (error) {
	        		console.log('Failed to delete ready job from beanstalk: beanstalkJobId: %s, beanstalkJobPayload: %s.  Continuing to process jobs.', beanstalkJobId, beanstalkJobPayload);
        		}

	        	return setTimeout(recursiveProcessReadyJob, 0, client, tubeName, callback);
        	});
        });
    });
}

//---------------------------------------------------------------------------------
// This function will remove all jobs in the state specified by the
// recursiveJobProcessor (delayed, ready, buried) from the tube and publish 
// them to the error handler for processing.
//
// tubeName: The name of the tube to drain the messages from.
// jobType the type of job ('DELAYED', 'READY', 'BURIED')
// tubeStat: The tube stats for this tube.
// recursiveJobProcessor: Function for recursively processing the jobs.
//       function(client, tubeName, callback)
// logger:  The logger to use to log messages.
// host: The IP address for beanstalk
// port: The port that beanstalk is listening on.
// callback:  function (error, message)
//        where:  error: null if there is no error, and the text identifying the
//                       error if one occurs.
//                message: The message to be printed.
//---------------------------------------------------------------------------------
function publishJobsAsErrors(tubeName, jobType, tubeStat, recursiveJobProcessor, logger, host, port, config, callback) {
	console.log('Draining jobs from tube: %s; jobType: %s', tubeName, jobType);

    var client = new BeanstalkClient(logger, host, port);
    client.connect(function(error) {
        if (error) {
            client.end(function() {
	            return callback(util.format('Failed to connect to beanstalk.  Host: %s; Port: %s; Error: %s', host, port, error));
            });
        }

        // Need this to put jobs in the tube.
        //-----------------------------------
        client.use(tubeName, function(error) {
            if (error) {
                client.end(function() {
	                return callback(util.format('Failed to use tube.  Host: %s; Port: %s; TubeName: %s; Error: %s', host, port, tubeName, error));
                });
            }

	        client.watch(tubeName, function(error) {
	            if (error) {
	                client.end(function() {
		                return callback(util.format('Failed to watch tube.  Host: %s; Port: %s; TubeName: %s; Error: %s', host, port, tubeName, error));
	                });
	            }

				recursiveJobProcessor(client, tubeName, function(error) {
					if (error) {
						console.log('Failed to drain jobs from tube: %s; error: %s', tubeName, error);
					} else {
						console.log('Successfully drained jobs from tube: %s; error: %s', tubeName, error);
					}

					client.end(function() {
						return callback(error);
					});
				});
	        });
	    });
    });
}

//---------------------------------------------------------------------------------
// This function will figure out which tubes contain jobs that are not processing
// and pull them from the tube and publish them to the error handler for processing.
//
// logger:  The logger to use to log messages.
// host: The IP address for beanstalk
// port: The port that beanstalk is listening on.
// callback:  function (error, message)
//        where:  error: null if there is no error, and the text identifying the
//                       error if one occurs.
//                message: The message to be printed.
//---------------------------------------------------------------------------------
function extractRemainingJobsAndPublish(logger, host, port, config, callback) {
	adminUtils.fetchAllTubeStats(logger, host, port, function (error, result) {
		console.log('***  All Tube Stats ***');
		console.log(adminUtils.formatResult(result, false));
		if (error) {
			error = adminUtils.formatResult(error, false);
			return callback('ERR_FROM_ADMIN_UTILS_FETCH_ALL_TUBE_STATS', error);
		}

		if (_.isEmpty(result)) {
			return callback('ERR_NO_RESULTS_FROM_ADMIN_UTILS_FETCH__ALL_TUBE_STATS', 'No result was returned.');
		}

		// Go through each tube and see if there is anything hanging in that tube that needs to be published as an error.
		//----------------------------------------------------------------------------------------------------------------
		var tasks = [];
		_.each(result, function(tubeStat, tubeName) {
			console.log('Tube: %s:', tubeName);
			console.log('%s', inspect(tubeStat));

			var totalJobsReceived = 0;
			var totalJobsDeleted = 0;
			var totalJobsReady = 0;
			var totalJobsReserved = 0;
			var totalJobsDelayed = 0;
			var totalJobsBuried = 0;
			if (_.isNumber(tubeStat['total-jobs'])) {
				totalJobsReceived = tubeStat['cmd-put'];
			}
			if (_.isNumber(tubeStat['cmd-delete'])) {
				totalJobsDeleted = tubeStat['cmd-delete'];
			}
			if (_.isNumber(tubeStat['current-jobs-ready'])) {
				totalJobsReady = tubeStat['current-jobs-ready'];
			}
			if (_.isNumber(tubeStat['current-jobs-reserved'])) {
				totalJobsReserved = tubeStat['current-jobs-reserved'];
			}
			if (_.isNumber(tubeStat['current-jobs-delayed'])) {
				totalJobsDelayed = tubeStat['current-jobs-delayed'];
			}
			if (_.isNumber(tubeStat['current-jobs-buried'])) {
				totalJobsBuried = tubeStat['current-jobs-buried'];
			}

			if (totalJobsDelayed > 0) {
				console.log('Tube: %s has %s jobs in a delayed state.', tubeName, totalJobsDelayed);
				tasks.push(publishJobsAsErrors.bind(this, tubeName, 'DELAYED', tubeStat, recursiveProcessDelayedJob, logger, host, port, config));
			}

			if (totalJobsReady > 0) {
				console.log('Tube: %s has %s jobs in a ready state.', tubeName, totalJobsReady);
				tasks.push(publishJobsAsErrors.bind(this, tubeName, 'READY',tubeStat, recursiveProcessReadyJob, logger, host, port, config));
			}

			if (totalJobsBuried > 0) {
				console.log('Tube: %s has %s jobs in a buried state.', tubeName, totalJobsBuried);
				tasks.push(publishJobsAsErrors.bind(this, tubeName, 'BURIED', tubeStat, recursiveProcessBuriedJob, logger, host, port, config));
			}

		});

		// Process each of the domains that need to be drained.
		//-----------------------------------------------------
		if (tasks.length > 0) {
			console.log('Found some tubes that need to be drained.  Processing %s tasks', tasks.length);
			async.series(tasks, function(error, result) {
				if (error) {
					console.log('Failed to process ready jobs.  Error: %s; result: %j', error, result);
					return callback('FAILED_TO_PROCESS_READY_JOBS', util.format('Failed to process ready jobs.  Error: %s; result: %j', error, result));
				} else {
					return callback(null, null);
				}

			});
		} else {
			console.log('All tubes empty.', tasks.length);
			return callback(null, null);
		}
	});
}

// Kick this whole thing off...
//------------------------------
recursiveFetchStats(logger, host, port, waitTimeInMilli, function(error, message) {
	console.log('Completed recursive calls to fetch stats.   Error: %s; Message: %s', error, message);

	if (!_.isString(message)) {
		message = '';
	} else {
		message = ' - Message: ' + message;
	}

	// If we have any error - then we shuld extract all remaining jobs from beanstalk and publish them as errors so that
	// we can retain them.
	//------------------------------------------------------------------------------------------------------------------
	if (error) {
		console.log('An error occurred - extracting any jobs left in beanstalk and publishing them as errors.');
		extractRemainingJobsAndPublish(logger, host, port, config, function (error, message) {
			if (error) {
				console.log('STATUS: ERROR - Error: %s; Message: %s', error, message);
			}
			else {
				console.log('STATUS: SUCCESS - %s', message);
			}
			process.exit();			// Since JDS Client is using a Forever Agent - we have to force this process to end.

		});
	} else {
		console.log('STATUS: SUCCESS - %s', message);
		process.exit();			// Since JDS Client is using a Forever Agent - we have to force this process to end.
	}

});



