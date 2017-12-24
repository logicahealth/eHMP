'use strict';
var _ = require('lodash');
var utils = require('./authentication-utils');

function getRequest(params) {
    var req = {
        audit: {}
    };
    if (_.has(params, 'title')) {
        _.set(req, '_resourceConfigItem.title', (params.title || 'authentication-authentication'));
        _.set(req, '_resourceConfigItem.rel', 'vha.create');
    }
    if (_.has(params, 'userType')) {
        _.set(req, 'session.user.consumerType', params.userType);
    }
    if (_.has(params, 'interceptorSwitch')) {
        _.set(req, 'app.config.interceptors.authentication.disabled', params.interceptorSwitch);
    }
    if (_.has(params, 'readOnly')) {
        _.set(req, 'app.config.interceptors.authentication.readOnly', params.readOnly);
    }
    if (_.has(params, 'session')) {
        _.set(req, 'session', params.session);
    }
    if (_.has(params, 'statusCode')) {
        _.set(req, 'statusCode', params.statusCode);
    }

    return req;
}

describe('Authentication utils', function() {
    it('checks properly for any resource', function() {
        var req = getRequest({
            title: 'test-only-fun'
        });
        var regex = /^test-only-fun$/;
        expect(utils.isNamedResource(req, regex)).to.be.true();
    });
    it('checks properly for an authentication resource', function() {
        var req = getRequest({
            title: 'authentication-authentication'
        });
        expect(utils.isAuthenticationResource(req)).to.be.true();

        req = getRequest({
            title: 'buzzing-the-tower-with-blindsight'
        });
        expect(utils.isAuthenticationResource(req)).to.be.false();
    });

    it('checks properly for a user login resource', function() {
        var req = getRequest({
            title: 'authentication-authentication'
        });
        expect(utils.isLoginResource(req)).to.be.true();

        req = getRequest({
            title: 'authentication-refreshToken'
        });
        expect(utils.isLoginResource(req)).to.be.false();
    });

    it('checks properly for a system login resource', function() {
        var req = getRequest({
            title: 'authentication-internal-systems-authenticate'
        });
        expect(utils.isSystemLoginResource(req)).to.be.true();

        req = getRequest({
            title: 'authentication-external-systems-authenticate'
        });
        expect(utils.isSystemLoginResource(req)).to.be.true();

        req = getRequest({
            title: 'authentication-internal-systems-destroy-session'
        });
        expect(utils.isSystemLoginResource(req)).to.be.false();
    });

    it('checks properly for valid and invalid users', function() {
        var req = getRequest({
            userType: 'user'
        });
        expect(utils.hasValidSession(req)).to.be.true();

        req = getRequest({
            userType: 'system'
        });
        expect(utils.hasValidSession(req)).to.be.true();

        req = getRequest();
        expect(utils.hasValidSession(req)).to.be.false();
    });

    it('checks properly for authentication interceptor disabling switch', function() {
        var req = getRequest({
            interceptorSwitch: false
        });
        expect(utils.isInterceptorEnabled(req)).to.be.true();

        req = getRequest({
            interceptorSwitch: true
        });
        expect(utils.isInterceptorEnabled(req)).to.be.false();
    });

    it('checks properly for readOnly', function() {
        var req = getRequest({
            readOnly: true
        });
        expect(utils.isInterceptorReadOnly(req)).to.be.true();

        req = getRequest({
            readOnly: false
        });
        expect(utils.isInterceptorReadOnly(req)).to.be.false();
    });

    it('checks properly that the audit is set after login', function() {
        var req = getRequest({
            session: {
                expires: new Date(),
            },
            statusCode: 200
        });
        utils.auditLoginResult(req);
        expect(req.audit.msg).to.match(/Successful Login/);
        expect(req.audit.status).to.be(200);
        expect(req.audit.lastSuccessfulLogin).to.be.truthy();
        expect(req.audit.lastUnsuccessfulLogin).to.be.undefined();

        req = getRequest({
            session: {
                expires: new Date(),
            },
            statusCode: 200
        });
        var error = new Error('Trumped up falicy for triggers');
        utils.auditLoginResult(req, error);
        expect(req.audit.msg).to.match(/Unsuccessful Login/);
        expect(req.audit.status).not.to.be(200);
        expect(req.audit.lastSuccessfulLogin).to.be.undefined();
        expect(req.audit.lastUnsuccessfulLogin).to.be.truthy();
        expect(req.audit.error).to.be.object();
    });
});
