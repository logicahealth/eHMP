'use strict';

//------------------------------------------------------------------------------------
// This file contains unit tests for vista-sync-util.js.
//
// Author: Les Westberg
//------------------------------------------------------------------------------------

require('../../../env-setup');

var _ = require('underscore');
var log = require(global.VX_DUMMIES + 'dummy-logger');
var vistaSyncUtil = require(global.VX_UTILS + 'vista-sync-util');
// var log = require(global.VX_UTILS + 'log');
// dummyLogger = log._createLogger({
//     name: 'vista-sync-util-spec',
//     level: 'debug',
//     child: log._createLogger
// });

describe('vista-sync-util', function() {
    describe('_extractAllocationTokenFromRawResponse', function() {
        it('Happy Path - with white space', function() {
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"KODAK.VISTACORE.US\",\"systemId\":\"SITE\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":1000,\"allocationToken\" : \"3150721\"}}';
            var allocationToken = vistaSyncUtil.extractAllocationTokenFromRawResponse(log, rawResponse);
            expect(allocationToken).toEqual('3150721');
        });
        it('Happy Path - with no white space', function() {
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"KODAK.VISTACORE.US\",\"systemId\":\"SITE\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":1000,\"allocationToken\":\"3150721\"}}';
            var allocationToken = vistaSyncUtil.extractAllocationTokenFromRawResponse(log, rawResponse);
            expect(allocationToken).toEqual('3150721');
        });
        it('Happy Path - handle multiple - get first', function() {
            var rawResponse = '{\"apiVersion\": 1.02,\"params\":{\"domain\":\"KODAK.VISTACORE.US\",\"systemId\":\"SITE\"},\"data\":{\"updated\":\"20150721120512\",\"totalItems\":1000,\"allocationToken\":\"3150721\",\"allocationToken\":\"3150722\"}}';
            var allocationToken = vistaSyncUtil.extractAllocationTokenFromRawResponse(log, rawResponse);
            expect(_.isArray(allocationToken)).toBe(false);
            expect(allocationToken).toEqual('3150721');
        });
    });

});
