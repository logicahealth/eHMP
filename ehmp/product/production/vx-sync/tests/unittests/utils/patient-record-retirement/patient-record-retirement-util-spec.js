'use strict';

require('../../../../env-setup');

var _ = require('underscore');
var JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');
var RecordRetirementUtil = require(global.VX_UTILS + 'patient-record-retirement/patient-record-retirement-util');
var nock = require('nock');
var log = require(global.VX_DUMMIES + '/dummy-logger');
var moment = require('moment');
var PublisherRouterDummy = require(global.VX_DUMMIES + '/publisherRouterDummy');
// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
// 	name: 'patient-record-retirement-util-spec',
// 	level: 'debug'
// });

var config = {
	'recordRetirement': {
		'rules': {
			'largePatientRecord': {
				'patientTotalSizeLimit': 100000000,
				'avgSizePerEvent': 100
			}
		},
		'lastAccessed': 180
	},
	'jds': {},
	syncRequestApi: {
		'protocol': 'http',
		'host': 'IP      ',
		'port': 'PORT',
		'timeout': 300000
	},
};

function createEnvironment(log, config) {
	return {
		jds: new JdsClientDummy(log, config),
		publisherRouter: new PublisherRouterDummy()
	};
}

var fullPatientList = [{
	jpid: 'aaaaa-bbbbb-ccccc',
	lastAccessTime: 20161017132715,
	patientIdentifiers: [
		'AAAA;1',
		'BBBB;1'
	]
}, {
	jpid: 'bbbbb-ccccc-ddddd',
	lastAccesTime: 20161017132715,
	patientIdentifiers: [
		'CCCC;1',
		'DDDD;1'
	]
}];

var errorPatient = {
	jpid: 'eeeee-fffff-ggggg',
	lastAccesTime: 20161017132715,
	patientIdentifiers: [
		'ERROR;1',
	]
};

