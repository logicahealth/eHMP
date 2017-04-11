'use strict';
var _ = require('lodash');
var httpMocks = require('node-mocks-http');
var logger = sinon.stub(require('bunyan').createLogger({
    name: 'pjdsUserData'
}));
var pjdsUserData = require('./pjds-user-data');
var pjdsStore = require('../../../subsystems/pjds/pjds-store');
var getStub;
var patchStub;

describe('pJDS eHMP User Data module', function() {
    var req;
    var res;
    var cb;

    beforeEach(function(done) {
        req = httpMocks.createRequest({
            method: 'GET',
            url: '/ehmpusers/{uid}'
        });
        req.logger = logger;

        cb = sinon.spy();
        getStub = sinon.stub(pjdsStore, 'get');
        res = httpMocks.createResponse();

        done();
    });

    afterEach(function(done) {
        cb.reset();
        getStub.reset();
        done();
    });

    it('just makes the callback early with an error and no data if the uid is blank', function() {
        var data = {
            duz: {}
        };
        var params = {
            site: '9E7A',
            data: data
        };
        pjdsUserData.getEhmpUserData(req, res, cb, params);
        expect(cb.called).to.be.true();
        expect(cb.getCall(0).args[0].code).to.match(/202.412.1001/);
        expect(cb.getCall(0).args[1]).to.be.null();
    });
    it('just makes the callback with error when pjds returns an error', function() {
        var data = {
            uid: 'urn:va:user:9E7A:2342565'
        };
        var params = {
            site: '9E7A',
            data: data
        };
        getStub.callsArgWith(3, new Error('this is a bogus one'), null);
        pjdsUserData.getEhmpUserData(req, res, cb, params);
        expect(cb.called).to.be.true();
        expect(cb.getCall(0).args[0].code).to.match(/202.500.1001/);
        expect(cb.getCall(0).args[1]).to.be.null();
    });
    it('just makes the callback with error when pjds returns an error', function() {
        var data = {
            uid: 'urn:va:user:9E7A:2342565'
        };
        var params = {
            site: '9E7A',
            data: data
        };
        var response = {
            data: {
                permissionSet: {
                    val: ['read-access'],
                    additionalPermissions: ['knifes-edge']
                },
                unsuccessfulLoginAttemptCount: 2
            }
        };
        getStub.callsArgWith(3, null, response);
        pjdsUserData.getEhmpUserData(req, res, cb, params);
        var firstCb = cb.getCall(0);
        expect(cb.called).to.be.true();
        expect(firstCb.args[0]).to.be.null();
        expect(firstCb.args[1]).to.be.have.keys(['eHMPUIContext', 'preferences', 'permissions', 'permissionSets', 'uid', 'unsuccessfulLoginAttemptCount']);
        expect(firstCb.args[1].unsuccessfulLoginAttemptCount).to.be(2);
        expect(firstCb.args[1].permissionSets).to.equal(response.data.permissionSet.val);
    });
});

describe('pJDS trust system data call', function() {
    var req;
    var res;
    var cb;

    beforeEach(function(done) {
        req = httpMocks.createRequest({
            method: 'GET',
            url: '/trustsys/{uid}'
        });
        req.logger = logger;

        cb = sinon.spy();
        getStub = sinon.stub(pjdsStore, 'get');
        res = httpMocks.createResponse();

        done();
    });

    afterEach(function(done) {
        cb.reset();
        getStub.reset();
        done();
    });

    it('just makes the callback early with an error and no data if the name is blank', function() {
        var params = {};
        pjdsUserData.getTrustedSystemData(req, res, cb, params);
        var firstCb = cb.getCall(0);
        expect(cb.called).to.be.true();
        expect(firstCb.args[0].code).to.match(/202.412.1001/);
        expect(firstCb.args[1]).to.be.null();
    });
    it('just makes the callback with error when pjds returns an error', function() {
        var params = {
            name: 'CDS'
        };
        getStub.callsArgWith(3, new Error('this is a bogus one'), null);
        pjdsUserData.getTrustedSystemData(req, res, cb, params);
        var firstCb = cb.getCall(0);
        expect(cb.called).to.be.true();
        expect(firstCb.args[0].code).to.match(/202.401.1003/);
        expect(firstCb.args[1]).to.be.null();
    });
    it('just makes the callback with data when pjds returns no error and a name that doesn\'t match the requested name', function() {
        var params = {
            name: 'CDS'
        };
        var response = {
            data: {
                name: 'FAKER',
                permissionSets: {
                    val: ['read-access'],
                    additionalPermissions: ['knifes-edge']
                },
                breakglass: true,
                corsTabs: true,
                rptTabs: true,
                dgSensitiveAccess: true
            }
        };
        getStub.callsArgWith(3, null, null);
        pjdsUserData.getTrustedSystemData(req, res, cb, params);
        var firstCb = cb.getCall(0);
        expect(cb.called).to.be.true();
        expect(firstCb.args[0].code).to.match(/202.401.1003/);
        expect(firstCb.args[1]).to.be.null();
    });
    it('just makes the callback with data when pjds returns no error', function() {
        var params = {
            name: 'CDS'
        };
        var response = {
            data: {
                name: 'CDS',
                permissionSets: {
                    val: ['read-access'],
                    additionalPermissions: ['knifes-edge']
                },
                breakglass: true,
                corsTabs: true,
                rptTabs: true,
                dgSensitiveAccess: true
            }
        };
        getStub.callsArgWith(3, null, response);
        pjdsUserData.getTrustedSystemData(req, res, cb, params);
        var firstCb = cb.getCall(0);
        expect(cb.called).to.be.true();
        expect(firstCb.args[0]).to.be.null();
        expect(firstCb.args[1]).to.have.keys(['name', 'consumerType', 'permissions', 'permissionSets', 'breakglass']);
    });
});

