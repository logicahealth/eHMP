'use strict';
/*global describe, it, before, beforeEach, after, afterEach, spyOn, expect, runs, waitsFor */

require('../../../../../env-setup');
var log = require(global.VX_DUMMIES + 'dummy-logger');
var handler = require(global.VX_HANDLERS + 'osync/admissions/admissions');

var Router = require(global.VX_DUMMIES + 'publisherRouterDummy');
var Publisher = require(global.VX_DUMMIES + 'publisherDummy');
var Updater = require(global.VX_DUMMIES + 'JobStatusUpdaterDummy');

var mockConfig = {
    delay: 5,
    rpcContext: "HMP UI CONTEXT",
    "vistaSites": {
        "9E7A": {
            "name": "panorama",
            "host": "IP_ADDRESS",
            "port": 9210,
            "accessCode": "PW",
            "verifyCode": "PW",
            "localIP": "127.0.0.1",
            "stationNumber": 500,
            "localAddress": "localhost",
            "connectTimeout": 3000,
            "sendTimeout": 20000
        },
        "C877": {
            "name": "kodak",
            "host": "IP_ADDRESS",
            "port": 9210,
            "accessCode": "PW",
            "verifyCode": "PW",
            "localIP": "127.0.0.1",
            "stationNumber": 500,
            "localAddress": "localhost",
            "connectTimeout": 3000,
            "sendTimeout": 20000
        }
    }
};

var mockHandlerCallback = {
    callback: function(error, response) {
    }
};

describe('admissions-handler integration test', function() {
    beforeEach(function () {
        spyOn(mockHandlerCallback, 'callback');
    });

    it('should call without error', function () {
        var done = false;
        var testData = null;
        var testError = null;

        runs(function () {
            var job = {};
            job.type = 'admissions';

            var mockEnvironment = {};
            var mockPublisher = new Publisher(log, mockConfig, job.type);
            var mockRouter = new Router(log, mockConfig, Updater, mockPublisher);
            mockEnvironment.publisherRouter = mockRouter;
            handler(log, mockConfig, mockEnvironment, job, function (error, data) {
                done = true;
                testData = data;
                testError = error;
                mockHandlerCallback.callback();
            });
        });

        waitsFor(function () {
            return done;
        }, 'Callback not called', 50000);

        runs(function () {
            expect(mockHandlerCallback.callback).toHaveBeenCalled();

            expect(testError).toBe(undefined);
        });
    });
});