describe('patient-record-retirement-util', function() {
	describe('getPidsToRetire', function() {
		it('normal path', function() {
			var environment = createEnvironment(log, config);
			environment.jds._setResponseData([null], [{
				statusCode: 200
			}], [{
				items: fullPatientList
			}]);

			var recordRetirementUtil = new RecordRetirementUtil(log, config, environment);

			recordRetirementUtil.getPidsToRetire(function(error, patientList) {
				expect(error).toBeFalsy();
				expect(patientList).toBeTruthy();
				expect(patientList[0]).toBeTruthy();
				expect(patientList[0].patientIdentifiers).toBeTruthy();
				expect(patientList[0].patientIdentifiers).toContain('AAAA;1');
				expect(patientList[0].patientIdentifiers).toContain('BBBB;1');
			});
		});

		it('error path: error from jds', function() {
			var environment = createEnvironment(log, config);
			environment.jds._setResponseData(['error!'], [null], [null]);

			var recordRetirementUtil = new RecordRetirementUtil(log, config, environment);

			recordRetirementUtil.getPidsToRetire(function(error, patientList) {
				expect(error).toBeTruthy();
				expect(patientList).toBeFalsy();
			});
		});
		it('error path: no response from jds', function() {
			var environment = createEnvironment(log, config);
			environment.jds._setResponseData([null], [null], [null]);

			var recordRetirementUtil = new RecordRetirementUtil(log, config, environment);

			recordRetirementUtil.getPidsToRetire(function(error, patientList) {
				expect(error).toBeTruthy();
				expect(patientList).toBeFalsy();
			});
		});
		it('error path: unexpected response from jds', function() {
			var environment = createEnvironment(log, config);
			environment.jds._setResponseData([null], [{
				statusCode: 400,
				body: {
					error: 'error!'
				}
			}], [null]);

			var recordRetirementUtil = new RecordRetirementUtil(log, config, environment);

			recordRetirementUtil.getPidsToRetire(function(error, patientList) {
				expect(error).toBeTruthy();
				expect(patientList).toBeFalsy();
			});
		});
		it('error path: null result from jds', function() {
			var environment = createEnvironment(log, config);
			environment.jds._setResponseData([null], [{
				statusCode: 200
			}], [null]);

			var recordRetirementUtil = new RecordRetirementUtil(log, config, environment);

			recordRetirementUtil.getPidsToRetire(function(error, patientList) {
				expect(error).toBeTruthy();
				expect(patientList).toBeFalsy();
			});
		});

		it('use instance\'s lastAccessed value if it exists', function() {
			var environment = createEnvironment(log, config);
			environment.jds._setResponseData([null], [{
				statusCode: 200
			}], [{
				items: fullPatientList
			}]);

			var lastAccessed = 3;

			var lastAccessTime = moment().subtract(lastAccessed, 'days');
			var configLastAccessTime = moment().subtract(config.recordRetirement.lastAccessed, 'days');

			spyOn(environment.jds, 'getPatientList').andCallThrough();

			var recordRetirementUtil = new RecordRetirementUtil(log, config, environment, lastAccessed);

			recordRetirementUtil.getPidsToRetire(function(error, patientList) {
				expect(error).toBeFalsy();
				expect(patientList).toBeTruthy();
				expect(patientList[0]).toBeTruthy();
				expect(patientList[0].patientIdentifiers).toBeTruthy();
				expect(patientList[0].patientIdentifiers).toContain('AAAA;1');
				expect(patientList[0].patientIdentifiers).toContain('BBBB;1');

				var resultLastAccessTime = environment.jds.getPatientList.calls[0].args[0];
				expect(moment(resultLastAccessTime, 'YYYYMMDDHHmmss').isSame(lastAccessTime, 'day')).toBe(true);
				expect(moment(resultLastAccessTime, 'YYYYMMDDHHmmss').isSame(configLastAccessTime, 'day')).toBe(false);
			});
		});

		it('use config lastAccessed value if instance\'s lastAccessed value does not exist', function() {
			var environment = createEnvironment(log, config);
			environment.jds._setResponseData([null], [{
				statusCode: 200
			}], [{
				items: fullPatientList
			}]);

			var configLastAccessTime = moment().subtract(config.recordRetirement.lastAccessed, 'days');

			spyOn(environment.jds, 'getPatientList').andCallThrough();

			var recordRetirementUtil = new RecordRetirementUtil(log, config, environment);

			recordRetirementUtil.getPidsToRetire(function(error, patientList) {
				expect(error).toBeFalsy();
				expect(patientList).toBeTruthy();
				expect(patientList[0]).toBeTruthy();
				expect(patientList[0].patientIdentifiers).toBeTruthy();
				expect(patientList[0].patientIdentifiers).toContain('AAAA;1');
				expect(patientList[0].patientIdentifiers).toContain('BBBB;1');

				var resultLastAccessTime = environment.jds.getPatientList.calls[0].args[0];
				expect(moment(resultLastAccessTime, 'YYYYMMDDHHmmss').isSame(configLastAccessTime, 'day')).toBe(true);
			});
		});
	});
	describe('runRetirementRules', function() {
		beforeEach(function() {
			var syncStatusEndpointResponse1 = {
				'jpid': 'aaaaa-bbbbb-ccccc',
				'identifierDocSizes': {
					'totalSize': 32,
					'AAAA;1': 'NO_DOCUMENTS',
					'BBBB;1': 32
				},
				'syncStatus': {
					'completedStamp': {
						'sourceMetaStamp': {
							'AAAA': {
								'domainMetaStamp': {
									'allergy': {
										'domain': 'allergy',
										'eventCount': 3
									}
								}
							},
							'BBBB': {
								'domainMetaStamp': {
									'allergy': {
										'domain': 'allergy',
										'eventCount': 3
									}
								}
							}
						}
					}
				}
			};

			var syncStatusEndpointResponse2 = {
				'jpid': 'bbbbb-ccccc-ddddd',
				'identifierDocSizes': {
					'totalSize': 100000001,
					'CCCC;1': 'NO_DOCUMENTS',
					'DDDD;1': 100000001
				},
				'syncStatus': {
					'completedStamp': {
						'sourceMetaStamp': {
							'CCCC': {
								'domainMetaStamp': {
									'allergy': {
										'domain': 'allergy',
										'eventCount': 3
									}
								}
							},
							'DDDD': {
								'domainMetaStamp': {
									'allergy': {
										'domain': 'allergy',
										'eventCount': 3
									}
								}
							}
						}
					}
				}
			};

			nock.cleanAll();
			nock.disableNetConnect();
			nock('http://IP           ')
				.get('/sync/status?pid=AAAA;1&docStatus=true')
				.reply(200, JSON.stringify(syncStatusEndpointResponse1));
			nock('http://IP           ')
				.get('/sync/status?pid=BBBB;1&docStatus=true')
				.reply(200, JSON.stringify(syncStatusEndpointResponse1));
			nock('http://IP           ')
				.get('/sync/status?pid=CCCC;1&docStatus=true')
				.reply(200, JSON.stringify(syncStatusEndpointResponse2));
			nock('http://IP           ')
				.get('/sync/status?pid=DDDD;1&docStatus=true')
				.reply(200, JSON.stringify(syncStatusEndpointResponse2));
			nock('http://IP           ')
				.get('/sync/status?pid=ERROR;1&docStatus=true')
				.reply(400);
		});

		it('normal path', function() {
			var environment = createEnvironment(log, config);
			var recordRetirementUtil = new RecordRetirementUtil(log, config, environment);

			var done = false;

			recordRetirementUtil.runRetirementRules(fullPatientList, function(error, patientList) {
				expect(error).toBeFalsy();
				expect(patientList).toBeTruthy();
				expect(patientList[0]).toBeTruthy();
				expect(patientList[0].patientIdentifiers).toBeTruthy();
				expect(patientList[0].patientIdentifiers).toContain('AAAA;1');
				expect(patientList[0].patientIdentifiers).toContain('BBBB;1');

				done = true;
			});

			waitsFor(function() {
				return done;
			});
		});

		it('normal path: no patients', function() {
			var environment = createEnvironment(log, config);
			var recordRetirementUtil = new RecordRetirementUtil(log, config, environment);

			var done = false;

			recordRetirementUtil.runRetirementRules(null, function(error, patientList) {
				expect(error).toBeFalsy();
				expect(patientList).toBeFalsy();

				done = true;
			});

			waitsFor(function() {
				return done;
			});
		});


		it('error path: error returned by rules engine', function() {
			var environment = createEnvironment(log, config);
			var recordRetirementUtil = new RecordRetirementUtil(log, config, environment);

			var done = false;

			recordRetirementUtil.runRetirementRules([errorPatient], function(error, patientList) {
				expect(error).toBeTruthy();
				expect(patientList).toBeFalsy();
				done = true;

			});
			waitsFor(function() {
				return done;
			});
		});
	});
	describe('sendRetirementJobs', function() {
		var referenceInfo = {
			sessionId: 'TEST',
			utilityType: 'Patient Record Retirement Utility Unit Test'
		};

		it('normal path', function() {
			var environment = createEnvironment(log, config);
			var recordRetirementUtil = new RecordRetirementUtil(log, config, environment);

			var jobsSentToBeanstalk = [];
			spyOn(environment.publisherRouter, 'publish').andCallFake(function(job, callback) {
				jobsSentToBeanstalk.push(job);
				return callback(null, 1);
			});

			recordRetirementUtil.sendRetirementJobs(fullPatientList, referenceInfo, function(error, count) {
				expect(error).toBeFalsy();
				expect(count).toEqual(2);
				expect(jobsSentToBeanstalk.length).toEqual(2);

				_.each(jobsSentToBeanstalk, function(job){
					expect(job.referenceInfo).toEqual(jasmine.objectContaining({
						sessionId: referenceInfo.sessionId,
						requestId: jasmine.any(String),
						utilityType: referenceInfo.utilityType
					}));
				});
			});
		});
		it('normal path: no patients', function(){
			var environment = createEnvironment(log, config);
			var recordRetirementUtil = new RecordRetirementUtil(log, config, environment);

			var jobsSentToBeanstalk = [];
			spyOn(environment.publisherRouter, 'publish').andCallFake(function(job, callback) {
				jobsSentToBeanstalk.push(job);
				return callback(null, 1);
			});

			recordRetirementUtil.sendRetirementJobs(null, referenceInfo, function(error, count) {
				expect(error).toBeFalsy();
				expect(count).toEqual(0);
				expect(jobsSentToBeanstalk.length).toEqual(0);
			});
		});
		it('error path: publisherRouter returns error', function() {
			var environment = createEnvironment(log, config);
			var recordRetirementUtil = new RecordRetirementUtil(log, config, environment);

			spyOn(environment.publisherRouter, 'publish').andCallFake(function(job, callback) {
				return callback('error');
			});

			recordRetirementUtil.sendRetirementJobs(fullPatientList, referenceInfo, function(error, count) {
				expect(error).toBeTruthy();
				expect(count).toEqual(0);
			});

		});
	});
});