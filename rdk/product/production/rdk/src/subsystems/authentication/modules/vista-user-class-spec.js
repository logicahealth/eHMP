'use strict';
var _ = require('lodash');
var httpMocks = require('node-mocks-http');
var logger = sinon.stub(require('bunyan').createLogger({
    name: 'vista-user-class'
}));
var RpcClient = require('vista-js').RpcClient;
var userClassRPC = require('./vista-user-class');
var SITE = 'SITE';
var ACCESS_CODE = 'PW';
var DUZ = 'blanco';

describe('Vista User Class module', function() {
    var req;
    var res;
    var cb;
    var executeStub;
    var rpcClient;

    beforeEach(function(done) {
        req = httpMocks.createRequest({
            method: 'GET',
            url: '/authenticate'
        });
        req.logger = logger;
        _.set(req, ['app', 'config', 'vistaSites', SITE], {
            host: '12345',
            port: PORT,
            name: 'PIONEER',
            infoButtonOid: 'blahblahblah',
            division: 411
        });
        _.set(req, 'audit', {});

        cb = sinon.spy();
        rpcClient = RpcClient.create(logger, req.app.config.vistaSites[SITE]);
        executeStub = sinon.stub(rpcClient, 'execute');
        res = httpMocks.createResponse();

        done();
    });

    afterEach(function(done) {
        cb.reset();
        executeStub.restore();
        done();
    });

    it('returns user data when no errors are present and data comes back', function() {
        var vistaJSAuthResult = JSON.stringify({
            vistaUserClass: ACCESS_CODE,
            vistaKeys: {
                'DG RECORD ACCESS': 'true',
                'DG SENSITIVITY': 'true',
                'DG SECURITY OFFICER': 'true',
                'PROVIDER': 'true'
            },
            vistaPositions: {
                role: 'Swashbuckler'
            }
        });
        var params = {
            rpcClient: rpcClient,
            site: SITE,
            data: {
                duz: {
                    'SITE': DUZ
                }
            }
        };
        userClassRPC(req, res, cb, params);
        executeStub.callArgWith(2, null, vistaJSAuthResult);
        expect(cb.called).to.be.true();
        expect(cb.args[0][0]).to.be.null();
        //these keys have to be a match for whats returned in the second param of the callback
        expect(cb.args[0][1]).to.have.keys(['vistaUserClass', 'vistaKeys', 'title', 'provider', 'dgRecordAccess', 'dgSensitiveAccess', 'dgSecurityOfficer']);
    });

    it('returns error when result is not a string', function() {
        var vistaJSAuthResult = {
            vistaUserClass: ACCESS_CODE,
            vistaKeys: {
                'DG RECORD ACCESS': 'true',
                'DG SENSITIVITY': 'true',
                'DG SECURITY OFFICER': 'true',
                'PROVIDER': 'true'
            },
            vistaPositions: {
                role: 'Swashbuckler'
            }
        };
        var params = {
            rpcClient: rpcClient,
            site: SITE,
            data: {
                duz: {
                    'SITE': DUZ
                }
            }
        };
        userClassRPC(req, res, cb, params);
        executeStub.callArgWith(2, null, vistaJSAuthResult);
        expect(cb.called).to.be.true();
        expect(cb.args[0][0].code).to.match(/100.401.1006/);
        expect(cb.args[0][1]).to.be.null();
    });

    it('returns error when the result can\'t be parsed', function() {
        var params = {
            rpcClient: rpcClient,
            site: SITE,
            data: {
                duz: {
                    'SITE': DUZ
                }
            }
        };
        userClassRPC(req, res, cb, params);
        executeStub.callArgWith(2, null, '{"foo" : 1, }');
        expect(cb.called).to.be.true();
        expect(cb.args[0][0].code).to.match(/100.401.1007/);
        expect(cb.args[0][1]).to.be.null();
    });

    it('returns error when Vista returns error', function() {
        var params = {
            rpcClient: rpcClient,
            site: SITE,
            data: {
                duz: {
                    'SITE': DUZ
                }
            }
        };
        userClassRPC(req, res, cb, params);
        executeStub.callArgWith(2, new Error('Fluffy lil error'), null);
        expect(cb.called).to.be.true();
        expect(cb.args[0][0].code).to.match(/100.401.1005/);
        expect(cb.args[0][1]).to.be.null();
    });
});