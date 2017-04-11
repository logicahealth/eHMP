'use strict';

var _ = require('lodash');
var bunyan = require('bunyan');
var httpMocks = require('node-mocks-http');
var sysAuth = require('./get-session');

var VALID_SYSTEM = 'CDS';

function buildRequest(systemUser) {
    var headers = {};

    if (systemUser) {
        var authHeader = new Buffer(systemUser).toString();
        headers.Authorization = authHeader;
    }

    var request = httpMocks.createRequest({
        method: 'POST',
        url: '/authentication/systems/internal'
    });

    request.get = function(header) {
        return headers[header];
    };

    request.logger = sinon.stub(bunyan.createLogger({
        name: 'system-get-session-resource'
    }));

    request.app = {
        config: {}
    };

    _.set(request, 'session', {});

    request.audit = {};

    request._resourceConfigItem = {};
    request._resourceConfigItem.title = 'authentication-internal-systems-authenticate';
    request._resourceConfigItem.rel = 'vha.create';

    return request;
}

describe('System Authentication test mock request', function() {
    it('tests that Authorization header is created correctly', function() {
        var req = buildRequest(VALID_SYSTEM);
        expect(req.get('Authorization')).to.match(new RegExp(VALID_SYSTEM));

        req = buildRequest();
        expect(req.get('Authorization')).to.be.undefined();
    });
});

describe('System Authentication', function() {
    it('tests that passing no Authorization Header will return bad request', function(done) {
        var req = buildRequest();
        var res = {
            status: function(status) {
                expect(status).to.be(400);
                return this;
            },
            rdkSend: function(body) {
                expect(body.code).to.match(/200.400.1001/);
                expect(body.data).to.be.falsy();
                done();
            }
        };

        sysAuth(req, res);
    });
});
