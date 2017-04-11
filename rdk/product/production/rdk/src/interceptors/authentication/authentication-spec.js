'use strict';

var httpMocks = require('node-mocks-http');
var auth = require('./authentication');
var dd = require('drilldown');
var _ = require('lodash');
var rdk = require('../../core/rdk');
var bunyan = require('bunyan');
var RpcClient = require('vista-js').RpcClient;

function buildRequest(username, password, disabled) {
    var headers = {

    };

    if (username && password) {
        var authHeader = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
        headers.Authorization = authHeader;
    }

    var request = httpMocks.createRequest({
        method: 'GET',
        url: '/authenticate'
    });

    request.get = function(header) {
        return headers[header];
    };

    request.logger = {
        trace: function() {},
        debug: function() {},
        info: function() {},
        warn: function() {},
        error: function() {}
    };

    request.app = {
        config: {}
    };

    if (disabled !== undefined) {
        request.app.config = {
            interceptors: {
                authentication: {
                    disabled: true
                }
            }
        };
    }

    return request;
}


var validUid = 'C877;10VEHU';
var validPwd = 'VEHU10';
var invalidUid = 'zzz';
var invalidPwd = 'xxx';

describe('Authentication test mock request', function() {
    it('tests that Authorization header is created correctly', function() {
        var req = buildRequest(validUid, validPwd);
        expect(req.get('Authorization')).not.to.be.undefined();

        req = buildRequest();
        expect(req.get('Authorization')).to.be.undefined();
    });

    it('tests that undefined disabled does not create interceptors.authentication.disabled property', function() {
        var req = buildRequest(validUid, validPwd);
        expect(req.app.config.interceptors).to.be.undefined();
    });

    it('tests that true disabled creates interceptors.authentication.disabled property', function() {
        var req = buildRequest(validUid, validPwd, true);
        expect(req.app.config.interceptors.authentication.disabled).to.be.true();
    });
});

describe('BasicAuth', function() {
    it('tests that an invalid login when authentication is disabled calls next()', function() {
        var next = sinon.spy();
        var req = buildRequest(invalidUid, invalidPwd, true);
        var res = httpMocks.createResponse();

        auth(req, res, next);
        expect(next.called).to.be.true();
    });
});

describe('authentication', function() {
    var req;
    var res;
    var completedSites;
    beforeEach(function() {
        req = {};
        req.logger = sinon.stub(bunyan.createLogger({
            name: 'authentication'
        }));
        req.param = _.identity;
        dd(req)('app')('config').set({});
        res = {};
        completedSites = {
            site: true
        };
    });

    it('attempts login if the operational data sync check passed', function(done) {
        var site = '9E7A';
        req.audit = {};
        req.param = function(param) {
            if (param === 'site') {
                return site;
            }
            return param;
        };
        dd(req)('session')('destroy').set(_.noop);
        dd(req)('app')('config')('rpcConfig')('context').set('CONTEXT');
        dd(req)('app')('config')('vistaSites')('9E7A')('name').set('PANORAMA');
        var response = {
            statusCode: 200,
            body: {}
        };
        dd(response)('body')('completedStamp')('sourceMetaStamp')(site)('syncCompleted').set(true);

        sinon.stub(rdk.utils.http, 'get', function(options, callback) {
            return callback(null, response, response.body);
        });

        var res = {
            status: function(status) {
                return this;
            },
            rdkSend: function(response) {
                expect(req.logger.info.calledWith(
                    sinon.match(/DOING LOGIN/)
                )).to.be.true();
                done();
            }
        };
        auth(req, res);
    });
});
