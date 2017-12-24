'use strict';

//-------------------------------------------------------------------------
// This module will export any jobs remaining in any of the beanstalk tubes.
// The root directory will be passed in on the command line.   This will create
// a subdirectory for each tube that contains jobs and it will place one JSON
// file for each job extracted from the tube into that directory.  The job
// name will be <job-id>.json.
//
// @Author: Les Westberg
//--------------------------------------------------------------------------

require('../../env-setup');
var _ = require('underscore');
var fs = require('fs');
var uuid = require('node-uuid');

var adminUtils = require(global.VX_TOOLS + 'beanstalk/admin-utils');
var config = require(global.VX_ROOT + 'worker-config');
var logger = require('bunyan').createLogger({
	name: 'exportBeanstalkJobs',
	level: 'debug'
});

var inspect = require(global.VX_UTILS + 'inspect');
var BeanstalkClient = require(global.VX_JOBFRAMEWORK).BeanstalkClient;
var util = require('util');
var async = require('async');


var argv = require('yargs')
	.usage('Usage: $0 [options...]')
	.demand(['basedir'])
	.describe('basedir', 'Base directory to place the exported jobs.')
	.describe('host', 'IP Address of the machine where the beanstalk is running.')
	.describe('port', 'Port for beanstalk. (NOT the beanstalk admin tool)')
	.describe('tubename', 'Name of tube to extract from.')
	.argv;

// console.log('DEBUG: config: %j', config);

var host;
if (_.isString(argv.host)) {
	host = argv.host;
} else if ((_.isObject(config)) && (_.isObject(config.beanstalk)) && (_.isObject(config.beanstalk.repoDefaults)) && (_.isString(config.beanstalk.repoDefaults.host))) {
	host = config.beanstalk.repoDefaults.host;
}

var port;
if (_.isNumber(argv.port)) {
	port = argv.port;
} else if (_.isNumber(config.beanstalk.repoDefaults.port)) {
	port = config.beanstalk.repoDefaults.port;
}

console.log('Beanstalk using host: %s; port: %s', host, port);

if ((!_.isString(host)) || (!_.isNumber(port))) {
	console.log('Host and Port are required.  It must either be passed in or come from worker-config.');
	process.exit();
}

var baseDir = argv.basedir;
var requestedTubeName = argv.tubename;

//-----------------------------------------------------------------------------------
// This function returns the name and path of the tube directory.
//
// baseDir: The base directory where the exported jobs will be placed.
// tubeName: The name of the tube to drain the messages from.
// returns: The path including the baseDir and tubeName.
//-----------------------------------------------------------------------------------
function tubeDirPath(baseDir, tubeName) {
	var tubeDir = baseDir;
	if (/\/$/.test(tubeDir) === false) {
		tubeDir += '/';
	}
	tubeDir += tubeName;
	return tubeDir;
}

//-----------------------------------------------------------------------------------
// Return the path and file name for the file that will contain the beanstalk job.
//
// tubeDir:  The directory where jobs for the tube are being placed.
// jobType the type of job ('DELAYED', 'READY', 'BURIED')
// beanstalkJobId: The job identifier for the job.
// suffix:  The suffix to add to the file name.  Null means add none.
// returns the path and file name for the beanstalk job
//------------------------------------------------------------------------------------
function jobFilePathAndName(tubeDir, jobType, beanstalkJobId, suffix) {
	var filePathAndName = tubeDir;
	if (/\/$/.test(filePathAndName) === false) {
		filePathAndName += '/';
	}

	var jobId = beanstalkJobId;

    // If for some reason there is no jobId, then create a new UUID to use for the jobId to make the filename unique.
    //----------------------------------------------------------------------------------------------------------------
	if (!jobId) {
        jobId = uuid.v4();
    }

	filePathAndName += jobType + '_' + jobId;

	if (suffix) {
		filePathAndName += '_' + suffix;
	}

	filePathAndName += '.json';
	return filePathAndName;
}


