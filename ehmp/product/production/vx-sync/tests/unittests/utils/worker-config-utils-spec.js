'use strict';

require('../../../env-setup');
var _ = require('underscore');


var workerConfigUtil = require(global.VX_UTILS + 'worker-config-utils');

var initialConfig = {
    'configRefresh': 0,
    'rules': {
        'accept-all': {},
        'rapid-fire': {},
        'operational-data-sync': {
            'odsAttempts': 10,
            'odsDelay': 30
        },
        'expiration': {
            'default': 3600000,
            'dod': 3600000
        }
    },
    'vistaSites': {
        '9E7A': {
            'name': 'panorama',
            'host': 'IP        ',
            'port': 9210,
            'accessCode': 'ep1234',
            'verifyCode': 'ep1234!!',
            'localIP': '127.0.0.1',
            'stationNumber': 500,
            'localAddress': 'localhost',
            'connectTimeout': 3000,
            'sendTimeout': 20000
        },
        'C877': {
            'name': 'kodak',
            'host': 'IP        ',
            'port': 9210,
            'accessCode': 'ep1234',
            'verifyCode': 'ep1234!!',
            'localIP': '127.0.0.1',
            'stationNumber': 501,
            'localAddress': 'localhost',
            'connectTimeout': 3000,
            'sendTimeout': 20000
        }
    },
    'hdr': {
        'hdrSites': {
            '1234': {
                'name': 'panorama',
                'host': 'IP        ',
                'port': 9210,
                'accessCode': 'ep1234',
                'verifyCode': 'ep1234!!',
                'localIP': '127.0.0.1',
                'stationNumber': 600,
                'localAddress': 'localhost',
                'connectTimeout': 3000,
                'sendTimeout': 20000
            },
            'CCCC': {
                'name': 'kodak',
                'host': 'IP        ',
                'port': 9210,
                'accessCode': 'ep1234',
                'verifyCode': 'ep1234!!',
                'localIP': '127.0.0.1',
                'stationNumber': 601,
                'localAddress': 'localhost',
                'connectTimeout': 3000,
                'sendTimeout': 20000
            }
        },
    }
};

describe('worker-config-utils.js', function() {
    describe('createVistaSitesByStationCombined()', function() {
        it('test with both vista and HDR data', function() {
            var localConfig = JSON.parse(JSON.stringify(initialConfig));
            var resultConfig = workerConfigUtil.createVistaSitesByStationCombined(localConfig);
            expect(resultConfig).toBeTruthy();
            expect(resultConfig.vistaSitesByStationCombined).toBeTruthy();
            expect(_.size(resultConfig.vistaSitesByStationCombined)).toBe(4);
            expect(resultConfig.vistaSitesByStationCombined[String(resultConfig.vistaSites['9E7A'].stationNumber)]).toBe(resultConfig.vistaSites['9E7A']);
            expect(resultConfig.vistaSitesByStationCombined[String(resultConfig.vistaSites['9E7A'].stationNumber)].siteHash).toBe('9E7A');
            expect(resultConfig.vistaSitesByStationCombined[String(resultConfig.vistaSites.C877.stationNumber)]).toBe(resultConfig.vistaSites.C877);
            expect(resultConfig.vistaSitesByStationCombined[String(resultConfig.vistaSites.C877.stationNumber)].siteHash).toBe('C877');
            expect(resultConfig.vistaSitesByStationCombined[String(resultConfig.hdr.hdrSites['1234'].stationNumber)]).toBe(resultConfig.hdr.hdrSites['1234']);
            expect(resultConfig.vistaSitesByStationCombined[String(resultConfig.hdr.hdrSites['1234'].stationNumber)].siteHash).toBe('1234');
            expect(resultConfig.vistaSitesByStationCombined[String(resultConfig.hdr.hdrSites.CCCC.stationNumber)]).toBe(resultConfig.hdr.hdrSites.CCCC);
            expect(resultConfig.vistaSitesByStationCombined[String(resultConfig.hdr.hdrSites.CCCC.stationNumber)].siteHash).toBe('CCCC');
        });
        it('test with vista and no HDR data', function() {
            var localConfig = JSON.parse(JSON.stringify(initialConfig));
            localConfig.hdr.hdrSites = {};
            var resultConfig = workerConfigUtil.createVistaSitesByStationCombined(localConfig);
            expect(resultConfig).toBeTruthy();
            expect(resultConfig.vistaSitesByStationCombined).toBeTruthy();
            expect(_.size(resultConfig.vistaSitesByStationCombined)).toBe(2);
            expect(resultConfig.vistaSitesByStationCombined[String(resultConfig.vistaSites['9E7A'].stationNumber)]).toBe(resultConfig.vistaSites['9E7A']);
            expect(resultConfig.vistaSitesByStationCombined[String(resultConfig.vistaSites.C877.stationNumber)]).toBe(resultConfig.vistaSites.C877);
        });
        it('test with no vista but with HDR data', function() {
            var localConfig = JSON.parse(JSON.stringify(initialConfig));
            localConfig.vistaSites = {};
            var resultConfig = workerConfigUtil.createVistaSitesByStationCombined(localConfig);
            expect(resultConfig).toBeTruthy();
            expect(resultConfig.vistaSitesByStationCombined).toBeTruthy();
            expect(_.size(resultConfig.vistaSitesByStationCombined)).toBe(2);
            expect(resultConfig.vistaSitesByStationCombined[String(resultConfig.hdr.hdrSites['1234'].stationNumber)]).toBe(resultConfig.hdr.hdrSites['1234']);
            expect(resultConfig.vistaSitesByStationCombined[String(resultConfig.hdr.hdrSites.CCCC.stationNumber)]).toBe(resultConfig.hdr.hdrSites.CCCC);
        });
        it('test with no vista and no HDR data', function() {
            var localConfig = JSON.parse(JSON.stringify(initialConfig));
            localConfig.vistaSites = {};
            localConfig.hdr = {};
            var resultConfig = workerConfigUtil.createVistaSitesByStationCombined(localConfig);
            expect(resultConfig).toBeTruthy();
            expect(resultConfig.vistaSitesByStationCombined).toBeTruthy();
            expect(_.size(resultConfig.vistaSitesByStationCombined)).toBe(0);
        });
    });
});