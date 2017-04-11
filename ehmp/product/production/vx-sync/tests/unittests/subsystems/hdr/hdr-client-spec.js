'use strict';

// var _ = require('underscore');
// var format = require('util').format;
// var querystring = require('querystring');

require('../../../../env-setup');
var log = require(global.VX_DUMMIES + 'dummy-logger');
var HdrClient = require(global.VX_SUBSYSTEMS + 'hdr/hdr-client');

var config = {
    hdr: {
        pubsubConfig: {
            host: 'IP_ADDRESS',
            port: 8999,
            protocol: 'http',
            path: 'repositories.DNS       /fpds/vpr/',
            server: 'HMPTest',
            clientName: 'eHMP',
            _type: 'json',
            identifier: 'USVHA',
            extractSchema: '3.001',
            maxBatchSize: 500,
            timeout: 6000
        },
        hdrSites: {
            '84F0' : {
                stationNumber: 578
            }
        }
    }
};

describe('hdr-client.js', function() {
    var hdrClient = new HdrClient(log, log, config);

    it('construct getStationIdBySiteId', function() {
        var siteId = '84F0';
        var stationId = hdrClient.getStationIdBySiteId(siteId);
        expect(stationId).toEqual(578);
        siteId = 'FHDH';
        stationId = hdrClient.getStationIdBySiteId(siteId);
        expect(stationId).toEqual(undefined);
        siteId = undefined;
        stationId = hdrClient.getStationIdBySiteId(siteId);
        expect(stationId).toEqual(undefined);
    });

    it('construct resolvedIdentifier', function() {
        var expectedIdentifier = '5-578-USVHA';
        var resolvedIdentifier = hdrClient._getHDRResolvedIdentifier(5,578);
        expect(resolvedIdentifier).toEqual(expectedIdentifier);

    });

    it('construct HDR Base URL', function() {
        var expectedUrl = 'http://IP_ADDRESS:PORT/repositories.DNS       /fpds/vpr/';
        var resolvedUrl = hdrClient._getHDRBaseUrl();
        expect(resolvedUrl).toEqual(expectedUrl);

    });
});