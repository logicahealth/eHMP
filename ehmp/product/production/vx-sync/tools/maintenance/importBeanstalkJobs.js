'use strict';

//-------------------------------------------------------------------------
// This module will import jobs that have been exported by the
// exportBeanstalkJobs.js routine.  This module requires that the base
// directory be set up in a specific way.  The base directory will contain
// subdirectories where each subdirectory is the name of the tube for
// which the jobs were extracted.   Each tube subdirectory will contain
// a separate JSON file for each job.  The name of the JSON file will be
// <job-type>_<jobId>[_<iterator>].json
//
// Where:  <job-type> will be: 'BURIED', 'DELAYED", or 'READY'
//         <jobId> will be the jobId attribute within the Job.
//         <<iterator> is an optional index if the file had a collision.
//
// This utility will iterate through these jobs - if it successfully places
// the job in the tube, it will move the json file to a subdirectory
// entitled: 'completed'.
//
// @author: Les Westberg
//-------------------------------------------------------------------------

require('../../env-setup');
var _ = require('underscore');
var fs = require('fs');
var util = require('util');
var async = require('async');

var mapUtil = require(global.VX_UTILS + 'map-utils');
var config = require(global.VX_ROOT + 'worker-config');
var logger = require('bunyan').createLogger({
	name: 'exportBeanstalkJobs',
	level: 'debug'
});

var PublisherRouter = require(global.VX_JOBFRAMEWORK).PublisherRouter;
var JobStatusUpdater = require(global.VX_SUBSYSTEMS + 'jds/JobStatusUpdater');
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var Metrics = require(global.VX_UTILS + 'metrics');


var argv = require('yargs')
	.usage('Usage: $0 [options...]')
	.demand(['basedir'])
	.describe('basedir', 'Base directory where the exported jobs are located.')
	.describe('tube', 'The tube where jobs for which the jobs should be imported.  Omit or specify \'ALL\' to process all jobs in all tubes.')
	.describe('type', 'The type of jobs to process.   Possible values are: \'READY\', \'DELAYED\', and \'BURIED\'.  ' +
		              'Omit this value to process both \'READY\' and \'DELAYED\'.  Pass \'ALL\' to process all jobs regardless of type.')
	.argv;

console.log('DEBUG: **** config: %j', config);

var environment;

var COMPLETED_SUBDIR_NAME = 'completed';

var baseDir = argv.basedir;
if (/\/$/.test(baseDir) === false) {
	baseDir += '/';
}
var baseDirSubDirectories = [];	// This will be filled in by verifyBasedirParam and will be an array of all the subdirectories under basedir.

var tube = argv.tube;
if ((tube === null) || (tube === undefined) || (tube.toUpperCase() === 'ALL')) {
	tube = 'ALL';
}
var tubesToProcess = [];	// This will be filled in by verifyTubeParam and will be an array of tubes to process

var type = argv.type;
if (_.isString(type)) {
	type = type.toUpperCase();
}
var typesToProcess = null;  // This will be filled in by the verifyTypeParam and will be an array of all the types to be processed.

