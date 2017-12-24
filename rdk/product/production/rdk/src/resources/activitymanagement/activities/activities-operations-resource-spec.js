'use strict';

var _ = require('lodash');
var activities = require('./activities-operations-resource');
var bunyan = require('bunyan');
var cdsSubsystem = require('../../../subsystems/cds/cds-subsystem');
var rdk = require('../../../core/rdk');
var http = rdk.utils.http;

// Create a logger and stub only the logging functions
var logger = bunyan.createLogger({
    name: 'activities-operations-resource-spec'
});
// Create spy for logger.error function
var logErrorSpy = sinon.spy(logger, 'error');
// Stub the other logger functions
sinon.stub(logger, 'trace');
sinon.stub(logger, 'debug');
sinon.stub(logger, 'info');
sinon.stub(logger, 'warn');
sinon.stub(logger, 'fatal');

var user = {
    firstname: 'FIRST',
    lastname: 'LAST',
    ssn: '000000000',
    facility: 'SITE',
    site: 'PANORAMA',
    division: '500',
    duz: {
        'PANORAMA': '500'
    }
};

//subsystemFactory.registerSubsystem(app, 'cds', cdsSubsystem);

describe('Activity Operations Resource', function() {

    describe('getCdsIntentResults tests', function() {
        var app, stubbedCds, req, res;

        beforeEach(function() {
            // Reset error spy to ensure spy.called reports only for the current test
            logErrorSpy.reset();
            // Stub the CDS subsystem here to avoid conflict with other test suites
            stubbedCds = sinon.stub(cdsSubsystem);
            app = {
                config: {
                },
                logger: logger,
                subsystems: {
                    cds: stubbedCds
                }
            };
            req = {
                app: app,
                body: {},
                interceptorResults: {
                    'patientIdentifiers': {
                        'icn': '10108V420871',
                        'dfn': '3',
                    },
                    'jdsFilter': {}
                },
                logger: logger,
                audit: {}
            };
            res = {
                send: function() {},
                rdkSend: function(data) {},
                status: function(responseStatus) {
                    this.statusCode = responseStatus;
                    return this;
                }
            };
            _.set(req, 'session.user', user);
        });

        it('Receives bad request for malformed request body', function (done) {
            var malformedReq = {
                app: app,
                body: 'This should be an object',
                interceptorResults: {
                    'patientIdentifiers': {
                        'icn': '10108V420871',
                        'dfn': '3',
                    },
                    'jdsFilter': {}
                },
                logger: logger,
                audit: {}
            };
            sinon.stub(http, 'post').callsFake(function(config, callback) {
                callback('Call failed', null);
            });
            activities.getCdsIntentResults(malformedReq, res);
            expect(res.statusCode).to.eql(400);
            expect(logErrorSpy.called);
            done();
        });

        it('Receives internal server error on CDS Invocation Post error (string)', function (done) {
            sinon.stub(http, 'post').callsFake(function(config, callback) {
                callback('Call failed', null);
            });
            activities.getCdsIntentResults(req, res);
            expect(res.statusCode).to.eql(500);
            expect(logErrorSpy.called);
            done();
        });

        it('Receives internal server error on CDS Invocation Post error (document)', function (done) {
            sinon.stub(http, 'post').callsFake(function(config, callback) {
                callback({error: 'Call failed'}, null);
            });
            activities.getCdsIntentResults(req, res);
            expect(res.statusCode).to.eql(500);
            expect(logErrorSpy.called);
            done();
        });

        it('Receives internal server error on invalid response status code', function (done) {
            var badResult = {
                statusCode: 503
            };
            sinon.stub(http, 'post').callsFake(function(config, callback) {
                callback(null, badResult);
            });
            activities.getCdsIntentResults(req, res);
            expect(res.statusCode).to.eql(500);
            expect(logErrorSpy.called);
            done();
        });

        it('Receives internal server error on undefined body', function (done) {
            var badResult = {
                statusCode: 200
            };

            sinon.stub(http, 'post').callsFake(function(config, callback) {
                callback(null, badResult);
            });
            activities.getCdsIntentResults(req, res);
            expect(res.statusCode).to.eql(500);
            expect(logErrorSpy.called);
            done();
        });

        it('Receives internal server error on missing body.status', function (done) {
            var body = {
            };
            var badResult = {
                statusCode: 200,
                body: body
            };

            sinon.stub(http, 'post').callsFake(function(config, callback) {
                callback(null, badResult, body);
            });
            activities.getCdsIntentResults(req, res);
            expect(res.statusCode).to.eql(500);
            expect(logErrorSpy.called);
            done();
        });

        it('Receives internal server error on missing body.status.code', function (done) {
            var body = {
                status: {
                }
            };
            var badResult = {
                statusCode: 200,
                body: body
            };

            sinon.stub(http, 'post').callsFake(function(config, callback) {
                callback(null, badResult, body);
            });
            activities.getCdsIntentResults(req, res);
            expect(res.statusCode).to.eql(500);
            expect(logErrorSpy.called);
            done();
        });

        it('Receives internal server error on non-zero body.status.code', function (done) {
            var body = {
                status: {
                    code: '1'
                }
            };
            var badResult = {
                statusCode: 200,
                body: body
            };

            sinon.stub(http, 'post').callsFake(function(config, callback) {
                callback(null, badResult, body);
            });
            activities.getCdsIntentResults(req, res);
            expect(res.statusCode).to.eql(500);
            expect(logErrorSpy.called);
            done();
        });

        it('Happy path for intent retrieval', function (done) {
            var body = {
                status: {
                    code: '0'
                }
            };
            var goodResult = {
                statusCode: 200,
                body: body
            };

            sinon.stub(http, 'post').callsFake(function(config, callback) {
                callback(null, goodResult, body);
            });
            activities.getCdsIntentResults(req, res);
            expect(res.statusCode).to.eql(200);
            done();
        });
    });
});
