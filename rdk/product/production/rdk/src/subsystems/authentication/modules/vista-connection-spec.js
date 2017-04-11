'use strict';
var _ = require('lodash');
var httpMocks = require('node-mocks-http');
var logger = sinon.stub(require('bunyan').createLogger({
    name: 'vista-connection'
}));
var RpcClient = require('vista-js').RpcClient;
var vistaConnect = require('./vista-connection');
var SITE = '9E7A';
var DIVISION = '411';
var ACCESS_CODE = 'JENGA';
var VERIFY_CODE = 'JENGA';
var FAKE_VERIFY_CODE = 'JENAG';
var DUZ = 'blanco';

describe('Vista Connection Module', function() {
    var req;
    var res;
    var cb;
    var connectStub;
    var rpcClient;

    beforeEach(function(done) {
        req = httpMocks.createRequest({
            method: 'GET',
            url: '/authenticate'
        });
        req.logger = logger;
        _.set(req, ['app', 'config', 'vistaSites', SITE], {
            host: '12345',
            port: 8888,
            //name: 'PIONEER',
            infoButtonOid: 'blahblahblah',
            //division: 411
            division: [{
                id: '411',
                name: 'PIONEER'
            }]
        });
        _.set(req, 'audit', {});

        cb = sinon.spy();
        rpcClient = RpcClient.create(logger, req.app.config.vistaSites[SITE]);
        connectStub = sinon.stub(rpcClient, 'connect');
        res = httpMocks.createResponse();

        done();
    });

    afterEach(function(done) {
        cb.reset();
        connectStub.restore();
        done();
    });

    it('returns user data when no errors are present and data comes back', function() {
        var vistaJSAuthResult = {
            accessCode: ACCESS_CODE,
            verifyCode: VERIFY_CODE,
            duz: DUZ
        };
        var params = {
            rpcClient: rpcClient,
            site: SITE,
            division: DIVISION
        };
        vistaConnect(req, res, cb, params);
        connectStub.callArgWith(0, null, vistaJSAuthResult);
        expect(cb.called).to.be.true();
        expect(cb.args[0][0]).to.be.null();
        //these keys have to be a match for whats returned in the second param of the callback
        expect(cb.args[0][1]).to.have.keys(['username', 'password', 'facility', 'duz', 'infoButtonOid', 'site', 'division', 'consumerType']);
    });

    it('returns error when VistA sends back an error not accounted for', function() {
        var params = {
            rpcClient: rpcClient,
            site: SITE,
            division: DIVISION
        };
        vistaConnect(req, res, cb, params);
        connectStub.callArgWith(0, new Error('NETCONN ERROR'), null);
        expect(cb.called).to.be.true();
        expect(cb.args[0][0].code).to.match(/100.401.1001/);
        expect(cb.args[0][1]).to.to.be.null();
    });

    it('returns error when the A/V codes dont match at VistA', function() {
        var params = {
            rpcClient: rpcClient,
            site: SITE,
            division: DIVISION
        };
        vistaConnect(req, res, cb, params);
        connectStub.callArgWith(0, new Error('No DUZ returned from login request'), null);
        expect(cb.called).to.be.true();
        expect(cb.args[0][0].code).to.match(/100.401.1002/);
        expect(cb.args[0][1]).to.to.be.null();
    });

    it('returns error when VistA does not allow multiple signons', function() {
        var params = {
            rpcClient: rpcClient,
            site: SITE,
            division: DIVISION
        };
        vistaConnect(req, res, cb, params);
        connectStub.callArgWith(0, new Error('MULTIPLE SIGNONS'), null);
        expect(cb.called).to.be.true();
        expect(cb.args[0][0].code).to.match(/100.401.1003/);
        expect(cb.args[0][1]).to.to.be.null();
    });

    it('returns error when VistA does have context for the RPC called', function() {
        var params = {
            rpcClient: rpcClient,
            site: SITE,
            division: DIVISION
        };
        vistaConnect(req, res, cb, params);
        connectStub.callArgWith(0, new Error('context DRAGONBORN does not exist'), null);
        expect(cb.called).to.be.true();
        expect(cb.args[0][0].code).to.match(/100.401.1004/);
        expect(cb.args[0][1]).to.to.be.null();
    });

    it('returns error when VistA does not send back a result', function() {
        var params = {
            rpcClient: rpcClient,
            site: SITE,
            division: DIVISION
        };
        vistaConnect(req, res, cb, params);
        connectStub.callArgWith(0, null, null);
        expect(cb.called).to.be.true();
        expect(cb.args[0][0].code).to.match(/200.401.1001/);
        expect(cb.args[0][1]).to.to.be.null();
    });
});
