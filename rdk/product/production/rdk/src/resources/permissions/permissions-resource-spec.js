'use strict';
var permissionsResource = require('./permissions-resource');
var rdk = require('../../core/rdk');
var httpMocks = require('node-mocks-http');
var httpUtil = rdk.utils.http;

describe('Permissions resources', function() {
    it('tests that getResourceConfig() is setup correctly for list roles', function() {
        var resources = permissionsResource.getResourceConfig()[0];

        expect(resources.name).to.equal('permissions-list');
        expect(resources.path).to.equal('/list');
        expect(resources.subsystems).not.to.be.undefined();
        expect(resources.get).not.to.be.undefined();
    });
});

describe('Permissions resource calls', function() {
    var req;
    var res;
    var spyStatus;
    beforeEach(function() {
        req = {};
        req.app = {};
        req.app.config = {};
        req.app.config.generalPurposeJdsServer = {
            host: 'dummy',
            port: 0
        };
        req.parameters = {
            'testdata': false
        };
        req.param = function(param) {
            return req.parameters[param] || undefined;
        };
        res = httpMocks.createResponse();
        spyStatus = sinon.spy(res, 'status');
    });
    afterEach(function() {
        spyStatus.reset();
    });
    it('request list of permissions returns list', function(done) {
        var resources = permissionsResource.getResourceConfig()[0];
        res.rdkSend = function(result) {
            expect(result).to.be.an(Array);
            expect(spyStatus.withArgs(rdk.httpstatus.ok).called).to.be.true();
            done();
        };
        var expectedHttpOptions = {
            'body': '',
            'host': 'dummy',
            'json': true,
            'logger': undefined,
            'port': 0,
            'url': '/permission/?filter=eq(%22status%22%2C%22active%22)'
        };
        sinon.stub(httpUtil, 'get', function(httpOptions) {
            expect(httpOptions.body).to.be.equal(expectedHttpOptions.body);
            expect(httpOptions.host).to.be.equal(expectedHttpOptions.host);
            expect(httpOptions.json).to.be.equal(expectedHttpOptions.json);
            expect(httpOptions.logger).to.be.equal(expectedHttpOptions.logger);
            expect(httpOptions.port).to.be.equal(expectedHttpOptions.port);
            expect(httpOptions.url).to.be.equal(expectedHttpOptions.url);
            done();
        });
        resources.get(req, res);
    });
});