var tubeCorrectOrder = [
	'vxs-error-request',
	'vxs-operational-store-record',
	'vxs-vista-operational-subscribe-request',
	'vxs-publish-data-change-event',
	'vxs-solr-record-storage',
	'vxs-store-record',
	/vxs-record-enrichment\d*$/,						// This is special case - since there can be multiple of these - we need to get them all
	'vxs-event-prioritization-request',
	'vxs-vista-record-processor-request',
	'vxs-hdr-xform-allergy-vpr',
	'vxs-hdr-xform-appointment-vpr',
	'vxs-hdr-xform-consult-vpr',
	'vxs-hdr-xform-cpt-vpr',
	'vxs-hdr-xform-document-vpr',
	'vxs-hdr-xform-factor-vpr',
	'vxs-hdr-xform-image-vpr',
	'vxs-hdr-xform-immunization-vpr',
	'vxs-hdr-xform-lab-vpr',
	'vxs-hdr-xform-med-vpr',
	'vxs-hdr-xform-order-vpr',
	'vxs-hdr-xform-patient-vpr',
	'vxs-hdr-xform-pov-vpr',
	'vxs-hdr-xform-problem-vpr',
	'vxs-hdr-xform-procedure-vpr',
	'vxs-hdr-xform-surgery-vpr',
	'vxs-hdr-xform-vital-vpr',
	'vxs-hdr-xform-visit-vpr',
	'vxs-hdr-sync-allergy-request',
	'vxs-hdr-sync-appointment-request',
	'vxs-hdr-sync-consult-request',
	'vxs-hdr-sync-cpt-request',
	'vxs-hdr-sync-document-request',
	'vxs-hdr-sync-factor-request',
	'vxs-hdr-sync-image-request',
	'vxs-hdr-sync-immunization-request',
	'vxs-hdr-sync-lab-request',
	'vxs-hdr-sync-med-request',
	'vxs-hdr-sync-order-request',
	'vxs-hdr-sync-patient-request',
	'vxs-hdr-sync-pov-request',
	'vxs-hdr-sync-problem-request',
	'vxs-hdr-sync-procedure-request',
	'vxs-hdr-sync-surgery-request',
	'vxs-hdr-sync-vital-request',
	'vxs-hdr-sync-visit-request',
	'vxs-hdr-sync-request',
	'vxs-jmeadows-pdf-document-transform',
	'vxs-jmeadows-cda-document-conversion',
	'vxs-jmeadows-document-retrieval',
	'vxs-jmeadows-xform-allergy-vpr',
	'vxs-jmeadows-xform-appointment-vpr',
	'vxs-jmeadows-xform-consult-vpr',
	'vxs-jmeadows-xform-demographics-vpr',
	'vxs-jmeadows-xform-dischargeSummary-vpr',
	'vxs-jmeadows-xform-encounter-vpr',
	'vxs-jmeadows-xform-immunization-vpr',
	'vxs-jmeadows-xform-lab-vpr',
	'vxs-jmeadows-xform-medication-vpr',
	'vxs-jmeadows-xform-note-vpr',
	'vxs-jmeadows-xform-order-vpr',
	'vxs-jmeadows-xform-problem-vpr',
	'vxs-jmeadows-xform-progressNote-vpr',
	'vxs-jmeadows-xform-radiology-vpr',
	'vxs-jmeadows-xform-vital-vpr',
	'vxs-jmeadows-sync-allergy-request',
	'vxs-jmeadows-sync-appointment-request',
	'vxs-jmeadows-sync-consult-request',
	'vxs-jmeadows-sync-demographics-request',
	'vxs-jmeadows-sync-dischargeSummary-request',
	'vxs-jmeadows-sync-encounter-request',
	'vxs-jmeadows-sync-immunization-request',
	'vxs-jmeadows-sync-lab-request',
	'vxs-jmeadows-sync-medication-request',
	'vxs-jmeadows-sync-note-request',
	'vxs-jmeadows-sync-order-request',
	'vxs-jmeadows-sync-problem-request',
	'vxs-jmeadows-sync-progressNote-request',
	'vxs-jmeadows-sync-radiology-request',
	'vxs-jmeadows-sync-vital-request',
	'vxs-jmeadows-sync-request',
	'vxs-vler-xform-vpr',
	'vxs-vler-sync-request',
	/vxs-vista-[0-9a-fA-F]{4}-subscribe-request$/,				// This is special case - since there can be multiple of these - we need to get them all
	'vxs-enterprise-sync-request',
	'vxs-resync-request',
	'vxs-pgd-xform-vpr',
	'vxs-pgd-sync-request',
];

