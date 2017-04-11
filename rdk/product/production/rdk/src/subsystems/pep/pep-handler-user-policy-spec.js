'use strict';

var rdk = require('../../core/rdk');
var httpUtil = rdk.utils.http;
var httpMocks = require('node-mocks-http');
var rulesEngine = require('../pdp/rules-engine');
var handler = require('./pep-handler-user-policy');
var pidValidator = rdk.utils.pidValidator;
var nullchecker = require('../../utils/nullchecker');
var S = require('string');

var logger = sinon.stub(require('bunyan').createLogger({
    name: 'pep-handler-user-policy'
}));

describe('When pdp policy handler is executed', function() {
    var req, mockHttp, mockRulesEngine, callback, res;

    beforeEach(function(done) {
        req = {};
        req.audit = {};
        req.interceptorResults = {};
        req.interceptorResults.patientIdentifiers = {};
        req.interceptorResults.patientIdentifiers.originalID = 'test';
        req.logger = logger;
        req.session = {
            user: {
                pid: '9E7A;18',
                site: '9E7A'
            }
        };
        req.params = {
            pid: '9E7A;18'
        };
        req.app = {
            config: {
                jdsServer: {
                    baseUrl: 'base'
                }
            },
            vxSyncServer: {
                host: 'vxsynchost',
                port: 2
            }
        };

        res = httpMocks.createResponse();

        mockHttp = sinon.stub(httpUtil, 'get', function(config, callback) {
            callback(null, null, {
                data: {
                    items: [{
                        pid: 'six'
                    }]
                }
            });
        });

        callback = sinon.spy();

        sinon.stub(pidValidator, 'isIcn', function(icn) {
            return nullchecker.isNotNullish(icn) && !S(icn).contains(';');
        });
        sinon.stub(pidValidator, 'isSiteDfn', function(icn) {
            return nullchecker.isNotNullish(icn) && S(icn).contains(';');
        });

        done();
    });

    afterEach(function(done) {
        pidValidator.isIcn.restore(); // Unwraps the spy
        pidValidator.isSiteDfn.restore(); // Unwraps the spy

        rulesEngine.executeRules.restore();
        mockHttp.restore();
        callback.reset();

        done();
    });

    it('user is permitted to execute request', function(done) {
        mockRulesEngine = sinon.stub(rulesEngine, 'executeRules', function(rules, facts, callback) {
            callback({
                code: 'Permit'
            });
        });

        handler(req, res, callback);
        var args = callback.getCall(0).args;
        expect(args[0]).must.eql(null);
        expect(args[1].code).must.be('Permit');

        done();
    });

    it('user is denied permission to execute request', function(done) {
        mockRulesEngine = sinon.stub(rulesEngine, 'executeRules', function(rules, facts, callback) {
            callback({
                code: 'Deny',
                text: 'error'
            });
        });

        handler(req, res, callback);

        var args = callback.getCall(0).args;
        expect(args[0].message).to.be('error');
        expect(args[0].code).to.be(rdk.httpstatus.forbidden);

        done();
    });
});