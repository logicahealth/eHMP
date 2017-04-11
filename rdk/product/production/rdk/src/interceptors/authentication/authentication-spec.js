'use strict';

var _ = require('lodash');
var bunyan = require('bunyan');
var httpMocks = require('node-mocks-http');
var auth = require('./authentication');
var rdk = require('../../core/rdk');
var RdkError = rdk.utils.RdkError;

var VALID_ACCESS = '10VEHU';
var VALID_PASS = 'VEHU10';
var INVALID_ACCESS = 'zzz';
var INVALID_PASS = 'xxx';
var VALID_SYSTEM = 'CDS';
var SITE = 'C877';

describe('Authentication interceptor', function() {
    var req;
    var res;
    var next;

    beforeEach(function(done) {
        req = httpMocks.createRequest({
            method: 'GET',
            url: '/authenticate'
        });
        req.logger = sinon.stub(bunyan.createLogger({
            name: 'authentication-interceptor'
        }));

        _.set(req, '_resourceConfigItem.rel', 'vha.create');

        _.set(req, 'app.config', {});
        _.set(req, 'app.config.interceptors.authentication.readOnly', true);
        _.set(req, 'app.config.interceptors.authentication.disabled', false);

        _.set(req, 'session', {
            regenerate: sinon.stub().callsArg(0)
        });

        next = sinon.spy();
        res = httpMocks.createResponse();
        res.rdkSend = sinon.spy();

        done();
    });

    afterEach(function(done) {
        next.reset();
        req.logger.warn.restore();
        req.session.regenerate.reset();
        res.rdkSend.reset();
        done();
    });

    it('tests that enabling the interceptor calls next after warning', function() {
        //purposly hit the disabled interceptor
        _.set(req, '_resourceConfigItem.title', 'authentication-authentication');
        _.set(req, 'app.config.interceptors.authentication.disabled', true);
        auth(req, res, next);
        expect(req.logger.warn.called).to.be.true();
        expect(res.rdkSend.called).to.be.false();
        expect(next.called).to.be.true();
    });

    it('tests that enabling the interceptor calls next with no warning or rdkSend', function() {
        //bypass everything
        _.set(req, 'session.user.consumerType', 'user');
        _.set(req, '_resourceConfigItem.title', 'authentication-refreshToken');
        auth(req, res, next);
        expect(req.logger.warn.called).to.be.false();
        expect(res.rdkSend.called).to.be.false();
        expect(next.called).to.be.true();
    });

    it('tests that an invalid user can\'t call resources other than authentication resources', function() {
        _.set(req, '_resourceConfigItem.title', 'postulate-this-fresh-beat');
        auth(req, res, next);
        expect(req.logger.warn.called).to.be.false();
        expect(res.rdkSend.called).to.be.true();
        expect(res.rdkSend.calledWith(new RdkError({
            code: 'rdk.401.1002',
            logger: req.logger
        }))).to.be.true();
        expect(next.called).to.be.false();
    });

    it('tests that next is called when an invalid user is calling an authentication resource so that login may occur', function() {
        _.set(req, 'body', {
            accessCode: INVALID_ACCESS,
            verifyCode: INVALID_PASS,
            site: SITE
        });
        _.set(req, '_resourceConfigItem.title', 'authentication-authentication');
        auth(req, res, next);
        expect(req.logger.warn.called).to.be.false();
        expect(res.rdkSend.called).to.be.false();
        expect(req.session.regenerate.called).to.be.true();
        expect(next.called).to.be.true();
    });

    it('tests that next is called when an invalid system user is calling an authentication resource so that login may occur', function() {
        _.set(req, 'headers', {
            authorization: VALID_SYSTEM
        });
        _.set(req, '_resourceConfigItem.title', 'authentication-internal-systems-authenticate');
        auth(req, res, next);
        expect(req.logger.warn.called).to.be.false();
        expect(res.rdkSend.called).to.be.false();
        expect(req.session.regenerate.called).to.be.true();
        expect(next.called).to.be.true();
    });

    it('tests that calling a login resource with a valid session and user credentials will not regenerate the session and calls next', function() {
        _.set(req, 'body', {
            accessCode: VALID_ACCESS,
            verifyCode: VALID_PASS,
            site: SITE
        });
        _.set(req, 'session.user', {
            accessCode: VALID_ACCESS,
            password: VALID_PASS,
            site: SITE,
            consumerType: 'user'
        });
        _.set(req, '_resourceConfigItem.title', 'authentication-authentication');
        auth(req, res, next);
        expect(req.logger.warn.called).to.be.false();
        expect(res.rdkSend.called).to.be.false();
        expect(req.session.regenerate.called).to.be.false();
        expect(next.called).to.be.true();
    });
    it('tests that calling a login resource with a valid session and system user credentials will not regenerate the session and calls next', function() {
        _.set(req, 'headers', {
            authorization: VALID_SYSTEM
        });
        _.set(req, 'session.user', {
            name: VALID_SYSTEM,
            consumerType: 'system'
        });
        _.set(req, '_resourceConfigItem.title', 'authentication-internal-systems-authenticate');
        auth(req, res, next);
        expect(req.logger.warn.called).to.be.false();
        expect(res.rdkSend.called).to.be.false();
        expect(req.session.regenerate.called).to.be.false();
        expect(next.called).to.be.true();
    });
});