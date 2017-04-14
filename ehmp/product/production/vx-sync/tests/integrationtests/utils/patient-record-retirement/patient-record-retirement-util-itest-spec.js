'use strict';

require('../../../../env-setup');

var RecordRetirementUtil = require(global.VX_UTILS + 'patient-record-retirement/patient-record-retirement-util');
var log = require(global.VX_DUMMIES + '/dummy-logger');

// NOTE: be sure next lines are commented out before pushing
// var logUtil = require(global.VX_UTILS + 'log');
// log = logUtil._createLogger({
// 	name: 'test',
// 	level: 'debug',
// 	child: logUtil._createLogger
// });

var _ = require('underscore');
var async = require('async');
var request = require('request');

var host = require(global.VX_INTTESTS + 'test-config');
var port = 5000;
var val = require(global.VX_UTILS + 'object-utils').getProperty;

var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var BeanstalkClient = require(global.VX_JOBFRAMEWORK).BeanstalkClient;
var solrSmartClient = require('solr-smart-client');
var VistaClient = require(global.VX_SUBSYSTEMS + 'vista/vista-client');
var HdrClient = require(global.VX_SUBSYSTEMS + 'hdr/hdr-client');
var VxSyncForeverAgent = require(global.VX_UTILS + 'vxsync-forever-agent');

var val = require(global.VX_UTILS + 'object-utils').getProperty;
var inspect = require('util').inspect;

var getBeanstalkConfig = require(global.VX_INTTESTS + 'framework/handler-test-framework').getBeanstalkConfig;
var updateTubenames = require(global.VX_INTTESTS + 'framework/handler-test-framework').updateTubenames;
var getTubenames = require(global.VX_INTTESTS + 'framework/handler-test-framework').getTubenames;
var clearTubes = require(global.VX_INTTESTS + 'framework/handler-test-framework').clearTubes;
var grabJobs = require(global.VX_INTTESTS + 'framework/job-grabber');

var PublisherRouter = require(global.VX_JOBFRAMEWORK).PublisherRouter;

//Make deep copy of config so that we can modify it without affecting other tests
var config = JSON.parse(JSON.stringify(require(global.VX_ROOT + 'worker-config')));

config.recordRetirement = {
	'rules': {
		'largePatientRecord': {
			'patientTotalSizeLimit': 100000000,
			'avgSizePerEvent': 100
		}
	},
	'lastAccessed': -1
};

config.syncRequestApi.host = host;

var tubePrefix = 'retirement-util-test';
var jobType = 'patient-record-retirement';
var tubenames;
var publisherRouter;
/*
	*** Note ***
	This test requires a patient to be synced before it can test the utility.
	The patient used here is 9E7A;21.
	This patient will remain synced after the test runs.
 */

