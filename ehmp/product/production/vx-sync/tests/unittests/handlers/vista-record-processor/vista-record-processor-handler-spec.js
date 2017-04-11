'use strict';

require('../../../../env-setup');

var _ = require('underscore');
var handle = require(global.VX_HANDLERS + 'vista-record-processor/vista-record-processor-handler');
var errorUtil = require(global.VX_UTILS + 'error');
var log = require(global.VX_DUMMIES + 'dummy-logger');
var jobUtil = require(global.VX_UTILS + 'job-utils');
var PublisherRouterDummy = require(global.VX_DUMMIES + 'publisherRouterDummy');
var PublisherDummy = require(global.VX_DUMMIES + 'publisherDummy');
var PatIdCompareUtil = require(global.VX_DUMMIES + 'patient-id-comparator-dummy');
var metricsDummyLogger = require(global.VX_DUMMIES + 'dummy-logger');
var dummyLogger = require(global.VX_DUMMIES + 'dummy-logger');

// MAKE SURE YOU COMMENT OUT THE FOLLOWING BEFORE CHECKING IN
//------------------------------------------------------------
// // var logConfig = require('./worker-config');
// var logConfig = {
//     'loggers': [{
//         'name': 'root',
//         'streams': [{
//             'stream': process.stdout,
//             'level': 'debug'
//         }]
//     }],
// };
// var logUtil = require(global.VX_UTILS + 'log');
// logUtil.initialize(logConfig.loggers);
// var dummyLogger = logUtil.get('VistaRecordProcessor-spec', 'host');
// End of code to comment out.

var JobStatusUpdater = require(global.VX_SUBSYSTEMS + 'jds/JobStatusUpdater');
var JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');


var rootJob = {
	rootJobId: 1
};

var lastUpdateTimeValue = '3150106-1624';
var vistaIdValue = 'C877';

var syncStartJobsValue = [{
	collection: 'syncStart',
	pid: vistaIdValue + ';1',
	metaStamp: {
		stampTime: '20150114115126',
		sourceMetaStamp: {
			'C877': {
				pid: vistaIdValue + ';1',
				localId: '1',
				stampTime: '20150114115126',
				domainMetaStamp: {
					'allergy': {
						domain: 'allergy',
						stampTime: '20150114115126',
						eventMetaStamp: {
							'urn:va:allergy:C877:1:751': {
								stampTime: '20150114115126'
							},
							'urn:va:allergy:C877:1:752': {
								stampTime: '20150114115126'
							}
						}
					}
				}
			}
		}
	}
}, {
	collection: 'syncStart',
	pid: vistaIdValue + ';2',
	metaStamp: {
		stampTime: '20150114115126',
		sourceMetaStamp: {
			'C877': {
				pid: vistaIdValue + ';2',
				localId: '1',
				stampTime: '20150114115126',
				domainMetaStamp: {
					'allergy': {
						domain: 'allergy',
						stampTime: '20150114115126',
						eventMetaStamp: {
							'urn:va:allergy:C877:2:300': {
								stampTime: '20150114115126'
							},
							'urn:va:allergy:C877:2:301': {
								stampTime: '20150114115126'
							}
						}
					}
				}
			}
		}
	}
}];

var vistaDataJobAllergyObjectWithoutPid = {
	uid: 'urn:va:allergy:9E7A:1:27837'
};

var vistaDataJobsValue = [{
	collection: 'allergy',
	pid: vistaIdValue + ';1',
	object: vistaDataJobAllergyObjectWithoutPid
}, {
	collection: 'pt-select',
	pid: vistaIdValue + ';2',
	object: {
		pid: vistaIdValue + ';2'
	}
}, {
	collection: 'doc-ref',
	object: {
		data: 'some operational data'
	}
}];

var dataValue = {
	lastUpdate: lastUpdateTimeValue,
	items: []
};
dataValue.items = syncStartJobsValue.concat(vistaDataJobsValue);


function getConfig() {
	return {
		jds: {
			protocol: 'http',
			host: 'IP_ADDRESS',
			port: 9080
		},
		'hmp.batch.size': 1000,
		hdr: {
			hdrSites: {
				'84F0': {
					stationNumber: 578
				}
			},
			pubsubConfig: {
				maxBatchSize: 500
			}
		}
	};
}

function getEnv(config) {
	var jdsClientDummy = new JdsClientDummy(dummyLogger, config);
	var publisherRouterDummy = new PublisherRouterDummy(dummyLogger, config, PublisherDummy);
	var environment = {
		jobStatusUpdater: {},
		metrics: metricsDummyLogger,
		patientIdComparator: PatIdCompareUtil.detectAndResync,
		publisherRouter: publisherRouterDummy,
		jds: jdsClientDummy
	};
	environment.jobStatusUpdater = new JobStatusUpdater(dummyLogger, config, environment.jds);

	return environment;
}



describe('vista-record-processor-handler.js', function() {
	// var job;
	// var rootJob;
	// var config;
	// var environment;
	// var callback;
	// var patientIdentifier;

	describe('handle()', function() {
		it('verify missing job is rejected', function() {
			var config = getConfig();
			var environment = getEnv(config);
			var called = false;
			var calledError;
			var calledResult;

			handle(log, config, environment, null, function(error, result) {
				calledError = error;
				calledResult = result;
				called = true;
			});

			waitsFor(function() {
				return called;
			}, 'should be called', 100);

			runs(function() {
				expect(errorUtil.isFatal(calledError)).toBe(true);
				expect(_.isObject(calledError)).toBe(true);
				if (_.isObject(calledError)) {
					expect(calledError.message).toBe('No job given to handle');
				}
			});
		});
		it('verify invalid job type is rejected', function() {
			var config = getConfig();
			var environment = getEnv(config);
			var called = false;
			var calledError;
			var calledResult;

			var job = {
				type: jobUtil.hdrSyncRequestType()
			};
			handle(log, config, environment, job, function(error, result) {
				calledError = error;
				calledResult = result;
				called = true;
			});

			waitsFor(function() {
				return called;
			}, 'should be called', 100);

			runs(function() {
				expect(errorUtil.isFatal(calledError)).toBe(true);
				expect(_.isObject(calledError)).toBe(true);
				if (_.isObject(calledError)) {
					expect(calledError.message).toBe('Incorrect job type');
				}
			});
		});
		it('verify invalid job format (no record) is rejected', function() {
			var config = getConfig();
			var environment = getEnv(config);
			var called = false;
			var calledError;
			var calledResult;

			var job = jobUtil.createVistaRecordProcessorRequest(null, rootJob);
			handle(log, config, environment, job, function(error, result) {
				calledError = error;
				calledResult = result;
				called = true;
			});

			waitsFor(function() {
				return called;
			}, 'should be called', 100);

			runs(function() {
				expect(errorUtil.isFatal(calledError)).toBe(true);
				expect(_.isObject(calledError)).toBe(true);
				if (_.isObject(calledError)) {
					expect(calledError.message).toBe('Invalid job');
				}
			});
		});
		it('verify valid job processed', function() {
			var config = getConfig();
			var environment = getEnv(config);
			var called = false;
			var calledError;
			var calledResult;

			var job = jobUtil.createVistaRecordProcessorRequest(dataValue, rootJob);
			handle(log, config, environment, job, function(error, result) {
				calledError = error;
				calledResult = result;
				called = true;
			});

			waitsFor(function() {
				return called;
			}, 'should be called', 100);

			runs(function() {
				expect(errorUtil.isFatal(calledError)).toBe(false);
				expect(calledError).toBeNull();
				expect(calledResult).toBeNull();
			});
		});

	});
});