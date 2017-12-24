'use strict';

var _ = require('lodash');
var bunyan = require('bunyan');
var trackerResource = require('./tracker-resource');
var rdk = require('../../core/rdk');
var httpUtil = rdk.utils.http;

describe('Tracker resource', function() {
    describe('getResourceConfig', function() {
        it('returns 1 item', function() {
            var resourceConfig = trackerResource.getResourceConfig();
            expect(resourceConfig).to.have.length(1);
        });
        it('is not patient centric', function() {
            var resourceConfig = trackerResource.getResourceConfig();
            expect(resourceConfig[0].isPatientCentric).to.be.false();
        });
    });

    describe('postTracker', function() {
        it('logs to RDK if there is no baseUrl', function() {
            var logger = sinon.stub(bunyan.createLogger({
                name: 'tracker-spec.js'
            }));
            var req = {};
            var res = {};
            _.set(req, 'app.config.UAtracker', {});
            _.set(req, 'logger', logger);
            _.set(req, 'body', {
                screenName: 'abc'
            });
            res.status = function(statusCode) {
                expect(statusCode).to.equal(200);
                return this;
            };
            res.rdkSend = function(body) {
                expect(body.status).to.equal(200);
                expect(logger.info.calledWithMatch({
                    tracker: sinon.match.object
                })).to.be.true();
            };
            trackerResource._postTracker(req, res);
        });
        it('sends a POST request when UAtracker.baseUrl is set', function() {
            var logger = sinon.stub(bunyan.createLogger({
                name: 'tracker-spec.js'
            }));
            var req = {};
            var res = {};
            _.set(req, 'app.config.UAtracker.baseUrl', 'google.com');
            _.set(req, 'app.config.UAtracker.url', '/xpolog');
            _.set(req, 'logger', logger);
            _.set(req, 'body', {
                screenName: 'abc',
                bad: 'def'
            });
            res.status = function(statusCode) {
                expect(statusCode).to.equal(200);
                return this;
            };
            res.rdkSend = function(body) {
                expect(body.status).to.equal(200);
                expect(logger.info.called).to.be.false();
            };

            sinon.stub(httpUtil, 'post', function(options, callback) {
                expect(options).to.eql({
                    logger: logger,
                    body: {
                        screenName: 'abc'
                    },
                    baseUrl: req.app.config.UAtracker.baseUrl,
                    url: '/xpolog'
                });
                var response = {
                    statusCode: 200
                };
                return callback(null, response);
            });

            trackerResource._postTracker(req, res);
        });
        it('logs to RDK when the POST request fails', function() {
            var logger = sinon.stub(bunyan.createLogger({
                name: 'tracker-spec.js'
            }));
            var req = {};
            var res = {};
            _.set(req, 'app.config.UAtracker.baseUrl', 'google.com');
            _.set(req, 'app.config.UAtracker.url', '/xpolog');
            _.set(req, 'logger', logger);
            _.set(req, 'body', {
                screenName: 'abc',
                bad: 'def'
            });
            res.status = function(statusCode) {
                expect(statusCode).to.equal(500);
                return this;
            };
            res.rdkSend = function(body) {
                expect(body.status).to.equal(500);
                expect(body.error.original).to.equal('Tracker Error');
                expect(logger.info.calledWithMatch({
                    tracker: sinon.match.object
                })).to.be.true();
                expect(logger.error.calledWithMatch({
                    error: {
                        original: 'Tracker Error',
                        additionalInfo: 'Could not save tracker information to external server'
                    }
                })).to.be.true();
            };

            sinon.stub(httpUtil, 'post', function(options, callback) {
                expect(options).to.eql({
                    logger: logger,
                    body: {
                        screenName: 'abc'
                    },
                    baseUrl: req.app.config.UAtracker.baseUrl,
                    url: '/xpolog'
                });
                var response = {
                    statusCode: 500
                };
                return callback('Tracker Error', response);
            });

            trackerResource._postTracker(req, res);
        });
    });
});