//-----------------------------------------------------------------------------------
// This function sets up the environment variables that will be used.
//
// callback:  function (error, message)
//        where:  error: null if there is no error, and the text identifying the
//                       error if one occurs.
//                message: The message to be printed.
//-----------------------------------------------------------------------------------
function setupEnvironment(callback) {
    var metricsLog = new Metrics(config);
    var jds = new JdsClient(logger, metricsLog, config);
    environment = {
        jobStatusUpdater: {},
        publisherRouter: {},
        jds: jds,
        metrics: metricsLog,
    };
    environment.jobStatusUpdater = new JobStatusUpdater(logger, config, environment.jds);
    environment.publisherRouter = new PublisherRouter(logger, config, metricsLog, environment.jobStatusUpdater);
    return callback(null, null);
}

//-----------------------------------------------------------------------------------
// Verify that the baseDir parameter really contains the path to the base directory,
// and that the directory exists and contains subdirectories.
//
// baseDir: The base directory where the exported jobs reside.
// callback:  function (error, message)
//        where:  error: null if there is no error, and the text identifying the
//                       error if one occurs.
//                message: The message to be printed.
//-----------------------------------------------------------------------------------
function verifyBasedirParam(baseDir, callback) {
	// Make sure baseDir has something...
	//-----------------------------------
	if ((!_.isString(baseDir)) || (baseDir === '')) {
		return callback('BASEDIR_NOT_SET', 'basedir must be a valid string representation of the baseDir path.');
	}

	fs.exists(baseDir, function(exists) {
		if (!exists) {
			return callback('BASEDIR_NOT_EXIST', 'basedir must be an existing directory');
		}

		// Verify that this basedir has subdirectories
		//--------------------------------------------
		fs.readdir(baseDir, function(error, files) {
			if (error) {
				return callback('BASEDIR_FAILED_READ_SUBDIRS', 'Failed to read the files within basedir.');
			}

			if (!_.isArray(files)) {
				return callback('BASEDIR_CONTAINED_NO_FILES', 'The basedir contained no sub-directories.');
			}

			var subDirectories = [];

			// This file should contain only directories.  Lets make sure this is the case.
			//-----------------------------------------------------------------------------
			async.every(files, function(file, everyCallback) {
				var fileName = baseDir + file;
				subDirectories.push(fileName);
				fs.stat(fileName, function(error, stats) {
					if (error) {
						console.log('Error occurred when calling fs.stat for file: %s.  Error: %s', fileName, error);
						return everyCallback(null, false);
					}
					var isSubDir = stats.isDirectory();
					if (!isSubDir) {
						console.log('The base directory: %s should contain only sub-directories.   The following file was not a sub-directory: %s.', baseDir, fileName);
					}
					return everyCallback(null, isSubDir);
				});
			}, function (error, allAreSubDirs) {
				if (!allAreSubDirs) {
					return callback('BASEDIR_HAS_NON_SUBDIRS', 'Basedir contains some files that are not sub-directories.');
				}

				baseDirSubDirectories = subDirectories;

				return callback(null, null);
			});
		});
	});
}

//-----------------------------------------------------------------------------------
// Verify that the tube parameter contains the correct item.  The following are
// valid: null, 'ALL', or a specific tube.  If a specific tube is given, then
// this will validate that there is a subdirectory in the basedir for that tube.
//
// baseDir: The base directory where the exported jobs reside.
// tube: The tube where the exported jobs will be processed.  (This is also the name
//       of the subdirectory in basedir containing the jobs to be processed.)
// callback:  function (error, message)
//        where:  error: null if there is no error, and the text identifying the
//                       error if one occurs.
//                message: The message to be printed.
//-----------------------------------------------------------------------------------
function verifyTubeParam(baseDir, tube, callback) {
	if (tube === 'ALL') {
		tubesToProcess = baseDirSubDirectories;
		return (callback(null, null));
	}

	var fileName = baseDir + tube;
	fs.exists(fileName, function(exists) {
		if (!exists) {
			return callback('DIR_NOT_EXIST', util.format('There is no directory for tube: %s.  The following does not exist: %s', tube, fileName));
		}

		// Note that we do not need to check to see if it is a directory - because the verifyBasedirParam will verify that all files under baseDir
		// are directories.
		//-----------------------------------------------------------------------------------------------------------------------------------------
		tubesToProcess = [fileName];

		return callback(null, null);
	});
}


