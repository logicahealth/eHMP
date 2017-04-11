'use strict';
/*global describe, it, before, beforeEach, after, afterEach, spyOn, expect, runs, waitsFor */

require('../../../../../env-setup');
var log = require(global.VX_DUMMIES + 'dummy-logger');
var handler = require(global.VX_HANDLERS + 'osync/store-job-status/store-job-status');

var mockConfig = {
    jds: {
        protocol: 'http',
        host: 'IP_ADDRESS',
        port: 9080,
        "jdsSaveURI": "/user/set/this",
        "jdsGetURI": "/user/get"
    }
};

var mockHandlerCallback = {
    callback: function(error, response) {
    }
};

var mockLogger = require(global.VX_DUMMIES + 'mock-logger');

describe('store-job-status integration test', function() {
    describe('store-job-status.handle', function() {
        beforeEach(function() {
            spyOn(mockHandlerCallback, 'callback');
        });

        it('records a patient as synced in memory', function() {
            var done = false;

            var testData = null;
            var testError = null;

            runs(function() {
                var job = {};
                job.type = 'store-job-status';
                job.source = 'appointments';
                job.patient = {
                    dfn: '1',
                    siteId: '9E7A'
                };
                job.siteId = '9E7A';

                var mockEnvironment = {
                    resultsLog: mockLogger
                };
                handler(log, mockConfig, mockEnvironment, job, function(error, data) {
                    done = true;
                    testData = data;
                    testError = error;
                    mockHandlerCallback.callback();
                });
            });

            waitsFor(function() {
                return done;
            }, 'Callback not called', 5000);

            runs(function() {
                expect(mockHandlerCallback.callback).toHaveBeenCalled();

                expect(testError).toBe(null);
                expect(testData).not.toBe(null);
                expect(testData).not.toBe(undefined);
                expect(testData).not.toBe(false);

                var infoLog = mockLogger.getInfo();
                var expectedLog = '\"siteId\":\"9E7A\",\"patient\":{\"dfn\":\"1\"';
                expect(infoLog).not.toBe(null);
                expect(infoLog).not.toBe(undefined);
                expect(infoLog).toMatch(expectedLog);
            });
        });
    });

});

