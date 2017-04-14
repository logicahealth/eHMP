'use strict';

//------------------------------------------------------------------------------------
// This file contains unit tests for event-priority-rules-engine.js.
//
// Author: Les Westberg
//------------------------------------------------------------------------------------

require('../../../env-setup');
var _ = require('underscore');
var EventPriorityRulesEngine = require(global.VX_EVENTPRIORITYRULES + 'event-priority-rules-engine');
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
// 	name: 'event-priority-rules-engine-spec',
// 	level: 'debug'
// });

var hmpServer = 'TheHmpServer';

var config = {
	jds: {
		protocol: 'http',
		host: '10.2.2.110',
		port: 9080
	},
	'vistaSites': {
		'9E7A': {
			'name': 'panorama',
			'host': '10.2.2.101',
			'port': 9210,
			'accessCode': 'pu1234',
			'verifyCode': 'pu1234!!',
			'localIP': '127.0.0.1',
			'localAddress': 'localhost',
			'connectTimeout': 3000,
			'sendTimeout': 10000
		},
		'C877': {
			'name': 'kodak',
			'host': '10.2.2.102',
			'port': 9210,
			'accessCode': 'pu1234',
			'verifyCode': 'pu1234!!',
			'localIP': '127.0.0.1',
			'localAddress': 'localhost',
			'connectTimeout': 3000,
			'sendTimeout': 10000
		}
	},
	'eventPrioritizationRules': {
		'site-type': {},
		'domain-type': {
			'consult': 20,
			'allergy': -20,
			'order': 40
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

//---------------------------------------------------------------------
// Create an instance of the environment variable.
//
// the_config:  The config object to be used in the environment.
// returns: The environment that was created.
//---------------------------------------------------------------------
function createEnvironment(the_config) {
	var environment = {
		jds: new JdsClientDummy(log, the_config),
		metrics: log
	};

	spyOn(environment.jds, 'getJobStatus').andCallThrough();

	return environment;
}

//--------------------------------------------------------------------
// Create an instance of the job and return it.
//
// site: The site to associate with this job.
// priority: The priority to associated with this job
// dataDomain: The domain of data that represents this job.
// returns: The created job
//--------------------------------------------------------------------
function createJob(site, priority, dataDomain) {
	var job = {
		type: 'event-prioritization-request',
		patientIdentifier: {
			type: 'pid',
			value: site + ';3'
		},
		jpid: '8107cc41-69eb-4060-8813-a82db245a11a',
		rootJobId: '1',
		dataDomain: dataDomain,
		priority: priority,
		record: {},
		jobId: '34'
	};

	return job;

}

//--------------------------------------------------------------------
// Create an instance of the job status and return it.
//
// site: The site to associate with this job status.
// priority: The priority to associated with this job status
// returns: The created job status
//--------------------------------------------------------------------
function createJobStatus(site, priority) {
	var jobStatus = {
		'jobId': '4bbb4574-68ab-4fd0-9aaf-5abf75765449',
		'jpid': '15fbef90-aed2-4267-9f8b-980ad62c2a00',
		'patientIdentifier': {
			'type': 'pid',
			value: site + ';3'
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

describe('event-priority-rules-engine.js', function() {
	describe('_getRulesFromConfig()', function() {
		it('Happy Path', function() {

			var environment = createEnvironment(config);
			var rulesEngine = new EventPriorityRulesEngine(log, config, environment);

			var rulesFunctions = rulesEngine._getRulesFromConfig();
			expect(_.isArray(rulesFunctions)).toBe(true);
			expect(rulesFunctions.length).toBe(2);
			expect(_.isFunction(rulesFunctions[0])).toBe(true);
			expect(rulesFunctions[0]).toBe(require(global.VX_EVENTPRIORITYRULES + 'site-type-rule'));
			expect(_.isFunction(rulesFunctions[1])).toBe(true);
			expect(rulesFunctions[1]).toBe(require(global.VX_EVENTPRIORITYRULES + 'domain-type-rule'));
		});
	});
	describe('prioritize()', function() {
		it('Happy Path for job associated with MySite', function() {

			var environment = createEnvironment(config);
			var rulesEngine = new EventPriorityRulesEngine(log, config, environment);
			spyOn(rulesEngine, '_runRule').andCallThrough();

			var job = createJob('9E7A', 1, 'appointment');
			var jobStatus = createJobStatus('9E7A', 1);
			setupDummyJds(environment, jobStatus);

			var finished = false;

			runs(function() {
				rulesEngine.prioritize(job, function(err, resultJob) {
					expect(err).toBeFalsy();
					expect(rulesEngine._runRule.calls.length).toEqual(2);
					expect(rulesEngine._runRule).toHaveBeenCalledWith(require(global.VX_EVENTPRIORITYRULES + 'site-type-rule'),
						jasmine.objectContaining({
							type: 'event-prioritization-request',
							rootJobId: '1',
							jobId: '34',
							priority: jasmine.any(Number)
						}), jasmine.any(Function));
					expect(rulesEngine._runRule).toHaveBeenCalledWith(require(global.VX_EVENTPRIORITYRULES + 'domain-type-rule'),
						jasmine.objectContaining({
							type: 'event-prioritization-request',
							rootJobId: '1',
							jobId: '34',
							priority: jasmine.any(Number)
						}), jasmine.any(Function));
					expect(resultJob).toBeTruthy();
					expect(resultJob.priority).toBe(1);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('Happy Path for job associated with MySite but with a lower priority domain', function() {

			var environment = createEnvironment(config);
			var rulesEngine = new EventPriorityRulesEngine(log, config, environment);
			spyOn(rulesEngine, '_runRule').andCallThrough();

			var job = createJob('9E7A', 1, 'order');
			var jobStatus = createJobStatus('9E7A', 1);
			setupDummyJds(environment, jobStatus);

			var finished = false;

			runs(function() {
				rulesEngine.prioritize(job, function(err, resultJob) {
					expect(err).toBeFalsy();
					expect(rulesEngine._runRule.calls.length).toEqual(2);
					expect(rulesEngine._runRule).toHaveBeenCalledWith(require(global.VX_EVENTPRIORITYRULES + 'site-type-rule'),
						jasmine.objectContaining({
							type: 'event-prioritization-request',
							rootJobId: '1',
							jobId: '34',
							priority: jasmine.any(Number)
						}), jasmine.any(Function));
					expect(rulesEngine._runRule).toHaveBeenCalledWith(require(global.VX_EVENTPRIORITYRULES + 'domain-type-rule'),
						jasmine.objectContaining({
							type: 'event-prioritization-request',
							rootJobId: '1',
							jobId: '34',
							priority: jasmine.any(Number)
						}), jasmine.any(Function));
					expect(resultJob).toBeTruthy();
					expect(resultJob.priority).toBe(41);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('Happy Path for job associated with Other VistA Site', function() {

			var environment = createEnvironment(config);
			var rulesEngine = new EventPriorityRulesEngine(log, config, environment);
			spyOn(rulesEngine, '_runRule').andCallThrough();

			var job = createJob('C877', 1, 'appointment');
			var jobStatus = createJobStatus('9E7A', 1);
			setupDummyJds(environment, jobStatus);

			var finished = false;

			runs(function() {
				rulesEngine.prioritize(job, function(err, resultJob) {
					expect(err).toBeFalsy();
					expect(rulesEngine._runRule.calls.length).toEqual(2);

					// Note for the future...    In case you fall into the same trap I did... :)
					// The job that is verfied by spyOn is whatever state that job is in at the end.  Since the rules engine
					// is modifying the priority within the same job on each rule call - you cannot check the individual priority
					// numbers on each individual call - since it will oonly show you the final state of the job.  So the best we
					// can do is verify that each rule was indeed called with the correct job, and that in the end, the final
					// priority value setting was correct.
					//------------------------------------------------------------------------------------------------------------
					expect(rulesEngine._runRule).toHaveBeenCalledWith(require(global.VX_EVENTPRIORITYRULES + 'site-type-rule'),
						jasmine.objectContaining({
							type: 'event-prioritization-request',
							rootJobId: '1',
							jobId: '34',
							priority: jasmine.any(Number)
						}), jasmine.any(Function));
					expect(rulesEngine._runRule).toHaveBeenCalledWith(require(global.VX_EVENTPRIORITYRULES + 'domain-type-rule'),
						jasmine.objectContaining({
							type: 'event-prioritization-request',
							rootJobId: '1',
							jobId: '34',
							priority: jasmine.any(Number)
						}), jasmine.any(Function));
					expect(resultJob).toBeTruthy();
					expect(resultJob.priority).toBe(21);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});

		it('Happy Path for job associated with Other VistA Site and no original default priority set.', function() {

			var environment = createEnvironment(config);
			var rulesEngine = new EventPriorityRulesEngine(log, config, environment);
			spyOn(rulesEngine, '_runRule').andCallThrough();

			var job = createJob('C877', undefined, 'appointment');
			var jobStatus = createJobStatus('9E7A', undefined);
			setupDummyJds(environment, jobStatus);

			var finished = false;

			runs(function() {
				rulesEngine.prioritize(job, function(err, resultJob) {
					expect(err).toBeFalsy();
					expect(rulesEngine._runRule.calls.length).toEqual(2);

					// Note for the future...    In case you fall into the same trap I did... :)
					// The job that is verfied by spyOn is whatever state that job is in at the end.  Since the rules engine
					// is modifying the priority within the same job on each rule call - you cannot check the individual priority
					// numbers on each individual call - since it will oonly show you the final state of the job.  So the best we
					// can do is verify that each rule was indeed called with the correct job, and that in the end, the final
					// priority value setting was correct.
					//------------------------------------------------------------------------------------------------------------
					expect(rulesEngine._runRule).toHaveBeenCalledWith(require(global.VX_EVENTPRIORITYRULES + 'site-type-rule'),
						jasmine.objectContaining({
							type: 'event-prioritization-request',
							rootJobId: '1',
							jobId: '34',
							priority: jasmine.any(Number)
						}), jasmine.any(Function));
					expect(rulesEngine._runRule).toHaveBeenCalledWith(require(global.VX_EVENTPRIORITYRULES + 'domain-type-rule'),
						jasmine.objectContaining({
							type: 'event-prioritization-request',
							rootJobId: '1',
							jobId: '34',
							priority: jasmine.any(Number)
						}), jasmine.any(Function));
					expect(resultJob).toBeTruthy();
					expect(resultJob.priority).toBe(21);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});

		it('Happy Path for job associated with Other VistA Site and priority set with out of range low value.', function() {

			var environment = createEnvironment(config);
			var rulesEngine = new EventPriorityRulesEngine(log, config, environment);
			spyOn(rulesEngine, '_runRule').andCallThrough();

			var job = createJob('C877', -50, 'appointment');
			var jobStatus = createJobStatus('9E7A', -50);
			setupDummyJds(environment, jobStatus);

			var finished = false;

			runs(function() {
				rulesEngine.prioritize(job, function(err, resultJob) {
					expect(err).toBeFalsy();
					expect(rulesEngine._runRule.calls.length).toEqual(2);

					// Note for the future...    In case you fall into the same trap I did... :)
					// The job that is verfied by spyOn is whatever state that job is in at the end.  Since the rules engine
					// is modifying the priority within the same job on each rule call - you cannot check the individual priority
					// numbers on each individual call - since it will oonly show you the final state of the job.  So the best we
					// can do is verify that each rule was indeed called with the correct job, and that in the end, the final
					// priority value setting was correct.
					//------------------------------------------------------------------------------------------------------------
					expect(rulesEngine._runRule).toHaveBeenCalledWith(require(global.VX_EVENTPRIORITYRULES + 'site-type-rule'),
						jasmine.objectContaining({
							type: 'event-prioritization-request',
							rootJobId: '1',
							jobId: '34',
							priority: jasmine.any(Number)
						}), jasmine.any(Function));
					expect(rulesEngine._runRule).toHaveBeenCalledWith(require(global.VX_EVENTPRIORITYRULES + 'domain-type-rule'),
						jasmine.objectContaining({
							type: 'event-prioritization-request',
							rootJobId: '1',
							jobId: '34',
							priority: jasmine.any(Number)
						}), jasmine.any(Function));
					expect(resultJob).toBeTruthy();
					expect(resultJob.priority).toBe(21);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});

		it('Happy Path for job associated with Other VistA Site and priority set with out of range high value.', function() {

			var environment = createEnvironment(config);
			var rulesEngine = new EventPriorityRulesEngine(log, config, environment);
			spyOn(rulesEngine, '_runRule').andCallThrough();

			var job = createJob('C877', 200, 'appointment');
			var jobStatus = createJobStatus('9E7A', 200);
			setupDummyJds(environment, jobStatus);

			var finished = false;

			runs(function() {
				rulesEngine.prioritize(job, function(err, resultJob) {
					expect(err).toBeFalsy();
					expect(rulesEngine._runRule.calls.length).toEqual(2);

					// Note for the future...    In case you fall into the same trap I did... :)
					// The job that is verfied by spyOn is whatever state that job is in at the end.  Since the rules engine
					// is modifying the priority within the same job on each rule call - you cannot check the individual priority
					// numbers on each individual call - since it will oonly show you the final state of the job.  So the best we
					// can do is verify that each rule was indeed called with the correct job, and that in the end, the final
					// priority value setting was correct.
					//------------------------------------------------------------------------------------------------------------
					expect(rulesEngine._runRule).toHaveBeenCalledWith(require(global.VX_EVENTPRIORITYRULES + 'site-type-rule'),
						jasmine.objectContaining({
							type: 'event-prioritization-request',
							rootJobId: '1',
							jobId: '34',
							priority: jasmine.any(Number)
						}), jasmine.any(Function));
					expect(rulesEngine._runRule).toHaveBeenCalledWith(require(global.VX_EVENTPRIORITYRULES + 'domain-type-rule'),
						jasmine.objectContaining({
							type: 'event-prioritization-request',
							rootJobId: '1',
							jobId: '34',
							priority: jasmine.any(Number)
						}), jasmine.any(Function));
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