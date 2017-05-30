'use strict';

//---------------------------------------------------------------------------------------------------
// This is the unit tests for the http-header-utils.js file.
//
// @Author: Les Westberg
//---------------------------------------------------------------------------------------------------
require('../../../env-setup');

var _ = require('underscore');

var HttpHeaderUtil = require(global.VX_UTILS + 'http-header-utils');
var log = require(global.VX_DUMMIES + 'dummy-logger');
// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
//     name: 'solr-xform-spec',
//     level: 'debug'
// });


describe('http-header-util.js', function() {
    describe('extractReferenceInfo', function() {
        it('Verify when req is null', function() {
            var httpHeaderUtil = new HttpHeaderUtil(log);
            var referenceInfo = httpHeaderUtil.extractReferenceInfo(null);
            expect(referenceInfo).not.toBeNull();
            expect(_.isEmpty(referenceInfo)).toBe(true);
        });
        it('Verify when req is undefined', function() {
            var httpHeaderUtil = new HttpHeaderUtil(log);
            var referenceInfo = httpHeaderUtil.extractReferenceInfo(undefined);
            expect(referenceInfo).not.toBeNull();
            expect(_.isEmpty(referenceInfo)).toBe(true);
        });
        it('Verify when req is empty object', function() {
            var httpHeaderUtil = new HttpHeaderUtil(log);
            var referenceInfo = httpHeaderUtil.extractReferenceInfo({});
            expect(referenceInfo).not.toBeNull();
            expect(_.isEmpty(referenceInfo)).toBe(true);
        });
        it('Verify when req.headers is null', function() {
            var httpHeaderUtil = new HttpHeaderUtil(log);
            var req = {
                headers: null
            };
            var referenceInfo = httpHeaderUtil.extractReferenceInfo(req);
            expect(referenceInfo).not.toBeNull();
            expect(_.isEmpty(referenceInfo)).toBe(true);
        });
        it('Verify when req.headers is undefined', function() {
            var httpHeaderUtil = new HttpHeaderUtil(log);
            var req = {
                headers: undefined
            };
            var referenceInfo = httpHeaderUtil.extractReferenceInfo(req);
            expect(referenceInfo).not.toBeNull();
            expect(_.isEmpty(referenceInfo)).toBe(true);
        });
        it('Verify when req.headers is an empty object', function() {
            var httpHeaderUtil = new HttpHeaderUtil(log);
            var req = {
                headers: {}
            };
            var referenceInfo = httpHeaderUtil.extractReferenceInfo(req);
            expect(referenceInfo).not.toBeNull();
            expect(_.isEmpty(referenceInfo)).toBe(true);
        });
        it('Verify when req.headers has requestId, sessionId and other Non-Reference properties.', function() {
            var httpHeaderUtil = new HttpHeaderUtil(log);
            var req = {
                headers: {
                    'x-session-id': '1234567',
                    'x-request-id': '9999999',
                    someOtherProperty: '1234567890'
                }
            };
            var referenceInfo = httpHeaderUtil.extractReferenceInfo(req);
            expect(referenceInfo).not.toBeNull();
            expect(_.isEmpty(referenceInfo)).toBe(false);
            expect(_.size(referenceInfo)).toBe(2);
            expect(referenceInfo.sessionId).toBe('1234567');
            expect(referenceInfo.requestId).toBe('9999999');
        });
        it('Verify when req.headers has requestId, sessionId and other Non-Reference and Reference properties.', function() {
            var httpHeaderUtil = new HttpHeaderUtil(log);
            var req = {
                headers: {
                    'x-session-id': '1234567',
                    'x-request-id': '9999999',
                    'x-utility-type': 'test-utility',
                    someOtherProperty: '1234567890',
                    reference_Property1: 'test1',
                    reference_property_2: 'test2',
                    reference_propertyThree: 'test3'
                }
            };
            var referenceInfo = httpHeaderUtil.extractReferenceInfo(req);
            expect(referenceInfo).not.toBeNull();
            expect(_.isEmpty(referenceInfo)).toBe(false);
            expect(_.size(referenceInfo)).toBe(6);
            expect(referenceInfo.sessionId).toBe('1234567');
            expect(referenceInfo.requestId).toBe('9999999');
            expect(referenceInfo.utilityType).toBe('test-utility');
            expect(referenceInfo.Property1).toBe('test1');
            expect(referenceInfo.property_2).toBe('test2');
            expect(referenceInfo.propertyThree).toBe('test3');
        });
    });
    describe('insertReferenceInfo', function() {
        it('Verify when referenceInfo is null', function() {
            var httpHeaderUtil = new HttpHeaderUtil(log);
            var options = {};
            var responseOptions = httpHeaderUtil.insertReferenceInfo(options, null);
            expect(responseOptions).not.toBeNull();
            expect(_.isObject(responseOptions.headers)).toBe(true);
        });
        it('Verify when referenceInfo is undefined', function() {
            var httpHeaderUtil = new HttpHeaderUtil(log);
            var options = {};
            var responseOptions = httpHeaderUtil.insertReferenceInfo(options, undefined);
            expect(responseOptions).not.toBeNull();
            expect(_.isObject(responseOptions.headers)).toBe(true);
        });
        it('Verify when referenceInfo is an empty object', function() {
            var httpHeaderUtil = new HttpHeaderUtil(log);
            var options = {};
            var referenceInfo = {};
            var responseOptions = httpHeaderUtil.insertReferenceInfo(options, referenceInfo);
            expect(responseOptions).not.toBeNull();
            expect(_.isObject(responseOptions.headers)).toBe(true);
        });
        it('Verify a new options is created if a null one is passed in.', function() {
            var httpHeaderUtil = new HttpHeaderUtil(log);
            var referenceInfo = {};
            var responseOptions = httpHeaderUtil.insertReferenceInfo(null, referenceInfo);
            expect(responseOptions).not.toBeNull();
            expect(_.isObject(responseOptions.headers)).toBe(true);
        });
        it('Verify a new options is created if an undefined one is passed in.', function() {
            var httpHeaderUtil = new HttpHeaderUtil(log);
            var referenceInfo = {};
            var responseOptions = httpHeaderUtil.insertReferenceInfo(undefined, referenceInfo);
            expect(responseOptions).not.toBeNull();
            expect(_.isObject(responseOptions.headers)).toBe(true);
        });
        it('Verify when referenceInfo has sessionId requestId, and other properties.', function() {
            var httpHeaderUtil = new HttpHeaderUtil(log);
            var referenceInfo = {
                sessionId: '1234567',
                requestId: '9999999',
                utilityType: 'test-utility',
                Property1: 'test1',
                property_2: 'test2',
                propertyThree: 'test3'
            };
            var responseOptions = httpHeaderUtil.insertReferenceInfo(undefined, referenceInfo);
            expect(responseOptions).not.toBeNull();
            expect(_.isObject(responseOptions.headers)).toBe(true);
            expect(_.size(responseOptions.headers)).toBe(6);
            expect(responseOptions.headers['x-session-id']).toBe('1234567');
            expect(responseOptions.headers['x-request-id']).toBe('9999999');
            expect(responseOptions.headers['x-utility-type']).toBe('test-utility');
            expect(responseOptions.headers.reference_Property1).toBe('test1');
            expect(responseOptions.headers.reference_property_2).toBe('test2');
            expect(responseOptions.headers.reference_propertyThree).toBe('test3');
        });
    });
});
