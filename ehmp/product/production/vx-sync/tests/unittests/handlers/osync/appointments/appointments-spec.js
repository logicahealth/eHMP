'use strict';
/*global describe, it, before, beforeEach, after, afterEach, spyOn, expect, runs, waitsFor */

require('../../../../../env-setup');
var log = require(global.VX_DUMMIES + 'dummy-logger');
var handler = require(global.VX_HANDLERS + 'osync/appointments/appointments');

var mockHandlerCallback = {
    callback: function(error, response) {
    }
};

describe('appointment-handler unit test', function() {
    describe('appointment.handle', function() {
        beforeEach(function() {
            spyOn(mockHandlerCallback, 'callback');
        });

        it('error condition: incorrect job type', function() {
            var done = false;

            runs(function () {
                var job = {};

                var mockConfig = null;
                var mockEnvironment = null;
                handler(log, mockConfig, mockEnvironment, job, function() {
                    done = true;
                    mockHandlerCallback.callback();
                });
            });

            waitsFor(function() {
                return done;
            }, 'Callback not called', 100);

            runs(function() {
                expect(mockHandlerCallback.callback).toHaveBeenCalled();
            });
        });

        it('error condition: incorrect job type', function() {
            var done = false;

            runs(function() {
                var job = {};
                job.type = 'cds-xform-vpr';

                var mockConfig = null;
                var mockEnvironment = null;
                handler(log, mockConfig, mockEnvironment, job, function() {
                    done = true;
                    mockHandlerCallback.callback();
                });
            });

            waitsFor(function() {
                return done;
            }, 'Callback not called', 100);

            runs(function() {
                expect(mockHandlerCallback.callback).toHaveBeenCalled();
            });
        });
    });
});
