'use strict';

//------------------------------------------------------------------------------------
// This file contains unit tests for site-type-rule.js.
//
// Author: Les Westberg
//------------------------------------------------------------------------------------

require('../../../env-setup');
var siteTypeRule = require(global.VX_EVENTPRIORITYRULES + 'site-type-rule');
var JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');

var log = require(global.VX_DUMMIES + 'dummy-logger');
//--------------------------------------------------------------
// Uncomment the following to see the logging out on the screen.
//--------------------------------------------------------------
// var logUtil = require(global.VX_UTILS + 'log');
// logUtil.initialize([{
//     name: 'root',
//     stream: process.stdout,
//     level: 'debug'
// }]);
// log = logUtil.get('test', 'debug');
//------------------------------------------
// End of logging stuff to comment out....
//------------------------------------------
// log = require('bunyan').createLogger({
// 	name: 'site-type-rule-spec',
// 	level: 'debug'
// });


var hmpServer = 'TheHmpServer';

var config = {
	jds: {
		protocol: 'http',
		host: 'IP_ADDRESS',
		port: 9080
	},
	'vistaSites': {
		'9E7A': {
			'name': 'panorama',
			'host': 'IP_ADDRESS',
			'port': 9210,
			'accessCode': 'PW',
			'verifyCode': 'PW',
			'localIP': '127.0.0.1',
			'localAddress': 'localhost',
			'connectTimeout': 3000,
			'sendTimeout': 10000
		},
		'C877': {
			'name': 'kodak',
			'host': 'IP_ADDRESS',
			'port': 9210,
			'accessCode': 'PW',
			'verifyCode': 'PW',
			'localIP': '127.0.0.1',
			'localAddress': 'localhost',
			'connectTimeout': 3000,
			'sendTimeout': 10000
		}
	},
	'hmp.server.id': hmpServer,
	'hmp.version': '0.7-S65',
	'hmp.batch.size': '1000',
	'hmp.extract.schema': '3.001',
	'hdr': {
		'operationMode': 'REQ/RES'
	}
};

var vistaHdrConfig = {
	jds: {
		protocol: 'http',
		host: 'IP_ADDRESS',
		port: 9080
	},
	'vistaSites': {
		'9E7A': {
			'name': 'panorama',
			'host': 'IP_ADDRESS',
			'port': 9210,
			'accessCode': 'PW',
			'verifyCode': 'PW',
			'localIP': '127.0.0.1',
			'localAddress': 'localhost',
			'connectTimeout': 3000,
			'sendTimeout': 10000
		},
		'C877': {
			'name': 'kodak',
			'host': 'IP_ADDRESS',
			'port': 9210,
			'accessCode': 'PW',
			'verifyCode': 'PW',
			'localIP': '127.0.0.1',
			'localAddress': 'localhost',
			'connectTimeout': 3000,
			'sendTimeout': 10000
		}
	},
	'hmp.server.id': hmpServer,
	'hmp.version': '0.7-S65',
	'hmp.batch.size': '1000',
	'hmp.extract.schema': '3.001',
	'hdr': {
		'operationMode': 'PUB/SUB',
		'hdrSites': {
			'3A8B': {
				'stationNumber': 42
			},
			'CF2A': {
				'stationNumber': 101
			},
			'72A0': {
				'stationNumber': 13
			},
			'8211': {
				'stationNumber': 1337
			},
			'84F0': {
				'stationNumber': 578
			}
		}
	}
};


//---------------------------------------------------------------------
// Create an instance of the environment variable.
//---------------------------------------------------------------------
function createEnvironment(the_config) {
	var environment = {
		jds: new JdsClientDummy(log, the_config),
	};

	spyOn(environment.jds, 'getJobStatus').andCallThrough();

	return environment;
}

//--------------------------------------------------------------------
// Create an instance of the job and return it.
//
// pid: The pid to associate with this job.
// priority: The priority to associated with this job
// returns: The created job
//--------------------------------------------------------------------
function createJob(pid, priority) {
	var job = {
		type: 'record-enrichment',
		patientIdentifier: {
			type: 'pid',
			value: pid
		},
		jpid: '8107cc41-69eb-4060-8813-a82db245a11a',
		rootJobId: '1',
		dataDomain: 'appointment',
		priority: priority,
		record: {},
		jobId: '34'
	};

	return job;

}

//--------------------------------------------------------------------
// Create an instance of the job status and return it.
//
// pid: The pid to associate with this job status.
// priority: The priority to associated with this job status
// returns: The created job status
//--------------------------------------------------------------------
function createJobStatus(pid, priority) {
	var jobStatus = {
		'jobId': '4bbb4574-68ab-4fd0-9aaf-5abf75765449',
		'jpid': '15fbef90-aed2-4267-9f8b-980ad62c2a00',
		'patientIdentifier': {
			'type': 'pid',
			value: pid
		},
		priority: priority,
		'rootJobId': '4bbb4574-68ab-4fd0-9aaf-5abf75765449',
		'status': 'completed',
		'timestamp': '1458680891151',
		'type': 'enterprise-sync-request'
	};

	return jobStatus;

}

