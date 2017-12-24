'use strict';

//---------------------------------------------------------------------------------------------------
// Unit tests for record-enrichment-checker.
//
// @Author: Les Westberg
//---------------------------------------------------------------------------------------------------

require('../../../env-setup');
const log = require(global.VX_DUMMIES + 'dummy-logger');
// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
//     name: 'vlerdas-checker-spec',
//     level: 'debug'
// });

let recEnrichmentChecker = require(global.VX_ERROR_PROCESSING + 'record-enrichment-checker');

//------------------------------------------------------------------------------------------------------
// This function returns an instance of worker-config.json with the settings we need for our unit tests.
//
// returns: The worker-config settings.
//------------------------------------------------------------------------------------------------------
function getConfig() {
    let config = {
        'handlerMaxSockets': 10,
        'terminology': {
            'protocol': 'http',
            'host': '127.0.0.1',
            'port': '5400',
            'timeout': 60000,
            'lncPath': '/term/lnc',
            'drugPath': '/term/drug',
            'jlvPath': '/term/jlv',
            'jlvListPath': '/term/jlvList',
            'terminologyPing': '/term/ping'
        }
    };
    return config;
}


describe('record-enrichment-checker.js', function () {
    describe('check()', function () {
        it('Happy Path', function () {
            const config = getConfig();
            const fakeMethods = {
                request:  function test (url, callback) {
                    return callback(null, { statusCode: 200 }, '{ "message": "pong"}');
                }
            };
            spyOn(fakeMethods, 'request').andCallThrough();


            let finished = false;
            recEnrichmentChecker(log, config, function(error, systemUpFlag) {
                const url = config.terminology.protocol + '://' + config.terminology.host + ':' + config.terminology.port + config.terminology.terminologyPing;
                expect(fakeMethods.request).toHaveBeenCalledWith(url, jasmine.any(Function));
                expect(error).toBeNull();
                expect(systemUpFlag).toBe(true);
                finished = true;
            }, { _request: fakeMethods.request });

            waitsFor(function() {
                return finished;
            }, 'calling recEnrichmentChecker method', 100);
        });

        it('Error returned from request', function () {
            const config = getConfig();
            const fakeMethods = {
                request:  function (url, callback) {
                    return callback('SomeError', { statusCode: 200 }, '{}');
                }
            };
            spyOn(fakeMethods, 'request').andCallThrough();


            let finished = false;
            recEnrichmentChecker(log, config, function(error, systemUpFlag) {
                const url = config.terminology.protocol + '://' + config.terminology.host + ':' + config.terminology.port + config.terminology.terminologyPing;
                expect(fakeMethods.request).toHaveBeenCalledWith(url, jasmine.any(Function));
                expect(error).toBeNull();
                expect(systemUpFlag).toBe(false);
                finished = true;
            }, { _request: fakeMethods.request });

            waitsFor(function() {
                return finished;
            }, 'calling recEnrichmentChecker method', 100);
        });

        it('Request returns something other than statusCode of 200', function () {
            const config = getConfig();
            const fakeMethods = {
                request:  function (url, callback) {
                    return callback(null, { statusCode: 500 }, '{}');
                }
            };
            spyOn(fakeMethods, 'request').andCallThrough();


            let finished = false;
            recEnrichmentChecker(log, config, function(error, systemUpFlag) {
                const url = config.terminology.protocol + '://' + config.terminology.host + ':' + config.terminology.port + config.terminology.terminologyPing;
                expect(fakeMethods.request).toHaveBeenCalledWith(url, jasmine.any(Function));
                expect(error).toBeNull();
                expect(systemUpFlag).toBe(false);
                finished = true;
            }, { _request: fakeMethods.request });

            waitsFor(function() {
                return finished;
            }, 'calling recEnrichmentChecker method', 100);
        });

        it('Request returns statusCode of 200 - but empty body', function () {
            const config = getConfig();
            const fakeMethods = {
                request:  function (url, callback) {
                    return callback(null, { statusCode: 200 }, null);
                }
            };
            spyOn(fakeMethods, 'request').andCallThrough();


            let finished = false;
            recEnrichmentChecker(log, config, function(error, systemUpFlag) {
                const url = config.terminology.protocol + '://' + config.terminology.host + ':' + config.terminology.port + config.terminology.terminologyPing;
                expect(fakeMethods.request).toHaveBeenCalledWith(url, jasmine.any(Function));
                expect(error).toBeNull();
                expect(systemUpFlag).toBe(false);
                finished = true;
            }, { _request: fakeMethods.request });

            waitsFor(function() {
                return finished;
            }, 'calling recEnrichmentChecker method', 100);
        });

        it('Request returns statusCode of 200 - but body string that is not parseable', function () {
            const config = getConfig();
            const fakeMethods = {
                request:  function (url, callback) {
                    return callback(null, { statusCode: 200 }, '{xx1');
                }
            };
            spyOn(fakeMethods, 'request').andCallThrough();


            let finished = false;
            recEnrichmentChecker(log, config, function(error, systemUpFlag) {
                const url = config.terminology.protocol + '://' + config.terminology.host + ':' + config.terminology.port + config.terminology.terminologyPing;
                expect(fakeMethods.request).toHaveBeenCalledWith(url, jasmine.any(Function));
                expect(error).toBeNull();
                expect(systemUpFlag).toBe(false);
                finished = true;
            }, { _request: fakeMethods.request });

            waitsFor(function() {
                return finished;
            }, 'calling recEnrichmentChecker method', 100);
        });

        it('Request returns statusCode of 200 - but an incorrect Body message', function () {
            const config = getConfig();
            const fakeMethods = {
                request:  function (url, callback) {
                    return callback(null, { statusCode: 200 }, '{}');
                }
            };
            spyOn(fakeMethods, 'request').andCallThrough();


            let finished = false;
            recEnrichmentChecker(log, config, function(error, systemUpFlag) {
                const url = config.terminology.protocol + '://' + config.terminology.host + ':' + config.terminology.port + config.terminology.terminologyPing;
                expect(fakeMethods.request).toHaveBeenCalledWith(url, jasmine.any(Function));
                expect(error).toBeNull();
                expect(systemUpFlag).toBe(false);
                finished = true;
            }, { _request: fakeMethods.request });

            waitsFor(function() {
                return finished;
            }, 'calling recEnrichmentChecker method', 100);
        });

    });
});
