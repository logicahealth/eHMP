'use strict';

var rdk = require('../../core/rdk');
var httpUtil = rdk.utils.http;
var httpMocks = require('node-mocks-http');
var rulesEngine = require('../pdp/rules-engine');
var handler = require('./pep-handler-patient-access-policy');
var pidValidator = rdk.utils.pidValidator;
var nullchecker = require('../../utils/nullchecker');
var S = require('string');

var logger = sinon.stub(require('bunyan').createLogger({
    name: 'pep-handler-patient-access-policy'
}));

describe('When the pep handler policy is called', function() {
    var req;

    beforeEach(function(done) {
        req = {};
        req.logger = logger;
        req.interceptorResults = {};
        req.interceptorResults.patientIdentifiers = {};

        sinon.stub(pidValidator, 'isIcn', function(icn) {
            return nullchecker.isNotNullish(icn) && !S(icn).contains(';');
        });
        sinon.stub(pidValidator, 'isSiteDfn', function(icn) {
            return nullchecker.isNotNullish(icn) && S(icn).contains(';');
        });

        done();
    });

    afterEach(function() {
        pidValidator.isIcn.restore(); // Unwraps the spy
        pidValidator.isSiteDfn.restore(); // Unwraps the spy
    });

    it('and the params on the request is not defined then an error is returned', function(done) {
        var callback = function(err) {
            expect(err.code).to.be(rdk.httpstatus.forbidden);
            done();
        };

        handler._getPatient(req, callback);
    });

    it('and the pid on the request is not defined then an error is returned', function(done) {
        req.params = {};

        var callback = function(err) {
            expect(err.code).to.be(rdk.httpstatus.forbidden);
            done();
        };

        handler._getPatient(req, callback);
    });

    it('and the pid on the request is null then an error is returned', function(done) {
        req.params = {
            pid: null
        };

        var callback = function(err) {
            expect(err.code).to.be(rdk.httpstatus.forbidden);
            done();
        };

        handler._getPatient(req, callback);
    });
});

describe('When getting patients', function() {
    var req, mockHttp, res;

    beforeEach(function(done) {
        req = {};
        req.interceptorResults = {};
        req.interceptorResults.patientIdentifiers = {};
        req.interceptorResults.patientIdentifiers.originalID = 'six';
        req.session = {
            user: {
                pid: 'SITE;18',
                site: 'SITE'
            }
        };
        req.logger = logger;
        req.params = {
            pid: 'SITE;18'
        };
        req.app = {
            config: {
                jdsServer: {
                    baseUrl: 'base'
                }
            }
        };

        res = httpMocks.createResponse();

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

        mockHttp.restore();

        done();
    });

    it('and the JDS service returns invalid JSON then an error is returned', function(done) {
        mockHttp = sinon.stub(httpUtil, 'get', function(config, callback) {
            callback(null, res, '[pid:"six"]');
        });

        var callback = function(err) {
            expect(err.code).to.be(rdk.httpstatus.internal_server_error);
            done();
        };

        handler._getPatient(req, callback);
    });

    it('and the JDS service returns an error then an error is returned', function(done) {
        mockHttp = sinon.stub(httpUtil, 'get', function(config, callback) {
            callback('err', null, null);
        });

        var callback = function(err) {
            expect(err.code).to.be(rdk.httpstatus.internal_server_error);
            done();
        };

        handler._getPatient(req, callback);
    });

    it('and JDS returns valid patient data then the data is returned', function(done) {
        mockHttp = sinon.stub(httpUtil, 'get', function(config, callback) {
            callback(null, res, [{
                pid: 'six',
                sensitive: false
            }]);
        });

        var callback = function(err, result) {
            expect(result).must.eql([{
                pid: 'six',
                sensitive: false
            }]);
            done();
        };

        handler._getPatient(req, callback);
    });
});

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
                pid: 'SITE;18',
                site: 'SITE'
            }
        };
        req.params = {
            pid: 'SITE;18'
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

    it('user is denied permission to execute request', function(done) {
        mockRulesEngine = sinon.stub(rulesEngine, 'executeRules', function(rules, facts, callback) {
            callback({
                code: 'BreakGlass',
                text: 'no can do',
                reason: 'you are not the one'
            });
        });

        handler(req, res, callback);

        var args = callback.getCall(0).args;
        expect(args[0].message).to.be('no can do');
        expect(args[0].code).to.be(rdk.httpstatus.permanent_redirect);
        expect(res.getHeader('BTG')).to.be('you are not the one');

        done();
    });
});