//-----------------------------------------------------------------------------------
// Verify that the type parameter contains a correct value.  The following are
// valid: null, 'BURIED', 'READY', 'DELAYED', 'ALL'.  Note that null means it will do
// 'READY' and 'DELAYED'.   'ALL' means it will do all three.  This function will
// update the typesToProcess array with all the types that should be included.
//
// type: The type of job to process
// callback:  function (error, message)
//        where:  error: null if there is no error, and the text identifying the
//                       error if one occurs.
//                message: The message to be printed.
//-----------------------------------------------------------------------------------
function verifyTypeParam(type, callback) {
	if ((type === null) || (type === undefined)) {
		typesToProcess = /^(READY|DELAYED)_/;
		return callback(null, null);
	}

	if (type === 'ALL') {
		typesToProcess = /^(READY|DELAYED|BURIED)_/;
		return callback(null, null);
	}

	if ((type === 'READY') || (type === 'DELAYED') || (type === 'BURIED')) {
		typesToProcess = new RegExp('^' + type + '_');
		return callback(null, null);
	}

	return callback('TYPE_NOT_VALID', util.format('The type value: %s was not a valid type.', type));
}

//------------------------------------------------------------------------------------
// This function creates the "completed" directory under the specified tube directory.
// If the file already exists, it makes sure that it is a directory.
//
// tubeFileAndPath: The file and path of the tube directory.
// callback:  function (error, message)
//        where:  error: null if there is no error, and the text identifying the
//                       error if one occurs.
//                message: The message to be printed.
//------------------------------------------------------------------------------------
function setupCompletedDir(tubeFileAndPath, callback) {
	var completedDir = tubeFileAndPath;
	if (/\/$/.test(completedDir) === false) {
		completedDir += '/';
	}
	completedDir += COMPLETED_SUBDIR_NAME;

	console.log('Calling fs.mkdir for %s.', completedDir);

	fs.mkdir(completedDir, '700', function(error) {
		// console.log('DEBUG: fs.mkdir returned when attempting to create: %s.  Error: %s', completedDir, error);

		// If the file already exists - we need to make sure it is a directory.
		//---------------------------------------------------------------------
		if ((error) && (error.code === 'EEXIST')) {
			fs.stat(completedDir, function(error, stats) {
				if (error) {
					console.log('Error occurred when checking stats for %s.  Error: %s', completedDir, error);
					return callback('FAILED_CHECK_COMPLETED_DIR_ERROR', util.format('Failed when checking stats for %s.  Error: %s', completedDir, error));
				}

				if (!stats) {
					console.log('Error occurred when checking stats for %s.  Stats was null.', completedDir);
					return callback('FAILED_CHECK_COMPLETED_DIR_NO_STATS', util.format('Failed when checking stats for %s.  Stats was null.', completedDir));
				}

				if (!stats.isDirectory()) {
					console.log('Error occurred when verifying %s is a directory.  It is not a directory and must be a directory before you can continue.', completedDir);
					return callback('FAILED_CHECK_COMPLETED_DIR_NOT_DIRECTORY', 
						   util.format('Error occurred when verifying %s is a directory.  It is not a directory and must be a directory before you can continue.', completedDir));
				}

				// If we got here - it exists and it is a directory.
				//--------------------------------------------------
				return callback(null, null);
			});
		} else if (error) {
			console.log('Error occurred creating %s.  Error: %s', completedDir, error);
			return callback('FAILED_CHECK_COMPLETED_DIR_ERROR', util.format('Error occurred creating %s.  Error: %s', completedDir, error));
		} else {
			return callback(null, null);
		}
	});

}

