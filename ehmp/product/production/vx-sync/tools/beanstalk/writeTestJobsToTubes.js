'use strict';

//---------------------------------------------------------------------------------
// This file writes some jobs to some tubes so that the waitForBeanstalkToClear.js
// file can be manually tested.  It writes two "ready", "delayed", and "buried"
// jobs to two separate tubes.  So that the tests can test clearing all three
// of these types of jobs on multiple tubes.
//
// @Author: Les Westberg
//---------------------------------------------------------------------------------


require('../../env-setup');
var logger = require('bunyan').createLogger({
	name: 'waitForBeanstalkToClear',
	level: 'debug'
});
var BeanstalkClient = require(global.VX_JOBFRAMEWORK + 'beanstalk-client');
var util = require('util');
var async = require('async');
var jobUtil = require(global.VX_UTILS + 'job-utils');
var uuid = require('node-uuid');


var argv = require('yargs')
  .usage('Usage: $0 [options...]')
  .demand(['host', 'port'])
  .describe('host', 'IP Address of the machine where the beanstalk is running.')
  .describe('port', 'Port for beanstalk. (NOT the beanstalk admin tool)')
  .argv;

var host = argv.host;
var port = argv.port;

var rootJob = {
	'jpid' : uuid.v4(),
	'rootJobId' : 1,
	'jobId' : 1
};

var record = {
	'name' : 'someRecord',
	'uid' : 'urn:va:allergy:9E7A:3:1111'
};

var domain = 'allergy';

var patientIdentifier = {
	'type': 'pid',
	'value': '9E7A;3'
};

var normalJob1 = jobUtil.createRecordEnrichment(patientIdentifier, domain, record,  rootJob);
normalJob1.jobId = 2;
var normalJob2 = jobUtil.createRecordEnrichment(patientIdentifier, domain, record,  rootJob);
normalJob2.jobId = 3;
var delayJob1 = jobUtil.createRecordEnrichment(patientIdentifier, domain, record,  rootJob);
delayJob1.jobId = 4;
var delayJob2 = jobUtil.createRecordEnrichment(patientIdentifier, domain, record,  rootJob);
delayJob2.jobId = 5;
var buriedJob1 = jobUtil.createRecordEnrichment(patientIdentifier, domain, record,  rootJob);
buriedJob1.jobId = 6;
var buriedJob2 = jobUtil.createRecordEnrichment(patientIdentifier, domain, record,  rootJob);
buriedJob2.jobId = 7;

//--------------------------------------------------------------------------------
// This function writes a job to the tube.
//
// client: Beanstalk client.
// delaySecs: The number of seconds to delay the job.
// job: The job to be written.
// callback: The callback handler.
//---------------------------------------------------------------------------------
function writeJob(client, delaySecs, job, callback) {
	var priority = 10;
	var ttrSecs = 60;
	client.put(priority, delaySecs, ttrSecs, job,  callback);
}

//--------------------------------------------------------------------------------
// This function writes a job to the tube and then buries it.
//
// client: Beanstalk client.
// job: The job to be written.
// callback: The callback handler.
//---------------------------------------------------------------------------------
function buryJob(client, job, callback) {
	writeJob(client, 0, job, function (error, beanstalkJobId) {
		console.log('Returned from writeJob.  error: %j; beanstalkJobId: %j', error, beanstalkJobId);
		if (error) {
			console.log('Failed to write job to tube.  job: %j', job);
			return callback(error);
		}

	    client.reserve_with_timeout(3, function(error, reservedBeanstalkJobId, reservedBeanstalkJobPayload) {
	    	if (error) {
	    		console.log('Failed to reserve job that we want to bury. job: %j', job);
	    		return callback(error);
	    	}
	    	if (!reservedBeanstalkJobId) {
	    		console.log('Failed to reserve a job.');
	    		return callback('FAILED-TO-RESERVE-JOB');
	    	}
	    	if (beanstalkJobId !== reservedBeanstalkJobId) {
	    		console.log('Failed to reserve the correct job. desired jobId: %s; reservedJobId: %s; reservedBeanstalkJobPayload: %j', beanstalkJobId, reservedBeanstalkJobId, reservedBeanstalkJobPayload);
	    		return callback('FAILED-TO-RESERVE-JOB');
	    	}

			var priority = 10;
			client.bury(beanstalkJobId, priority, callback);
	    });
	});
}

//----------------------------------------------------------------------------------
// This will do a deep clone of the job, and then put the tubeName in the job
// type - to make sure it is not confused with other real job types.
//
// job - The job to be cloned
// tubeName - the name of the tube.
//----------------------------------------------------------------------------------
function createJob(job, tubeName) {
	var clonedJob = null;

	try {
		clonedJob = JSON.parse(JSON.stringify(job));
	}
	catch (e) {
		console.log('Failed to clone the job.');
	}

	clonedJob.type = tubeName;
	return clonedJob;
}

//---------------------------------------------------------------------------------
// This function writes jobs to the tube in "ready", "delayed", and "buried" state.
//
// tubeName: The name of the tube to write the job too.
// callback: The callback handler.
//---------------------------------------------------------------------------------
function writeJobsToTube(tubeName, callback) {
    var client = new BeanstalkClient(logger, host, port);

    var tasks = [];
    tasks.push(buryJob.bind(null, client,  JSON.stringify(createJob(buriedJob1, tubeName))));
    tasks.push(buryJob.bind(null, client,  JSON.stringify(createJob(buriedJob2, tubeName))));
    tasks.push(writeJob.bind(null, client,  0, JSON.stringify(createJob(normalJob1, tubeName))));
    tasks.push(writeJob.bind(null, client,  0, JSON.stringify(createJob(normalJob2, tubeName))));
    tasks.push(writeJob.bind(null, client,  300, JSON.stringify(createJob(delayJob1, tubeName))));
    tasks.push(writeJob.bind(null, client,  300, JSON.stringify(createJob(delayJob2, tubeName))));

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

            // Need this to bury jobs.
            //------------------------
	        client.watch(tubeName, function(error) {
	            if (error) {
	                client.end(function() {
		                return callback(util.format('Failed to watch tube.  Host: %s; Port: %s; TubeName: %s; Error: %s', host, port, tubeName, error));
	                });
	            }

	            async.series(tasks, function(error, result) {
	            	if (error) {
	            		console.log('Failed to process tasks to write jobs to tubes.  error: %j; result: %j', error, result);
	            	}

					client.end(function() {
						return callback(error);
					});
	            });
	        });
        });
    });
}


// Begin code to do the work...
//--------------------------------
var writeToTubeTasks = [];
writeToTubeTasks.push(writeJobsToTube.bind(null, 'vx-sync-temp-1'));
writeToTubeTasks.push(writeJobsToTube.bind(null, 'vx-sync-temp-2'));

async.series(writeToTubeTasks, function (error, result) {
	if (error) {
		console.log('An error occurred trying to write the jobs.  error: %j; result: %j', error, result);
	}

	process.exit();
});
