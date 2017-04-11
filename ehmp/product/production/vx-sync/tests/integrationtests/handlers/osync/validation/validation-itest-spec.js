'use strict';
/*global describe, it, before, beforeEach, after, afterEach, spyOn, expect, runs, waitsFor */

require('../../../../../env-setup');
var log = require(global.VX_DUMMIES + 'dummy-logger');
var handler = require(global.VX_HANDLERS + 'osync/validation/validation');

var Router = require(global.VX_DUMMIES + 'publisherRouterDummy');
var Publisher = require(global.VX_DUMMIES + 'publisherDummy');
var Updater = require(global.VX_DUMMIES + 'JobStatusUpdaterDummy');

var mockHandlerCallback = {
    callback: function(error, response) {
    }
};

var mockConfig = {
    jds: {
        protocol: 'http',
        host: 'IP        ',
        port: 9080,
        "jdsSaveURI": "/user/set/this",
        "jdsGetURI": "/user/get",
        osyncjobfrequency: 172800000
    }
};

var mockLogger = require(global.VX_DUMMIES + 'mock-logger');

describe('validation handler integration test', function() {
    describe('validation.handle', function() {
        beforeEach(function () {
            spyOn(mockHandlerCallback, 'callback');
        });

        it('valid job', function() {
            var done = false;
            var patient = {};

            var testData = null;
            var testError = null;

            runs(function() {
                var job = {};
                job.type = 'validation';
                job.source = 'appointments';
                job.siteId = '9E7A';

                patient.icn = '1234';
                job.patient = patient;

                var mockEnvironment = {
                    validPatientsLog: mockLogger
                };
                var mockPublisher = new Publisher(log, mockConfig, job.type);
                var mockRouter = new Router(log, mockConfig, Updater, mockPublisher);
                mockEnvironment.publisherRouter = mockRouter;
                handler(log, mockConfig, mockEnvironment, job, function (error, data) {
                    testData = data;
                    testError = error;
                    done = true;
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
                expect(testData.type).toBe('sync');
                expect(testData.source).toBe('appointments');

                var infoLog = mockLogger.getInfo();
                var expectedLog = '\"siteId\":\"9E7A\",\"patient\":{\"icn\":\"1234\"';
                expect(infoLog).not.toBe(null);
                expect(infoLog).not.toBe(undefined);
                expect(infoLog).toMatch(expectedLog);
            });
        });
    });

});
