'use strict';

var _ = require('lodash');
var bunyan = require('bunyan');
var httpMocks = require('node-mocks-http');
var auth = require('./get-session');
var rdk = require('../../../core/rdk');
var RpcClient = require('vista-js').RpcClient;

var validDuz = '10VEHU';
var validPwd = 'VEHU10';
var invalidDuz = 'zzz';
var invalidPwd = 'xxx';
var site = 'C877';
var division = '500';
var invalidSite = '1337';

function buildRequest(accessCode, verifyCode, site, disabled) {
    var headers = {};

    var request = httpMocks.createRequest({
        method: 'GET',
        url: '/authenticate',
        body: {
            accessCode: (accessCode || ''),
            verifyCode: (verifyCode || ''),
            site: (site || ''),
            division: (division || '')
        }
    });

    request.get = function(header) {
        return headers[header];
    };

    request.logger = sinon.stub(bunyan.createLogger({
        name: 'api-get-session-resource'
    }));

    _.set(request, 'app.config.interceptors.authentication.disabled', (disabled || false));
    _.set(request, 'audit', {});
    _.set(request, 'session', {
        destroy: function() {}
    });
    _.set(request, ['app', 'config', 'vistaSites', site], {});

    return request;
}

describe('Authentication Resource', function() {
    it('rejects the login attempt if there are no credentials', function() {
        var next = sinon.spy();
        var req = buildRequest();
        _.set(req, '_resourceConfigItem.title', 'authentication-authenticate');
        _.set(req, '_resourceConfigItem.rel', 'vha.create');
        var res = {};
        res.status = function(status) {
            this.status = status;
            return this;
        };
        res.rdkSend = function(body) {
            expect(body.code).to.match(/200.400.1001/);
            expect(this.status).to.equal(400);
        };
        auth(req, res, next);
    });
    it('rejects the login attempt if there is a bad site', function() {
        var next = sinon.spy();
        var req = buildRequest(validDuz, validPwd, invalidSite);
        _.set(req, '_resourceConfigItem.title', 'authentication-authenticate');
        _.set(req, '_resourceConfigItem.rel', 'vha.create');
        var res = {};
        res.status = function(status) {
            this.status = status;
            return this;
        };
        res.rdkSend = function(body) {
            expect(body.code).to.match(/200.400.1002/);
            expect(this.status).to.equal(400);
        };
        auth(req, res, next);
    });
    /**
     * TODO add tests for the handle login attempt and other callbacks
     */
});
