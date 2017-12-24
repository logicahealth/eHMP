'use strict';

require('../../../../../env-setup');

var _ = require('underscore');
var log = require(global.VX_DUMMIES + 'dummy-logger');
var resultsLog = require(global.VX_DUMMIES + 'dummy-logger');
var handler = require(global.VX_HANDLERS + 'osync/sync/sync');
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var val = require(global.VX_UTILS + 'object-utils').getProperty;
var config = require(global.VX_ROOT + 'worker-config');
var pidUtils = require(global.VX_UTILS + 'patient-identifier-utils');
var PjdsClient = require('jds-cache-api').PjdsClient;

// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
// 	name: 'sync-spec',
// 	level: 'debug'
// });

var testConfig = require(global.VX_INTTESTS + 'test-config');

var osyncConfig = _.defaults({
	syncUrl: 'http://' + testConfig.vxsyncIP + ':' + testConfig.vxsyncPort + '/sync/doLoad',
	statusUrl: 'http://' + testConfig.vxsyncIP + ':' + testConfig.vxsyncPort + '/sync/status',
}, config.osync);

//----------------------------------------------------------------------------------
// This method creates an instance of the environment variable.
//
// osyncConfig: The osync section of the config (worker-config.json)
// returns: The environment variable.
//----------------------------------------------------------------------------------
function createEnvironment(jds, pjds) {
	var environment = {
		metrics: log,
		resultsLog: resultsLog,
		jds: jds,
		pjds: pjds,
		validPatientsLog: {
			info: jasmine.createSpy()
		}
	};

	spyOn(environment.resultsLog, 'info').andCallThrough();

	return environment;
}

//----------------------------------------------------------------------------------
// Looks up the most recent enterprise sync job for the given patient
//
// patientIdentifier:
// environment:
// callback
//----------------------------------------------------------------------------------
function retrieveEnterpriseSyncJobHistory(patientIdentifier, environment, callback) {
	var job = {
		patientIdentifier: patientIdentifier
	};

	var filter = {
		filter: '?filter=eq(\"type\",\"enterprise-sync-request\")'
	};

	environment.jds.getJobStatus(job, filter, function(error, response, result) {
		callback(error, response, result);
	});
}

/*
	*** Note ***
	This test requires a patient to be synced before it can test the utility.
	The patient used here is SITE;23.
	This patient will remain synced after the test runs.
 */

describe('osync sync handler integration test', function() {
	describe('patient not on blacklist', function() {
		var jds = new JdsClient(log, log, config);
		var pjds = new PjdsClient(log, log, config.pjds);

		var patientIdentifier = {
			type: 'pid',
			value: 'SITE;22'
		};

		beforeEach(function() {
			var done = false;

			runs(function() {
				//Clear patient before test runs
				jds.deletePatientByPid(patientIdentifier.value, function(error, response) {
					expect(error).toBeFalsy();
					expect(response).toBeTruthy();
					done = true;
				});
			});

			waitsFor(function() {
				return done;
			});
		});
		it('verify handler starts a sync', function() {
			var done = false;
			var environment = createEnvironment(jds, pjds);

			var referenceInfo = {
				'sessionId': 'sync-itest-spec',
				'utilityType': 'Osync Sync Handler Integration Test'
			};

			var job = {
				type: 'sync',
				source: 'appointments',
				siteId: pidUtils.extractSiteFromPid(patientIdentifier.value),
				patient: {
					dfn: pidUtils.extractDfnFromPid(patientIdentifier.value)
				},
				referenceInfo: referenceInfo
			};

			runs(function() {
				handler(log, osyncConfig, environment, job, function(error, result) {
					expect(error).toBeFalsy();
					expect(result).toBeFalsy();

					retrieveEnterpriseSyncJobHistory(patientIdentifier, environment, function(error, response, result) {
						expect(error).toBeFalsy();
						expect(response).toBeTruthy();
						expect(response.message).toBeFalsy();
						expect(val(result, ['items', '0', 'referenceInfo'])).toEqual(jasmine.objectContaining({
							sessionId: referenceInfo.sessionId,
							requestId: jasmine.any(String),
							utilityType: referenceInfo.utilityType
						}));
						done = true;
					});
				});
			});

			waitsFor(function() {
				return done;
			});
		});
		afterEach(function() {
			// Check sync status to verify that a sync has been started
			jds.getSimpleSyncStatus(patientIdentifier, function(error, response) {
				expect(error).toBeFalsy();
				expect(val(response, 'statusCode')).toEqual(200);
			});
		});
	});

	describe('patient is on blacklist', function() {
		var jds = new JdsClient(log, log, config);
		var pjds = new PjdsClient(log, log, config.pjds);

		var patientIdentifier = {
			type: 'pid',
			value: 'SITE;45645654'
		};

		beforeEach(function() {
			var done = false;

			runs(function() {
				//Put a mock pid into the blacklist
				var user = {
					uid: 'urn:va:patient:SITE:45645654:45645654',
					site: 'SITE',
					id: 'SITE;45645654'
				};

				pjds.addToOsyncBlist('SITE;45645654', 'SITE', 'patient', function(error, response) {
					if (error) {
						expect(error).toBeFalsy();
					}

					expect(response.statusCode).toBe(201);
					done = true;
				});
			});

			waitsFor(function() {
				return done;
			});
		});
		it('verify handler does not start a sync', function() {
			var done = false;
			var environment = createEnvironment(jds, pjds);

			var job = {
				type: 'sync',
				source: 'appointments',
				siteId: pidUtils.extractSiteFromPid(patientIdentifier.value),
				patient: {
					dfn: pidUtils.extractDfnFromPid(patientIdentifier.value)
				}
			};

			runs(function() {
				handler(log, osyncConfig, environment, job, function(error, result) {
					expect(error).toBeFalsy();
					expect(result).toBeTruthy();
					done = true;
				});
			});

			waitsFor(function() {
				return done;
			});
		});
		afterEach(function() {
			var cleanUp = false;

			runs(function() {
				pjds.removeFromOsyncBlist('SITE;45645654', 'SITE', 'patient', function(error, response) {
					if (error) {
						expect(error).toBeFalsy();
					}
					expect(response.statusCode).toBe(200);
					cleanUp = true;
				});
			});

			waitsFor(function() {
				return cleanUp;
			}, 'clean up', 20000);
		});
	});
});
