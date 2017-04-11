'use strict';

require('../../../../env-setup');

var handler = require(global.VX_HANDLERS + 'hdr-sync-domain-request/hdr-sync-domain-request-handler');
var log = require(global.VX_DUMMIES + 'dummy-logger');

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
			expect(domainConfig.agentClass).toBeDefined();
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
});