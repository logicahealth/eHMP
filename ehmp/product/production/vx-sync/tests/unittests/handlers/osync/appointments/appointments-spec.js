'use strict';
/*global describe, it, before, beforeEach, after, afterEach, spyOn, expect, runs, waitsFor */

require('../../../../../env-setup');
var log = require(global.VX_DUMMIES + 'dummy-logger');
// NOTE: be sure next lines are commented out before pushing
// var logUtil = require(global.VX_UTILS + 'log');
// log = logUtil._createLogger({
//     name: 'test',
//     level: 'debug',
//     child: logUtil._createLogger
// });

var _ = require('underscore');
var PublisherRouterDummy = require(global.VX_DUMMIES + 'publisherRouterDummy');
var handler = require(global.VX_HANDLERS + 'osync/appointments/appointments');
var osyncJobUtils = require(global.OSYNC_UTILS + 'osync-job-utils');

var mockHandlerCallback = {
    callback: function(error, response) {}
};

describe('appointment-handler unit test', function() {
    describe('appointment.handle', function() {
        beforeEach(function() {
            spyOn(mockHandlerCallback, 'callback');
        });

        it('error condition: missing job type', function() {
            var done = false;
            var calledError;

            runs(function() {
                var job = {};

                var mockConfig = null;
                var mockEnvironment = {};
                handler(log, mockConfig, mockEnvironment, job, function(error) {
                    calledError = error;
                    done = true;
                    mockHandlerCallback.callback();
                });
            });

            waitsFor(function() {
                return done;
            }, 'Callback not called', 100);

            runs(function() {
                expect(calledError).toBe('appointments.validate: Invalid job type for appointments handler');
                expect(mockHandlerCallback.callback).toHaveBeenCalled();
            });
        });

        it('error condition: incorrect job type', function() {
            var done = false;
            var calledError;

            runs(function() {
                var job = {};
                job.type = 'cds-xform-vpr';

                var mockConfig = null;
                var mockEnvironment = {};
                handler(log, mockConfig, mockEnvironment, job, function(error) {
                    calledError = error;
                    done = true;
                    mockHandlerCallback.callback();
                });
            });

            waitsFor(function() {
                return done;
            }, 'Callback not called', 100);

            runs(function() {
                expect(calledError).toBe('appointments.validate: Invalid job type for appointments handler');
                expect(mockHandlerCallback.callback).toHaveBeenCalled();
            });
        });

        it('error condition: missing siteId', function() {
            var done = false;
            var calledError;

            runs(function() {
                var job = {};
                job.type = 'appointments';

                var mockConfig = null;
                var mockEnvironment = {};
                handler(log, mockConfig, mockEnvironment, job, function(error) {
                    calledError = error;
                    done = true;
                    mockHandlerCallback.callback();
                });
            });

            waitsFor(function() {
                return done;
            }, 'Callback not called', 100);

            runs(function() {
                expect(mockHandlerCallback.callback).toHaveBeenCalled();
                expect(calledError).toBe('appointments.validate: Missing site in job');
            });
        });

        it('error condition: missing clinic', function() {
            var done = false;
            var calledError;

            runs(function() {
                var job = {};
                job.type = 'appointments';
                job.siteId = '9E7A';

                var mockConfig = null;
                var mockEnvironment = {};
                handler(log, mockConfig, mockEnvironment, job, function(error) {
                    calledError = error;
                    done = true;
                    mockHandlerCallback.callback();
                });
            });

            waitsFor(function() {
                return done;
            }, 'Callback not called', 100);

            runs(function() {
                expect(mockHandlerCallback.callback).toHaveBeenCalled();
                expect(calledError).toBe('appointments.validate: Missing clinic in job');
            });
        });

        it('normal path: handler executes job successfully', function(done) {
            var meta = {
                type: 'appointments',
                referenceInfo: {
                    sessionId: 'TEST',
                    utilityType: 'Osync Appointments Handler Unit Test'
                }
            };

            var job = osyncJobUtils.createAppointmentsJob(log, meta);
            job.siteId = '9E7A';
            job.clinic = '123';

            var vistaStr = '12345^3170126.15^TEST 1^104^\r\n25^3170126.15^AUDIOLOGY^64^\r\n';
            var mockConfig = {
                appointmentsOptions: {
                    daysInFuture: 1
                },
                vistaSites: {
                    '9E7A': {}
                }
            };
            var mockEnvironment = {
                rpcUtil: {
                    standardRPCCall: function(log, rpcConfig, rpcName, startDate, endDate, clinic, parse, callback) {
                        callback(null, vistaStr);
                    }
                },
                publisherRouter: new PublisherRouterDummy(log, mockConfig, null, null)
            };

            var resultJobs = [];
            spyOn(mockEnvironment.publisherRouter, 'publish').andCallFake(function(job, callback) {
                resultJobs.push(job);
                callback();
            });

            handler(log, mockConfig, mockEnvironment, job, function(error) {
                expect(error).toBeFalsy();
                expect(resultJobs).toContain(jasmine.objectContaining({
                    'type': 'sync',
                    'jpid': jasmine.any(String),
                    'referenceInfo': {
                        'sessionId': 'TEST',
                        'utilityType': 'Osync Appointments Handler Unit Test'
                    },
                    'source': 'appointments',
                    'patient': {
                        'dfn': '12345',
                        'date': '3170126.15',
                        'locationName': 'TEST 1',
                        'locationIen': '104'
                    },
                    'siteId': '9E7A'
                }));
                expect(resultJobs).toContain(jasmine.objectContaining({
                    'type': 'sync',
                    'jpid': jasmine.any(String),
                    'referenceInfo': {
                        'sessionId': 'TEST',
                        'utilityType': 'Osync Appointments Handler Unit Test'
                    },
                    'source': 'appointments',
                    'patient': {
                        'dfn': '25',
                        'date': '3170126.15',
                        'locationName': 'AUDIOLOGY',
                        'locationIen': '64'
                    },
                    'siteId': '9E7A'
                }));
                done();
            });

        });
    });
});