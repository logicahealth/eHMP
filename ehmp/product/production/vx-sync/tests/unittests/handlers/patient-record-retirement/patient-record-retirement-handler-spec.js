'use strict';

require('../../../../env-setup');

var handler = require(global.VX_HANDLERS + 'patient-record-retirement/patient-record-retirement-handler');
var getPatientIdentifiersFromJds = handler._steps.getPatientIdentifiersFromJds;
var jobUtil = require(global.VX_UTILS + 'job-utils');
var JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');

var log = require(global.VX_DUMMIES + '/dummy-logger');
// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
// 	name: 'patient-record-retirement-handler-spec',
// 	level: 'debug'
// });

var config = {
	documentStorage: {
		publish: {
			path: './abcd-test-directory-dcba'
		}
	},
	vistaSites: {
		AAAA: {},
		BBBB: {}
	},
	hdr: {
		hdrSites: {
			XHDR: {},
			YHDR: {}
		},
		operationMode: 'pub/sub'
	}
};

var patientIdentifier = {
	type: 'pid',
	value: 'AAAA;1'
};

function createEnvironment(log, config) {
	return {
		jds: new JdsClientDummy(log, config),
		solr: {
			deleteByQuery: function(pid, callback) {
				callback(null);
			}
		},
		vistaClient: {
			unsubscribe: function(pid, callback) {
				callback(null, 'success');
			}
		},
		hdrClient: {
			unsubscribe: function(siteId, pid, callback) {
				callback(null, 'success');
			}
		}
	};
}

describe('patient-record-retirement-handler', function() {
	describe('getPatientIdentifiersFromJds', function() {
		var job = jobUtil.createPatientRecordRetirement(patientIdentifier, '1');

		it('normal path: job only contains patientIdentifier', function() {
			var environment = createEnvironment(log, config);

			environment.jds._setResponseData([null], [{
				statusCode: 200
			}], [{
				patientIdentifiers: ['AAAA;1', 'BBBB;1'],
				jpid: 'aaaaa-bbbbbb-cccccc'
			}]);

			getPatientIdentifiersFromJds(log, config, environment, job, function(error, identifiers, jpid) {
				expect(error).toBeFalsy();
				expect(identifiers).toBeTruthy();
				expect(jpid).toBeTruthy();
				expect(identifiers).toContain('AAAA;1');
				expect(identifiers).toContain('BBBB;1');
				expect(jpid).toEqual('aaaaa-bbbbbb-cccccc');
			});
		});
		it('normal path: job contains list of identifiers, jpid', function() {
			var job = jobUtil.createPatientRecordRetirement(patientIdentifier, '2');
			job.identifiers=['AAAA;1', 'BBBB;1'];
			job.jpid='aaaaa-bbbbbb-cccccc';

			var environment = createEnvironment(log, config);

			getPatientIdentifiersFromJds(log, config, environment, job, function(error, identifiers, jpid) {
				expect(error).toBeFalsy();
				expect(identifiers).toBeTruthy();
				expect(jpid).toBeTruthy();
				expect(identifiers).toContain('AAAA;1');
				expect(identifiers).toContain('BBBB;1');
				expect(jpid).toEqual('aaaaa-bbbbbb-cccccc');
			});
		});
		it('error: error from jds', function() {
			var environment = createEnvironment(log, config);

			environment.jds._setResponseData(['error'], [null], [null]);

			getPatientIdentifiersFromJds(log, config, environment, job, function(error, identifiers, jpid) {
				expect(error).toBeTruthy();
				expect(identifiers).toBeFalsy();
				expect(jpid).toBeFalsy();
			});
		});
		it('error: null response from jds', function() {
			var environment = createEnvironment(log, config);
			environment.jds._setResponseData([null], [null], [null]);

			getPatientIdentifiersFromJds(log, config, environment, job, function(error, identifiers, jpid) {
				expect(error).toBeTruthy();
				expect(identifiers).toBeFalsy();
				expect(jpid).toBeFalsy();
			});
		});
		it('error: unexpected response from jds', function() {
			var environment = createEnvironment(log, config);
			environment.jds._setResponseData([null], [{
				statusCode: 500
			}], [null]);

			getPatientIdentifiersFromJds(log, config, environment, job, function(error, identifiers, jpid) {
				expect(error).toBeTruthy();
				expect(identifiers).toBeFalsy();
				expect(jpid).toBeFalsy();
			});
		});
		it('error: null result from jds', function() {
			var environment = createEnvironment(log, config);
			environment.jds._setResponseData([null], [{
				statusCode: 200
			}], [null]);

			getPatientIdentifiersFromJds(log, config, environment, job, function(error, identifiers, jpid) {
				expect(error).toBeTruthy();
				expect(identifiers).toBeFalsy();
				expect(jpid).toBeFalsy();
			});
		});
	});

	describe('handle', function() {
		it('normal path', function() {
			var environment = createEnvironment(log, config);
			environment.jds._setResponseData([null, null], [{
				statusCode: 200
			}, {
				statusCode: 200
			}], [{
				patientIdentifiers: ['AAAA;1', 'BBBB;1', 'XHDR;1', 'YHDR;1', '12345V12345'],
				jpid: 'aaaaa-bbbbbb-cccccc'
			}, null]);

			var job = jobUtil.createPatientRecordRetirement(patientIdentifier, '1');
			handler(log, config, environment, job, function(error, result) {
				expect(error).toBeFalsy();
				expect(result).toBeTruthy();
				expect(result).toEqual('success');
			});
		});
		it('error path - getPatientIdentifiersFromJds returns error', function() {
			var environment = createEnvironment(log, config);
			environment.jds._setResponseData([null], [{
				statusCode: 500
			}], [null]);

			var job = jobUtil.createPatientRecordRetirement(patientIdentifier, '1');

			handler(log, config, environment, job, function(error, result) {
				expect(error).toBeTruthy();
				expect(result).toBeFalsy();
			});
		});
		it('error path - clearPatient returns error', function() {
			var environment = createEnvironment(log, config);
			environment.jds._setResponseData([null, null], [{
				statusCode: 200
			}, {
				statusCode: 500
			}], [{
				patientIdentifiers: ['AAAA;1', 'BBBB;1', 'XHDR;1', 'YHDR;1', '12345V12345'],
				jpid: 'aaaaa-bbbbbb-cccccc'
			}, null]);

			var job = jobUtil.createPatientRecordRetirement(patientIdentifier, '1');

			handler(log, config, environment, job, function(error, result) {
				expect(error).toBeTruthy();
				expect(result).toBeFalsy();
			});
		});
	});
});