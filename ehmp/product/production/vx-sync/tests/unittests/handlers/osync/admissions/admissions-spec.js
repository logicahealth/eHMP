'use strict';
/* global describe, it, beforeEach, spyOn, expect, runs, waitsFor */

require('../../../../../env-setup');
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

var mockHandlerCallback = {
    callback: function (error, response) {
    }
};

describe('osync-admission-handler.js', function () {
    describe('admission.handle', function () {
        // globally used variables
        var job = {};
        var mockConfig = null;
        var mockEnvironment = null;
        var mockRPCConfig = {
            'name': "panorama",
            'host': '10.2.2.101',
            'port': 9210,
            'accessCode': 'ep1234',
            'verifyCode': 'ep1234!!',
            'localIP': '127.0.0.1',
            'stationNumber': 500,
            'localAddress': 'localhost',
            'connectTimeout': 3000,
            'sendTimeout': 20000
        };

        beforeEach(function () {
            spyOn(mockHandlerCallback, 'callback');
        });

        it('error condition: no job type passed', function () {
            var done = false;

            runs(function () {


                handler(logger, mockConfig, mockEnvironment, job, function (err) {
                    expect(err).toEqual({
                        'type': 'fatal-exception',
                        'message': 'admissions.validate: Could not find job type'
                    });
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

        it('error condition: empty string for job type passed', function () {
            var done = false;

            runs(function () {
                job.type = '';

                handler(logger, mockConfig, mockEnvironment, job, function (err) {
                    expect(err).toEqual({
                        'type': 'fatal-exception',
                        'message': 'admissions.validate: Could not find job type'
                    });
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

        it('error condition: wrong job type passed', function () {
            var done = false;

            runs(function () {
                job.type = 'cds-xform-vpr';

                handler(logger, mockConfig, mockEnvironment, job, function (err) {
                    expect(err).toEqual({
                        'type': 'fatal-exception',
                        'message': 'admissions.validate: job type was not admissions'
                    });
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

        it('error condition: no site passed', function () {
            var done = false;

            runs(function () {
                job.type = 'admissions';

                handler(logger, mockConfig, mockEnvironment, job, function (err) {
                    expect(err).toEqual({
                        'type': 'fatal-exception',
                        'message': 'admissions.validate: Could not find job site'
                    });
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

        it('error condition: empty string for site passed', function () {
            var done = false;

            runs(function () {
                job.type = 'admissions';
                job.siteId = '';

                handler(logger, mockConfig, mockEnvironment, job, function (err) {
                    expect(err).toEqual({
                        'type': 'fatal-exception',
                        'message': 'admissions.validate: Could not find job site'
                    });
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

        it('error condition: null configuration passed', function () {
            var done = false;

            runs(function () {
                job.type = 'admissions';
                job.siteId = 'ASDF';

                handler(logger, mockConfig, mockEnvironment, job, function (err) {
                    expect(err).toEqual({
                        'type': 'fatal-exception',
                        'message': 'admissions.handle: Invalid configuration passed'
                    });
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

        it('error condition: null vistaSites configuration passed', function () {
            var done = false;

            runs(function () {
                job.type = 'admissions';
                job.siteId = 'ASDF';

                mockConfig = {};
                mockConfig.vistaSites = null;

                handler(logger, mockConfig, mockEnvironment, job, function (err) {
                    expect(err).toEqual({
                        'type': 'fatal-exception',
                        'message': 'admissions.handle: No VistA site configuration found'
                    });
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

        it('error condition: VistA site not found in config', function () {
            var done = false;

            runs(function () {
                job.type = 'admissions';
                job.siteId = 'ASDF';

                mockConfig = {};
                mockConfig.vistaSites = {};
                mockConfig.vistaSites['9E7A'] = mockRPCConfig;

                handler(logger, mockConfig, mockEnvironment, job, function (err) {
                    expect(err).toEqual({
                        'type': 'fatal-exception',
                        'message': 'admissions.handle: No RPC configuration for site ASDF'
                    });
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

        it('error condition: rpcConfig not found in config', function () {
            var done = false;

            runs(function () {
                job.type = 'admissions';
                job.siteId = 'ASDF';

                mockConfig = {};
                mockConfig.vistaSites = {};
                mockConfig.vistaSites['ASDF'] = mockRPCConfig;

                handler(logger, mockConfig, mockEnvironment, job, function (err) {
                    expect(err).toEqual({
                        'type': 'fatal-exception',
                        'message': 'admissions.handle: No RPC context found in configuration'
                    });
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
    describe('admission.handle: Happy paths', function () {
        // globally used variables
        var job = {};
        var mockConfig = {};
        mockConfig.vistaSites = {};

        var mockRPCConfig = {
            'name': "panorama",
            'host': '10.2.2.101',
            'port': 9210,
            'accessCode': 'ep1234',
            'verifyCode': 'ep1234!!',
            'localIP': '127.0.0.1',
            'stationNumber': 500,
            'localAddress': 'localhost',
            'connectTimeout': 3000,
            'sendTimeout': 20000
        };

        beforeEach(function () {
            spyOn(mockHandlerCallback, 'callback');
        });

        it('Happy path: correct job sent to handler (numeric site)', function () {
            var done = false;

            runs(function () {
                job.type = 'admissions';
                job.siteId = '1234';

                mockConfig.vistaSites['1234'] = mockRPCConfig;
                mockConfig.rpcContext = 'HMP SYNCHRONIZATION CONTEXT'

                var mockPublisher = new Publisher(logger, mockConfig, job.type);
                var environment = {
                    vistaClient: new VistaClientDummy(logger, mockConfig, null),
                    publisherRouter: new Router(logger, mockConfig, Updater, mockPublisher)
                };

                handler(logger, mockConfig, environment, job, function (err) {
                    expect(err).toBeFalsy();
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

        it('Happy path: correct job sent to handler (mixed site)', function () {
            var done = false;

            runs(function () {
                job.type = 'admissions';
                job.siteId = '9E7A';

                mockConfig.vistaSites['9E7A'] = mockRPCConfig;
                mockConfig.rpcContext = 'HMP SYNCHRONIZATION CONTEXT'

                var mockPublisher = new Publisher(logger, mockConfig, job.type);
                var environment = {
                    vistaClient: new VistaClientDummy(logger, mockConfig, null),
                    publisherRouter: new Router(logger, mockConfig, Updater, mockPublisher)
                };

                handler(logger, mockConfig, environment, job, function (err) {
                    expect(err).toBeFalsy();
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

        it('Happy path: correct job sent to handler (leading zero fully numeric site)', function () {
            var done = false;

            runs(function () {
                job.type = 'admissions';
                job.siteId = '0042';

                mockConfig.vistaSites['0042'] = mockRPCConfig;
                mockConfig.rpcContext = 'HMP SYNCHRONIZATION CONTEXT'

                var mockPublisher = new Publisher(logger, mockConfig, job.type);
                var environment = {
                    vistaClient: new VistaClientDummy(logger, mockConfig, null),
                    publisherRouter: new Router(logger, mockConfig, Updater, mockPublisher)
                };

                handler(logger, mockConfig, environment, job, function (err) {
                    expect(err).toBeFalsy();
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

        it('Happy path: correct job sent to handler (leading zero mixed site)', function () {
            var done = false;

            runs(function () {
                job.type = 'admissions';
                job.siteId = '0AF2';

                mockConfig.vistaSites['0AF2'] = mockRPCConfig;
                mockConfig.rpcContext = 'HMP SYNCHRONIZATION CONTEXT'

                var mockPublisher = new Publisher(logger, mockConfig, job.type);
                var environment = {
                    vistaClient: new VistaClientDummy(logger, mockConfig, null),
                    publisherRouter: new Router(logger, mockConfig, Updater, mockPublisher)
                };

                handler(logger, mockConfig, environment, job, function (err) {
                    expect(err).toBeFalsy();
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
