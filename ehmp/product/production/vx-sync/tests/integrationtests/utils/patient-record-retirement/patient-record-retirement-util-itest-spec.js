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

var testConfig = require(global.VX_INTTESTS + 'test-config');
var host = testConfig.vxsyncIP;
var port = PORT;

var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var BeanstalkClient = require(global.VX_JOBFRAMEWORK).BeanstalkClient;
var solrSmartClient = require('solr-smart-client');
var VistaClient = require(global.VX_SUBSYSTEMS + 'vista/vista-client');
var HdrClient = require(global.VX_SUBSYSTEMS + 'hdr/hdr-client');
var VxSyncForeverAgent = require('http').Agent;

var val = require(global.VX_UTILS + 'object-utils').getProperty;

var syncAndWaitForPatient = require(global.VX_INTTESTS + 'framework/handler-test-framework').syncAndWaitForPatient;
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
config.syncRequestApi.port = testConfig.vxsyncPort;

var tubePrefix = 'retirement-util-test';
var jobType = 'patient-record-retirement';
var tubenames;
var publisherRouter;
/*
	*** Note ***
	This test requires a patient to be synced before it can test the utility.
	The patient used here is SITE;21.
	This patient will remain synced after the test runs.
 */

describe('patient-record-retirement-util', function() {
	it('runUtility', function() {
		var referenceInfo = {
			sessionId: 'TEST',
			utilityType: 'Patient Record Retirement Util Integration Test'
		};

		var pid = 'SITE;21';

		var environment = {
			vistaClient: new VistaClient(log, log, config, null),
			jds: new JdsClient(log, log, config),
			solr: solrSmartClient.createClient(log, config.solrClient, new VxSyncForeverAgent({keepAlive: true, maxSockets: config.handlerMaxSockets || 5})),
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

		syncAndWaitForPatient(log, config, pid);

		var recordRetirementUtil;

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

			recordRetirementUtil.runUtility(referenceInfo, function(error, result) {
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

					//Check every job for referenceInfo
					_.each(val(jobs, ['0','jobs']), function(job){
                        expect(job.referenceInfo).toEqual(jasmine.objectContaining({
                        	sessionId: referenceInfo.sessionId,
                        	utilityType: referenceInfo.utilityType,
                        	requestId: jasmine.any(String)
                        }));
                    });

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
