'use strict';

require('../../../../env-setup');

var handler = require(global.VX_HANDLERS + 'hdr-sync-domain-request/hdr-sync-domain-request-handler');
var log = require(global.VX_DUMMIES + 'dummy-logger');
// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
// 	name: 'hdr-sync-domain-request-handler-spec',
// 	level: 'debug'
// });
var nock = require('nock');
var PublisherRouterDummy = require(global.VX_DUMMIES + 'publisherRouterDummy');

describe('hdr-sync-request-handler', function() {
	describe('getDomainConfiguration()', function() {
		var blackList = [{
			siteHash: '2927',
			stationNumber: 202
		}, {
			siteHash: 'A8C2',
			stationNumber: 504
		}];

		var config = {
			vistaAssigningAuthority: 'USVHA',
			hdr: {
				defaults: {
					host: 'localhost',
					port: 54000,
					method: 'GET',
					timeout: 60000
				},
				med: {
					path: '/hdr/getData?domain=med'
				}
			}
		};

		var job = {
			dataDomain: 'med',
			patientIdentifier: {
				value: 'HDR;1234567V1234567'
			}
		};

		it('tests undefined blackList', function() {
			var domainConfig = handler._getDomainConfiguration(log, config, job);
			expect(domainConfig.qs.excludeIdentifier).toBeUndefined();
		});

		it('tests that domainConfig is built correctly', function() {
			config.hdr.blackList = blackList;
			var domainConfig = handler._getDomainConfiguration(log, config, job);

			expect(domainConfig.qs).toEqual({
				icn: '1234567V1234567',
				excludeIdentifier: ['-202-USVHA', '-504-USVHA']
			});
			expect(domainConfig.path).toEqual('/hdr/getData?domain=med');
			expect(domainConfig.host).toEqual('localhost');
			expect(domainConfig.port).toEqual(54000);
			expect(domainConfig.method).toEqual('GET');
			expect(domainConfig.timeout).toEqual(60000);
			expect(domainConfig.url).toEqual('http://localhost:54000/hdr/getData?domain=med');
			expect(domainConfig.forever).toBeDefined();
			expect(domainConfig.agentOptions).toBeDefined();
		});
	});

	describe('buildExcludeIdentifierParams()', function() {
		it('tests empty blackList', function() {
			expect(handler._buildExcludeIdentifierParams(log, null)).toEqual([]);
			expect(handler._buildExcludeIdentifierParams(log, [])).toEqual([]);
		});

		it('tests invalid item in blackList', function() {
			var blackList = [{
				siteHash: '2927',
				stationNumber: 202
			}, {
				siteHash: 'A8C2',
			}, {
				siteHash: null,
				stationNumber: 202
			}];

			var list = handler._buildExcludeIdentifierParams(log, blackList, null, 'USVHA');
			expect(list).toEqual(['-202-USVHA']);
		});

		it('tests that domainConfig is built correctly', function() {
			var blackList = [{
				siteHash: '2927',
				stationNumber: 202
			}, {
				siteHash: 'A8C2',
				stationNumber: 504
			}];

			var list = handler._buildExcludeIdentifierParams(log, blackList, null, 'USVHA');
			expect(list).toEqual(['-202-USVHA', '-504-USVHA']);
		});

		it('tests invalid item in vista sites list', function() {
			var vistaSites = {
				'3937': {
					stationNumber: 101
				},
				'FFDE': {
					stationNumber: null
				},
			};
			var list = handler._buildExcludeIdentifierParams(log, [], vistaSites, 'USVHA');
			expect(list).toEqual(['-101-USVHA']);
			var blackList = [{
				siteHash: '2927',
				stationNumber: 202
			}, {
				siteHash: 'A8C2',
				stationNumber: 504
			}];
			list = handler._buildExcludeIdentifierParams(log, blackList, vistaSites, 'USVHA');
			expect(list).toEqual(['-202-USVHA', '-504-USVHA', '-101-USVHA']);
		});

		it('tests duplicate item in vista sites list', function() {
			var vistaSites = {
				'2927': {
					stationNumber: 202
				},
				'3937': {
					stationNumber: 101
				}
			};
			var list = handler._buildExcludeIdentifierParams(log, [], vistaSites, 'USVHA');
			expect(list).toEqual(['-202-USVHA', '-101-USVHA']);
			var blackList = [{
				siteHash: '2927',
				stationNumber: 202
			}, {
				siteHash: 'A8C2',
				stationNumber: 504
			}];
			list = handler._buildExcludeIdentifierParams(log, blackList, vistaSites, 'USVHA');
			expect(list).toEqual(['-202-USVHA', '-504-USVHA', '-101-USVHA']);
		});
	});

	describe('handle', function() {
		var patientIdentifier = {
			type: 'pid',
			value: 'HDR;11111V22222'
		};
		var config = {
			vistaAssigningAuthority: 'USVHA',
			hdr: {
				defaults: {
					host: '0.0.0.0',
					port: '1234',
					method: 'GET',
					timeout: 60000
				},
				allergy: {
					path: '/hdr/getData?domain=allergy'
				}
			}
		};

		var hdrHostAndPort = 'http://0.0.0.0:1234';
		var hdrQueryString = config.hdr.allergy.path + '&icn=11111V22222';

		function createEnvironment() {
			return {
				metrics: log,
				publisherRouter: new PublisherRouterDummy()
			};
		}

		var referenceInfo = {
			sessionId: 'test-session-id',
			requestId: 'test-request-id'
		};

		var job = {
			type: 'hdr-sync-allergy-request',
			timestamp: '20170101135900',
			patientIdentifier: patientIdentifier,
			jpid: 'aaaaa',
			dataDomain: 'allergy',
			requestStampTime: '20170101135900',
			jobId: 'bbbbb',
			referenceInfo: referenceInfo
		};

		var hdrRecord1 = {
			data: {
				items: [{
					test: 'a'
				}]
			}
		};

		var hdrRecord2 = {
			data: {
				items: [{
					test: 'b'
				}]
			}
		};

		it('Error path: hdr response via soap handler is error', function(done){
			var environment = createEnvironment();

			nock(hdrHostAndPort)
				.get(hdrQueryString)
				.replyWithError('Error!');

			handler(log, config, environment, job, function(error, result) {
				expect(error).toBeTruthy();
				expect(result).toBeFalsy();

				done();
			});
		});
		it('Error path: hdr response via soap handler is null', function(done){
			var environment = createEnvironment();

			nock(hdrHostAndPort)
				.get(hdrQueryString)
				.reply(200, null);

			handler(log, config, environment, job, function(error, result) {
				expect(error).toBeTruthy();
				expect(result).toBeFalsy();

				done();
			});
		});
		it('Error path: hdr response via soap handler is not 200 or 204', function(done){
			var environment = createEnvironment();

			nock(hdrHostAndPort)
				.get(hdrQueryString)
				.reply(500);

			handler(log, config, environment, job, function(error, result) {
				expect(error).toBeTruthy();
				expect(result).toBeFalsy();

				done();
			});
		});
		it('Error path: hdr response via soap handler is empty', function(done) {
			var environment = createEnvironment();

			nock(hdrHostAndPort)
				.get(hdrQueryString)
				.reply(200, {});

			handler(log, config, environment, job, function(error, result) {
				expect(error).toBeFalsy();
				expect(result).toEqual(jasmine.objectContaining({
					type: 'fatal-exception',
					message: 'No Valid Data Found'
				}));

				done();
			});
		});
		it('Error path: hdr response via soap handler is bad JSON', function(done){
			var environment = createEnvironment();

			nock(hdrHostAndPort)
				.get(hdrQueryString)
				.reply(200, '{badJson: ');

			handler(log, config, environment, job, function(error, result) {
				expect(error).toBeTruthy();
				expect(result).toBeFalsy();

				done();
			});
		});
		it('Normal path: 204 from hdr via soap handler', function(done) {
			var environment = createEnvironment();
			spyOn(environment.publisherRouter, 'publish').andCallThrough();

			nock(hdrHostAndPort)
				.get(hdrQueryString)
				.reply(204);

			handler(log, config, environment, job, function(error, result) {
				expect(error).toBeFalsy();
				expect(result).toBeTruthy();

				expect(result).toEqual(jasmine.objectContaining({type: 'transient-exception'}));
				done();
			});
		});
		it('Normal path: hdr response via soap handler includes sites', function(done) {
			var environment = createEnvironment();
			spyOn(environment.publisherRouter, 'publish').andCallThrough();

			nock(hdrHostAndPort)
				.get(hdrQueryString)
				.reply(200, {
					sites: [hdrRecord1, hdrRecord2]
				});

			handler(log, config, environment, job, function(error, result) {
				expect(error).toBeFalsy();
				expect(result).toBeTruthy();

				expect(environment.publisherRouter.publish).toHaveBeenCalledWith([jasmine.objectContaining({
					type: 'hdr-xform-allergy-vpr',
					timestamp: jasmine.any(String),
					patientIdentifier: patientIdentifier,
					jpid: 'aaaaa',
					referenceInfo: referenceInfo,
					dataDomain: 'allergy',
					record: hdrRecord1,
					requestStampTime: jasmine.any(String),
					jobId: 'bbbbb'
				}), jasmine.objectContaining({
					type: 'hdr-xform-allergy-vpr',
					timestamp: jasmine.any(String),
					patientIdentifier: patientIdentifier,
					jpid: 'aaaaa',
					referenceInfo: referenceInfo,
					dataDomain: 'allergy',
					record: hdrRecord2,
					requestStampTime: jasmine.any(String),
					jobId: 'bbbbb'
				})], jasmine.any(Function));
				done();
			});
		});
		it('Normal path: hdr response via soap handler is a JSON string', function(done) {
			var environment = createEnvironment();
			spyOn(environment.publisherRouter, 'publish').andCallThrough();

			nock(hdrHostAndPort)
				.get(hdrQueryString)
				.reply(200, JSON.stringify({
					sites: [hdrRecord1]
				}));

			handler(log, config, environment, job, function(error, result) {
				expect(error).toBeFalsy();
				expect(result).toBeTruthy();

				expect(environment.publisherRouter.publish).toHaveBeenCalledWith([jasmine.objectContaining({
					type: 'hdr-xform-allergy-vpr',
					timestamp: jasmine.any(String),
					patientIdentifier: patientIdentifier,
					jpid: 'aaaaa',
					referenceInfo: referenceInfo,
					dataDomain: 'allergy',
					record: hdrRecord1,
					requestStampTime: jasmine.any(String),
					jobId: 'bbbbb'
				})], jasmine.any(Function));
				done();
			});
		});
		it('Normal path: hdr response via soap handler does not include \"sites\"', function(done) {
			var environment = createEnvironment();
			spyOn(environment.publisherRouter, 'publish').andCallThrough();

			nock(hdrHostAndPort)
				.get(hdrQueryString)
				.reply(200,
					hdrRecord1
				);

			handler(log, config, environment, job, function(error, result) {
				expect(error).toBeFalsy();
				expect(result).toBeTruthy();

				expect(environment.publisherRouter.publish).toHaveBeenCalledWith(jasmine.objectContaining({
					type: 'hdr-xform-allergy-vpr',
					timestamp: jasmine.any(String),
					patientIdentifier: patientIdentifier,
					jpid: 'aaaaa',
					referenceInfo: referenceInfo,
					dataDomain: 'allergy',
					record: hdrRecord1,
					requestStampTime: jasmine.any(String),
					jobId: 'bbbbb'
				}), jasmine.any(Function));
				done();
			});
		});
	});
});