//---------------------------------------------------------------------------------
// This function a call to fetch the overall beanstalk stats.  If it finds there
// are no jobs left in the tube, it returns null as the error.  If it
// finds that there are still jobs in the tubes, then it will return an error to
// signal that the jobs need to be drained.
//
// logger:  The logger to use to log messages.
// host: The IP address for beanstalk
// port: The port that beanstalk is listening on.
// callback:  function (error, message)
//        where:  error: null if there is no error, and the text identifying the
//                       error if one occurs.
//                message: The message to be printed.
//---------------------------------------------------------------------------------
function fetchStats(logger, host, port, callback) {
	// console.log('DEBUG: Entered recursiveFetchStats:   Iteration %s', iterationCount++);

	adminUtils.fetchStats(logger, host, port, function(error, result) {
		// console.log('DEBUG: Returned from adminUtils.fetchStats...');
		if (error) {
			error = adminUtils.formatResult(error, false);
			return callback('ERR_FROM_ADMIN_UTILS_FETCH_STATS', error);
		}
		if ((_.isEmpty(result)) || (_.isEmpty(result.stats))) {
			return callback('ERR_NO_RESULTS_FROM_ADMIN_UTILS_FETCH_STATS', 'No result was returned.');
		}

		console.log('Beanstalk Stats: ' + adminUtils.formatResult(result, false));

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
		if ((totalJobsReceived === 0) && (totalJobsDeleted === 0) && (totalJobsReady === 0) &&
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
		} else {
			return callback('ERR_BEANSTALK_HAS_JOBS', 'Beanstalk tubes contained pending jobs.  Exporting pending jobs now.');
		}
	});
}

//------------------------------------------------------------------------------------------------------------------
// Although unexpected - there may be cases where the name of the file may be a duplicate of one that is already
// in the directory. If this occurs, then add an index to make it unique.  Continue this process, until the file
// name is unique.
//
// tubeDir: The directory where jobs for the tibe will be placed.
// jobType the type of job ('DELAYED', 'READY', 'BURIED')
// jobId: The VX-Sync jobId of the beanstalk Job.
// suffix: The suffix to append to the job_id to make the file name unique.  Null means add no suffix.
// callback:  function (error, filePathAndNameResolved)
//        where:  error: null if there is no error, and the text identifying the
//                       error if one occurs.
//                message: The file and path name to use for this job.
//-------------------------------------------------------------------------------------------------------------------
function resolveConflictingFileNames(tubeDir, jobType, jobId, suffix, callback) {
	var filePathAndName = jobFilePathAndName(tubeDir, jobType, jobId, suffix);

	fs.exists(filePathAndName, function(exists) {
		if (!exists) {
			return callback(null, filePathAndName);
		}
		else {
            suffix = uuid.v4();
			return resolveConflictingFileNames(tubeDir, jobType, jobId, suffix, callback);
		}
	});
}