//----------------------------------------------------------------------------
// Since we are mocking out JDS - and since each of the calls to JDS for this
// unit test are similar.  This function sets up the jds response that should
// be given when JDS is called.
//
// environment: The environment object containing the handle to JDS
// jobStatus: The jobStatus that will be returned by JDS.
//----------------------------------------------------------------------------
function setupDummyJds(environment, jobStatus) {
	var expectedJdsError = [null];
	var expectedJdsResponse = [{
		statusCode: 200
	}];
	var expectedJdsResult = [{
		items: [jobStatus]
	}];
	environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);
}

describe('site-type-rule.js', function() {
	describe('extractSite()', function() {
		it('Happy Path with valid job', function() {
			var job = createJob('9E7A;3', 1);
			var site = siteTypeRule._internalFunctions._extractSite(job);
			expect(site).toBe('9E7A');
		});
		it('Happy Path with valid jobStatus', function() {
			var jobStatus = createJobStatus('C877;3', 1);
			var site = siteTypeRule._internalFunctions._extractSite(jobStatus);
			expect(site).toBe('C877');
		});
		it('Job or jobStatus is null', function() {
			var site = siteTypeRule._internalFunctions._extractSite(null);
			expect(site).toBeNull();
		});
		it('Job or jobStatus is undefined', function() {
			var site = siteTypeRule._internalFunctions._extractSite(undefined);
			expect(site).toBeNull();
		});
		it('job.patientIdentifier is undefined', function() {
			var job = {};
			var site = siteTypeRule._internalFunctions._extractSite(job);
			expect(site).toBeNull();
		});
		it('job.patientIdentifier.value is undefined', function() {
			var job = {
				patientIdentifier: {}
			};
			var site = siteTypeRule._internalFunctions._extractSite(job);
			expect(site).toBeNull();
		});
	});
	describe('fixPriorityRange()', function() {
		it('Happy Path with no change', function() {
			var job = createJob('9E7A;3', 50);
			siteTypeRule._internalFunctions._fixPriorityRange(job);
			expect(job.priority).toBe(50);
		});
		it('Range too low', function() {
			var job = createJob('9E7A;3', -25);
			siteTypeRule._internalFunctions._fixPriorityRange(job);
			expect(job.priority).toBe(1);
		});
		it('Range too high', function() {
			var job = createJob('9E7A;3', 500);
			siteTypeRule._internalFunctions._fixPriorityRange(job);
			expect(job.priority).toBe(100);
		});
	});
	describe('prioritize()', function() {
		it('Happy Path with valid my-site job', function() {
			var environment = createEnvironment(config);
			var job = createJob('9E7A;3', 1);
			var jobStatus = createJobStatus('9E7A;3', 1);
			setupDummyJds(environment, jobStatus);

			var finished = false;

			runs(function() {
				siteTypeRule(log, config, environment, job, function(err, resultJob) {
					expect(err).toBeFalsy();
                    expect(environment.jds.getJobStatus.calls.length).toEqual(1);
                    expect(environment.jds.getJobStatus).toHaveBeenCalledWith(job, jasmine.objectContaining({ filter: jasmine.any(String) }), jasmine.any(Function));
					expect(resultJob).toBeTruthy();
					expect(resultJob.priority).toBe(1);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('Happy Path with valid Other Primary Vista Site job', function() {
			var environment = createEnvironment(config);
			var job = createJob('C877;3', 1);
			var jobStatus = createJobStatus('9E7A;3', 1);
			setupDummyJds(environment, jobStatus);

			var finished = false;

			runs(function() {
				siteTypeRule(log, config, environment, job, function(err, resultJob) {
					expect(err).toBeFalsy();
                    expect(environment.jds.getJobStatus.calls.length).toEqual(1);
                    expect(environment.jds.getJobStatus).toHaveBeenCalledWith(job, jasmine.objectContaining({ filter: jasmine.any(String) }), jasmine.any(Function));
					expect(resultJob).toBeTruthy();
					expect(resultJob.priority).toBe(21);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});

		it('Happy Path with valid Other VistaHDR Site job', function() {
			var environment = createEnvironment(vistaHdrConfig);
			var job = createJob('3A8B;3', 1);
			var jobStatus = createJobStatus('9E7A;3', 1);
			setupDummyJds(environment, jobStatus);

			var finished = false;

			runs(function() {
				siteTypeRule(log, vistaHdrConfig, environment, job, function(err, resultJob) {
					expect(err).toBeFalsy();
                    expect(environment.jds.getJobStatus.calls.length).toEqual(1);
                    expect(environment.jds.getJobStatus).toHaveBeenCalledWith(job, jasmine.objectContaining({ filter: jasmine.any(String) }), jasmine.any(Function));
					expect(resultJob).toBeTruthy();
					expect(resultJob.priority).toBe(21);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});

		it('Happy Path with valid Other Secondary HDR Site job', function() {
			var environment = createEnvironment(config);
			var job = createJob('HDR;10108V420871', 1);
			var jobStatus = createJobStatus('9E7A;3', 1);
			setupDummyJds(environment, jobStatus);

			var finished = false;

			runs(function() {
				siteTypeRule(log, config, environment, job, function(err, resultJob) {
					expect(err).toBeFalsy();
                    expect(environment.jds.getJobStatus.calls.length).toEqual(1);
                    expect(environment.jds.getJobStatus).toHaveBeenCalledWith(job, jasmine.objectContaining({ filter: jasmine.any(String) }), jasmine.any(Function));
					expect(resultJob).toBeTruthy();
					expect(resultJob.priority).toBe(21);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});

		it('Happy Path with valid DOD Site job', function() {
			var environment = createEnvironment(config);
			var job = createJob('DOD;0000000003', 1);
			var jobStatus = createJobStatus('9E7A;3', 1);
			setupDummyJds(environment, jobStatus);

			var finished = false;

			runs(function() {
				siteTypeRule(log, config, environment, job, function(err, resultJob) {
					expect(err).toBeFalsy();
                    expect(environment.jds.getJobStatus.calls.length).toEqual(1);
                    expect(environment.jds.getJobStatus).toHaveBeenCalledWith(job, jasmine.objectContaining({ filter: jasmine.any(String) }), jasmine.any(Function));
					expect(resultJob).toBeTruthy();
					expect(resultJob.priority).toBe(41);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});

		it('Happy Path with valid Other Secondary VLER Site job', function() {
			var environment = createEnvironment(config);
			var job = createJob('VLER;10108V420871', 1);
			var jobStatus = createJobStatus('9E7A;3', 1);
			setupDummyJds(environment, jobStatus);

			var finished = false;

			runs(function() {
				siteTypeRule(log, config, environment, job, function(err, resultJob) {
					expect(err).toBeFalsy();
                    expect(environment.jds.getJobStatus.calls.length).toEqual(1);
                    expect(environment.jds.getJobStatus).toHaveBeenCalledWith(job, jasmine.objectContaining({ filter: jasmine.any(String) }), jasmine.any(Function));
					expect(resultJob).toBeTruthy();
					expect(resultJob.priority).toBe(41);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});

		it('Happy Path with original priority never set.', function() {
			var environment = createEnvironment(config);
			var job = createJob('9E7A;3', undefined);
			var jobStatus = createJobStatus('9E7A;3', 50);
			setupDummyJds(environment, jobStatus);

			var finished = false;

			runs(function() {
				siteTypeRule(log, config, environment, job, function(err, resultJob) {
					expect(err).toBeFalsy();
                    expect(environment.jds.getJobStatus.calls.length).toEqual(1);
                    expect(environment.jds.getJobStatus).toHaveBeenCalledWith(job, jasmine.objectContaining({ filter: jasmine.any(String) }), jasmine.any(Function));
					expect(resultJob).toBeTruthy();
					expect(resultJob.priority).toBe(50);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});

		it('Happy Path with original priority not the same as the current job.', function() {
			var environment = createEnvironment(config);
			var job = createJob('9E7A;3', 50);
			var jobStatus = createJobStatus('9E7A;3', 30);
			setupDummyJds(environment, jobStatus);

			var finished = false;

			runs(function() {
				siteTypeRule(log, config, environment, job, function(err, resultJob) {
					expect(err).toBeFalsy();
                    expect(environment.jds.getJobStatus.calls.length).toEqual(1);
                    expect(environment.jds.getJobStatus).toHaveBeenCalledWith(job, jasmine.objectContaining({ filter: jasmine.any(String) }), jasmine.any(Function));
					expect(resultJob).toBeTruthy();
					expect(resultJob.priority).toBe(30);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});

		it('Case where priority overflows upper limit', function() {
			var environment = createEnvironment(config);
			var job = createJob('VLER;10108V420871', 80);
			var jobStatus = createJobStatus('9E7A;3', 80);
			setupDummyJds(environment, jobStatus);

			var finished = false;

			runs(function() {
				siteTypeRule(log, config, environment, job, function(err, resultJob) {
					expect(err).toBeFalsy();
                    expect(environment.jds.getJobStatus.calls.length).toEqual(1);
                    expect(environment.jds.getJobStatus).toHaveBeenCalledWith(job, jasmine.objectContaining({ filter: jasmine.any(String) }), jasmine.any(Function));
					expect(resultJob).toBeTruthy();
					expect(resultJob.priority).toBe(100);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});

	});
});