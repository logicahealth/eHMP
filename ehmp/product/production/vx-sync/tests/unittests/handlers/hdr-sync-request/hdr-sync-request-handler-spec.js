'use strict';

require('../../../../env-setup');

var handler = require(global.VX_HANDLERS + 'hdr-sync-request/hdr-sync-request-handler');
var log = require(global.VX_DUMMIES + 'dummy-logger');
var PublisherRouterDummy = require(global.VX_DUMMIES + 'publisherRouterDummy');
// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
//     name: 'hdr-sync-request-handler-spec',
//     level: 'debug'
// });

describe('hdr-sync-request', function() {
	var patientIdentifier = {
		type: 'pid',
		value: 'HDR;11111V22222'
	};

	var config = {
		hdr: {
			domains: ['allergy', 'consult', 'vital']
		}
	};

	function createEnvironment() {
		return {
			publisherRouter: new PublisherRouterDummy()
		};
	}

	it('Error path: no job', function(done) {
		var environment = createEnvironment();

		handler(log, config, environment, null, function(error, result) {
			expect(error).toBeTruthy();
			expect(result).toBeFalsy();
			done();
		});
	});
	it('Error path: wrong job type', function(done) {
		var environment = createEnvironment();

		handler(log, config, environment, {
			type: 'wrong type',
			patientIdentifier: patientIdentifier,
			jpid: 'aaaaa'
		}, function(error, result) {
			expect(error).toBeTruthy();
			expect(result).toBeFalsy();
			done();
		});
	});
	it('Error path: invalid job', function(done) {
		var environment = createEnvironment();

		handler(log, config, environment, {
			type: 'hdr-sync-request',
			jpid: 'aaaaa'
		}, function(error, result) {
			expect(error).toBeTruthy();
			expect(result).toBeFalsy();
			done();
		});
	});
	it('Error path: no domains', function(done) {
		var environment = createEnvironment();
		var noDomainsConfig = {
			hdr: {
				domains: []
			}
		};

		handler(log, noDomainsConfig, environment, {
			type: 'hdr-sync-request',
			patientIdentifier: patientIdentifier,
			jpid: 'aaaaa'
		}, function(error, result) {
			expect(error).toBeFalsy();
			expect(result).toBeFalsy();
			done();
		});
	});
	it('Error path: pubilsher error', function(done) {
		var environment = createEnvironment();
		spyOn(environment.publisherRouter, 'publish').andCallFake(function(job, callback) {
			callback('Publisher Error');
		});

		handler(log, config, environment, {
			type: 'hdr-sync-request',
			patientIdentifier: patientIdentifier,
			jpid: 'aaaaa'
		}, function(error, result) {
			expect(error).toBeTruthy();
			expect(result).toBeFalsy();
			done();
		});
	});
	it('Normal path', function(done) {
		var environment = createEnvironment();
		spyOn(environment.publisherRouter, 'publish').andCallThrough();

		var referenceInfo = {
			sessionId: 'test-session-id',
			requestId: 'test-request-id'
		};

		var job = {
			type: 'hdr-sync-request',
			patientIdentifier: patientIdentifier,
			jpid: 'aaaaa',
			referenceInfo: referenceInfo
		};

		handler(log, config, environment, job, function(error, result) {
			expect(error).toBeFalsy();
			expect(result).toBeTruthy();
			expect(environment.publisherRouter.publish).toHaveBeenCalledWith([jasmine.objectContaining({
				type: 'hdr-sync-allergy-request',
				timestamp: jasmine.any(String),
				patientIdentifier: {
					type: 'pid',
					value: 'HDR;11111V22222'
				},
				jpid: 'aaaaa',
				dataDomain: 'allergy',
				requestStampTime: jasmine.any(String),
				jobId: jasmine.any(String),
				referenceInfo: referenceInfo
			}), jasmine.objectContaining({
				type: 'hdr-sync-consult-request',
				timestamp: jasmine.any(String),
				patientIdentifier: {
					type: 'pid',
					value: 'HDR;11111V22222'
				},
				jpid: 'aaaaa',
				dataDomain: 'consult',
				requestStampTime: jasmine.any(String),
				jobId: jasmine.any(String),
				referenceInfo: referenceInfo
			}), jasmine.objectContaining({
				type: 'hdr-sync-vital-request',
				timestamp: jasmine.any(String),
				patientIdentifier: {
					type: 'pid',
					value: 'HDR;11111V22222'
				},
				jpid: 'aaaaa',
				dataDomain: 'vital',
				requestStampTime: jasmine.any(String),
				jobId: jasmine.any(String),
				referenceInfo: referenceInfo
			})], jasmine.any(Function));
			done();
		});
	});
});