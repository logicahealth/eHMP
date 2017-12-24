'use strict';

var _ = require('lodash');
var rdkJwt = require('./rdk-jwt');
var httpMocks = require('node-mocks-http');
var jwt = require('jsonwebtoken');

describe('rdkJwt', function() {

    var app = {};
    var req = {};
    var res = {};
    beforeEach(function() {
        app = {
            config: {
                rootPath: '/resource',
                secret: 'PW'
            },
            use: function() {}
        };
        req = httpMocks.createRequest();
        req.logger = sinon.stub(require('bunyan').createLogger({name: 'rdk-jwt-spec'}));
        req.app = app;
        req.session = {
            _id: 'opiuy243qyhsddasfop87asg'
        };

        res = httpMocks.createResponse();
        res.rdkSend = function(e) {};
    });
    afterEach(function() {
        app = {};
        req = {};
        res = {};
    });

    describe('enableJwt', function() {
        it('tests that jwt calls app.use with _csrfMiddleware', function() {
            var spy = sinon.spy(app, 'use');
            rdkJwt.enableJwt(app);
            expect(spy.calledWith(rdkJwt._internal._csrfMiddleware));
            spy.reset();
        });
    });

    describe('addJwtHeader', function() {
        it('sets a header based on the req.session', function(done) {
            res.set = function(headerName, data) {
                expect(headerName).to.be.equal('X-Set-JWT');
                expect(data).to.not.be(undefined);
                done();
            };
            rdkJwt.addJwtHeader(req, res);
        });
    });

    describe('updatePublicRoutes', function() {
        it('tests that the publicEndpoints got updated when bypassCsrf was true', function() {
            var path = '/resource/authentication';
            var configItem = {
                path: path,
                rel: 'vha.create',
                bypassCsrf: true
            };
            var endpoints = rdkJwt.updatePublicRoutes(app, configItem);
            expect(endpoints).to.be.a(Object);
            expect(endpoints).to.have.ownProperty('POST');
            expect(endpoints.POST[0]).to.be.equal(app.config.rootPath + path);
        });
        it('tests that the publicEndpoints was not updated when bypassCsrf was absent', function() {
            var configItem = {}; //passing just an empty object to get a starting place for comparison
            var initialEndpoints = rdkJwt.updatePublicRoutes(app, configItem);
            expect(initialEndpoints).to.be.a(Object);
            var path = '/resource/authentication';
            configItem = {
                path: path,
                rel: 'vha.create'
            };
            var postEndpoints = rdkJwt.updatePublicRoutes(app, configItem);
            expect(postEndpoints).to.be.a(Object);
            expect(postEndpoints).to.be.equal(initialEndpoints);
        });
    });

    describe('_internal._checkJwt', function() {
         it('tests that a signed jwt is verified and it contained a verified csrf token', function() {
            var next = sinon.spy();
            rdkJwt._internal._processCsrfToken(req);
            req.headers.authorization = 'Bearer ' + rdkJwt._internal._getJWTToken(req);
            rdkJwt._internal._checkJwt(req, res, next);
            expect(next.called).to.be.true();
        });
        it('tests that a bad jwt token does not get verified and returns a 401 error', function(done) {
            var next = sinon.spy();
            res.status = function(input) {
                expect(input).to.be(401);
                return this;
            };
            res.rdkSend = function(input) {
                expect(input).to.have.ownKeys(['error']);
                done();
            };
            req.headers.authorization = 'Bearer BogusJWTAmoungUs';
            rdkJwt._internal._checkJwt(req, res, next);
            expect(next.called).to.be.false();

        });
        it('tests that a bad csrf token does not verify and returns a 401 error', function(done) {
            var next = sinon.spy();
            var secret = _.trim(_.clone(app.config.secret));
            var subject = req.session._id;
            var newJwt = jwt.sign({
                csrf: 'thisisabadtoken',
                sub: subject
            }, secret);
            res.status = function(input) {
                expect(input).to.be(401);
                return this;
            };
            res.rdkSend = function(input) {
                expect(input).to.have.ownKeys(['error']);
                done();
            };
            req.headers.authorization = 'Bearer ' + newJwt;

            rdkJwt._internal._checkJwt(req, res, next);
            expect(next.called).to.be.false();
        });
    });

    describe('_internal._csrfMiddleware', function() {
        it('tests that csrf check is not done to a public endpoint', function() {
            var next = sinon.spy();
            var secret = _.trim(_.clone(app.config.secret));
            var subject = req.session._id;
            var newJwt = jwt.sign({
                csrf: 'thisisabadtoken',
                sub: subject
            }, secret);
            var path = '/resourcedirectory';
            req.headers.authorization = 'Bearer ' + newJwt;
            req.method = 'GET';
            req.path = app.config.rootPath + path;
            rdkJwt._internal._addRoute(app, {
                rel: 'vha.read',
                path: path
            });
            rdkJwt._internal._csrfMiddleware(req, res, next);
            expect(next.called).to.be.true();
        });
        it('tests that a csrf check does occur to a non public endpoint', function(done) {
            var next = sinon.spy();
            var secret = _.trim(_.clone(app.config.secret));
            var subject = req.session._id;
            var path = '/definitely/not/public';
            var newJwt = jwt.sign({
                csrf: 'thisisabadtoken',
                sub: subject
            }, secret);
            res.status = function(input) {
                expect(input).to.be(401);
                return this;
            };
            res.rdkSend = function(input) {
                expect(input).to.have.ownKeys(['error']);
                done();
            };
            req.headers.authorization = 'Bearer ' + newJwt;
            req.method = 'POST';
            req.path = app.config.rootPath + path;

            rdkJwt._internal._csrfMiddleware(req, res, next);
            expect(next.called).to.be.false();
        });
    });

    describe('_internal._getBearer', function() {
        it('tests that the Bearer is removed from an authorization header', function() {
            var name = 'I-AM';
            req.headers.authorization = 'Bearer ' + name;
            var jwtString = rdkJwt._internal._getBearer(req);
            expect(jwtString).to.not.match(/bearer/i);
        });
        it('tests that the text is correct without "Bearer " preceed', function() {
            var name = 'I-AM';
            req.headers.authorization = 'Bearer ' + name;
            var jwtString = rdkJwt._internal._getBearer(req);
            expect(jwtString).to.be.equal(name);
        });
    });

    describe('_internal._canSkipCSRFCheck', function() {
        it('tests that the endpoint we are hitting is NOT found in the publicEndpoints', function() {
            var path = '/definitely/still/not/public';
            req.method = 'GET';
            req.path = app.config.rootPath + path;
            var skippyDoDa = rdkJwt._internal._canSkipCSRFCheck(req);
            expect(skippyDoDa).to.be.false();
        });
        it('tests that the endpoint we are hitting is found in the publicEndpoints', function() {
            var path = '/resourcedirectory';
            req.method = 'GET';
            req.path = app.config.rootPath + path;
            rdkJwt._internal._addRoute(app, {
                rel: 'vha.read',
                path: path
            });
            var skipToMyLou = rdkJwt._internal._canSkipCSRFCheck(req);
            expect(skipToMyLou).to.be.true();
        });
    });

});