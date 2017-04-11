'use strict';

//------------------------------------------------------------------------------------
// This file contains unit tests for site-type-rule.js.
//
// Author: Les Westberg
//------------------------------------------------------------------------------------

require('../../../env-setup');
var domainTypeRule = require(global.VX_EVENTPRIORITYRULES + 'domain-type-rule');

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
	},
	'eventPrioritizationRules': {
		'site-type': {},
		'domain-type': {
			'consult': 20,
			'allergy': -20,
			'order': 40
		}
	},

};

//---------------------------------------------------------------------
// Create an instance of the environment variable.
//---------------------------------------------------------------------
function createEnvironment() {
	var environment = {
	};

	return environment;
}

//--------------------------------------------------------------------
// Create an instance of the job and return it.
//
// dataDomain: The domain of data that represents this job.
// priority: The priority to associated with this job
// returns: The created job
//--------------------------------------------------------------------
function createJob(dataDomain, priority) {
	var job = {
		type: 'event-prioritization-request',
		patientIdentifier: {
			type: 'pid',
			value: '9E7A;3'
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

describe('domain-type-rule.js', function() {
	describe('fixPriorityRange()', function() {
		it('Happy Path with no change', function() {
			var job = createJob('9E7A;3', 50);
			domainTypeRule._internalFunctions._fixPriorityRange(job);
			expect(job.priority).toBe(50);
		});
		it('Range too low', function() {
			var job = createJob('9E7A;3', -25);
			domainTypeRule._internalFunctions._fixPriorityRange(job);
			expect(job.priority).toBe(1);
		});
		it('Range too high', function() {
			var job = createJob('9E7A;3', 500);
			domainTypeRule._internalFunctions._fixPriorityRange(job);
			expect(job.priority).toBe(100);
		});
	});
	describe('prioritize()', function() {
		it('Happy Path with valid job', function() {
			var environment = createEnvironment();
			var job = createJob('allergy', 40);

			var finished = false;

			runs(function() {
				domainTypeRule(log, config, environment, job, function(err, resultJob) {
					expect(err).toBeFalsy();
					expect(resultJob).toBeTruthy();
					expect(resultJob.priority).toBe(20);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('Verify if domain causes value to drop below lower range limit - it will fix itself.', function() {
			var environment = createEnvironment();
			var job = createJob('allergy', 15);

			var finished = false;

			runs(function() {
				domainTypeRule(log, config, environment, job, function(err, resultJob) {
					expect(err).toBeFalsy();
					expect(resultJob).toBeTruthy();
					expect(resultJob.priority).toBe(1);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('Verify case where no configuration setting for the domain - means the priority stays the same.', function() {
			var environment = createEnvironment();
			var job = createJob('vital', 15);

			var finished = false;

			runs(function() {
				domainTypeRule(log, config, environment, job, function(err, resultJob) {
					expect(err).toBeFalsy();
					expect(resultJob).toBeTruthy();
					expect(resultJob.priority).toBe(15);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('Verify no job exits gracefully.', function() {
			var environment = createEnvironment();

			var finished = false;

			runs(function() {
				domainTypeRule(log, config, environment, null, function(err, resultJob) {
					expect(err).toBeFalsy();
					expect(resultJob).toBeNull();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('Verify no data domain - means the priority stays the same.', function() {
			var environment = createEnvironment();
			var job = createJob(undefined, 15);

			var finished = false;

			runs(function() {
				domainTypeRule(log, config, environment, job, function(err, resultJob) {
					expect(err).toBeFalsy();
					expect(resultJob).toBeTruthy();
					expect(resultJob.priority).toBe(15);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('Verify invalid job priority - means the priority sets to default.', function() {
			var environment = createEnvironment();
			var job = createJob('vital', 'invalid');

			var finished = false;

			runs(function() {
				domainTypeRule(log, config, environment, job, function(err, resultJob) {
					expect(err).toBeFalsy();
					expect(resultJob).toBeTruthy();
					expect(resultJob.priority).toBe(1);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('Verify if config rule for domain-type does not exist - means the priority stays the same.', function() {
			var environment = createEnvironment();
			var job = createJob('allergy', 25);
			var localConfig = JSON.parse(JSON.stringify(config));
			localConfig.eventPrioritizationRules['domain-type'] = undefined;

			var finished = false;

			runs(function() {
				domainTypeRule(log, localConfig, environment, job, function(err, resultJob) {
					expect(err).toBeFalsy();
					expect(resultJob).toBeTruthy();
					expect(resultJob.priority).toBe(25);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
	});
});