//-------------------------------------------------------------------------------------------
// Close the file and call the given callback with the error information passed in.
//
// tubeName: The name of the beanstalk tube.
// jobType the type of job ('DELAYED', 'READY', 'BURIED')
// jobId: The VX-Sync jobId of the beanstalk Job.
// beanstalkJobPayload: The job itself.
// baseDir: The base directory where the exported jobs will be placed.
// callback: The call back handler: function (error)
//-------------------------------------------------------------------------------------------
function jobWriter(tubeName, jobType, jobId, beanstalkJobPayload, baseDir, callback) {
	var tubeDir = tubeDirPath(baseDir, tubeName);			// The directoy should exist - as we already have a path for it.

	resolveConflictingFileNames(tubeDir, jobType, jobId, null, function (error, filePathAndNameResolved) {
		if (error) {
			console.log('Failed, Error while resolving file name for job: %j', beanstalkJobPayload);
			return callback(error);
		}

		if ((!_.isString(filePathAndNameResolved)) || (filePathAndNameResolved === '')) {
			console.log('Failed, No file name was returned for job: %j', beanstalkJobPayload);
			return callback('FILE-NAME-NOT-RETURNED');
		}

		var jobString;
		if (_.isObject(beanstalkJobPayload)) {
			jobString = JSON.stringify(beanstalkJobPayload);
		} else {
			jobString = beanstalkJobPayload;
		}

		if ((jobString === null) || (jobString === undefined) || (jobString === '')) {
			console.log('Failed: Job was empty. file: %s for job: %j', filePathAndNameResolved, beanstalkJobPayload);
			return callback('FAILED-EMPTY-JOB');
		}

		var options = {
			encoding: 'utf-8',
			mode: '700',
			flag: 'wx+'
		};

		fs.writeFile(filePathAndNameResolved, jobString, options, function (error) {
			if (error) {
				console.log('Failed to open and write to file: %s for job: %j', filePathAndNameResolved, beanstalkJobPayload);
				return callback(error);
			}

			console.log('Created file: %s', filePathAndNameResolved);
			return callback(null);
		});
	});
}

//-------------------------------------------------------------------------------------------------------------
// This function will store the job to the file.
//
// tubeName: The name of the beanstalk tube.
// jobType the type of job ('DELAYED', 'READY', 'BURIED')
// beanstalkJobId: The jobId of the beanstalk Job.
// beanstalkJobPayload: The job itself.
// baseDir: The base directory where the exported jobs will be placed.
// callback: The call back handler: function (error)
//-------------------------------------------------------------------------------------------------------------
function storeJobToFile(tubeName, jobType, beanstalkJobId, beanstalkJobPayload, baseDir, callback) {
	// console.log('DEBUG: storeJobToFile: entered method.  tubeName: %s; jobType:%s; beanstalkJobId: %s, beanstalkJobPayload: %s', tubeName, jobType, beanstalkJobId, beanstalkJobPayload);

	// console.log('DEBUG: typeof beanstalkJobPayload is ', typeof beanstalkJobPayload);
	try {
		beanstalkJobPayload = JSON.parse(beanstalkJobPayload);
		// console.log('DEBUG: Successfully converted beanstalkJobPayload to JSON object.  beanstalkJobPayload: %j', beanstalkJobPayload);
	} catch (e) {
		beanstalkJobPayload = {
			job: beanstalkJobPayload
		};
		console.log('Failed to convert beanstalkJobPayload to object.  beanstalkJobPayload: %j', beanstalkJobPayload);
	}
	// }

	jobWriter(tubeName, jobType, beanstalkJobPayload.jobId, beanstalkJobPayload, baseDir, function(error, result) {
		if (error) {
			console.log('Error occurred writing job.  error: %j; result: %j; beanstalkJobId: %s; beanstalkJobPayload: %j', error, result, beanstalkJobId, beanstalkJobPayload);
		} // else {
		// 	console.log('DEBUG: Successfully wrote job.  beanstalkJobId: %s; beanstalkJobPayload: %j', beanstalkJobId, beanstalkJobPayload);
		// }

		return callback(null); // We do not want to stop the processing if we cannot write the error - so return null.
	});

}