describe('patient-record-retirement-util', function() {
	it('runUtility', function() {

		var pid = '9E7A;21';

		var environment = {
			vistaClient: new VistaClient(log, log, config, null),
			jds: new JdsClient(log, log, config),
			solr: solrSmartClient.initClient(config.solrClient.core, config.solrClient.zooKeeperConnection, log, new VxSyncForeverAgent()),
			hdrClient: new HdrClient(log, log, config),
			beanstalk: new BeanstalkClient(log, host, config.beanstalk.repoDefaults.port),
			jobStatusUpdater: {
				createJobStatus: function(job, callback) {
					callback();
				},
				errorJobStatus: function(job, error, callback) {
					callback();
				}
			},

		};

		spyOn(environment.beanstalk, 'put').andCallThrough();

		var recordRetirementUtil;

		var syncRequestError;
		var syncRequestResponse;
		var syncRequestComplete = false;
		var syncIsComplete = false;
		var syncStatusCalledCounter = 0;

		//---------------------------------------------------------------------------------------------------
		// This function checks the sync status to see if there is nothing in progress and there are no
		// open jobs.  If that is the case, it will set syncIsComplete to true.
		//
		// callback: The function to call when the check is done.
		//---------------------------------------------------------------------------------------------------
		function checkSyncComplete(callback) {
			log.debug('patient-record-retirement-util-itest-spec.checkSyncComplete: Entered method.');
			var syncStatusCallComplete = false;
			var syncStatusCallError;
			var syncStatusCallResponse;
			runs(function() {
				var options = {
					url: config.syncRequestApi.protocol + '://' + host + ':' + config.syncRequestApi.port + config.syncRequestApi.patientStatusPath + '?pid=' + pid,
					method: 'GET'
				};

				syncStatusCalledCounter++;
				log.debug('patient-record-retirement-util-itest-spec.checkSyncComplete: Retrieving status: syncStatusCalledCounter: %s; options: %j', syncStatusCalledCounter, options);
				request.get(options, function(error, response, body) {
					log.debug('patient-record-retirement-util-itest-spec.checkSyncComplete: Retrieving status - Call back called: error: %j, response: %j, body: %j', error, response, body);
					expect(response).toBeTruthy();
					expect(val(response, 'statusCode')).toBe(200);
					expect(body).toBeTruthy();

					var syncStatusData;
					try {
						syncStatusData = JSON.parse(body);
					} catch (parseError) {}

					log.debug('patient-record-retirement-util-itest-spec.checkSyncComplete: Retrieving status - Call back called: syncStatusData: %j', syncStatusData);
					expect(syncStatusData).toBeTruthy();
					if (syncStatusData && (_.isObject(syncStatusData.syncStatus)) && (_.isEmpty(syncStatusData.syncStatus.inProgress)) &&
						(_.isArray(syncStatusData.jobStatus)) && (_.isEmpty(syncStatusData.jobStatus))) {
						syncIsComplete = true;
					}

					syncStatusCallError = error;
					syncStatusCallResponse = response;
					syncStatusCallComplete = true;
					return callback();
				});
			});

			waitsFor(function() {
				return syncStatusCallComplete;
			}, 'Timed out waiting for syncRequest.', 10000);
		}

		//------------------------------------------------------------------------------------------------------
		// Returns the value of syncIsComplete.
		//
		// returns TRUE if the sync is complete.  False if it is not.
		//------------------------------------------------------------------------------------------------------
		function isSyncComplete() {
			log.debug('patient-record-retirement-util-itest-spec.isSyncComplete: Entered method.  syncIsComplete: %j', syncIsComplete);
			return syncIsComplete;
		}


		//------------------------------------------------------------------------------------------------------
		// Test code starts here....
		//------------------------------------------------------------------------------------------------------
		runs(function() {
			var options = {
				url: config.syncRequestApi.protocol + '://' + host + ':' + config.syncRequestApi.port + config.syncRequestApi.patientSyncPath + '?pid=' + pid,
				method: 'GET'
			};

			log.debug('patient-record-retirement-util-itest-spec: Sync Request.  options: %j', options);
			request.get(options, function(error, response, body) {
				log.debug('patient-record-retirement-util-itest-spec: Sync Request call back called.  error: %j; response: %j, body: %j', error, response, body);
				syncRequestError = error;
				syncRequestResponse = response;
				expect(val(response, 'statusCode')).toBe(202);
				syncRequestComplete = true;
			});
		});

		waitsFor(function() {
			return syncRequestComplete;
		}, 'Timed out waiting for syncRequest.', 10000);

		// Need to wait for the sync to complete.
		//----------------------------------------
		runs(function() {
			log.debug('patient-record-retirement-util-itest-spec: Starting async.doWhilst.');
			async.doUntil(checkSyncComplete, isSyncComplete, function(error) {
				expect(error).toBeFalsy();
				log.debug('patient-record-retirement-util-itest-spec: async.doWhilst call back called.  error: %j', error);
			});
		});

		waitsFor(function() {
			return syncIsComplete;
		}, 'Timed out waiting for sync to complete.', 60000);



		var beanstalkConfig = getBeanstalkConfig(config, host, port, tubePrefix + '-' + jobType);
		updateTubenames(beanstalkConfig);

		tubenames = getTubenames(beanstalkConfig, [jobType]);

		config.beanstalk = beanstalkConfig;

		environment.publisherRouter = new PublisherRouter(log, config, log, environment.jobStatusUpdater);
		publisherRouter = environment.publisherRouter;
		// Now we can test the handler
		//-----------------------------
		var handlerDone = false;
		runs(function() {
			log.debug('patient-record-retirement-util-itest-spec: now testing handler');
			recordRetirementUtil = new RecordRetirementUtil(log, config, environment);

			recordRetirementUtil.runUtility(function(error, result) {
				expect(error).toBeFalsy();
				expect(result).toBeTruthy();
				expect(result).toEqual('success');

				if (error) {
					handlerDone = true;
					return;
				}

				grabJobs(log, host, port, tubenames, 2, function(error, jobs) {
					expect(error).toBeFalsy();
					expect(result).toBeTruthy();
					// calledResult = result;

					var resultJobTypes = _.chain(jobs).map(function(result) {
						return result.jobs;
					}).flatten().pluck('type').value();

					expect(val(resultJobTypes, 'length')).toBeGreaterThan(0);
					expect(resultJobTypes).toContain(jobType);

					handlerDone = true;
				});
			});
		});

		waitsFor(function() {
			return handlerDone;
		}, 'waiting for handler', 10000);

	});

	afterEach(function() {
		log.debug('patient-record-retirement-util-itest-spec: Cleaning up...');
		if (publisherRouter) {
			publisherRouter.close();
		}

		var cleared = false;

		grabJobs(log, host, port, tubenames, 0, function() {
			cleared = true;
			log.debug('patient-record-retirement-util-itest-spec: **** grabJobs callback was called.');
		});

		clearTubes(log, host, port, tubenames, function() {
			cleared = true;
			log.debug('patient-record-retirement-util-itest-spec: **** clearTube callback was called.');
		});

		waitsFor(function() {
			return cleared;
		}, 'clear jobs timed out', 10000);

		runs(function() {
			log.debug('patient-record-retirement-util-itest-spec: **** test complete.');
		});
	});
});