'use strict';
/*global describe, it, before, beforeEach, after, afterEach, spyOn, expect, runs, waitsFor */

require('../../../../../env-setup');
var log = require(global.VX_DUMMIES + 'dummy-logger');
var handler = require(global.VX_HANDLERS + 'osync/opportunistic-sync-request/opportunistic-sync-request');

var mockHandlerCallback = {
    callback: function(error, response) {
    }
};

describe('opportunistic-request-handler unit test', function() {
    describe('opportunistic-sync-request.handle', function() {
        beforeEach(function () {
            spyOn(mockHandlerCallback, 'callback');
        });

        it('error condition: no jobs to publish', function () {
            var done = false;

            runs(function () {
                var job = {};

                var mockConfig = {
                    "beanstalk": {
                        "jobs": {
                            "activeUsers": false,
                            "appointments": false,
                            "admissions": false
                        }
                    }
                };
                var mockEnvironment = null;
                handler(log, mockConfig, mockEnvironment, function () {
                    done = true;
                    mockHandlerCallback.callback();
                });
            });

            waitsFor(function () {
                return done;
            }, 'Callback not called', 100);

            runs(function () {
                expect(mockHandlerCallback.callback).toHaveBeenCalled();
            });
        });
    });
});