describe('pJDS permissions data call', function() {
    var req;
    var res;
    var cb;

    beforeEach(function(done) {
        req = httpMocks.createRequest({
            method: 'GET',
            url: '/permset/{uid}'
        });
        req.logger = logger;

        cb = sinon.spy();
        getStub = sinon.stub(pjdsStore, 'get');
        patchStub = sinon.stub(pjdsStore, 'patch');
        res = httpMocks.createResponse();

        done();
    });

    afterEach(function(done) {
        cb.reset();
        getStub.reset();
        patchStub.reset();
        done();
    });

    it('just makes the callback early with data if the permissionSet is blank', function() {
        var params = {
            data: {
                permissionSets: [],
                permission: ['mighty-mouse']
            }
        };
        pjdsUserData.getPermissionsData(req, res, cb, params);
        var firstCb = cb.getCall(0);
        expect(cb.called).to.be.true();
        expect(firstCb.args[0]).to.be.null();
        expect(firstCb.args[1]).not.to.be.empty();
    });
    it('just makes the callback with error when pjds returns an error', function() {
        var params = {
            data: {
                permissionSets: ['tweedle-dee']
            }
        };
        getStub.callsArgWith(3, new Error('this is a bogus one'), null);
        pjdsUserData.getPermissionsData(req, res, cb, params);
        var firstCb = cb.getCall(0);
        expect(cb.called).to.be.true();
        expect(firstCb.args[0].code).to.match(/202.401.1002/);
        expect(firstCb.args[1]).to.be.null();
    });
    it('just makes the callback with data when pjds returns no error', function() {
        var params = {
            data: {
                permissionSets: ['fluffy-dragon']
            }
        };
        var response = {
            data: {
                permissions: ['knifes-edge']
            }
        };
        getStub.callsArgWith(3, null, response);
        pjdsUserData.getPermissionsData(req, res, cb, params);
        var firstCb = cb.getCall(0);
        expect(cb.called).to.be.true();
        expect(firstCb.args[0]).to.be.null();
        expect(firstCb.args[1]).to.have.keys(['permissions', 'permissionSets']);
    });
});

describe('pJDS login attempt call', function() {
    var req;
    var res;
    var cb;

    beforeEach(function(done) {
        req = httpMocks.createRequest({
            method: 'GET',
            url: '/permset/{uid}'
        });
        req.logger = logger;

        cb = sinon.spy();
        patchStub = sinon.stub(pjdsStore, 'patch');
        res = httpMocks.createResponse();

        done();
    });

    afterEach(function(done) {
        cb.reset();
        patchStub.reset();
        done();
    });

    it('just makes the callback early with data if the uid is blank', function() {
        var params = {
            data: {}
        };
        pjdsUserData.setLoginAttempt(req, res, cb, params);
        var firstCb = cb.getCall(0);
        expect(cb.called).to.be.true();
        expect(firstCb.args[0].code).to.be.match(/202.412.1001/);
        expect(firstCb.args[1]).to.be.null();
    });
    it('just makes the callback with error when pjds returns an error', function() {
        var params = {};
        _.set(params, 'data', {});
        _.set(req, 'session.user.uid', 'urn:va:user:9E7A:153465246');
        patchStub.callsArgWith(3, new Error('this is a bogus one'), null);
        pjdsUserData.setLoginAttempt(req, res, cb, params);
        var firstCb = cb.getCall(0);
        expect(cb.called).to.be.true();
        expect(firstCb.args[0].code).to.match(/202.500.1001/);
        expect(firstCb.args[1]).to.be.null();
    });
    it('just makes the callback with data when pjds returns no error', function() {
        var params = {};
        _.set(params, 'data.permissionSets', ['trigonometry-buff']);
        _.set(params, 'data.permissions', ['write-mumps-like-pro']);
        _.set(req, 'session.user.uid', 'urn:va:user:9E7A:153465246');
        var response = {
            status: 200
        };
        patchStub.callsArgWith(3, null, response);
        pjdsUserData.setLoginAttempt(req, res, cb, params);
        var firstCb = cb.getCall(0);
        expect(cb.called).to.be.true();
        expect(firstCb.args[0]).to.be.null();
        expect(firstCb.args[1]).to.have.keys(['permissions', 'permissionSets']);
    });
});