//-------------------------------------------------------------------------------------
// This function makes sure that there is a directory named 'completed' in each of the
// tube subdirectories.  This is where each job file will be moved when they have been
// pushed back into the tube.
//
// callback:  function (error, message)
//        where:  error: null if there is no error, and the text identifying the
//                       error if one occurs.
//                message: The message to be printed.
//-------------------------------------------------------------------------------------
function setupCompletedDirs(callback) {
	// console.log('DEBUG: Entered setupCompletedDirs.  tubesToProcess: %j', tubesToProcess);
	var tasks = [];
	_.each(tubesToProcess, function(tubeAndFilePath) {
		tasks.push(setupCompletedDir.bind(null, tubeAndFilePath));
	});

	async.series(tasks, function(error, results) {
		if (error) {
			console.log('Failed to create completed subdirectories under one or more of the tube directories.  Error: %s, Results: %j', error, results);
			return callback('FAILED_CREATE_COMPLETED_DIRS', util.format('Failed to create completed subdirectories under one or more of the tube directories.  Error: %s; Results: %j', error, results));
		}

		return callback(null, null);
	});
}


//---------------------------------------------------------------------------------------
// This function will take then etries in the tubesToProcess and put them in the correct
// order for processing.
//
// callback:  function (error, message)
//        where:  error: null if there is no error, and the text identifying the
//                       error if one occurs.
//                message: The message to be printed.
//---------------------------------------------------------------------------------------
function putTubesInCorrectOrder (callback) {
	// console.log('DEBUG: Preparing to sort tubes.  tubesToProcess: %j', tubesToProcess);

	// If there is no array, or it is empty , or it has only one item - there is no need to sort it.
	//-----------------------------------------------------------------------------------------------
	if ((!_.isArray(tubesToProcess)) || (tubesToProcess.length === 0) || (tubesToProcess.length === 1)) {
		return callback(null, null);
	} else {

		// The easiest way I can see to do this sorting... Is to use the "already sorted list as a guide..."
		// walk through that list, one by one and see if the corresponding entry(s) are in the tubesToProcess
		// list and if they are build a new array by movig the items from the tubesToProcess array into the
		// new array in the right order.  As they are moved, they are also removed from the tubesToProcess
		// array.  When that array is empty, we are done creating the sorted list.  Note there are a couple of
		// special cases where one entry in the master sort order really could be multiple entries in the
		// tubesToProcess list.  For example, vxs-record-enrichment can have multiple tubes based on configuration.
		// Right now it could have 5 - but production may configure it differently - so we have to handle as
		// many as are there.   Also the ones that have the site as part of their tube name will also be effected.
		// We will have to do special handling on those to pick up the items correctly.
		//---------------------------------------------------------------------------------------------------------
		var tubesToProcessSorted = [];
		_.each(tubeCorrectOrder, function(tubeName) {
			if (typeof tubeName === 'string') {
				var tubeNameWithBasedir = baseDir + tubeName;
				var locationIdx = _.indexOf(tubesToProcess, tubeNameWithBasedir);
				if (locationIdx >= 0) {
					tubesToProcessSorted.push(tubeNameWithBasedir);
					tubesToProcess.splice(locationIdx, 1);
				}
			}
			// Is this one of our special cases we have to deal with via RegExp?
			//-------------------------------------------------------------------
			else if ((typeof tubeName === 'object') && (tubeName instanceof RegExp)) {
				// Since we should not be deleting from an array we are iterating.. First collect up all the items
				// we need into its own array.  Then we will use that to put the items into the new sorted list
				// and then remove the items from the original list.
				//------------------------------------------------------------------------------------------------
				var matchingItems = [];
				_.each(tubesToProcess, function(tubeAndFilePath) {
					if (tubeName.test(tubeAndFilePath)) {
						matchingItems.push(tubeAndFilePath);
					}
				});

				if (matchingItems.length > 0) {
					_.each(matchingItems, function(tubeAndFilePath) {
						var matchItemIdx = _.indexOf(tubesToProcess, tubeAndFilePath);
						if (matchItemIdx >= 0) {
							tubesToProcessSorted.push(tubeAndFilePath);
							tubesToProcess.splice(matchItemIdx, 1);
						}
					});
				}
			}
		});

		// If for some reason there are still items left in the tubesToProcess - then put them at the end of our list.
		//-------------------------------------------------------------------------------------------------------------
		if (tubesToProcess.length > 0) {
			_.each(tubesToProcess, function(tubeAndFilePath) {
				tubesToProcessSorted.push(tubeAndFilePath);
			});
		}

		tubesToProcess = tubesToProcessSorted;

		console.log('DEBUG: Completed sorting tubes.  tubesToProcess: %j', tubesToProcess);

		return callback(null, null);
	}
}

