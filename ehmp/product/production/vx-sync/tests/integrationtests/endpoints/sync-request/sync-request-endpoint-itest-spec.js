'use strict';

//---------------------------------------------------------------------------
// This contains a set of integration tests for sync-request-endpoint.js
//
// Author: Les Westberg
//---------------------------------------------------------------------------

require('../../../../env-setup');
var _ = require('underscore');
var val = require(global.VX_UTILS + 'object-utils').getProperty;
var log = require(global.VX_DUMMIES + '/dummy-logger');
//--------------------------------------------------------------
// Uncomment the following to see the logging out on the screen.
//--------------------------------------------------------------
// var logUtil = require(global.VX_UTILS + 'log');
// log = logUtil._createLogger({
//     name: 'test',
//     level: 'debug',
//     child: logUtil._createLogger
// });
//------------------------------------------
// End of logging stuff to comment out....
//------------------------------------------

var request = require('request');
var async = require('async');

var testConfig = require(global.VX_INTTESTS + 'test-config');
var host = testConfig.vxsyncIP;
var hostPort = testConfig.vxsyncPort;

var config = {
	syncRequestApi: {
		protocol: 'http',
		host: host,
		port: hostPort,
		patientSyncDemoPath: '/sync/demographicSync',
		patientUnsyncPath: '/sync/clearPatient',
		patientStatusPath: '/sync/status',
        patientSyncPath: '/sync/doLoad',
		method: 'POST'
	}
};