//-------------------------------------------------------------------------------------------------------------------
// Pull buried jobs, store the job into the error log (in JDS), and then delete the job.   Do this recursively until
// all buried jobs have been processed from the tube.
//
// client: Beanstalk Client
// tubeName: The name of the tube where jobs will be drained.
// baseDir: The base directory where the exported jobs will be placed.
// callback: The call back handler to call when this is completed.  function (error)
//------------------------------------------------------------------------------------------------------------------
function recursiveProcessBuriedJob(client, tubeName, baseDir, callback) {
	client.peek_buried(function(error, beanstalkJobId) {
		// If we have timed out - assume there are no jobs left to reserve...  Stop the recursion.
		//-----------------------------------------------------------------------------------------
		if ((error) && (error === 'TIMED_OUT')) {
			console.log('peek_buried timed out - no more buried jobs for this tube: %s', tubeName);
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
			return setTimeout(recursiveProcessBuriedJob, 0, client, tubeName, baseDir, callback);
		}

		// If we got here - we have a job to work with...   Send it to the log and then delete it...
		//------------------------------------------------------------------------------------------
		client.peek(beanstalkJobId, function(error, receivedBeanstalkJobId, beanstalkJobPayload) {
			// console.log('DEBUG: Returned from peek for buried job.  beanstalkJobId: %s; receivedBeanstalkJobId: %s; beanstalkJobPayload: %j', beanstalkJobId, receivedBeanstalkJobId, beanstalkJobPayload);

			if (error) {
				console.log('Beanstalk failed to retrieve buried job.  Checking for another job.  error: %s; beanstalkJobId: %s', error, beanstalkJobId);
				return setTimeout(recursiveProcessBuriedJob, 0, client, baseDir, tubeName.callback);
			}

			if (!beanstalkJobPayload) {
				console.log('Beanstalk attempted to retrieve buried job and it was not returned.  Checking for another job.  error: %s; beanstalkJobId: %s', error, beanstalkJobId);
				return setTimeout(recursiveProcessBuriedJob, 0, client, tubeName, baseDir, callback);
			}

			// If we got here - we have a job - so lets process it.
			//-----------------------------------------------------
			storeJobToFile(tubeName, 'BURIED', beanstalkJobId, beanstalkJobPayload, baseDir, function(error) {
				if (error) {
					console.log('Failed to store buried job: beanstalkJobId: %s, beanstalkJobPayload: %s.  Continuing to process jobs.', beanstalkJobId, beanstalkJobPayload);
				} // else {
				// 	console.log('Stored buried job: beanstalkJobId: %s, beanstalkJobPayload: %s.  Continuing to process jobs.', beanstalkJobId, beanstalkJobPayload);
				// }

				client.destroy(beanstalkJobId, function(error) {
					if (error) {
						console.log('Failed to delete buried job from beanstalk: beanstalkJobId: %s, beanstalkJobPayload: %s.  Continuing to process jobs.', beanstalkJobId, beanstalkJobPayload);
					}

					return setTimeout(recursiveProcessBuriedJob, 0, client, tubeName, baseDir, callback);
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
// baseDir: The base directory where the exported jobs will be placed.
// callback: The call back handler to call when this is completed.  function (error)
//--------------------------------------------------------------------------------------------------------------
function recursiveProcessDelayedJob(client, tubeName, baseDir, callback) {
	client.peek_delayed(function(error, beanstalkJobId) {
		// If we have timed out - assume there are no jobs left to reserve...  Stop the recursion.
		//-----------------------------------------------------------------------------------------
		if ((error) && (error === 'TIMED_OUT')) {
			console.log('Reserve timed out - no more delayed jobs for this tube: %s', tubeName);
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
			return setTimeout(recursiveProcessDelayedJob, 0, client, tubeName, baseDir, callback);
		}

		// If we got here - we have a job to work with...   Send it to the log and then delete it...
		//------------------------------------------------------------------------------------------
		client.peek(beanstalkJobId, function(error, receivedBeanstalkJobId, beanstalkJobPayload) {
			// console.log('DEBUG: Returned from peek for delayed job.  beanstalkJobId: %s; receivedBeanstalkJobId: %s; beanstalkJobPayload: %j', beanstalkJobId, receivedBeanstalkJobId, beanstalkJobPayload);

			if (error) {
				console.log('Beanstalk failed to retrieve delayed job.  Checking for another job.  error: %s; beanstalkJobId: %s', error, beanstalkJobId);
				return setTimeout(recursiveProcessDelayedJob, 0, client, tubeName, baseDir, callback);
			}

			if (!beanstalkJobPayload) {
				console.log('Beanstalk attempted to retrieve delayed job and it was not returned.  Checking for another job.  error: %s; beanstalkJobId: %s', error, beanstalkJobId);
				return setTimeout(recursiveProcessDelayedJob, 0, client, tubeName, baseDir, callback);
			}

			// If we got here - we have a job - so lets process it.
			//-----------------------------------------------------
			storeJobToFile(tubeName, 'DELAYED', beanstalkJobId, beanstalkJobPayload, baseDir, function(error) {
				if (error) {
					console.log('Failed to store delayed job: beanstalkJobId: %s, beanstalkJobPayload: %s.  Continuing to process jobs.', beanstalkJobId, beanstalkJobPayload);
				} // else {
				// 	console.log('Stored delayed job in error log: beanstalkJobId: %s, beanstalkJobPayload: %s.  Continuing to process jobs.', beanstalkJobId, beanstalkJobPayload);
				// }

				client.destroy(beanstalkJobId, function(error) {
					if (error) {
						console.log('Failed to delete delayed job from beanstalk: beanstalkJobId: %s, beanstalkJobPayload: %s.  Continuing to process jobs.', beanstalkJobId, beanstalkJobPayload);
					}

					return setTimeout(recursiveProcessDelayedJob, 0, client, tubeName, baseDir, callback);
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
// baseDir: The base directory where the exported jobs will be placed.
// callback: The call back handler to call when this is completed.  function (error)
//--------------------------------------------------------------------------------------------------------------
function recursiveProcessReadyJob(client, tubeName, baseDir, callback) {
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
			return setTimeout(recursiveProcessReadyJob, 0, client, tubeName. baseDir, callback);
		}

		if (!beanstalkJobPayload) {
			console.log('Beanstalk returned without error - but there was no beanstalkJobPayload returned for tube: %s.  beanstalkJobId: %s.  Checking again.', tubeName, beanstalkJobId);
			return setTimeout(recursiveProcessReadyJob, 0, client, tubeName, baseDir, callback);
		}

		// If we got here - we have a job to work with...   Send it to the log and then delete it...
		//------------------------------------------------------------------------------------------
		storeJobToFile(tubeName, 'READY', beanstalkJobId, beanstalkJobPayload, baseDir, function(error) {
			if (error) {
				console.log('Failed to store ready job in error log: beanstalkJobId: %s, beanstalkJobPayload: %s.  Continuing to process jobs.', beanstalkJobId, beanstalkJobPayload);
			} // else {
			// 	console.log('Stored ready job in error log: beanstalkJobId: %s, beanstalkJobPayload: %s.  Continuing to process jobs.', beanstalkJobId, beanstalkJobPayload);
			// }

			client.destroy(beanstalkJobId, function(error) {
				if (error) {
					console.log('Failed to delete ready job from beanstalk: beanstalkJobId: %s, beanstalkJobPayload: %s.  Continuing to process jobs.', beanstalkJobId, beanstalkJobPayload);
				}

				return setTimeout(recursiveProcessReadyJob, 0, client, tubeName, baseDir, callback);
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
// baseDir: The base directory where the exported jobs will be placed.
// host: The IP address for beanstalk
// port: The port that beanstalk is listening on.
// callback:  function (error, message)
//        where:  error: null if there is no error, and the text identifying the
//                       error if one occurs.
//                message: The message to be printed.
//---------------------------------------------------------------------------------
function publishJobsAsErrors(tubeName, jobType, tubeStat, recursiveJobProcessor, logger, baseDir, host, port, config, callback) {
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

				recursiveJobProcessor(client, tubeName, baseDir, function(error) {
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

//----------------------------------------------------------------------------------
// This method creates the directory for the tube in the baseDir.
//
// baseDir: The base directory where the exported jobs will be placed.
// tubeName: The name of the tube to drain the messages from.
// callback:  function (error, message)
//        where:  error: null if there is no error, and the text identifying the
//                       error if one occurs.
//                message: The message to be printed.
//----------------------------------------------------------------------------------
function createDirectory(directory, callback) {
	fs.stat(directory, function(error, stats) {
		// console.log('DEBUG: Returned from fs.stat: typeof error: %s, error: %j, error: %s, stats: %j', typeof error, error, error, stats);

		if ((error) && (error.code !== 'ENOENT')) {
			return callback(error, 'Failed to retrieve stats on directory: %s', directory);
		} else if ((stats) && (!stats.isDirectory())) {
			return callback('FILE-EXISTS-BY-SAME-NAME', 'Failed to create directory - file already exists with that name.  directory: %s', directory);
		} else if ((stats) && (stats.isDirectory())) {
			return callback(null, 'Directory exists.  No need to create it.  directory: %s', directory);
		} else if ((error === 'ENOENT') || (!stats)) {
			fs.mkdir(directory, '700', function(error) {
				if (error) {
					return callback(error, 'Failed to create directory.');
				}

				return callback(null);
			});
		} else if (stats) {
			return callback('UNKNOWN-ERROR', 'Failed to create directory - file already exists.  directory: %s', directory);
		}
	});
}

//---------------------------------------------------------------------------------
// This function will figure out which tubes contain jobs that are not processing
// and pull them from the tube and export them into files.
//
// logger:  The logger to use to log messages.
// baseDir: The base directory where the exported jobs will be placed.
// host: The IP address for beanstalk
// port: The port that beanstalk is listening on.
// callback:  function (error, message)
//        where:  error: null if there is no error, and the text identifying the
//                       error if one occurs.
//                message: The message to be printed.
//---------------------------------------------------------------------------------
function exportRemainingJobs(logger, baseDir, host, port, config, requestedTubeName, callback) {
	adminUtils.fetchAllTubeStats(logger, host, port, function(error, result) {
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
			if ((!requestedTubeName) || (requestedTubeName === tubeName)) {
				console.log('Tube: %s; stats:', tubeName);
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

				// Make sure the directory for this tube is created.
				//--------------------------------------------------
				if ((totalJobsDelayed > 0) || (totalJobsReady > 0) || (totalJobsBuried > 0)) {
					console.log('Tube: %s; Creating directory.', tubeName);
					tasks.push(createDirectory.bind(this, tubeDirPath(baseDir, tubeName)));
				}

				if (totalJobsDelayed > 0) {
					console.log('Tube: %s has %s jobs in a delayed state.', tubeName, totalJobsDelayed);
					tasks.push(publishJobsAsErrors.bind(this, tubeName, 'DELAYED', tubeStat, recursiveProcessDelayedJob, logger, baseDir, host, port, config));
				}

				if (totalJobsReady > 0) {
					console.log('Tube: %s has %s jobs in a ready state.', tubeName, totalJobsReady);
					tasks.push(publishJobsAsErrors.bind(this, tubeName, 'READY', tubeStat, recursiveProcessReadyJob, logger, baseDir, host, port, config));
				}

				if (totalJobsBuried > 0) {
					console.log('Tube: %s has %s jobs in a buried state.', tubeName, totalJobsBuried);
					tasks.push(publishJobsAsErrors.bind(this, tubeName, 'BURIED', tubeStat, recursiveProcessBuriedJob, logger, baseDir, host, port, config));
				}
			}
		});

		// Process each of the domains that need to be drained.
		//-----------------------------------------------------
		if (tasks.length > 0) {
			console.log('Found some tubes that need to be drained.  Processing %s tasks', tasks.length);
			async.series(tasks, function(error, result) {
				if (error) {
					console.log('Failed to process jobs.  Error: %s; result: %j', error, result);
					return callback('FAILED_TO_PROCESS_JOBS', util.format('Failed to process jobs.  Error: %s; result: %j', error, result));
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

// Make sure the directory for the baseDir exists or is created.
//--------------------------------------------------------------
console.log('Tube: %s; Creating directory.', baseDir);
createDirectory(baseDir, function(error, message) {
	if (error) {
		console.log('STATUS: ERROR - Error: %s; Message: %s', error, message);
		process.exit(); // Since JDS Client is using a Forever Agent - we have to force this process to end.
	}

	// If we got here - the baseDir exists and is a directory...
	//-----------------------------------------------------------

	// Kick this whole thing off...
	//------------------------------
	fetchStats(logger, host, port, function(error, message) {
		console.log('Completed call to fetch stats.   Error: %s; Message: %s', error, message);

		message = (!_.isString(message)) ? '' : ' - Message: ' + message;

		// If we have any error - then we shuld export all remaining jobs from beanstalk - so they can be processed when
		// the system comes up.
		//------------------------------------------------------------------------------------------------------------------
		if (error) {
			console.log('Exporting any jobs left in beanstalk.');
			exportRemainingJobs(logger, baseDir, host, port, config, requestedTubeName, function(error, message) {
				message = (!_.isString(message)) ? '' : ' - Message: ' + message;
				if (error) {
					console.log('STATUS: ERROR - Error: %s; Message: %s', error, message);
				} else {
					console.log('STATUS: SUCCESS - %s', message);
				}
				process.exit(); // Since JDS Client is using a Forever Agent - we have to force this process to end.

			});
		} else {
			message = (!_.isString(message)) ? '' : ' - Message: ' + message;
			console.log('STATUS: SUCCESS - %s', message);
			process.exit(); // Since JDS Client is using a Forever Agent - we have to force this process to end.
		}

	});
});



// // First check for the existence of the baseDir and make sure it is a directory
// //------------------------------------------------------------------------------
// fs.stat(baseDir, function(error, stats) {

// 	if (error) {
// 		console.log('Error received while retrieving stats on basedir: %s; error: %s; stats: %j', baseDir, error, stats);
// 		console.log('STATUS: ERROR - Error: %s', error);
// 		process.exit();
// 	}

// 	if (!stats) {
// 		console.log('Failed to receive stats on basedir (It most likely does not exist.) : %s', baseDir);
// 		console.log('STATUS: ERROR - Error:');
// 		process.exit();
// 	}

// 	if ((stats) && (!stats.isDirectory())) {
// 		console.log('basedir is not a directory.  basedir: %s; stats: %j', baseDir, stats);
// 		console.log('STATUS: ERROR - Error:');
// 		process.exit();
// 	}

// 	// If we got here - the baseDir exists and is a directory...
// 	//-----------------------------------------------------------

// 	// Kick this whole thing off...
// 	//------------------------------
// 	fetchStats(logger, host, port, function(error, message) {
// 		console.log('Completed call to fetch stats.   Error: %s; Message: %s', error, message);

// 		message = (!_.isString(message)) ? '' : ' - Message: ' + message;

// 		// If we have any error - then we shuld export all remaining jobs from beanstalk - so they can be processed when
// 		// the system comes up.
// 		//------------------------------------------------------------------------------------------------------------------
// 		if (error) {
// 			console.log('Exporting any jobs left in beanstalk.');
// 			exportRemainingJobs(logger, baseDir, host, port, config, function(error, message) {
// 				message = (!_.isString(message)) ? '' : ' - Message: ' + message;
// 				if (error) {
// 					console.log('STATUS: ERROR - Error: %s; Message: %s', error, message);
// 				} else {
// 					console.log('STATUS: SUCCESS - %s', message);
// 				}
// 				process.exit(); // Since JDS Client is using a Forever Agent - we have to force this process to end.

// 			});
// 		} else {
// 			message = (!_.isString(message)) ? '' : ' - Message: ' + message;
// 			console.log('STATUS: SUCCESS - %s', message);
// 			process.exit(); // Since JDS Client is using a Forever Agent - we have to force this process to end.
// 		}

// 	});

// });