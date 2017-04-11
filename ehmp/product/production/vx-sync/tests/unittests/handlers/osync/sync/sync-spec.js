'use strict';

require('../../../../../env-setup');

var request = require('request');
var log = require(global.VX_DUMMIES + 'dummy-logger');
var handler = require(global.VX_HANDLERS + 'osync/sync/sync');
var PublisherRouterDummy = require(global.VX_DUMMIES + 'publisherRouterDummy');
var PublisherDummy = require(global.VX_DUMMIES + 'publisherDummy');

var mockHandlerCallback = {
    callback: function(error, response) {
    }
};

describe('validation unit test', function() {
    describe('validation.handle error conditions for jobs passed in', function() {
        beforeEach(function () {
            spyOn(mockHandlerCallback, 'callback');
        });

        it('error condition: incorrect job type (empty)', function () {
            var done = false;

            runs(function () {
                var job = {};

                var mockConfig = null;
                var mockEnvironment = null;
                handler(log, mockConfig, mockEnvironment, job, function (error, data) {
                    done = true;
                    expect(error).toBe('sync.validate: Could not find job type');
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

        it('error condition: incorrect job type (wrong type)', function () {
            var done = false;

            runs(function () {
                var job = {};
                job.type = 'BOGUS';

                var mockConfig = null;
                var mockEnvironment = null;
                handler(log, mockConfig, mockEnvironment, job, function (error, data) {
                    done = true;
                    expect(error).toBe('sync.validate: job type was not sync');
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

        it('error condition: incorrect job source (empty)', function () {
            var done = false;

            runs(function () {
                var job = {};
                job.type = 'sync';

                var mockConfig = null;
                var mockEnvironment = null;
                handler(log, mockConfig, mockEnvironment, job, function (error, data) {
                    done = true;
                    expect(error).toBe('sync.validate: Could not find job source');
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

        it('error condition: incorrect job source (wrong source)', function () {
            var done = false;

            runs(function () {
                var job = {};
                job.type = 'sync';
                job.source = 'bogus';

                var mockConfig = null;
                var mockEnvironment = null;
                handler(log, mockConfig, mockEnvironment, job, function (error, data) {
                    done = true;
                    expect(error).toBe('sync.validate: job source was not "appointments" , "admissions" or "patient lists"');
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

        it('error condition: incorrect job patients (empty)', function () {
            var done = false;

            runs(function () {
                var job = {};
                job.type = 'sync';
                job.source = 'appointments';

                var mockConfig = null;
                var mockEnvironment = null;
                handler(log, mockConfig, mockEnvironment, job, function (error, data) {
                    done = true;
                    expect(error).toBe('sync.validate: Could not find job patient');
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

        it('error condition: patient missing ien and dfn', function () {
            var done = false;
            var patient = {};

            runs(function () {
                var job = {};
                job.type = 'sync';
                job.source = 'appointments';

                job.patient = patient;

                var mockConfig = null;
                var mockEnvironment = null;
                handler(log, mockConfig, mockEnvironment, job, function (error, data) {
                    done = true;
                    expect(error).toBe('sync.validate: Missing dfn and ien for patient');
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

    describe('validation.handle error conditions for configuration passed in', function() {
        beforeEach(function () {
            spyOn(mockHandlerCallback, 'callback');
        });

        it('error condition: config missing', function () {
            var done = false;
            var patient = {};

            runs(function () {
                var job = {};
                job.type = 'sync';
                job.source = 'appointments';

                patient.ien = '9E7A;1234';
                job.patient = patient;

                var mockConfig = null;
                var mockEnvironment = null;
                handler(log, mockConfig, mockEnvironment, job, function (error, data) {
                    done = true;
                    expect(error).toBe('sync.validateConfig: Configuration cannot be null');
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

        it('error condition: config missing syncUrl', function () {
            var done = false;
            var patient = {};

            runs(function () {
                var job = {};
                job.type = 'sync';
                job.source = 'appointments';

                patient.ien = '9E7A;1234';
                job.patient = patient;

                var mockConfig = {};
                var mockEnvironment = null;
                handler(log, mockConfig, mockEnvironment, job, function (error, data) {
                    done = true;
                    expect(error).toBe('sync.validateConfig: syncUrl cannot be null');
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

    describe('send sync request', function() {
        var mockConfig, mockEnvironment, handlerCallback;

        beforeEach(function() {
            spyOn(request, 'get').andCallFake(function(syncUrl, callback) {
                callback(null, {statusCode: 200}, {syncStatus: {}});
                return {on: function(type, callback) {}};
            });

            mockConfig = {
                syncUrl: "http://IP           /sync/doLoad",
                statusUrl: "http://IP           /sync/status"
            };

            mockEnvironment = {
                metrics: log,
                publisherRouter: new PublisherRouterDummy(log, mockConfig, PublisherDummy)
            };

            handlerCallback = function(error, data) {};
        });

        it('verify pid and priority set correctly when syncPriority is missing from config', function() {
            var job = {type: 'sync', source: 'appointments', siteId: '9E7A', patient: {dfn:'1234'}};

            handler(log, mockConfig, mockEnvironment, job, handlerCallback);

            expect(request.get.calls[1].args[0].url).toBe(mockConfig.syncUrl);
            expect(request.get.calls[1].args[0].qs.pid).toBe('9E7A;1234');
            expect(request.get.calls[1].args[0].qs.priority).toBe(50);
        });

        it('verify icn and priority set correctly when syncPriority is set in config', function() {
            var job = {type: 'sync', source: 'appointments', patient: {ien: '10110V004877'}};
            mockConfig.syncPriority = 80;

            handler(log, mockConfig, mockEnvironment, job, handlerCallback);

            expect(request.get.calls[1].args[0].url).toBe(mockConfig.syncUrl);
            expect(request.get.calls[1].args[0].qs.icn).toBe('10110V004877');
            expect(request.get.calls[1].args[0].qs.priority).toBe(80);
        });

        it('verify priority set correctly when syncPriority is less than 1 and is set in config', function() {
            var job = {type: 'sync', source: 'appointments', patient: {ien: '10110V004877'}};
            mockConfig.syncPriority = -10;

            handler(log, mockConfig, mockEnvironment, job, handlerCallback);

            expect(request.get.calls[1].args[0].url).toBe(mockConfig.syncUrl);
            expect(request.get.calls[1].args[0].qs.icn).toBe('10110V004877');
            expect(request.get.calls[1].args[0].qs.priority).toBe(1);
        });

        it('verify priority set correctly when syncPriority is greater than 100 and is set in config', function() {
            var job = {type: 'sync', source: 'appointments', patient: {ien: '10110V004877'}};
            mockConfig.syncPriority = 200;

            handler(log, mockConfig, mockEnvironment, job, handlerCallback);

            expect(request.get.calls[1].args[0].url).toBe(mockConfig.syncUrl);
            expect(request.get.calls[1].args[0].qs.icn).toBe('10110V004877');
            expect(request.get.calls[1].args[0].qs.priority).toBe(100);
        });
    })
});