describe('sync-request-endpoint-itest-spec.js', function() {
	it('Sync DoD Only By EDIPI', function() {

		var dataToPost = {
			'edipi': '4325678',
			'demographics': {
				'givenNames': 'PATIENT',
				'familyName': 'DODONLY',
				'genderCode': 'M',
				'ssn': '*****1234',
				'birthDate': '19670909',
				'id': '4325678V4325678^NI^200M^USVHA',
				'facility': '200M',
				'dataSource': 'USVHA',
				'pid': '4325678V4325678',
				'idType': 'NI',
				'idClass': 'ICN',
				'fullName': 'DODONLY,PATIENT',
				'displayName': 'DODONLY,PATIENT',
				'age': 47,
				'ssn4': '1234',
				'genderName': 'Male',
				'ageYears': 'Unk',
				'dob': '19670909'
			}
		};

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
		function checkSyncComplete (callback) {
			log.debug('sync-request-endpoint-itest-spec.checkSyncComplete: Entered method.');
			var syncStatusCallComplete = false;
			var syncStatusCallError;
			var syncStatusCallResponse;
			runs(function() {
				var options = {
					url: config.syncRequestApi.protocol + '://' + config.syncRequestApi.host + ':' + config.syncRequestApi.port + config.syncRequestApi.patientStatusPath + '?pid=DOD;4325678',
					method: 'GET'
				};

				syncStatusCalledCounter++;
				log.debug('sync-request-endpoint-itest-spec.checkSyncComplete: Retrieving status: syncStatusCalledCounter: %i; options: %j', syncStatusCalledCounter, options);
				request.get(options, function(error, response, body) {
					log.debug('sync-request-endpoint-itest-spec.checkSyncComplete: Retrieving status - Call back called: error: %j, response: %j, body: %j', error, response, body);
					expect(response).toBeTruthy();
					expect(val(response,'statusCode')).toBe(200);
					expect(body).toBeTruthy();

		            var syncStatusData;
		            try {
		                syncStatusData = JSON.parse(body);
		            } catch (parseError) {
		            }

					log.debug('sync-request-endpoint-itest-spec.checkSyncComplete: Retrieving status - Call back called: syncStatusData: %j', syncStatusData);
		            expect(syncStatusData).toBeTruthy();
		            if ( (_.isObject(syncStatusData.syncStatus)) && (_.isEmpty(syncStatusData.syncStatus.inProgress)) &&
		            	 (_.isArray(syncStatusData.jobStatus)) && (_.isEmpty(syncStatusData.jobStatus))) {
		            	syncIsComplete = true;
		            }

					syncStatusCallError = error;
					syncStatusCallResponse = response;
					syncStatusCallComplete = true;
					return callback();
				});
			});

			waitsFor(function () {
				return syncStatusCallComplete;
			}, 'Timed out waiting for syncRequest.', 10000);
		}

		//------------------------------------------------------------------------------------------------------
		// Returns the value of syncIsComplete.
		//
		// returns TRUE if the sync is complete.  False if it is not.
		//------------------------------------------------------------------------------------------------------
		function isSyncComplete() {
			log.debug('sync-request-endpoint-itest-spec.isSyncComplete: Entered method.  syncIsComplete: %j', syncIsComplete);
			return syncIsComplete;
		}


		//------------------------------------------------------------------------------------------------------
		// Test code starts here....
		//------------------------------------------------------------------------------------------------------
		runs(function() {
			var options = {
				url: config.syncRequestApi.protocol + '://' + config.syncRequestApi.host + ':' + config.syncRequestApi.port + config.syncRequestApi.patientSyncDemoPath,
				method: 'POST',
				json: dataToPost
			};

			log.debug('sync-request-endpoint-itest-spec: Sync Request.  options: %j', options);
			request.post(options, function(error, response, body) {
				log.debug('sync-request-endpoint-itest-spec: Sync Request call back called.  error: %j; response: %j, body: %j', error, response, body);
				syncRequestError = error;
				syncRequestResponse = response;
				expect(response.statusCode).toBe(202);
	            expect(body.priority).toBeTruthy();
	            expect(body.priority).toBe(1);
				syncRequestComplete = true;
			});
		});

		waitsFor(function() {
			return syncRequestComplete;
		}, 'Timed out waiting for syncRequest.', 10000);



		// Need to wait for the sync to complete.
		//----------------------------------------
		runs(function() {
			log.debug('sync-request-endpoint-itest-spec: Starting async.doWhilst.');
			async.doUntil(checkSyncComplete, isSyncComplete, function (error) {
				expect(error).toBeFalsy();
				log.debug('sync-request-endpoint-itest-spec: async.doWhilst call back called.  error: %j', error);
			});
		});

		waitsFor(function() {
			return syncIsComplete;
		}, 'Timed out waiting for sync to complete.', 60000);

		runs(function() {
			log.debug('sync-request-endpoint-itest-spec: Done Syncing syncStatusCalledCounter: %i; ', syncStatusCalledCounter);
		});

	});

	it('Sync disallowed for invalid type', function() {
		var syncRequestComplete = false;
		var testResponse;
		var testBody;
		var testError;

		runs(function() {
			var options = {
				url: config.syncRequestApi.protocol + '://' + config.syncRequestApi.host + ':' + config.syncRequestApi.port + config.syncRequestApi.patientStatusPath + '?das=DAS;SITE',
				method: 'GET'
			};

			request.get(options, function(error, response, body) {
				log.debug('sync-request-endpoint-itest-spec.checkSyncComplete: Retrieving status - Call back called: error: %j, response: %j, body: %j', error, response, body);
				testError = error;
				testResponse = response;
				testBody = body;

				syncRequestComplete = true;
			});
		});

		waitsFor(function() {
			return syncRequestComplete;
		}, 'Timed out waiting for syncRequest.', 5000);

		runs(function() {
			expect(testError).not.toBeTruthy();
			expect(testResponse).toBeTruthy();
			if(testResponse) {
				expect(testResponse.statusCode).toBe(400);
			}
			expect(testBody).toBeTruthy();
		});
	});

    it('Sync not started for pid not in jds', function() {
        var syncRequestComplete = false;
        var testResponse;
        var testBody;
        var testError;

        runs(function() {
            var options = {
                url: config.syncRequestApi.protocol + '://' + config.syncRequestApi.host + ':' + config.syncRequestApi.port + config.syncRequestApi.patientSyncPath + '?pid=SITE;99999999999999999',
                method: 'GET'
            };

            request.get(options, function(error, response, body) {
                log.debug('sync-request-endpoint-itest-spec.checkSyncComplete: Retrieving status - Call back called: error: %j, response: %j, body: %j', error, response, body);
                testError = error;
                testResponse = response;
                testBody = body;

                syncRequestComplete = true;
            });
        });

        waitsFor(function() {
            return syncRequestComplete;
        }, 'Timed out waiting for syncRequest.', 5000);

        runs(function() {
            expect(testError).not.toBeTruthy();
            expect(testResponse).toBeTruthy();
            if(testResponse) {
                expect(testResponse.statusCode).toBe(400);
            }
            expect(testBody).toBeTruthy();
            expect(testBody).toBe('Patient does not exist in Jds.');
        });
    });
});