//---------------------------------------------------------------------------------------------
// This function moves the json file that was just sent to beanstalk to the completed directory
// to show that it has now been processed.
//
// tubeFileAndPath: The file and path of the tube directory.
// jsonFileName: The file in the tube directory that is being imported.
// callback:  function (error, message)
//        where:  error: null if there is no error, and the text identifying the
//                       error if one occurs.
//                message: The message to be printed.
//---------------------------------------------------------------------------------------------
function moveFileToCompleted(tubeAndFilePath, jsonFileName, callback) {
	var originalFileName = tubeAndFilePath + '/' + jsonFileName;
	var completedFileName = tubeAndFilePath + '/' + COMPLETED_SUBDIR_NAME + '/' + jsonFileName;

	fs.rename(originalFileName, completedFileName, function(error) {
		if (error) {
			return callback('FAILED_TO_MOVE_FILE', util.format('WARNING: Failed to rename file from: %j to %j. Error: %s', originalFileName, completedFileName, error));
		}

		return callback(null, null);
	});
}

//----------------------------------------------------------------------------------------
// This function imports one file.  It will read the file, push the job to beanstalk, then
// move the file to the "completed" directory.
//
// tubeFileAndPath: The file and path of the tube directory.
// jsonFileName: The file in the tube directory that is being imported.
// callback:  function (error, message)
//        where:  error: null if there is no error, and the text identifying the
//                       error if one occurs.
//                message: The message to be printed.
//----------------------------------------------------------------------------------------

function processImportFile(tubeAndFilePath, jsonFileName, callback) {
	console.log('DEBUG: Entered processImportFile.  tubeAndFilePath: %s; file: %s', tubeAndFilePath, jsonFileName);

	var jsonFileNameAndPath = tubeAndFilePath + '/' + jsonFileName;

	// Read the file
	//---------------
	fs.readFile(jsonFileNameAndPath, 'utf-8', function(error, fileContents) {
		// console.log('DEBUG', 'Returned from readFile: fileContents: %s', fileContents);
		if (error) {
			console.log('Error occurred reading file: %j; error: %s', jsonFileNameAndPath, error);
			return callback('FAILED_READING_FILE', util.format('Error occurred reading file: %j; error: %s', jsonFileNameAndPath, error));
		}

		if ((!_.isString(fileContents)) || (fileContents === '')) {
			console.log('File contained no content: %j; error: %s', jsonFileNameAndPath, error);
			return callback('FAILED_NO_CONTENT_IN_FILE', util.format('File contained no content: %j; error: %s', jsonFileNameAndPath, error));
		}

		var jobToPublish;

		try {
			jobToPublish = JSON.parse(fileContents);
		} catch (error) {
			console.log('WARNING:  Failed to parse contents of file: %j into JSON.  Skipping this job.  Error: %s', jsonFileNameAndPath, error);
			return callback(null, null);
		}

		if (_.isEmpty(jobToPublish)) {
			console.log('WARNING:  The file had no JSON content: %j into JSON.  Skipping this job.  Error: %s', jsonFileNameAndPath, error);
			return callback(null, null);
		}

		// Publish the job
		//----------------
	    environment.publisherRouter.publish(jobToPublish, function(error) {
	        if (error) {
	            console.log('WARNING: Failed to publish job.  File: %s, error: %s, Job: %j.', jsonFileNameAndPath, error, jobToPublish);
	            return callback(null, null);
	        }


	        // Move file to the "completed" directory
	        //---------------------------------------
	        moveFileToCompleted(tubeAndFilePath, jsonFileName, function (error) {
	        	if (error) {
		            console.log('WARNING: Failed to move job to completed tube.  File: %s, error: %s, Job: %j.', jsonFileNameAndPath, error, jobToPublish);
		            return callback(null, null);
	        	}

		        return callback(null, null);
	        });
	    });
	});
}

