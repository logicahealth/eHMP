'use strict';

//---------------------------------------------------------------------------------
// This file writes some jobs to some tubes so that the record update environment
// can be manually tested.  It writes a job to the record update tube on the separate
// persistent beanstalk instance (*You still must specify the correct port)
// to make sure the handler picks up and processes the job
//
// @Author: J.Vega, Les Westberg
//---------------------------------------------------------------------------------

require('../../env-setup');
var logger = require('bunyan').createLogger({
	name: 'writeTestJobToRecordUpdate',
	level: 'debug'
});
var BeanstalkClient = require(global.VX_JOBFRAMEWORK).BeanstalkClient;
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
	'jpid': uuid.v4(),
	'rootJobId': 1,
	'jobId': 1
};

var record = {
	'name': 'someRecord',
	'pid': '9E7A;3',
	'entered': 20150706152900,
	'facilityCode': 500,
	'facilityName': 'CAMP MASTER',
	'historical': true,
	'kind': 'Allergy / Adverse Reaction',
	'lastUpdateTime': 20160405132100,
	'localId': 1111,
	'mechanism': 'ALLERGY',
	'originatorName': 'PROGRAMMER,ONE',
	'products': [{
		'name': 'SOY MILK',
		'vuid': 'urn:va:vuid:4691068'
	}],
	'reactions': [{
		'name': 'HIVES',
		'vuid': 'urn:va:vuid:'
	}],
	'reference': '718;GMRD(120.82,',
	'stampTime': 20160405132100,
	'summary': 'SOY MILK',
	'typeName': 'DRUG, FOOD',
	'uid': 'urn:va:allergy:9E7A:3:1111',
	'verified': 20150706153033,
	'verifierName': '<auto-verified>'
};

var domain = 'allergy';

var patientIdentifier = {
	'type': 'pid',
	'value': '9E7A;3'
};

var normalJob1 = jobUtil.createRecordUpdate(patientIdentifier, domain, record, rootJob);
normalJob1.jobId = 2;

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
	client.put(priority, delaySecs, ttrSecs, job, callback);
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
	tasks.push(writeJob.bind(null, client, 0, JSON.stringify(normalJob1)));

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
writeToTubeTasks.push(writeJobsToTube.bind(null, 'vxs-record-update'));

async.series(writeToTubeTasks, function(error, result) {
	if (error) {
		console.log('An error occurred trying to write the jobs.  error: %j; result: %j', error, result);
	}

	process.exit();
});