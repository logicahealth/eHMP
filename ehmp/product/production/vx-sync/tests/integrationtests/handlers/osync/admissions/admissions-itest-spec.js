'use strict';
/* global describe, it, beforeEach, spyOn, expect, runs, waitsFor */

require('../../../../../env-setup');
var _ = require('underscore');
var logger = require(global.VX_DUMMIES + 'dummy-logger');

// logger = require('bunyan').createLogger({
//     name: 'osync-admissions',
//     level: 'debug'
// });

var handler = require(global.VX_HANDLERS + 'osync/admissions/admissions');

var Router = require(global.VX_DUMMIES + 'publisherRouterDummy');
var Publisher = require(global.VX_DUMMIES + 'publisherDummy');
var Updater = require(global.VX_DUMMIES + 'JobStatusUpdaterDummy');
var VistaClientDummy = require(global.VX_DUMMIES + 'vista-client-dummy');

var wConfig = require(global.VX_ROOT + 'worker-config');

var mockConfig = {
    delay: 5,
    rpcContext: 'HMP SYNCHRONIZATION CONTEXT',
    vistaSites: _.defaults(wConfig.vistaSites, {
        '9E7A': {
            'name': 'panorama',
            'host': 'IP        ',
            'port': PORT,
            'accessCode': 'REDACTED',
            'verifyCode': 'REDACTED',
            'localIP': '127.0.0.1',
            'stationNumber': 500,
            'localAddress': 'localhost',
            'connectTimeout': 3000,
            'sendTimeout': 20000
        },
        'C877': {
            'name': 'kodak',
            'host': 'IP        ',
            'port': PORT,
            'accessCode': 'REDACTED',
            'verifyCode': 'REDACTED',
            'localIP': '127.0.0.1',
            'stationNumber': 500,
            'localAddress': 'localhost',
            'connectTimeout': 3000,
            'sendTimeout': 20000
        }
    })
};

var mockHandlerCallback = {
    callback: function (error, response) {
    }
};

describe('osync-admissions-handler.js', function () {
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
            job.siteId = 'C877';

            var mockPublisher = new Publisher(logger, mockConfig, job.type);
            var environment = {
                vistaClient: new VistaClientDummy(logger, mockConfig, null),
                publisherRouter: new Router(logger, mockConfig, Updater, mockPublisher)
            };

            handler(logger, mockConfig, environment, job, function (error, data) {
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

            expect(testError).toBeFalsy();
        });
    });
});
