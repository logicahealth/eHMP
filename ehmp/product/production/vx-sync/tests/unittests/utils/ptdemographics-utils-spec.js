'use strict';

//------------------------------------------------------------------------------------
// This file contains unit tests for ptdemographics-utils.js.
//
// Author: Les Westberg
//------------------------------------------------------------------------------------

require('../../../env-setup');
var _ = require('underscore');

var PtDemographicsUtil = require(global.VX_UTILS + '/ptdemographics-utils');
var metastampUtil = require(global.VX_UTILS + 'metastamp-utils');
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
// 	name: 'vista-record-poller-spec',
// 	level: 'debug'
// });

var hmpServer = 'TheHmpServer';


var config = {
	jds: {
		protocol: 'http',
		host: 'IPADDRESS ',
		port: 9080
	},
	'vistaSites': {
		'9E7A': {
			'name': 'panorama',
			'host': 'IPADDRESS ',
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
			'host': 'IPADDRESS ',
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

var vistaHdrConfig = {
	jds: {
		protocol: 'http',
		host: 'IPADDRESS ',
		port: 9080
	},
	'vistaSites': {
		'9E7A': {
			'name': 'panorama',
			'host': 'IPADDRESS ',
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
			'host': 'IPADDRESS ',
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
        'operationMode' : 'PUB/SUB',
        'hdrSites' : {
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

var demographicsFromVista = {
	'pid': '9E7A;3',
	'birthDate': '19350407',
	'last4': '0008',
	'last5': 'E0008',
	'icn': '10108V420871',
	'familyName': 'EIGHT',
	'givenNames': 'PATIENT',
	'fullName': 'EIGHT,PATIENT',
	'displayName': 'Eight,Patient',
	'genderCode': 'urn:va:pat-gender:M',
	'genderName': 'Male',
	'sensitive': false,
	'uid': 'urn:va:patient:9E7A:3:3',
	'summary': 'Eight,Patient',
	'ssn': '666000008',
	'localId': '3'
};

var pidDod = 'DOD;111';
var uidDod = 'urn:va:patient:DOD:111:111';
var demographicsDod = _.clone(demographicsFromVista);
demographicsDod.pid = pidDod;
demographicsDod.uid = uidDod;

var pidHdrSecondary = 'HDR;123';
var uidHdrSecondary = 'urn:va:patient:HDR:123:123';
var demographicsHdrSecondary = _.clone(demographicsFromVista);
demographicsHdrSecondary.pid = pidHdrSecondary;
demographicsHdrSecondary.uid = uidHdrSecondary;

var pidVistaHdr = '8211;456';
var uidVistaHdr = 'urn:va:patient:8211:456:456';
var demographicsVistaHdr = _.clone(demographicsFromVista);
demographicsVistaHdr.pid = pidVistaHdr;
demographicsVistaHdr.uid = uidVistaHdr;

//---------------------------------------------------------------------
// Create an instance of the environment variable.
//---------------------------------------------------------------------
function createEnvironment(vistaClient, the_config) {
	var environment = {
		jds: new JdsClientDummy(log, the_config),
		vistaClient: {}
	};

	if (vistaClient) {
		environment.vistaClient = vistaClient;
	}

	spyOn(environment.jds, 'getOperationalDataPtSelectByIcn').andCallThrough();
	spyOn(environment.jds, 'getOperationalDataPtSelectByPid').andCallThrough();
	spyOn(environment.jds, 'storePatientData').andCallThrough();
    spyOn(environment.jds, 'saveSyncStatus').andCallThrough();
	spyOn(environment.jds, 'getPtDemographicsByPid').andCallThrough();

	return environment;
}

describe('ptdemographics-utils.js', function() {
	describe('createPtDemographics()', function() {
		it('Happy Path with pid', function() {
			var finished = false;
			var vistaClient = {
				getDemographics: function(vistaId, dfn, callback) {
					return callback(null, demographicsFromVista);
				}
			};
			var environment = createEnvironment(vistaClient, config);
			var expectedJdsError = [null, null, null];
			var expectedJdsResponse = [{
				statusCode: 404
			}, {
                statusCode: 200
            }, {
				statusCode: 201
			}];
			var expectedJdsResult = [null, null, null];
			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			var originalSyncJob = {
				patientIdentifier: {
					type: 'pid',
					value: '9E7A;3'
				}
			};
			var syncJobsToPublish = [];
			runs(function() {
				ptDemographicsUtil.createPtDemographics(originalSyncJob, syncJobsToPublish, function(error, response) {
					expect(error).toBeFalsy();
					expect(response).toEqual(syncJobsToPublish);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('Happy Path with icn', function() {
			var finished = false;
			var vistaClient = {
				getDemographics: function(vistaId, dfn, callback) {
					return callback(null, demographicsFromVista);
				}
			};
			var environment = createEnvironment(vistaClient, config);
			var expectedJdsError = [null, null, null, null];
			var expectedJdsResponse = [{
				statusCode: 200
			}, {
				statusCode: 404
			}, {
                statusCode: 200
            }, {
				statusCode: 201
			}];
			var expectedJdsResult = [{
				data: {
					items: [{
						pid: '9E7A;3'
					}]
				}
			},
			null, null, null];
			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);
			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			var icn = '100';
			var originalSyncJob = {
				patientIdentifier: {
					type: 'icn',
					value: icn
				}
			};
			var syncJobsToPublish = [];
			runs(function() {
				ptDemographicsUtil.createPtDemographics(originalSyncJob, syncJobsToPublish, function(error, response) {
					expect(error).toBeFalsy();
					expect(response).toEqual(syncJobsToPublish);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('Happy Path with icn plus demographics', function() {
			// log.debug('***************************  start of test **********************************');
			var finished = false;
			var vistaClient = {
				getDemographics: function(vistaId, dfn, callback) {
					return callback(null, demographicsFromVista);
				}
			};
			var environment = createEnvironment(vistaClient, config);
			var expectedJdsError = [null, null];
			var expectedJdsResponse = [{
				statusCode: 200
			}, {
				statusCode: 200
			}];
			var expectedJdsResult = [null,
				{
					'data' : {
						items: [demographicsFromVista]}
				}];
			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);
			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			var icn = '100';
			var originalSyncJob = {
				patientIdentifier: {
					type: 'icn',
					value: icn
				},
				demographics : demographicsFromVista
			};
			var syncJobsToPublish = [{ type: 'jmeadows-sync-request',
                patientIdentifier: { type: 'pid', value: 'DOD;1234567' },
                jpid: '21EC2020-3AEA-4069-A2DD-CCCCCCCCCCCC',
                rootJobId: '5',
                jobId: '0f257995-777f-4bb0-91f0-1e3f86792a38' }];

			runs(function() {
				ptDemographicsUtil.createPtDemographics(originalSyncJob, syncJobsToPublish, function(error, response) {
					expect(error).toBeFalsy();
					expect(response).toEqual(syncJobsToPublish);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});

			// runs(function () {
			// 	log.debug('***************************  end of test **********************************');
			// });
		});
		it('Happy Path with DOD;1234567 plus demographics', function() {
			log.debug('***************************  start of test **********************************');
			var finished = false;
			var vistaClient = {
				getDemographics: function(vistaId, dfn, callback) {
					return callback(null, demographicsFromVista);
				}
			};
			var environment = createEnvironment(vistaClient, config);
			var expectedJdsError = [null, null];
			var expectedJdsResponse = [{
				statusCode: 200
			}, {
				statusCode: 200
			}];
			var expectedJdsResult = [null,
				{
					'data' : {
						items: [demographicsFromVista]}
				}];
			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);
			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			var icn = '100';
			var originalSyncJob = {
				patientIdentifier: {
					type: 'pid',
					value: 'DOD;1234567'
				},
				demographics : demographicsFromVista
			};
			var syncJobsToPublish = [{ type: 'jmeadows-sync-request',
                patientIdentifier: { type: 'pid', value: 'DOD;1234567' },
                jpid: '21EC2020-3AEA-4069-A2DD-CCCCCCCCCCCC',
                rootJobId: '5',
                jobId: '0f257995-777f-4bb0-91f0-1e3f86792a38' }];

			runs(function() {
				ptDemographicsUtil.createPtDemographics(originalSyncJob, syncJobsToPublish, function(error, response) {
					expect(error).toBeFalsy();
					expect(response).toEqual(syncJobsToPublish);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});

			runs(function () {
				log.debug('***************************  end of test **********************************');
			});
		});
		it('No originalSyncJob', function() {
			var finished = false;
			var environment = createEnvironment(null, config);
			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			var syncJobsToPublish = {};
			runs(function() {
				ptDemographicsUtil.createPtDemographics(null, syncJobsToPublish, function(error, response) {
					expect(error).toBeTruthy();
					expect(response).toBe(syncJobsToPublish);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('No patientIdentifier', function() {
			var finished = false;
			var environment = createEnvironment(null, config);
			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			var originalSyncJob = {};
			var syncJobsToPublish = {};
			runs(function() {
				ptDemographicsUtil.createPtDemographics(originalSyncJob, syncJobsToPublish, function(error, response) {
					expect(error).toBeTruthy();
					expect(response).toBe(syncJobsToPublish);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('patientIdentifier not icn or pid.', function() {
			var finished = false;
			var environment = createEnvironment(null, config);
			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			var originalSyncJob = {
				patientIdentifier: {
					type: 'edipi',
					value: '1111'
				}
			};
			var syncJobsToPublish = {};
			runs(function() {
				ptDemographicsUtil.createPtDemographics(originalSyncJob, syncJobsToPublish, function(error, response) {
					expect(error).toBeTruthy();
					expect(response).toBe(syncJobsToPublish);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('patientIdentifier with pid but not a primary site.', function() {
			var finished = false;
			var environment = createEnvironment(null, config);
			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			var originalSyncJob = {
				patientIdentifier: {
					type: 'pid',
					value: '4E44;100'
				}
			};
			var syncJobsToPublish = {};
			runs(function() {
				ptDemographicsUtil.createPtDemographics(originalSyncJob, syncJobsToPublish, function(error, response) {
					expect(error).toBeTruthy();
					expect(response).toBe(syncJobsToPublish);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});

	});
	describe('retrievePrimaryPidFromSyncJobs()', function() {
		it('Happy Path', function() {
			var finished = false;
			var environment = createEnvironment(null, config);
			var expectedJdsError = null;
			var expectedJdsResponse = {
				statusCode: 200
			};
			var expectedJdsResult = {
				data: {
					items: [{
						pid: '9E7A;3'
					}]
				}
			};
			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);
			var icn = '100';
            var syncJobsToPublish = [ { type: 'vista-9E7A-subscribe-request',
                patientIdentifier: { type: 'pid', value: '9E7A;3' },
                jpid: '21EC2020-3AEA-4069-A2DD-CCCCCCCCCCCC',
                rootJobId: '5',
                jobId: '8d38053f-cfae-44c0-8d02-d450b118a31a' },
              { type: 'vista-C877-subscribe-request',
                patientIdentifier: { type: 'pid', value: 'C877;12' },
                jpid: '21EC2020-3AEA-4069-A2DD-CCCCCCCCCCCC',
                rootJobId: '5',
                jobId: '48d6527b-75b1-4df8-9dd1-5f70a5e3a6bc' },
              { type: 'jmeadows-sync-request',
                patientIdentifier: { type: 'pid', value: 'DOD;1234567' },
                jpid: '21EC2020-3AEA-4069-A2DD-CCCCCCCCCCCC',
                rootJobId: '5',
                jobId: '0f257995-777f-4bb0-91f0-1e3f86792a38' },
              { type: 'hdr-sync-request',
                patientIdentifier: { type: 'pid', value: 'HDR;111111' },
                jpid: '21EC2020-3AEA-4069-A2DD-CCCCCCCCCCCC',
                rootJobId: '5',
                jobId: '7f534da6-be97-4a05-a270-22ca710f3c82' },
              { type: 'vler-sync-request',
                patientIdentifier: { type: 'pid', value: 'VLER;222222' },
                jpid: '21EC2020-3AEA-4069-A2DD-CCCCCCCCCCCC',
                rootJobId: '5',
                jobId: '80806da9-363d-4a82-aefb-2996a5a2e212' } ];

            var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
            runs(function() {
                ptDemographicsUtil.retrievePrimaryPidFromSyncJobs(syncJobsToPublish, function(error, response) {
					expect(error).toBeFalsy();
					expect(response).toEqual('9E7A;3');
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('No result returned', function() {
			var finished = false;
			var environment = createEnvironment(null, config);
			var expectedJdsError = null;
			var expectedJdsResponse = {
				statusCode: 200
			};
			var expectedJdsResult = null;
			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);
            var syncJobsToPublish = {};

            var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
            runs(function() {
                ptDemographicsUtil.retrievePrimaryPidFromSyncJobs(syncJobsToPublish, function(error, response) {
					expect(error).toBeFalsy();
					expect(response).toBeNull();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('No result.data returned', function() {
			var finished = false;
			var environment = createEnvironment(null, config);
			var expectedJdsError = null;
			var expectedJdsResponse = {
				statusCode: 200
			};
			var expectedJdsResult = {};
			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);
            var syncJobsToPublish = {};

            var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
            runs(function() {
                ptDemographicsUtil.retrievePrimaryPidFromSyncJobs(syncJobsToPublish, function(error, response) {
					expect(error).toBeFalsy();
					expect(response).toBeNull();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('No result.data.items returned', function() {
			var finished = false;
			var environment = createEnvironment(null, config);
			var expectedJdsError = null;
			var expectedJdsResponse = {
				statusCode: 200
			};
			var expectedJdsResult = {
				data: {}
			};
			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);
            var syncJobsToPublish = {};

            var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
            runs(function() {
                ptDemographicsUtil.retrievePrimaryPidFromSyncJobs(syncJobsToPublish, function(error, response) {
					expect(error).toBeFalsy();
					expect(response).toBeNull();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('No result.data.items[0] returned', function() {
			var finished = false;
			var environment = createEnvironment(null, config);
			var expectedJdsError = null;
			var expectedJdsResponse = {
				statusCode: 200
			};
			var expectedJdsResult = {
				data: {
					items: []
				}
			};
			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);
            var syncJobsToPublish = {};

			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			runs(function() {
				ptDemographicsUtil.retrievePrimaryPidFromSyncJobs(syncJobsToPublish, function(error, response) {
					expect(error).toBeFalsy();
					expect(response).toBeNull();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
	});
	describe('retrieveDemographicsFromVistAandStoreInJds()', function() {
		it('Happy Path', function() {
			var finished = false;
			var vistaClient = {
				getDemographics: function(vistaId, dfn, callback) {
					return callback(null, demographicsFromVista);
				}
			};
			var environment = createEnvironment(vistaClient, config);
			var expectedJdsError = [null, null];
			var expectedJdsResponse = [{
                statusCode: 200
            }, {
				statusCode: 201
			}];
			var expectedJdsResult = [null, null];
            var record = {
                'data': {
                    'items': [demographicsFromVista]
                }
            };
            var metastamp = metastampUtil.metastampDomain(record, demographicsFromVista.stampTime,'');

			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			runs(function() {
				ptDemographicsUtil.retrieveDemographicsFromVistAandStoreInJds(demographicsFromVista.pid, function(error, ptDemographics) {
					expect(error).toBeFalsy();
					expect(ptDemographics).toBeTruthy();
					expect(ptDemographics).toEqual(jasmine.objectContaining(demographicsFromVista)); // toEqual because we should get our original item plus an additional attribute.
					expect(ptDemographics.stampTime).toBeTruthy();
                    expect(environment.jds.saveSyncStatus.calls.length).toEqual(1);
                    expect(environment.jds.saveSyncStatus).toHaveBeenCalledWith(jasmine.objectContaining(metastamp), jasmine.objectContaining({value: demographicsFromVista.pid}), jasmine.any(Function));
	                expect(environment.jds.storePatientData.calls.length).toEqual(1);
                    expect(environment.jds.storePatientData).toHaveBeenCalledWith(jasmine.objectContaining(demographicsFromVista), jasmine.any(Function));
                    expect(environment.jds.storePatientData).toHaveBeenCalledWith(jasmine.objectContaining({
                        stampTime: jasmine.any(String)
                    }), jasmine.any(Function));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('Pid was null', function() {
			var finished = false;
			var vistaClient = {
				getDemographics: function(vistaId, dfn, callback) {
					return callback(null, demographicsFromVista);
				}
			};
			var environment = createEnvironment(vistaClient, config);
			var expectedJdsError = null;
			var expectedJdsResponse = {
				statusCode: 200
			};
			var expectedJdsResult = null;
			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			runs(function() {
				ptDemographicsUtil.retrieveDemographicsFromVistAandStoreInJds(null, function(error, ptDemographics) {
					expect(error).toEqual('FailedNoPid');
					expect(ptDemographics).toBeNull();
					expect(environment.jds.storePatientData.calls.length).toEqual(0);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('Pid was invalid', function() {
			var finished = false;
			var vistaClient = {
				getDemographics: function(vistaId, dfn, callback) {
					return callback(null, demographicsFromVista);
				}
			};
			var environment = createEnvironment(vistaClient, config);
			var expectedJdsError = null;
			var expectedJdsResponse = {
				statusCode: 200
			};
			var expectedJdsResult = null;
			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			runs(function() {
				ptDemographicsUtil.retrieveDemographicsFromVistAandStoreInJds('9E7A', function(error, ptDemographics) {
					expect(error).toEqual('FailedPidInvalid');
					expect(ptDemographics).toBeNull();
					expect(environment.jds.storePatientData.calls.length).toEqual(0);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('VistA RPC call returned error', function() {
			var finished = false;
			var vistaClient = {
				getDemographics: function(vistaId, dfn, callback) {
					return callback('ErrorFromVista', null);
				}
			};
			var environment = createEnvironment(vistaClient, config);
			var expectedJdsError = null;
			var expectedJdsResponse = {
				statusCode: 200
			};
			var expectedJdsResult = null;
			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			runs(function() {
				ptDemographicsUtil.retrieveDemographicsFromVistAandStoreInJds(demographicsFromVista.pid, function(error, ptDemographics) {
					expect(error).toEqual('ErrorFromVista');
					expect(ptDemographics).toBeNull();
					expect(environment.jds.storePatientData.calls.length).toEqual(0);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('VistA RPC call returned no error and no demographics', function() {
			var finished = false;
			var vistaClient = {
				getDemographics: function(vistaId, dfn, callback) {
					return callback(null, null);
				}
			};
			var environment = createEnvironment(vistaClient, config);
			var expectedJdsError = null;
			var expectedJdsResponse = {
				statusCode: 200
			};
			var expectedJdsResult = null;
			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			runs(function() {
				ptDemographicsUtil.retrieveDemographicsFromVistAandStoreInJds(demographicsFromVista.pid, function(error, ptDemographics) {
					expect(error).toBeNull();
					expect(ptDemographics).toBeNull();
					expect(environment.jds.storePatientData.calls.length).toEqual(0);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});

        it('Error when creating metastamp for patient demographics', function() {
            var finished = false;

            var demographicsFromVistaWithBadTimeStamp = _.clone(demographicsFromVista);
            demographicsFromVistaWithBadTimeStamp.stampTime = 201512301451;

            var vistaClient = {
                getDemographics: function(vistaId, dfn, callback) {
                    return callback(null, demographicsFromVistaWithBadTimeStamp);
                }
            };
            var environment = createEnvironment(vistaClient, config);
            var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
            runs(function() {
                ptDemographicsUtil.retrieveDemographicsFromVistAandStoreInJds(demographicsFromVistaWithBadTimeStamp.pid, function(error, ptDemographics) {
                    expect(error).toEqual('FailedMetastampError');
                    expect(ptDemographics).toBeNull();
                    expect(environment.jds.saveSyncStatus.calls.length).toEqual(0);
                    expect(environment.jds.storePatientData.calls.length).toEqual(0);
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            });
        });

        it('JDS returned error on storage of metastamp for demographics', function() {
            var finished = false;
            var vistaClient = {
                getDemographics: function(vistaId, dfn, callback) {
                    return callback(null, demographicsFromVista);
                }
            };
            var environment = createEnvironment(vistaClient, config);
            var expectedJdsError = 'SomeError1';
            var expectedJdsResponse = {
                statusCode: 200
            };
            var expectedJdsResult = null;
            var record = {
                'data': {
                    'items': [demographicsFromVista]
                }
            };
            var metastamp = metastampUtil.metastampDomain(record, demographicsFromVista.stampTime,'');
            environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

            var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
            runs(function() {
                ptDemographicsUtil.retrieveDemographicsFromVistAandStoreInJds(demographicsFromVista.pid, function(error, ptDemographics) {
                    expect(error).toEqual('FailedJdsError');
                    expect(ptDemographics).toBeNull();
                    expect(environment.jds.saveSyncStatus.calls.length).toEqual(1);
                    expect(environment.jds.saveSyncStatus).toHaveBeenCalledWith(jasmine.objectContaining(metastamp), jasmine.objectContaining({value: demographicsFromVista.pid}), jasmine.any(Function));
                    expect(environment.jds.storePatientData.calls.length).toEqual(0);
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            });
        });

		it('JDS returned error on storage of demographics', function() {
			var finished = false;
			var vistaClient = {
				getDemographics: function(vistaId, dfn, callback) {
					return callback(null, demographicsFromVista);
				}
			};
			var environment = createEnvironment(vistaClient, config);
			var expectedJdsError = [null, 'SomeError'];
			var expectedJdsResponse = [{
                statusCode: 200
            }, {
				statusCode: 404
			}];
            var expectedJdsResult = [null, null];
            var record = {
                'data': {
                    'items': [demographicsFromVista]
                }
            };
            var metastamp = metastampUtil.metastampDomain(record, demographicsFromVista.stampTime,'');

			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			runs(function() {
				ptDemographicsUtil.retrieveDemographicsFromVistAandStoreInJds(demographicsFromVista.pid, function(error, ptDemographics) {
					expect(error).toEqual('FailedJdsError');
					expect(ptDemographics).toBeNull();
                    expect(environment.jds.saveSyncStatus.calls.length).toEqual(1);
                    expect(environment.jds.saveSyncStatus).toHaveBeenCalledWith(jasmine.objectContaining(metastamp), jasmine.objectContaining({value: demographicsFromVista.pid}), jasmine.any(Function));
	                expect(environment.jds.storePatientData.calls.length).toEqual(1);
                    expect(environment.jds.storePatientData).toHaveBeenCalledWith(jasmine.objectContaining(demographicsFromVista), jasmine.any(Function));
                    expect(environment.jds.storePatientData).toHaveBeenCalledWith(jasmine.objectContaining({
                        stampTime: jasmine.any(String)
                    }), jasmine.any(Function));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
        it('JDS returned no response on storge of metastamp for demographics', function() {
            var finished = false;
            var vistaClient = {
                getDemographics: function(vistaId, dfn, callback) {
                    return callback(null, demographicsFromVista);
                }
            };
            var environment = createEnvironment(vistaClient, config);
            var expectedJdsError = null;
            var expectedJdsResponse = null;
            var expectedJdsResult = null;
            var record = {
                'data': {
                    'items': [demographicsFromVista]
                }
            };
            var metastamp = metastampUtil.metastampDomain(record, demographicsFromVista.stampTime,'');

            environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

            var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
            runs(function() {
                ptDemographicsUtil.retrieveDemographicsFromVistAandStoreInJds(demographicsFromVista.pid, function(error, ptDemographics) {
                    expect(error).toEqual('FailedJdsNoResponse');
                    expect(ptDemographics).toBeNull();
                    expect(environment.jds.saveSyncStatus.calls.length).toEqual(1);
                    expect(environment.jds.saveSyncStatus).toHaveBeenCalledWith(jasmine.objectContaining(metastamp), jasmine.objectContaining({value: demographicsFromVista.pid}), jasmine.any(Function));
                    expect(environment.jds.storePatientData.calls.length).toEqual(0);
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            });
        });
		it('JDS returned no response on storge of demographics', function() {
			var finished = false;
			var vistaClient = {
				getDemographics: function(vistaId, dfn, callback) {
					return callback(null, demographicsFromVista);
				}
			};
			var environment = createEnvironment(vistaClient, config);
            var expectedJdsError = [null, null];
            var expectedJdsResponse = [{
                statusCode: 200
            }, null];
            var expectedJdsResult = [null, null];
            var record = {
                'data': {
                    'items': [demographicsFromVista]
                }
            };
            var metastamp = metastampUtil.metastampDomain(record, demographicsFromVista.stampTime,'');

			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			runs(function() {
				ptDemographicsUtil.retrieveDemographicsFromVistAandStoreInJds(demographicsFromVista.pid, function(error, ptDemographics) {
					expect(error).toEqual('FailedJdsNoResponse');
					expect(ptDemographics).toBeNull();
                    expect(environment.jds.saveSyncStatus.call.length).toEqual(1);
                    expect(environment.jds.saveSyncStatus).toHaveBeenCalledWith(jasmine.objectContaining(metastamp), jasmine.objectContaining({value: demographicsFromVista.pid}), jasmine.any(Function));
	                expect(environment.jds.storePatientData.calls.length).toEqual(1);
                    expect(environment.jds.storePatientData).toHaveBeenCalledWith(jasmine.objectContaining(demographicsFromVista), jasmine.any(Function));
                    expect(environment.jds.storePatientData).toHaveBeenCalledWith(jasmine.objectContaining({
                        stampTime: jasmine.any(String)
                    }), jasmine.any(Function));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
        it('JDS returned invalid status code on storage of metastamp for demographics', function() {
            var finished = false;
            var vistaClient = {
                getDemographics: function(vistaId, dfn, callback) {
                    return callback(null, demographicsFromVista);
                }
            };
            var environment = createEnvironment(vistaClient, config);
            var expectedJdsError = null;
            var expectedJdsResponse = {
                statusCode: 500
            };
            var expectedJdsResult = null;
            var record = {
                'data': {
                    'items': [demographicsFromVista]
                }
            };
            var metastamp = metastampUtil.metastampDomain(record, demographicsFromVista.stampTime,'');

            environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

            var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
            runs(function() {
                ptDemographicsUtil.retrieveDemographicsFromVistAandStoreInJds(demographicsFromVista.pid, function(error, ptDemographics) {
                    expect(error).toEqual('FailedJdsWrongStatusCode');
                    expect(ptDemographics).toBeNull();
                    expect(environment.jds.saveSyncStatus.calls.length).toEqual(1);
                    expect(environment.jds.saveSyncStatus).toHaveBeenCalledWith(jasmine.objectContaining(metastamp), jasmine.objectContaining({value: demographicsFromVista.pid}), jasmine.any(Function));
                    expect(environment.jds.storePatientData.calls.length).toEqual(0);
                    finished = true;
                });
            });
            waitsFor(function() {
                return finished;
            });
        });
		it('JDS returned invalid status code on storage of demographics', function() {
			var finished = false;
			var vistaClient = {
				getDemographics: function(vistaId, dfn, callback) {
					return callback(null, demographicsFromVista);
				}
			};
			var environment = createEnvironment(vistaClient, config);
            var expectedJdsError = [null, null];
            var expectedJdsResponse = [{
                statusCode: 200
            }, {
				statusCode: 404
            }];
            var expectedJdsResult = [null, null];
            var record = {
                'data': {
                    'items': [demographicsFromVista]
                }
            };
            var metastamp = metastampUtil.metastampDomain(record, demographicsFromVista.stampTime,'');

			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			runs(function() {
				ptDemographicsUtil.retrieveDemographicsFromVistAandStoreInJds(demographicsFromVista.pid, function(error, ptDemographics) {
					expect(error).toEqual('FailedJdsWrongStatusCode');
					expect(ptDemographics).toBeNull();
                    expect(environment.jds.saveSyncStatus.calls.length).toEqual(1);
                    expect(environment.jds.saveSyncStatus).toHaveBeenCalledWith(jasmine.objectContaining(metastamp), jasmine.objectContaining({value: demographicsFromVista.pid}), jasmine.any(Function));
	                expect(environment.jds.storePatientData.calls.length).toEqual(1);
                    expect(environment.jds.storePatientData).toHaveBeenCalledWith(jasmine.objectContaining(demographicsFromVista), jasmine.any(Function));
                    expect(environment.jds.storePatientData).toHaveBeenCalledWith(jasmine.objectContaining({
                        stampTime: jasmine.any(String)
                    }), jasmine.any(Function));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
	});
	describe('retrieveOrCreateDemographicsForPrimaryPid()', function() {
		it('Found demographics in JDS', function() {
			var finished = false;
			var vistaClient = {
				getDemographics: function(vistaId, dfn, callback) {
					return callback(null, demographicsFromVista);
				}
			};
			var environment = createEnvironment(vistaClient, config);
			var expectedJdsError = null;
			var expectedJdsResponse = {
				statusCode: 200
			};
			var expectedJdsResult = {
				data: {
					items: [demographicsFromVista]
				}
			};
			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			runs(function() {
				ptDemographicsUtil.retrieveOrCreateDemographicsForPrimaryPid(demographicsFromVista.pid, null, function(error, ptDemographics) {
					expect(error).toBeFalsy();
					expect(ptDemographics).toBeTruthy();
					expect(ptDemographics).toEqual(jasmine.objectContaining(demographicsFromVista));
					expect(environment.jds.getPtDemographicsByPid.calls.length).toEqual(1);
					expect(environment.jds.getPtDemographicsByPid).toHaveBeenCalledWith(demographicsFromVista.pid, jasmine.any(Function));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('Did not find demographics in JDS', function() {
			var finished = false;
			var vistaClient = {
				getDemographics: function(vistaId, dfn, callback) {
					return callback(null, demographicsFromVista);
				}
			};
			var environment = createEnvironment(vistaClient, config);
			var expectedJdsError = [null, null, null];
			var expectedJdsResponse = [{
				statusCode: 404
			}, {
                statusCode: 200
            }, {
				statusCode: 201
			}];
			var expectedJdsResult = [null, null, null];
            var record = {
                'data': {
                    'items': [demographicsFromVista]
                }
            };
            var metastamp = metastampUtil.metastampDomain(record, demographicsFromVista.stampTime,'');

			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			runs(function() {
				ptDemographicsUtil.retrieveOrCreateDemographicsForPrimaryPid(demographicsFromVista.pid, null, function(error, ptDemographics) {
					expect(error).toBeFalsy();
					expect(ptDemographics).toBeTruthy();
					expect(ptDemographics).toEqual(jasmine.objectContaining(demographicsFromVista)); // toEqual because we should get our original item plus an additional attribute.
					expect(ptDemographics.stampTime).toBeTruthy();
					expect(environment.jds.getPtDemographicsByPid.calls.length).toEqual(1);
					expect(environment.jds.getPtDemographicsByPid).toHaveBeenCalledWith(demographicsFromVista.pid, jasmine.any(Function));
                    expect(environment.jds.saveSyncStatus.calls.length).toEqual(1);
                    expect(environment.jds.saveSyncStatus).toHaveBeenCalledWith(jasmine.objectContaining(metastamp), jasmine.objectContaining({value: demographicsFromVista.pid}), jasmine.any(Function));
	                expect(environment.jds.storePatientData.calls.length).toEqual(1);
                    expect(environment.jds.storePatientData).toHaveBeenCalledWith(jasmine.objectContaining(demographicsFromVista), jasmine.any(Function));
                    expect(environment.jds.storePatientData).toHaveBeenCalledWith(jasmine.objectContaining({
                        stampTime: jasmine.any(String)
                    }), jasmine.any(Function));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
	});
	describe('_demographicsCreationTaskWrapper()', function() {
		it('Happy Path', function() {
			var finished = false;
			var demographicsCreationTask = function(callback) {
				return callback(null, demographicsDod);
			};
			var environment = createEnvironment(null, config);
			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			var _demographicsCreationTaskWrapper = PtDemographicsUtil._demographicsCreationTaskWrapper.bind(ptDemographicsUtil, pidDod, demographicsCreationTask);
			runs(function() {
				_demographicsCreationTaskWrapper(function(error, response) {
					expect(error).toBeNull();
					expect(response).toEqual(demographicsDod);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('Happy Path', function() {
			var finished = false;
			var demographicsCreationTask = function(callback) {
				return callback('SomeError', null);
			};
			var environment = createEnvironment(null, config);
			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			var _demographicsCreationTaskWrapper = PtDemographicsUtil._demographicsCreationTaskWrapper.bind(ptDemographicsUtil, pidDod, demographicsCreationTask);
			runs(function() {
				_demographicsCreationTaskWrapper(function(error, response) {
					expect(error).toBeNull();
					expect(response).toEqual({
						errorPid: pidDod,
						errorMessage: 'SomeError'
					});
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
	});
	describe('createPtDemographicsForJobsUsingPid()', function() {
		it('Happy Path for DoD Job', function() {
			var finished = false;
			var vistaClient = {
				getDemographics: function(vistaId, dfn, callback) {
					return callback(null, demographicsFromVista);
				}
			};
			var environment = createEnvironment(vistaClient, config);
			var expectedJdsError = [null, null];
			var expectedJdsResponse = [{
				statusCode: 200
			}, {
				statusCode: 200
			}];
			var expectedJdsResult = [{
				data: {
					items: [demographicsFromVista]
				}
			}, {
				data: {
					items: [demographicsDod]
				}
			}];
			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);
			var syncJobsToPublish = [{
				type: 'jmeadows-sync-request',
				patientIdentifier: {
					type: 'pid',
					value: pidDod
				}
			}];

			// Note we cannot test all the jobs at once - because of the parallel nature - we cannot control what order
			// JDS will have to give its responses.
			//-----------------------------------------------------------------------------------------------------------
			// var syncJobsToPublish = [{
			// 	type: 'vista-9E7A-subscribe-request',
			// 	patientIdentifier: {
			// 		type: 'pid',
			// 		value: demographicsFromVista.pid
			// 	}
			// }, {
			// 	type: 'vista-9E7A-subscribe-request',
			// 	patientIdentifier: {
			// 		type: 'pid',
			// 		value: 'C877;3'
			// 	}
			// }, {
			// 	type: 'jmeadows-sync-request',
			// 	patientIdentifier: {
			// 		type: 'pid',
			// 		value: pidDod
			// 	}
			// }];

			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			runs(function() {
				ptDemographicsUtil.createPtDemographicsForJobsUsingPid(demographicsFromVista.pid, syncJobsToPublish, null, function(error, filteredSyncJobsToPublish) {
					expect(error).toBeFalsy();
					expect(filteredSyncJobsToPublish).toEqual(syncJobsToPublish);
					expect(environment.jds.getPtDemographicsByPid.calls.length).toEqual(2);
					expect(environment.jds.getPtDemographicsByPid).toHaveBeenCalledWith(demographicsFromVista.pid, jasmine.any(Function));
					expect(environment.jds.getPtDemographicsByPid).toHaveBeenCalledWith(pidDod, jasmine.any(Function));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('Happy Path for HDR Job (HDR configured as secondary)', function() {
			var finished = false;
			var vistaClient = {
				getDemographics: function(vistaId, dfn, callback) {
					return callback(null, demographicsFromVista);
				}
			};
			var environment = createEnvironment(vistaClient, config);
			var expectedJdsError = [null, null];
			var expectedJdsResponse = [{
				statusCode: 200
			}, {
				statusCode: 200
			}];
			var expectedJdsResult = [{
				data: {
					items: [demographicsFromVista]
				}
			}, {
				data: {
					items: [demographicsHdrSecondary]
				}
			}];
			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);
			var syncJobsToPublish = [{
				type: 'hdr-sync-request',
				patientIdentifier: {
					type: 'pid',
					value: pidHdrSecondary
				}
			}];

			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			runs(function() {
				ptDemographicsUtil.createPtDemographicsForJobsUsingPid(demographicsFromVista.pid, syncJobsToPublish, null, function(error, filteredSyncJobsToPublish) {
					expect(error).toBeFalsy();
					expect(filteredSyncJobsToPublish).toEqual(syncJobsToPublish);
					expect(environment.jds.getPtDemographicsByPid.calls.length).toEqual(2);
					expect(environment.jds.getPtDemographicsByPid).toHaveBeenCalledWith(demographicsFromVista.pid, jasmine.any(Function));
					expect(environment.jds.getPtDemographicsByPid).toHaveBeenCalledWith(pidHdrSecondary, jasmine.any(Function));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('Happy Path for HDR Job (HDR configured as PUB/SUB)', function() {
			var finished = false;
			var vistaClient = {
				getDemographics: function(vistaId, dfn, callback) {
					return callback(null, demographicsFromVista);
				}
			};
			var environment = createEnvironment(vistaClient, vistaHdrConfig);
			var expectedJdsError = [null, null];
			var expectedJdsResponse = [{
				statusCode: 200
			}, {
				statusCode: 200
			}];
			var expectedJdsResult = [{
				data: {
					items: [demographicsFromVista]
				}
			}, {
				data: {
					items: [demographicsVistaHdr]
				}
			}];
			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);
			var syncJobsToPublish = [{
				type: 'vistahdr-8211-subscribe-request',
				patientIdentifier: {
					type: 'pid',
					value: pidVistaHdr
				}
			}];

			var ptDemographicsUtil = new PtDemographicsUtil(log, vistaHdrConfig, environment);
			runs(function() {
				ptDemographicsUtil.createPtDemographicsForJobsUsingPid(demographicsFromVista.pid, syncJobsToPublish, null, function(error, filteredSyncJobsToPublish) {
					expect(error).toBeFalsy();
					expect(filteredSyncJobsToPublish).toEqual(syncJobsToPublish);
					expect(environment.jds.getPtDemographicsByPid.calls.length).toEqual(2);
					expect(environment.jds.getPtDemographicsByPid).toHaveBeenCalledWith(demographicsFromVista.pid, jasmine.any(Function));
					expect(environment.jds.getPtDemographicsByPid).toHaveBeenCalledWith(pidVistaHdr, jasmine.any(Function));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('Happy Path for Primary Site Job - same as original primary site', function() {
			var finished = false;
			var vistaClient = {
				getDemographics: function(vistaId, dfn, callback) {
					return callback(null, demographicsFromVista);
				}
			};
			var environment = createEnvironment(vistaClient, config);
			var expectedJdsError = [null, null];
			var expectedJdsResponse = [{
				statusCode: 200
			}, {
				statusCode: 200
			}];
			var expectedJdsResult = [{
				data: {
					items: [demographicsFromVista]
				}
			}, {
				data: {
					items: [demographicsDod]
				}
			}];
			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);
			var syncJobsToPublish = [{
				type: 'vista-9E7A-subscribe-request',
				patientIdentifier: {
					type: 'pid',
					value: demographicsFromVista.pid
				}
			}];

			// Note we cannot test all the jobs at once - because of the parallel nature - we cannot control what order
			// JDS will have to give its responses.
			//-----------------------------------------------------------------------------------------------------------
			// var syncJobsToPublish = [{
			// 	type: 'vista-9E7A-subscribe-request',
			// 	patientIdentifier: {
			// 		type: 'pid',
			// 		value: demographicsFromVista.pid
			// 	}
			// }, {
			// 	type: 'vista-9E7A-subscribe-request',
			// 	patientIdentifier: {
			// 		type: 'pid',
			// 		value: 'C877;3'
			// 	}
			// }, {
			// 	type: 'jmeadows-sync-request',
			// 	patientIdentifier: {
			// 		type: 'pid',
			// 		value: pidDod
			// 	}
			// }];

			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			runs(function() {
				ptDemographicsUtil.createPtDemographicsForJobsUsingPid(demographicsFromVista.pid, syncJobsToPublish, null, function(error, filteredSyncJobsToPublish) {
					expect(error).toBeFalsy();
					expect(filteredSyncJobsToPublish).toEqual(syncJobsToPublish);
					expect(environment.jds.getPtDemographicsByPid.calls.length).toEqual(2);
					expect(environment.jds.getPtDemographicsByPid).toHaveBeenCalledWith(demographicsFromVista.pid, jasmine.any(Function));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('Happy Path for Primary Site Job - different than original primary site', function() {
			var finished = false;
			var vistaClient = {
				getDemographics: function(vistaId, dfn, callback) {
					return callback(null, demographicsFromVista);
				}
			};
			var environment = createEnvironment(vistaClient, config);
			var expectedJdsError = [null, null];
			var expectedJdsResponse = [{
				statusCode: 200
			}, {
				statusCode: 200
			}];
			var expectedJdsResult = [{
				data: {
					items: [demographicsFromVista]
				}
			}, {
				data: {
					items: [demographicsDod]
				}
			}];
			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);
			var syncJobsToPublish = [{
				type: 'vista-9E7A-subscribe-request',
				patientIdentifier: {
					type: 'pid',
					value: 'C877;3'
				}
			}];

			// Note we cannot test all the jobs at once - because of the parallel nature - we cannot control what order
			// JDS will have to give its responses.
			//-----------------------------------------------------------------------------------------------------------
			// var syncJobsToPublish = [{
			// 	type: 'vista-9E7A-subscribe-request',
			// 	patientIdentifier: {
			// 		type: 'pid',
			// 		value: demographicsFromVista.pid
			// 	}
			// }, {
			// 	type: 'vista-9E7A-subscribe-request',
			// 	patientIdentifier: {
			// 		type: 'pid',
			// 		value: 'C877;3'
			// 	}
			// }, {
			// 	type: 'jmeadows-sync-request',
			// 	patientIdentifier: {
			// 		type: 'pid',
			// 		value: pidDod
			// 	}
			// }];

			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			runs(function() {
				ptDemographicsUtil.createPtDemographicsForJobsUsingPid(demographicsFromVista.pid, syncJobsToPublish, null, function(error, filteredSyncJobsToPublish) {
					expect(error).toBeFalsy();
					expect(filteredSyncJobsToPublish).toEqual(syncJobsToPublish);
					expect(environment.jds.getPtDemographicsByPid.calls.length).toEqual(2);
					expect(environment.jds.getPtDemographicsByPid).toHaveBeenCalledWith(demographicsFromVista.pid, jasmine.any(Function));
					expect(environment.jds.getPtDemographicsByPid).toHaveBeenCalledWith('9E7A;3', jasmine.any(Function));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('DoD Job received an error', function() {
			var finished = false;
			var vistaClient = {
				getDemographics: function(vistaId, dfn, callback) {
					return callback(null, demographicsFromVista);
				}
			};
			var environment = createEnvironment(vistaClient, config);
			var expectedJdsError = [null, null, 'SomeError'];
			var expectedJdsResponse = [{
				statusCode: 200
			}, {
				statusCode: 200
			}, {
				statusCode: 404
			}];
			var expectedJdsResult = [{
				data: {
					items: [demographicsFromVista]
				}
			}, null, null];
			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);
			var syncJobsToPublish = [{
				type: 'jmeadows-sync-request',
				patientIdentifier: {
					type: 'pid',
					value: pidDod
				}
			}];

			// Note we cannot test all the jobs at once - because of the parallel nature - we cannot control what order
			// JDS will have to give its responses.
			//-----------------------------------------------------------------------------------------------------------
			// var syncJobsToPublish = [{
			// 	type: 'vista-9E7A-subscribe-request',
			// 	patientIdentifier: {
			// 		type: 'pid',
			// 		value: demographicsFromVista.pid
			// 	}
			// }, {
			// 	type: 'vista-9E7A-subscribe-request',
			// 	patientIdentifier: {
			// 		type: 'pid',
			// 		value: 'C877;3'
			// 	}
			// }, {
			// 	type: 'jmeadows-sync-request',
			// 	patientIdentifier: {
			// 		type: 'pid',
			// 		value: pidDod
			// 	}
			// }];

			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			runs(function() {
				ptDemographicsUtil.createPtDemographicsForJobsUsingPid(demographicsFromVista.pid, syncJobsToPublish, null, function(error, filteredSyncJobsToPublish) {
					expect(error).toBeFalsy();
					expect(filteredSyncJobsToPublish).toEqual([]); // Since there was an error - should have been removed from the list.
					expect(environment.jds.getPtDemographicsByPid.calls.length).toEqual(2);
					expect(environment.jds.getPtDemographicsByPid).toHaveBeenCalledWith(demographicsFromVista.pid, jasmine.any(Function));
					expect(environment.jds.getPtDemographicsByPid).toHaveBeenCalledWith(pidDod, jasmine.any(Function));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('retrieveOrCreateDemographicsForPrimaryPid failed to return ptDemographics.', function() {
			var finished = false;
			var vistaClient = {
				getDemographics: function(vistaId, dfn, callback) {
					return callback(null, demographicsFromVista);
				}
			};
			var environment = createEnvironment(vistaClient, config);
			var expectedJdsError = null;
			var expectedJdsResponse = {
				statusCode: 200
			};
			var expectedJdsResult = null;
			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);
			var syncJobsToPublish = [];

			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			runs(function() {
				ptDemographicsUtil.createPtDemographicsForJobsUsingPid(demographicsFromVista.pid, syncJobsToPublish, null, function(error) {
					expect(error).toEqual('FailedJdsNoResponse');
					expect(environment.jds.getPtDemographicsByPid.calls.length).toEqual(1);
					expect(environment.jds.getPtDemographicsByPid).toHaveBeenCalledWith(demographicsFromVista.pid, jasmine.any(Function));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('retrieveOrCreateDemographicsForPrimaryPid failed to return ptDemographics.', function() {
			var finished = false;
			var vistaClient = {
				getDemographics: function(vistaId, dfn, callback) {
					return callback(null, demographicsFromVista);
				}
			};
			var environment = createEnvironment(vistaClient, config);
			var expectedJdsError = null;
			var expectedJdsResponse = {
				statusCode: 200
			};
			var expectedJdsResult = null;
			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);
			var syncJobsToPublish = [];

			var demographics = {
				name: 'test patient'
			};
			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			runs(function() {
				ptDemographicsUtil.createPtDemographicsForJobsUsingPid('HDR;3', syncJobsToPublish, demographics, function(error) {
					expect(error).toBeFalsy();
					expect(environment.jds.getPtDemographicsByPid.calls.length).toEqual(1);
					expect(environment.jds.getPtDemographicsByPid).toHaveBeenCalledWith('HDR;3', jasmine.any(Function));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
	});
	describe('storeDemographicsInJdsUsingBasisDemographics()', function() {
		it('Happy Path', function() {
			var finished = false;
			var vistaClient = {
				getDemographics: function(vistaId, dfn, callback) {
					return callback(null, demographicsFromVista);
				}
			};
			var environment = createEnvironment(vistaClient, config);
            var expectedJdsError = [null, null];
            var expectedJdsResponse = [{
                statusCode: 200
            }, {
				statusCode: 201
			}];
			var expectedJdsResult = [null, null];
            var record = {
                'data': {
                    'items': [demographicsDod]
                }
            };
            var metastamp = metastampUtil.metastampDomain(record, demographicsDod.stampTime,'');

			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			runs(function() {
				ptDemographicsUtil.storeDemographicsInJdsUsingBasisDemographics(pidDod, demographicsFromVista, function(error, ptDemographics) {
					expect(error).toBeFalsy();
					expect(ptDemographics).toBeTruthy();
					expect(ptDemographics).toEqual(jasmine.objectContaining(demographicsDod)); // toEqual because we should get our original item plus an additional attribute.
                    expect(ptDemographics).toEqual(jasmine.objectContaining({
                        stampTime: jasmine.any(String)
                    }));
                    expect(environment.jds.saveSyncStatus.calls.length).toEqual(1);
                    expect(environment.jds.saveSyncStatus).toHaveBeenCalledWith(jasmine.objectContaining(metastamp), jasmine.objectContaining({value: demographicsDod.pid}), jasmine.any(Function));
	                expect(environment.jds.storePatientData.calls.length).toEqual(1);
                    expect(environment.jds.storePatientData).toHaveBeenCalledWith(jasmine.objectContaining(demographicsDod), jasmine.any(Function));
                    expect(environment.jds.storePatientData).toHaveBeenCalledWith(jasmine.objectContaining({
                        stampTime: jasmine.any(String)
                    }), jasmine.any(Function));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('Missing pid', function() {
			var finished = false;
			var vistaClient = {
				getDemographics: function(vistaId, dfn, callback) {
					return callback(null, demographicsFromVista);
				}
			};
			var environment = createEnvironment(vistaClient, config);
			var expectedJdsError = null;
			var expectedJdsResponse = {
				statusCode: 201
			};
			var expectedJdsResult = null;
			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			runs(function() {
				ptDemographicsUtil.storeDemographicsInJdsUsingBasisDemographics(null, demographicsFromVista, function(error, ptDemographics) {
					expect(error).toEqual('FailedNoPid');
					expect(ptDemographics).toBeNull();
                    expect(environment.jds.saveSyncStatus.calls.length).toEqual(0);
					expect(environment.jds.storePatientData.calls.length).toEqual(0);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('Missing ptDemographicsBasis', function() {
			var finished = false;
			var vistaClient = {
				getDemographics: function(vistaId, dfn, callback) {
					return callback(null, demographicsFromVista);
				}
			};
			var environment = createEnvironment(vistaClient, config);
			var expectedJdsError = null;
			var expectedJdsResponse = {
				statusCode: 201
			};
			var expectedJdsResult = null;
			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			runs(function() {
				ptDemographicsUtil.storeDemographicsInJdsUsingBasisDemographics(pidDod, null, function(error, ptDemographics) {
					expect(error).toEqual('FailedNoPtDemographicsBasis');
					expect(ptDemographics).toBeNull();
                    expect(environment.jds.saveSyncStatus.calls.length).toEqual(0);
					expect(environment.jds.storePatientData.calls.length).toEqual(0);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('PID not secondary site.', function() {
			var finished = false;
			var vistaClient = {
				getDemographics: function(vistaId, dfn, callback) {
					return callback(null, demographicsFromVista);
				}
			};
			var environment = createEnvironment(vistaClient, config);
			var expectedJdsError = null;
			var expectedJdsResponse = {
				statusCode: 201
			};
			var expectedJdsResult = null;
			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			runs(function() {
				ptDemographicsUtil.storeDemographicsInJdsUsingBasisDemographics('9E7A;3', demographicsFromVista, function(error, ptDemographics) {
					expect(error).toEqual('FailedPidNotSecondarySite');
					expect(ptDemographics).toBeNull();
                    expect(environment.jds.saveSyncStatus.calls.length).toEqual(0);
					expect(environment.jds.storePatientData.calls.length).toEqual(0);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('PID secondary site - but not valid format.', function() {
			var finished = false;
			var vistaClient = {
				getDemographics: function(vistaId, dfn, callback) {
					return callback(null, demographicsFromVista);
				}
			};
			var environment = createEnvironment(vistaClient, config);
			var expectedJdsError = null;
			var expectedJdsResponse = {
				statusCode: 201
			};
			var expectedJdsResult = null;
			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			runs(function() {
				ptDemographicsUtil.storeDemographicsInJdsUsingBasisDemographics('DOD;', demographicsFromVista, function(error, ptDemographics) {
					expect(error).toEqual('FailedPidNotSecondarySite');
					expect(ptDemographics).toBeNull();
                    expect(environment.jds.saveSyncStatus.calls.length).toEqual(0);
					expect(environment.jds.storePatientData.calls.length).toEqual(0);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
        it('Store metastamp failed with JDS returning error.', function() {
            var finished = false;
            var vistaClient = {
                getDemographics: function(vistaId, dfn, callback) {
                    return callback(null, demographicsFromVista);
                }
            };
            var environment = createEnvironment(vistaClient, config);
            var expectedJdsError = 'SomeError';
            var expectedJdsResponse = {
                statusCode: 500
            };
            var expectedJdsResult = null;
            var record = {
                'data': {
                    'items': [demographicsDod]
                }
            };
            var metastamp = metastampUtil.metastampDomain(record, demographicsDod.stampTime,'');

            environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

            var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
            runs(function() {
                ptDemographicsUtil.storeDemographicsInJdsUsingBasisDemographics(pidDod, demographicsFromVista, function(error, ptDemographics) {
                    expect(error).toEqual('FailedJdsError');
                    expect(ptDemographics).toBeNull();
                    expect(environment.jds.saveSyncStatus.calls.length).toEqual(1);
                    expect(environment.jds.saveSyncStatus).toHaveBeenCalledWith(jasmine.objectContaining(metastamp), jasmine.objectContaining({value: demographicsDod.pid}), jasmine.any(Function));
                    expect(environment.jds.storePatientData.calls.length).toEqual(0);
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            });
        });
		it('Store failed with JDS returning error.', function() {
			var finished = false;
			var vistaClient = {
				getDemographics: function(vistaId, dfn, callback) {
					return callback(null, demographicsFromVista);
				}
			};
			var environment = createEnvironment(vistaClient, config);
            var expectedJdsError = [null, 'SomeError'];
            var expectedJdsResponse = [{
                statusCode: 200
            }, {
                statusCode: 201
            }];
            var expectedJdsResult = [null, null];
            var record = {
                'data': {
                    'items': [demographicsDod]
                }
            };
            var metastamp = metastampUtil.metastampDomain(record, demographicsDod.stampTime,'');

			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			runs(function() {
				ptDemographicsUtil.storeDemographicsInJdsUsingBasisDemographics(pidDod, demographicsFromVista, function(error, ptDemographics) {
					expect(error).toEqual('FailedJdsError');
					expect(ptDemographics).toBeNull();
                    expect(environment.jds.saveSyncStatus.calls.length).toEqual(1);
                    expect(environment.jds.saveSyncStatus).toHaveBeenCalledWith(jasmine.objectContaining(metastamp), jasmine.objectContaining({value: demographicsDod.pid}), jasmine.any(Function));
	                expect(environment.jds.storePatientData.calls.length).toEqual(1);
                    expect(environment.jds.storePatientData).toHaveBeenCalledWith(jasmine.objectContaining(demographicsDod), jasmine.any(Function));
                    expect(environment.jds.storePatientData).toHaveBeenCalledWith(jasmine.objectContaining({
                        stampTime: jasmine.any(String)
                    }), jasmine.any(Function));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
        it('Store metastamp failed with JDS returning no response.', function() {
            var finished = false;
            var vistaClient = {
                getDemographics: function(vistaId, dfn, callback) {
                    return callback(null, demographicsFromVista);
                }
            };
            var environment = createEnvironment(vistaClient, config);
            var expectedJdsError = null;
            var expectedJdsResponse = null;
            var expectedJdsResult = null;
            var record = {
                'data': {
                    'items': [demographicsDod]
                }
            };
            var metastamp = metastampUtil.metastampDomain(record, demographicsDod.stampTime,'');

            environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

            var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
            runs(function() {
                ptDemographicsUtil.storeDemographicsInJdsUsingBasisDemographics(pidDod, demographicsFromVista, function(error, ptDemographics) {
                    expect(error).toEqual('FailedJdsNoResponse');
                    expect(ptDemographics).toBeNull();
                    expect(environment.jds.saveSyncStatus.calls.length).toEqual(1);
                    expect(environment.jds.storePatientData.calls.length).toEqual(0);
                    expect(environment.jds.saveSyncStatus).toHaveBeenCalledWith(jasmine.objectContaining(metastamp), jasmine.objectContaining({value: demographicsDod.pid}), jasmine.any(Function));
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            });
        });
		it('Store failed with JDS returning no response.', function() {
			var finished = false;
			var vistaClient = {
				getDemographics: function(vistaId, dfn, callback) {
					return callback(null, demographicsFromVista);
				}
			};
			var environment = createEnvironment(vistaClient, config);
			var expectedJdsError = [null, null];
            var expectedJdsResponse = [{
                statusCode: 200
            }, null];
            var expectedJdsResult = [null, null];
            var record = {
                'data': {
                    'items': [demographicsDod]
                }
            };
            var metastamp = metastampUtil.metastampDomain(record, demographicsDod.stampTime,'');

			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			runs(function() {
				ptDemographicsUtil.storeDemographicsInJdsUsingBasisDemographics(pidDod, demographicsFromVista, function(error, ptDemographics) {
					expect(error).toEqual('FailedJdsNoResponse');
					expect(ptDemographics).toBeNull();
                    expect(environment.jds.saveSyncStatus.calls.length).toEqual(1);
                    expect(environment.jds.saveSyncStatus).toHaveBeenCalledWith(jasmine.objectContaining(metastamp), jasmine.objectContaining({value: demographicsDod.pid}), jasmine.any(Function));
	                expect(environment.jds.storePatientData.calls.length).toEqual(1);
                    expect(environment.jds.storePatientData).toHaveBeenCalledWith(jasmine.objectContaining(demographicsDod), jasmine.any(Function));
                    expect(environment.jds.storePatientData).toHaveBeenCalledWith(jasmine.objectContaining({
                        stampTime: jasmine.any(String)
                    }), jasmine.any(Function));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
        it('Store metastamp failed with JDS returning incorrect response status code.', function() {
            var finished = false;
            var vistaClient = {
                getDemographics: function(vistaId, dfn, callback) {
                    return callback(null, demographicsFromVista);
                }
            };
            var environment = createEnvironment(vistaClient, config);
            var expectedJdsError = null;
            var expectedJdsResponse = {
                statusCode: 500
            };
            var expectedJdsResult = null;
            var record = {
                'data': {
                    'items': [demographicsDod]
                }
            };
            var metastamp = metastampUtil.metastampDomain(record, demographicsDod.stampTime,'');

            environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

            var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
            runs(function() {
                ptDemographicsUtil.storeDemographicsInJdsUsingBasisDemographics(pidDod, demographicsFromVista, function(error, ptDemographics) {
                    expect(error).toEqual('FailedJdsWrongStatusCode');
                    expect(ptDemographics).toBeNull();
                    expect(environment.jds.saveSyncStatus.calls.length).toEqual(1);
                    expect(environment.jds.saveSyncStatus).toHaveBeenCalledWith(jasmine.objectContaining(metastamp), jasmine.objectContaining({value: demographicsDod.pid}), jasmine.any(Function));
                    expect(environment.jds.storePatientData.calls.length).toEqual(0);
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            });
        });
		it('Store failed with JDS returning incorrect response status code.', function() {
			var finished = false;
			var vistaClient = {
				getDemographics: function(vistaId, dfn, callback) {
					return callback(null, demographicsFromVista);
				}
			};
			var environment = createEnvironment(vistaClient, config);
            var expectedJdsError = [null, null];
            var expectedJdsResponse = [{
                statusCode: 200
            }, {
				statusCode: 404
            }];
            var expectedJdsResult = [null, null];
            var record = {
                'data': {
                    'items': [demographicsDod]
                }
            };
            var metastamp = metastampUtil.metastampDomain(record, demographicsDod.stampTime,'');

			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			runs(function() {
				ptDemographicsUtil.storeDemographicsInJdsUsingBasisDemographics(pidDod, demographicsFromVista, function(error, ptDemographics) {
					expect(error).toEqual('FailedJdsWrongStatusCode');
					expect(ptDemographics).toBeNull();
                    expect(environment.jds.saveSyncStatus.calls.length).toEqual(1);
                    expect(environment.jds.saveSyncStatus).toHaveBeenCalledWith(jasmine.objectContaining(metastamp), jasmine.objectContaining({value: demographicsDod.pid}), jasmine.any(Function));
                    expect(environment.jds.storePatientData.calls.length).toEqual(1);
                    expect(environment.jds.storePatientData).toHaveBeenCalledWith(jasmine.objectContaining(demographicsDod), jasmine.any(Function));
                    expect(environment.jds.storePatientData).toHaveBeenCalledWith(jasmine.objectContaining({
                        stampTime: jasmine.any(String)
                    }), jasmine.any(Function));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
	});
	describe('retrieveOrCreateDemographicsForSecondaryOrVistaHdrPid()', function() {
		it('Found demographics in JDS', function() {
			var finished = false;
			var vistaClient = {};
			var environment = createEnvironment(vistaClient, config);
			var expectedJdsError = null;
			var expectedJdsResponse = {
				statusCode: 200
			};
			var expectedJdsResult = [{
				data: {
					items: [demographicsDod]
				}
			}];
			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			runs(function() {
				ptDemographicsUtil.retrieveOrCreateDemographicsForSecondaryOrVistaHdrPid(pidDod, demographicsFromVista, function(error, ptDemographics) {
					expect(error).toBeFalsy();
					expect(ptDemographics).toBeTruthy();
					expect(ptDemographics).toEqual(jasmine.objectContaining(demographicsDod));
					expect(environment.jds.getPtDemographicsByPid.calls.length).toEqual(1);
					expect(environment.jds.getPtDemographicsByPid).toHaveBeenCalledWith(pidDod, jasmine.any(Function));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('Found demographics in JDS (HDR configured as secondary)', function() {
			var finished = false;
			var vistaClient = {};
			var environment = createEnvironment(vistaClient, config);
			var expectedJdsError = null;
			var expectedJdsResponse = {
				statusCode: 200
			};
			var expectedJdsResult = [{
				data: {
					items: [demographicsHdrSecondary]
				}
			}];
			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			runs(function() {
				ptDemographicsUtil.retrieveOrCreateDemographicsForSecondaryOrVistaHdrPid(pidHdrSecondary, demographicsFromVista, function(error, ptDemographics) {
					expect(error).toBeFalsy();
					expect(ptDemographics).toBeTruthy();
					expect(ptDemographics).toEqual(jasmine.objectContaining(demographicsHdrSecondary));
					expect(environment.jds.getPtDemographicsByPid.calls.length).toEqual(1);
					expect(environment.jds.getPtDemographicsByPid).toHaveBeenCalledWith(pidHdrSecondary, jasmine.any(Function));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('Found demographics in JDS (HDR configured as PUB/SUB)', function() {
			var finished = false;
			var vistaClient = {};
			var environment = createEnvironment(vistaClient, vistaHdrConfig);
			var expectedJdsError = null;
			var expectedJdsResponse = {
				statusCode: 200
			};
			var expectedJdsResult = [{
				data: {
					items: [demographicsVistaHdr]
				}
			}];
			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

			var ptDemographicsUtil = new PtDemographicsUtil(log, vistaHdrConfig, environment);
			runs(function() {
				ptDemographicsUtil.retrieveOrCreateDemographicsForSecondaryOrVistaHdrPid(pidVistaHdr, demographicsFromVista, function(error, ptDemographics) {
					expect(error).toBeFalsy();
					expect(ptDemographics).toBeTruthy();
					expect(ptDemographics).toEqual(jasmine.objectContaining(demographicsVistaHdr));
					expect(environment.jds.getPtDemographicsByPid.calls.length).toEqual(1);
					expect(environment.jds.getPtDemographicsByPid).toHaveBeenCalledWith(pidVistaHdr, jasmine.any(Function));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('Did not find demographics in JDS', function() {
			var finished = false;
			var vistaClient = {};
			var environment = createEnvironment(vistaClient, config);
			var expectedJdsError = [null, null, null];
			var expectedJdsResponse = [{
				statusCode: 404
			}, {
                statusCode: 200
            }, {
				statusCode: 201
			}];
			var expectedJdsResult = [null, null, null];
            var record = {
                'data': {
                    'items': [demographicsDod]
                }
            };
            var metastamp = metastampUtil.metastampDomain(record, demographicsDod.stampTime,'');

			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			runs(function() {
				ptDemographicsUtil.retrieveOrCreateDemographicsForSecondaryOrVistaHdrPid(pidDod, demographicsFromVista, function(error, ptDemographics) {
					expect(error).toBeFalsy();
					expect(ptDemographics).toBeTruthy();
					expect(ptDemographics).toEqual(jasmine.objectContaining(demographicsDod)); // toEqual because we should get our original item plus an additional attribute.
					expect(ptDemographics.stampTime).toBeTruthy();
					expect(environment.jds.getPtDemographicsByPid.calls.length).toEqual(1);
					expect(environment.jds.getPtDemographicsByPid).toHaveBeenCalledWith(pidDod, jasmine.any(Function));
                    expect(environment.jds.saveSyncStatus.calls.length).toEqual(1);
                    expect(environment.jds.saveSyncStatus).toHaveBeenCalledWith(jasmine.objectContaining(metastamp), jasmine.objectContaining({value: demographicsDod.pid}), jasmine.any(Function));
					expect(environment.jds.storePatientData.calls.length).toEqual(1);
					expect(environment.jds.storePatientData).toHaveBeenCalledWith(jasmine.objectContaining(demographicsDod), jasmine.any(Function));
					expect(environment.jds.storePatientData).toHaveBeenCalledWith(jasmine.objectContaining({
						stampTime: jasmine.any(String)
					}), jasmine.any(Function));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('Did not find demographics in JDS (HDR configured as secondary)', function() {
			var finished = false;
			var vistaClient = {};
			var environment = createEnvironment(vistaClient, config);
			var expectedJdsError = [null, null, null];
			var expectedJdsResponse = [{
				statusCode: 404
			}, {
                statusCode: 200
            }, {
				statusCode: 201
			}];
			var expectedJdsResult = [null, null, null];
            var record = {
                'data': {
                    'items': [demographicsHdrSecondary]
                }
            };
            var metastamp = metastampUtil.metastampDomain(record, demographicsHdrSecondary.stampTime,'');

			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			runs(function() {
				ptDemographicsUtil.retrieveOrCreateDemographicsForSecondaryOrVistaHdrPid(pidHdrSecondary, demographicsFromVista, function(error, ptDemographics) {
					expect(error).toBeFalsy();
					expect(ptDemographics).toBeTruthy();
					expect(ptDemographics).toEqual(jasmine.objectContaining(demographicsHdrSecondary)); // toEqual because we should get our original item plus an additional attribute.
					expect(ptDemographics.stampTime).toBeTruthy();
					expect(environment.jds.getPtDemographicsByPid.calls.length).toEqual(1);
					expect(environment.jds.getPtDemographicsByPid).toHaveBeenCalledWith(pidHdrSecondary, jasmine.any(Function));
                    expect(environment.jds.saveSyncStatus.calls.length).toEqual(1);
                    expect(environment.jds.saveSyncStatus).toHaveBeenCalledWith(jasmine.objectContaining(metastamp), jasmine.objectContaining({value: demographicsHdrSecondary.pid}), jasmine.any(Function));
					expect(environment.jds.storePatientData.calls.length).toEqual(1);
					expect(environment.jds.storePatientData).toHaveBeenCalledWith(jasmine.objectContaining(demographicsHdrSecondary), jasmine.any(Function));
					expect(environment.jds.storePatientData).toHaveBeenCalledWith(jasmine.objectContaining({
						stampTime: jasmine.any(String)
					}), jasmine.any(Function));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('Did not find demographics in JDS (HDR configured as PUB/SUB)', function() {
			var finished = false;
			var vistaClient = {};
			var environment = createEnvironment(vistaClient, vistaHdrConfig);
            var expectedJdsError = [null, null, null];
			var expectedJdsResponse = [{
				statusCode: 404
			}, {
                statusCode: 200
            }, {
				statusCode: 201
			}];
			var expectedJdsResult = [null, null, null];
            var record = {
                'data': {
                    'items': [demographicsVistaHdr]
                }
            };
            var metastamp = metastampUtil.metastampDomain(record, demographicsVistaHdr.stampTime,'');

			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

			var ptDemographicsUtil = new PtDemographicsUtil(log, vistaHdrConfig, environment);
			runs(function() {
				ptDemographicsUtil.retrieveOrCreateDemographicsForSecondaryOrVistaHdrPid(pidVistaHdr, demographicsFromVista, function(error, ptDemographics) {
					expect(error).toBeFalsy();
					expect(ptDemographics).toBeTruthy();
					expect(ptDemographics).toEqual(jasmine.objectContaining(demographicsVistaHdr)); // toEqual because we should get our original item plus an additional attribute.
					expect(ptDemographics.stampTime).toBeTruthy();
	                expect(environment.jds.getPtDemographicsByPid.calls.length).toEqual(1);
                    expect(environment.jds.getPtDemographicsByPid).toHaveBeenCalledWith(pidVistaHdr, jasmine.any(Function));
                    expect(environment.jds.saveSyncStatus.calls.length).toEqual(1);
                    expect(environment.jds.saveSyncStatus).toHaveBeenCalledWith(jasmine.objectContaining(metastamp), jasmine.objectContaining({value: demographicsVistaHdr.pid}), jasmine.any(Function));
                    expect(environment.jds.storePatientData.calls.length).toEqual(1);
                    expect(environment.jds.storePatientData).toHaveBeenCalledWith(jasmine.objectContaining(demographicsVistaHdr), jasmine.any(Function));
                    expect(environment.jds.storePatientData).toHaveBeenCalledWith(jasmine.objectContaining({
                        stampTime: jasmine.any(String)
                    }), jasmine.any(Function));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
		it('Pid was not for a secondary site.', function() {
			var finished = false;
			var vistaClient = {};
			var environment = createEnvironment(vistaClient, config);
			var expectedJdsError = [null, null];
			var expectedJdsResponse = [{
				statusCode: 404
			}, {
				statusCode: 201
			}];
			var expectedJdsResult = [null, null];
			environment.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

			var ptDemographicsUtil = new PtDemographicsUtil(log, config, environment);
			runs(function() {
				ptDemographicsUtil.retrieveOrCreateDemographicsForSecondaryOrVistaHdrPid('9E7A;111', demographicsFromVista, function(error, ptDemographics) {
					expect(error).toEqual('FailedPidNotSecondarySite');
					expect(ptDemographics).toBeNull();
					expect(environment.jds.getPtDemographicsByPid.calls.length).toEqual(0);
					expect(environment.jds.storePatientData.calls.length).toEqual(0);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			});
		});
	});

	describe('_morphToSecondaryDemographics()', function() {
		it('Happy Path', function() {
			var primaryDemographics = {
				'pid': '9E7A;3',
				'birthDate': '19350407',
				'last4': '0008',
				'last5': 'E0008',
				'icn': '10108V420871',
				'familyName': 'EIGHT',
				'givenNames': 'PATIENT',
				'fullName': 'EIGHT,PATIENT',
				'displayName': 'Eight,Patient',
				'genderCode': 'urn:va:pat-gender:M',
				'genderName': 'Male',
				'sensitive': false,
				'uid': 'urn:va:patient:9E7A:3:3',
				'summary': 'Eight,Patient',
				'ssn': '666000008',
				'localId': '3',
				'shortInpatientLocation': 'shortInpatientLocation',
				'roomBed': 'roomBed',
				'inpatientLocation': 'inpatientLocation',
				'admissionUid': 'admissionUid',
				'cwadf': 'cwadf'
			};

			var secondaryDemographics = PtDemographicsUtil._morphToSecondaryDemographics(primaryDemographics);
			expect(secondaryDemographics.shortInpatientLocation).toBeUndefined();
			expect(secondaryDemographics.roomBed).toBeUndefined();
			expect(secondaryDemographics.inpatientLocation).toBeUndefined();
			expect(secondaryDemographics.admissionUid).toBeUndefined();
			expect(secondaryDemographics.cwadf).toBeUndefined();
		});
	});

});