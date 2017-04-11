'use strict';

//------------------------------------------------------------------------------------
// This file contains unit tests for event-priroritization-request-handler.js.
//
// Author: Les Westberg
//------------------------------------------------------------------------------------

require('../../../../env-setup');

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

var handler = require(global.VX_HANDLERS + 'event-prioritization-request/event-prioritization-request-handler');
var EventPriorityRulesEngine = require(global.VX_EVENTPRIORITYRULES + 'event-priority-rules-engine');
var PublisherRouterDummy = require(global.VX_DUMMIES + 'publisherRouterDummy');
var PublisherDummy = require(global.VX_DUMMIES + 'publisherDummy');

var hmpServer = 'TheHmpServer';

var config = {
	jds: {
		protocol: 'http',
		host: 'IP        ',
		port: 9080
	},
	'vistaSites': {
		'9E7A': {
			'name': 'panorama',
			'host': 'IP        ',
			'port': 9210,
			'accessCode': 'PW    ',
			'verifyCode': 'PW    !!',
			'localIP': '127.0.0.1',
			'localAddress': 'localhost',
			'connectTimeout': 3000,
			'sendTimeout': 10000
		},
		'C877': {
			'name': 'kodak',
			'host': 'IP        ',
			'port': 9210,
			'accessCode': 'PW    ',
			'verifyCode': 'PW    !!',
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

//---------------------------------------------------------------------
// This is a mock of the event priority rules engine prioritize method
// that simulates a successful call.
//
// job: The job to be prioritized.
// callback: The callback handler.   Singature is:
//    function(err, job)
//      where:
//         err: Is an error if one occurs.
//         job: Is the job with the updated priority.
//--------------------------------------------------------------------
function fakePrioritizeSuccess(job, callback) {
	job.priority = 50;
	return callback(null, job);
}

//---------------------------------------------------------------------
// This is a mock of the event priority rules engine prioritize method
// that simulates a err call.
//
// job: The job to be prioritized.
// callback: The callback handler.   Singature is:
//    function(err, job)
//      where:
//         err: Is an error if one occurs.
//         job: Is the job with the updated priority.
//--------------------------------------------------------------------
function fakePrioritizeErr(job, callback) {
	return callback('SomeError'. job);
}

//---------------------------------------------------------------------
// This is a mock of the event priority rules engine prioritize method
// that simulates a call where no job is returned.
//
// job: The job to be prioritized.
// callback: The callback handler.   Singature is:
//    function(err, job)
//      where:
//         err: Is an error if one occurs.
//         job: Is the job with the updated priority.
//--------------------------------------------------------------------
function fakePrioritizeNoJob(job, callback) {
	return callback(null, null);
}

//---------------------------------------------------------------------
// Create an instance of the environment variable.
//
// the_config:  The config object to be used in the environment.
// returns: The environment that was created.
//---------------------------------------------------------------------
function createEnvironment(the_config, fakePrioritizeFunction) {
	var environment = {
		metrics: log,
	    publisherRouter: new PublisherRouterDummy(log, the_config, PublisherDummy),
	};

	var eventPriorityRulesEngine = new EventPriorityRulesEngine(log,  the_config, environment);
	environment.eventPriorityRulesEngine = eventPriorityRulesEngine;

	spyOn(environment.eventPriorityRulesEngine, 'prioritize').andCallFake(fakePrioritizeFunction);
	spyOn(environment.publisherRouter, 'publish').andCallThrough();

	return environment;
}

//--------------------------------------------------------------------
// Create an instance of the job and return it.
//
// priority: The priority to associated with this job
// returns: The created job
//--------------------------------------------------------------------
function createJob(priority) {
	var job = {
		type: 'event-prioritization-request',
		patientIdentifier: {
			type: 'pid',
			value: '9E7A;3'
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

describe('event-priroritization-request-handler.js', function() {
	describe('handle()', function() {
		it('Happy Path', function() {

			var environment = createEnvironment(config, fakePrioritizeSuccess);
			var job = createJob(1);

			var finished;

			runs(function() {
				handler(log, config, environment, job, function(err) {
					expect(err).toBeFalsy();
                    expect(environment.eventPriorityRulesEngine.prioritize.calls.length).toEqual(1);
                    expect(environment.publisherRouter.publish.calls.length).toEqual(1);
                    expect(environment.eventPriorityRulesEngine.prioritize).toHaveBeenCalledWith(job, jasmine.any(Function));
                    expect(environment.publisherRouter.publish).toHaveBeenCalledWith(jasmine.objectContaining({ type: 'record-enrichment', priority: 50}), jasmine.any(Function));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('Err Path', function() {

			var environment = createEnvironment(config, fakePrioritizeErr);
			var job = createJob(1);

			var finished;

			runs(function() {
				handler(log, config, environment, job, function(err) {
					expect(err).toBeFalsy();
                    expect(environment.eventPriorityRulesEngine.prioritize.calls.length).toEqual(1);
                    expect(environment.publisherRouter.publish.calls.length).toEqual(1);
                    expect(environment.eventPriorityRulesEngine.prioritize).toHaveBeenCalledWith(job, jasmine.any(Function));
                    expect(environment.publisherRouter.publish).toHaveBeenCalledWith(jasmine.objectContaining({ type: 'record-enrichment', priority: 1}), jasmine.any(Function));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('No result Path', function() {

			var environment = createEnvironment(config, fakePrioritizeNoJob);
			var job = createJob(1);

			var finished;

			runs(function() {
				handler(log, config, environment, job, function(err) {
					expect(err).toBeFalsy();
                    expect(environment.eventPriorityRulesEngine.prioritize.calls.length).toEqual(1);
                    expect(environment.publisherRouter.publish.calls.length).toEqual(1);
                    expect(environment.eventPriorityRulesEngine.prioritize).toHaveBeenCalledWith(job, jasmine.any(Function));
                    expect(environment.publisherRouter.publish).toHaveBeenCalledWith(jasmine.objectContaining({ type: 'record-enrichment', priority: 1}), jasmine.any(Function));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});

	});
});


