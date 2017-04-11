'use strict';
var permissionSetsResource = require('./permission-sets-resource');
var rdk = require('../../core/rdk');
var httpMocks = require('node-mocks-http');
var httpUtil = rdk.utils.http;

describe('Permission Sets resources', function() {
    it('tests that getResourceConfig() is setup correctly for edit permission sets', function() {
        var resources = permissionSetsResource.getResourceConfig()[0];

        expect(resources.name).to.equal('permission-sets-edit');
        expect(resources.path).to.equal('/edit');
        expect(resources.subsystems).not.to.be.undefined();
        expect(resources.put).not.to.be.undefined();
    });

    it('tests that getResourceConfig() is setup correctly for get user permission sets', function() {
        var resources = permissionSetsResource.getResourceConfig()[1];

        expect(resources.name).to.equal('permission-sets-getUserPermissionSets');
        expect(resources.path).to.equal('/getUserPermissionSets');
        expect(resources.subsystems).not.to.be.undefined();
        expect(resources.get).not.to.be.undefined();
    });

    it('tests that getResourceConfig() is setup correctly for list permission sets', function() {
        var resources = permissionSetsResource.getResourceConfig()[2];

        expect(resources.name).to.equal('permission-sets-list');
        expect(resources.path).to.equal('/list');
        expect(resources.subsystems).not.to.be.undefined();
        expect(resources.get).not.to.be.undefined();
    });
});

describe('Permission Sets resource calls', function() {
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
        res = httpMocks.createResponse();
        spyStatus = sinon.spy(res, 'status');
    });
    afterEach(function() {
        spyStatus.reset();
    });
    it('request list of permission sets returns list', function(done) {
        var resources = permissionSetsResource.getResourceConfig()[2];
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
            'url': '/permset/'
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