//---------------------------------------------------------------------------------------
// This function will process the requested import for the specified tube directory.
//
// tubeFileAndPath: The file and path of the tube directory.
// callback:  function (error, message)
//        where:  error: null if there is no error, and the text identifying the
//                       error if one occurs.
//                message: The message to be printed.
//---------------------------------------------------------------------------------------
function processImportForTube (tubeAndFilePath, callback) {
	// Nothing to process in this directory.  We should never see this - but just in case...
	//--------------------------------------------------------------------------------------
	if ((!_.isString(tubeAndFilePath)) || (tubeAndFilePath === '')) {
		return callback(null, null);
	}

	fs.readdir(tubeAndFilePath, function(error, files) {
		if (error) {
			console.log('Error occurred retrieving list of files from directory: %j; error: %s', tubeAndFilePath, error);
			return callback('FAILED_RETRIEVE_FILE_LIST', util.format('Error occurred retrieving list of files from directory: %j; error: %s', tubeAndFilePath, error));
		}

		// If this is a JSON file and it is one of the types we are supposed to process...
		//--------------------------------------------------------------------------------
		if ((_.isArray(files)) && (files.length > 0)) {
			var fileToProcessTasks = [];
			_.each(files, function(file) {
				if ((/.json$/.test(file)) && typesToProcess.test(file)) {
					fileToProcessTasks.push(processImportFile.bind(null, tubeAndFilePath, file));
				}
			});

			async.series(fileToProcessTasks, function(error, results) {
				if (error) {
					console.log('Failed to import jobs from tubes.  Error: %s, Results: %j', error, results);
					return callback('FAILED_IMPORT_TUBES', util.format('Failed to import jobs from tubes.  Error: %s; Results: %j', error, results));
				}

				return callback(null, null);
			});
		}
	});


}


//---------------------------------------------------------------------------------------
// This function will process the requested import.
//
// callback:  function (error, message)
//        where:  error: null if there is no error, and the text identifying the
//                       error if one occurs.
//                message: The message to be printed.
//---------------------------------------------------------------------------------------
function processImport(callback) {
	// console.log('DEBUG: Entered processImport.  tubesToProcess: %j', tubesToProcess);

	var tasks = [];
	_.each(tubesToProcess, function(tubeAndFilePath){
		tasks.push(processImportForTube.bind(null, tubeAndFilePath));
	});

	async.series(tasks, function(error, results) {
		if (error) {
			console.log('Failed to import jobs from tubes.  Error: %s, Results: %j', error, results);
			return callback('FAILED_IMPORT_TUBES', util.format('Failed to import jobs from tubes.  Error: %s; Results: %j', error, results));
		}

		return callback(null, null);
	});
}


var tasks = [];
tasks.push(verifyBasedirParam.bind(null, baseDir));
tasks.push(verifyTubeParam.bind(null, baseDir, tube));
tasks.push(verifyTypeParam.bind(null, type));
tasks.push(setupCompletedDirs.bind(null));
tasks.push(setupEnvironment.bind(null));
tasks.push(putTubesInCorrectOrder.bind(null));
tasks.push(processImport.bind(null));

async.series(tasks, function (error, results) {
	// console.log('DEBUG: Returned from calling tasks.  Error: %s; results: %j', error, results);
	console.log('Tubes Processed: %j', tubesToProcess);
	console.log('Types Processed: %s', typesToProcess);
	var messages = mapUtil.filteredMap(results, function (message) {
		return message;
	}, [null, undefined]);

	if (error) {
		console.log('Error occurred: error: %s; messages: %j; results: %j', error, messages, results);
		process.exit(); // Since JDS Client is using a Forever Agent - we have to force this process to end.
	} else {
		console.log('STATUS: SUCCESS - %s', messages);
		process.exit(); // Since JDS Client is using a Forever Agent - we have to force this process to end.
	}
});
