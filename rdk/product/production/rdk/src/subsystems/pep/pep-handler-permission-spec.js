'use strict';

var rdk = require('../../core/rdk');
var httpMocks = require('node-mocks-http');
var rulesEngine = require('../pdp/rules-engine');
var handler = require('./pep-handler-permission');

describe('When pep permission handler is executed', function() {
    var req, mockRulesEngine, callback, res;

    beforeEach(function(done) {
        req = {};
        req._resourceConfigItem = {};
        req._resourceConfigItem.requiredPermissions = [];
        req._resourceConfigItem.isPatientCentric = false;
        req.logger = sinon.stub(require('bunyan').createLogger(
            {name: 'validate-response-format-spec.js'}
        ));
        req.session = {};
        req.session.user = {
            uid: 'read-access',
            label: 'Read Access',
            permissions: []
        };
        callback = sinon.spy();
        res = httpMocks.createResponse();

        done();
    });

    afterEach(function(done) {
        rulesEngine.executeRules.restore();
        callback.reset();

        done();
    });

    it('with invalid user then an error is returned', function(done) {
        mockRulesEngine = sinon.stub(rulesEngine, 'executeRules', function(rules, facts, callback) {
            callback(true);
        });

        req.session.user = undefined;
        handler(req, res, callback);

        expect(callback.calledWith(rdk.httpstatus.internal_server_error));

        done();
    });

    it('user permissions are set', function(done) {

        mockRulesEngine = sinon.stub(rulesEngine, 'executeRules', function(rules, facts, callback) {
            callback('Permit');
        });

        handler(req, res, callback);
        expect(callback.calledWith('Permit'));

        done();
    });

    it('invalid permissions results are returned and an error is returned', function(done) {
        mockRulesEngine = sinon.stub(rulesEngine, 'executeRules', function(rules, facts, callback) {
            callback(true);
        });

        handler(req, res, callback);
        expect(callback.calledWith(rdk.httpstatus.unauthorized));

        done();
    });
});
