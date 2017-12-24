'use strict';
/* global describe, it, beforeEach, spyOn, expect, runs, waitsFor */

require('../../../../../env-setup');
var logger = require(global.VX_DUMMIES + 'dummy-logger');
// NOTE: be sure next lines are commented out before pushing
// var logUtil = require(global.VX_UTILS + 'log');
// var logger = logUtil._createLogger({
//     name: 'osync-admissions',
//     level: 'debug',
//     child: logUtil._createLogger
// });

var handler = require(global.VX_HANDLERS + 'osync/admissions/admissions');
var Router = require(global.VX_DUMMIES + 'publisherRouterDummy');
var Publisher = require(global.VX_DUMMIES + 'publisherDummy');
var Updater = require(global.VX_DUMMIES + 'JobStatusUpdaterDummy');
var VistaClientDummy = require(global.VX_DUMMIES + 'vista-client-dummy');

var mockHandlerCallback = {
    callback: function(error, response) {}
};

describe('osync-admission-handler.js', function() {
    describe('admission.handle', function() {
        // globally used variables
        var job = {};
        var mockConfig = null;
        var mockEnvironment = null;
        var mockRPCConfig = {
            'name': "panorama",
            'host': 'IP        ',
            'port': PORT,
            'accessCode': 'USER  ',
            'verifyCode': 'PW      ',
            'localIP': '127.0.0.1',
            'stationNumber': 500,
            'localAddress': 'localhost',
            'connectTimeout': 3000,
            'sendTimeout': 20000
        };

        beforeEach(function() {
            spyOn(mockHandlerCallback, 'callback');
        });

        it('error condition: no job type passed', function() {
            var done = false;

            runs(function() {


                handler(logger, mockConfig, mockEnvironment, job, function(err) {
                    expect(err).toEqual({
                        'type': 'fatal-exception',
                        'message': 'admissions.validate: Could not find job type'
                    });
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

        it('error condition: empty string for job type passed', function() {
            var done = false;

            runs(function() {
                job.type = '';

                handler(logger, mockConfig, mockEnvironment, job, function(err) {
                    expect(err).toEqual({
                        'type': 'fatal-exception',
                        'message': 'admissions.validate: Could not find job type'
                    });
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

        it('error condition: wrong job type passed', function() {
            var done = false;

            runs(function() {
                job.type = 'cds-xform-vpr';

                handler(logger, mockConfig, mockEnvironment, job, function(err) {
                    expect(err).toEqual({
                        'type': 'fatal-exception',
                        'message': 'admissions.validate: job type was not admissions'
                    });
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

        it('error condition: no site passed', function() {
            var done = false;

            runs(function() {
                job.type = 'admissions';

                handler(logger, mockConfig, mockEnvironment, job, function(err) {
                    expect(err).toEqual({
                        'type': 'fatal-exception',
                        'message': 'admissions.validate: Could not find job site'
                    });
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

        it('error condition: empty string for site passed', function() {
            var done = false;

            runs(function() {
                job.type = 'admissions';
                job.siteId = '';

                handler(logger, mockConfig, mockEnvironment, job, function(err) {
                    expect(err).toEqual({
                        'type': 'fatal-exception',
                        'message': 'admissions.validate: Could not find job site'
                    });
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

        it('error condition: null configuration passed', function() {
            var done = false;

            runs(function() {
                job.type = 'admissions';
                job.siteId = 'ASDF';

                handler(logger, mockConfig, mockEnvironment, job, function(err) {
                    expect(err).toEqual({
                        'type': 'fatal-exception',
                        'message': 'admissions.handle: Invalid configuration passed'
                    });
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

        it('error condition: null vistaSites configuration passed', function() {
            var done = false;

            runs(function() {
                job.type = 'admissions';
                job.siteId = 'ASDF';

                mockConfig = {};
                mockConfig.vistaSites = null;

                handler(logger, mockConfig, mockEnvironment, job, function(err) {
                    expect(err).toEqual({
                        'type': 'fatal-exception',
                        'message': 'admissions.handle: No VistA site configuration found'
                    });
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

        it('error condition: VistA site not found in config', function() {
            var done = false;

            runs(function() {
                job.type = 'admissions';
                job.siteId = 'ASDF';

                mockConfig = {};
                mockConfig.vistaSites = {};
                mockConfig.vistaSites['SITE'] = mockRPCConfig;

                handler(logger, mockConfig, mockEnvironment, job, function(err) {
                    expect(err).toEqual({
                        'type': 'fatal-exception',
                        'message': 'admissions.handle: No RPC configuration for site ASDF'
                    });
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

        it('error condition: rpcConfig not found in config', function() {
            var done = false;

            runs(function() {
                job.type = 'admissions';
                job.siteId = 'ASDF';

                mockConfig = {};
                mockConfig.vistaSites = {};
                mockConfig.vistaSites['ASDF'] = mockRPCConfig;

                handler(logger, mockConfig, mockEnvironment, job, function(err) {
                    expect(err).toEqual({
                        'type': 'fatal-exception',
                        'message': 'admissions.handle: No RPC context found in configuration'
                    });
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
    describe('admission.handle: Happy paths', function() {
        // globally used variables
        var job = {};
        var mockConfig = {};
        mockConfig.vistaSites = {};

        var mockRPCConfig = {
            'name': "panorama",
            'host': 'IP        ',
            'port': PORT,
            'accessCode': 'USER  ',
            'verifyCode': 'PW      ',
            'localIP': '127.0.0.1',
            'stationNumber': 500,
            'localAddress': 'localhost',
            'connectTimeout': 3000,
            'sendTimeout': 20000
        };

        beforeEach(function() {
            spyOn(mockHandlerCallback, 'callback');
        });

        it('Happy path: correct job sent to handler (numeric site)', function() {
            var done = false;

            runs(function() {
                job.type = 'admissions';
                job.siteId = '1234';

                mockConfig.vistaSites['1234'] = mockRPCConfig;
                mockConfig.rpcContext = 'HMP SYNCHRONIZATION CONTEXT';

                var mockPublisher = new Publisher(logger, mockConfig, job.type);
                var environment = {
                    vistaClient: new VistaClientDummy(logger, mockConfig, null),
                    publisherRouter: new Router(logger, mockConfig, Updater, mockPublisher)
                };

                handler(logger, mockConfig, environment, job, function(err) {
                    expect(err).toBeFalsy();
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

        it('Happy path: correct job sent to handler (mixed site)', function() {
            var done = false;

            runs(function() {
                job.type = 'admissions';
                job.siteId = 'SITE';

                mockConfig.vistaSites['SITE'] = mockRPCConfig;
                mockConfig.rpcContext = 'HMP SYNCHRONIZATION CONTEXT';

                var mockPublisher = new Publisher(logger, mockConfig, job.type);
                var environment = {
                    vistaClient: new VistaClientDummy(logger, mockConfig, null),
                    publisherRouter: new Router(logger, mockConfig, Updater, mockPublisher)
                };

                handler(logger, mockConfig, environment, job, function(err) {
                    expect(err).toBeFalsy();
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

        it('Happy path: correct job sent to handler (leading zero fully numeric site)', function() {
            var done = false;

            runs(function() {
                job.type = 'admissions';
                job.siteId = '0042';

                mockConfig.vistaSites['0042'] = mockRPCConfig;
                mockConfig.rpcContext = 'HMP SYNCHRONIZATION CONTEXT';

                var mockPublisher = new Publisher(logger, mockConfig, job.type);
                var environment = {
                    vistaClient: new VistaClientDummy(logger, mockConfig, null),
                    publisherRouter: new Router(logger, mockConfig, Updater, mockPublisher)
                };

                handler(logger, mockConfig, environment, job, function(err) {
                    expect(err).toBeFalsy();
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

        it('Happy path: correct job sent to handler (leading zero mixed site)', function() {
            var done = false;

            runs(function() {
                job.type = 'admissions';
                job.siteId = '0AF2';

                mockConfig.vistaSites['0AF2'] = mockRPCConfig;
                mockConfig.rpcContext = 'HMP SYNCHRONIZATION CONTEXT';

                var mockPublisher = new Publisher(logger, mockConfig, job.type);
                var environment = {
                    vistaClient: new VistaClientDummy(logger, mockConfig, null),
                    publisherRouter: new Router(logger, mockConfig, Updater, mockPublisher)
                };

                handler(logger, mockConfig, environment, job, function(err) {
                    expect(err).toBeFalsy();
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

        it('Happy path: correct jobs generated', function(done) {
            var resultJobs = [];

            runs(function() {
                job.type = 'admissions';
                job.siteId = '1234';
                job.referenceInfo = {
                    requestId: 'admissions-requestId',
                    sessionId: 'admissions-sessionId'
                };

                mockConfig.vistaSites['1234'] = mockRPCConfig;
                mockConfig.rpcContext = 'HMP SYNCHRONIZATION CONTEXT';

                var mockPublisher = new Publisher(logger, mockConfig, job.type);
                var environment = {
                    vistaClient: new VistaClientDummy(logger, mockConfig, null),
                    publisherRouter: new Router(logger, mockConfig, Updater, mockPublisher)
                };

                var vistaStr = '12345^20170131120000^TEST^12^123^\r\n54321^20170131120000^TEST2^21^321^\r\n';
                environment.vistaClient._setFetchResponseData(null, vistaStr);

                spyOn(environment.publisherRouter, 'publish').andCallFake(function(job, callback) {
                    resultJobs.push(job);
                    callback();
                });

                handler(logger, mockConfig, environment, job, function(err) {
                    expect(err).toBeFalsy();
                    expect(resultJobs).toContain(jasmine.objectContaining({
                        type: 'sync',
                        referenceInfo: {
                            requestId: 'admissions-requestId',
                            sessionId: 'admissions-sessionId'
                        },
                        source: 'admissions',
                        patient: {
                            dfn: '12345',
                            date: '20170131120000',
                            locationName: 'TEST',
                            roomBed: '12',
                            locationIen: '123'
                        },
                        siteId: '1234'
                    }));
                    expect(resultJobs).toContain(jasmine.objectContaining({
                        type: 'sync',
                        referenceInfo: {
                            requestId: 'admissions-requestId',
                            sessionId: 'admissions-sessionId'
                        },
                        source: 'admissions',
                        patient: {
                            dfn: '54321',
                            date: '20170131120000',
                            locationName: 'TEST2',
                            roomBed: '21',
                            locationIen: '321'
                        },
                        siteId: '1234'
                    }));
                    done();
                });
            });
        });
    });
});
