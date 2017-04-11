'use strict';

require('../../../../../env-setup');
var log = require(global.VX_DUMMIES + 'dummy-logger');
var handler = require(global.VX_HANDLERS + 'osync/sync/sync');

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
});
