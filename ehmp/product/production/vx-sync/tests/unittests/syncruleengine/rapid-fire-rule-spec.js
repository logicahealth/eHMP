'use strict';

require('../../../env-setup');
const SyncRulesEngine = require(global.VX_SYNCRULES + '/rules-engine');
const JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');

let log = require(global.VX_DUMMIES + 'dummy-logger');
// log = require('bunyan').createLogger({
//     name: 'rapid-fire-rule-spec',
//     level: 'debug'
// });

const config = {
	rules: {
		'rapid-fire': {}
	}
};

const mockPatientIds = [{
	type: 'pid',
	value: 'SITE;3'
}, {
	type: 'pid',
	value: 'SITE;3'
}, {
	type: 'pid',
	value: 'DOD;0000000003'
}, {
	type: 'pid',
	value: 'HDR;10108V420871'
}, {
	type: 'pid',
	value: 'VLER;10108V420871'
}];

function getSimpleStatus() {
	return {
		'icn': '10108V420871',
		'latestEnterpriseSyncRequestTimestamp': 1503325896024,
		'latestJobTimestamp': 1503325910479,
		'latestSourceStampTime': 20170821103136,
		'sites': {
			'SITE': {
				'latestJobTimestamp': 1503325896024,
				'pid': 'SITE;3',
				'solrSyncCompleted': true,
				'sourceStampTime': 20170821101553,
				'syncCompleted': true
			},
			'SITE': {
				'latestJobTimestamp': 1503325896024,
				'pid': 'SITE;3',
				'solrSyncCompleted': true,
				'sourceStampTime': 20170821101553,
				'syncCompleted': true
			},
			'DOD': {
				'latestJobTimestamp': 1503325910479,
				'pid': 'DOD;0000000003',
				'solrSyncCompleted': true,
				'sourceStampTime': 20170821103135,
				'syncCompleted': true
			},
			'HDR': {
				'latestJobTimestamp': 1503325896928,
				'pid': 'HDR;10108V420871',
				'solrSyncCompleted': true,
				'sourceStampTime': 20170821103135,
				'syncCompleted': true
			},
			'VLER': {
				'latestJobTimestamp': 1503325897071,
				'pid': 'VLER;10108V420871',
				'solrSyncCompleted': true,
				'sourceStampTime': 20170821103136,
				'syncCompleted': true
			}
		},
		'solrSyncCompleted': true,
		'syncCompleted': true
	};
}

