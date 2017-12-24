'use strict';
var _ = require('lodash');
var httpMocks = require('node-mocks-http');
var logger = sinon.stub(require('bunyan').createLogger({
    name: 'vista-user-class'
}));
var RpcClient = require('vista-js').RpcClient;
var userInfoRPC = require('./vista-user-info');
var SITE = 'SITE';
var FIRST_NAME = 'FIRST';
var LAST_NAME = 'LAST';
var USER_NAME = LAST_NAME + ',' + FIRST_NAME;
var DUZ = 'blanco';

describe('Vista User Info module', function() {
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
        var vistaJSAuthResult = '0^' + USER_NAME + '^2^3^4^5^6^7^8^9^10^11^12^13^14^15^16^17^18^19^20^1^1';
        var params = {
            rpcClient: rpcClient,
            site: SITE,
            data: {
                duz: {
                    'SITE': DUZ
                }
            }
        };
        userInfoRPC(req, res, cb, params);
        executeStub.callArgWith(1, null, vistaJSAuthResult);
        expect(cb.called).to.be.true();
        expect(cb.args[0][0]).to.be.null();
        //these keys have to be a match for whats returned in the second param of the callback
        expect(cb.args[0][1]).to.have.keys(['firstname', 'lastname', 'corsTabs', 'rptTabs']);
        expect(cb.args[0][1].firstname).to.match(new RegExp(FIRST_NAME));
        expect(cb.args[0][1].lastname).to.match(new RegExp(LAST_NAME));
    });

    it('returns error when result is not a string', function() {
        var vistaJSAuthResult = [];
        var params = {
            rpcClient: rpcClient,
            site: SITE,
            data: {
                duz: {
                    'SITE': DUZ
                }
            }
        };
        userInfoRPC(req, res, cb, params);
        executeStub.callArgWith(1, null, vistaJSAuthResult);
        expect(cb.called).to.be.true();
        expect(cb.args[0][0].code).to.match(/100.401.1009/);
        expect(cb.args[0][1]).to.be.null();
    });

    it('returns error when the a user doesn\'t have cors or rpt tabs', function() {
        var vistaJSAuthResult = '0^' + USER_NAME + '^2^3^4^5^6^7^8^9^10^11^12^13^14^15^16^17^18^19^20^0^0';
        var params = {
            rpcClient: rpcClient,
            site: SITE,
            data: {
                duz: {
                    'SITE': DUZ
                }
            }
        };
        userInfoRPC(req, res, cb, params);
        executeStub.callArgWith(1, null, vistaJSAuthResult);
        expect(cb.called).to.be.true();
        expect(cb.args[0][0].code).to.match(/100.401.1010/);
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
        userInfoRPC(req, res, cb, params);
        executeStub.callArgWith(1, new Error('Fluffy lil error'), null);
        expect(cb.called).to.be.true();
        expect(cb.args[0][0].code).to.match(/200.401.1008/);
        expect(cb.args[0][1]).to.be.null();
    });
});