describe('rapid-fire-rule', function() {
	it('Error path: jds returns error', function(done) {
		let jdsClientDummy = new JdsClientDummy(log, config);
		jdsClientDummy._setResponseData(['Error'], null, null);
		let environment = {
			jds: jdsClientDummy,
			metrics: log
		};
		let engine = new SyncRulesEngine(log, config, environment);
		runs(function() {
			engine.getSyncPatientIdentifiers(mockPatientIds, [], function(err, result) {
				expect(err).toBeTruthy();
				expect((result || []).length).toEqual(0);
				done();
			});
		});
	});
	it('jds returns 404 - patient not synced?', function(done) {
		let jdsClientDummy = new JdsClientDummy(log, config);
		jdsClientDummy._setResponseData(null, {
			statusCode: 404
		}, 'JPID not found');
		let environment = {
			jds: jdsClientDummy,
			metrics: log
		};
		let engine = new SyncRulesEngine(log, config, environment);
		runs(function() {
			engine.getSyncPatientIdentifiers(mockPatientIds, [], function(err, result) {
				expect(err).toBeFalsy();
				expect((result || []).length).toEqual(5);
				done();
			});
		});
	});
	it('all sites complete', function(done) {
		let jdsClientDummy = new JdsClientDummy(log, config);
		jdsClientDummy._setResponseData(null, {statusCode: 200}, getSimpleStatus());
		let environment = {
			jds: jdsClientDummy,
			metrics: log
		};
		let engine = new SyncRulesEngine(log, config, environment);
		runs(function() {
			engine.getSyncPatientIdentifiers(mockPatientIds, [], function(err, result) {
				expect(err).toBeFalsy();
				expect((result || []).length).toEqual(5);
				done();
			});
		});
	});
	it('first sync for this patient - no latestSourceStampTime', function(done) {
		let simpleStatus = getSimpleStatus();
		simpleStatus.sites['SITE'].syncCompleted = false;
		simpleStatus.sites['SITE'].syncCompleted = false;
		simpleStatus.sites['DOD'].syncCompleted = false;
		simpleStatus.sites['HDR'].syncCompleted = false;
		simpleStatus.sites['VLER'].syncCompleted = false;
		delete simpleStatus.latestSourceStampTime;

		let jdsClientDummy = new JdsClientDummy(log, config);
		jdsClientDummy._setResponseData(null, {statusCode: 200}, simpleStatus);
		let environment = {
			jds: jdsClientDummy,
			metrics: log
		};
		let engine = new SyncRulesEngine(log, config, environment);
		runs(function() {
			engine.getSyncPatientIdentifiers(mockPatientIds, [], function(err, result) {
				expect(err).toBeFalsy();
				expect((result || []).length).toEqual(5);
				done();
			});
		});
	});
	it('all sites incomplete', function(done) {
		let simpleStatus = getSimpleStatus();
		simpleStatus.sites['SITE'].syncCompleted = false;
		simpleStatus.sites['SITE'].syncCompleted = false;
		simpleStatus.sites['DOD'].syncCompleted = false;
		simpleStatus.sites['HDR'].syncCompleted = false;
		simpleStatus.sites['VLER'].syncCompleted = false;

		let jdsClientDummy = new JdsClientDummy(log, config);
		jdsClientDummy._setResponseData(null, {statusCode: 200}, simpleStatus);
		let environment = {
			jds: jdsClientDummy,
			metrics: log
		};
		let engine = new SyncRulesEngine(log, config, environment);
		runs(function() {
			engine.getSyncPatientIdentifiers(mockPatientIds, [], function(err, result) {
				expect(err).toBeFalsy();
				expect((result || []).length).toEqual(0);
				done();
			});
		});
	});
	it('all sites in error', function(done) {
		let simpleStatus = getSimpleStatus();
		simpleStatus.sites['SITE'].syncCompleted = false;
		simpleStatus.sites['SITE'].syncCompleted = false;
		simpleStatus.sites['DOD'].syncCompleted = false;
		simpleStatus.sites['HDR'].syncCompleted = false;
		simpleStatus.sites['VLER'].syncCompleted = false;

		simpleStatus.sites['SITE'].hasError = true;
		simpleStatus.sites['SITE'].hasError = true;
		simpleStatus.sites['DOD'].hasError = true;
		simpleStatus.sites['HDR'].hasError = true;
		simpleStatus.sites['VLER'].hasError = true;

		let jdsClientDummy = new JdsClientDummy(log, config);
		jdsClientDummy._setResponseData(null, {statusCode: 200}, simpleStatus);
		let environment = {
			jds: jdsClientDummy,
			metrics: log
		};
		let engine = new SyncRulesEngine(log, config, environment);
		runs(function() {
			engine.getSyncPatientIdentifiers(mockPatientIds, [], function(err, result) {
				expect(err).toBeFalsy();
				expect((result || []).length).toEqual(5);
				done();
			});
		});
	});
	it('some sites incomplete', function(done) {
		let simpleStatus = getSimpleStatus();
		simpleStatus.sites['SITE'].syncCompleted = false;
		simpleStatus.sites['DOD'].syncCompleted = false;
		simpleStatus.sites['VLER'].syncCompleted = false;

		let jdsClientDummy = new JdsClientDummy(log, config);
		jdsClientDummy._setResponseData(null, {statusCode: 200}, simpleStatus);
		let environment = {
			jds: jdsClientDummy,
			metrics: log
		};
		let engine = new SyncRulesEngine(log, config, environment);
		runs(function() {
			engine.getSyncPatientIdentifiers(mockPatientIds, [], function(err, result) {
				expect(err).toBeFalsy();
				expect((result || []).length).toEqual(2);
				done();
			});
		});
	});
	it('some sites in error - the rest are complete', function(done) {
		let simpleStatus = getSimpleStatus();
		simpleStatus.sites['SITE'].hasError = true;
		simpleStatus.sites['DOD'].hasError = true;
		simpleStatus.sites['VLER'].hasError = true;

		let jdsClientDummy = new JdsClientDummy(log, config);
		jdsClientDummy._setResponseData(null, {statusCode: 200}, simpleStatus);
		let environment = {
			jds: jdsClientDummy,
			metrics: log
		};
		let engine = new SyncRulesEngine(log, config, environment);
		runs(function() {
			engine.getSyncPatientIdentifiers(mockPatientIds, [], function(err, result) {
				expect(err).toBeFalsy();
				expect((result || []).length).toEqual(5);
				done();
			});
		});
	});
});