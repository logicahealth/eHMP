'use strict';

var rulesEngine = require('./rules-engine');
var rules = require('./user-policy-rules').rules;
var fact = {};

describe('Test all policy rules', function() {
    beforeEach(function() {
        fact = {};
    });

    it('publicResourcePolicy- permit response', function() {
        fact = {
            breakglass: false,
            sensitive: false,
            hasSSN: true,
            requestingOwnRecord: false,
            rptTabs: false,
            corsTabs: false,
            dgRecordAccess: false,
            dgSensitiveAccess: false,
            site: '9E7A',
            isPublicEndpoint: true
        };
        rulesEngine.executeRules(rules, fact, function(result) {
            expect(result.code).to.equal('Permit');
        });
    });
    it('systemUserPolicy- permit response', function() {
        fact = {
            consumerType: 'system',
            breakglass: false,
            sensitive: false,
            hasSSN: true,
            requestingOwnRecord: false,
            rptTabs: false,
            corsTabs: false,
            dgRecordAccess: false,
            dgSensitiveAccess: false,
            resourceConfigItemRel: 'vha.read',
            site: '9E7A',
            isPublicEndpoint: false
        };
        rulesEngine.executeRules(rules, fact, function(result) {
            expect(result.code).to.equal('Permit');
        });
    });
    it('cprsUserPolicy- deny response', function() {
        fact = {
            breakglass: false,
            sensitive: false,
            hasSSN: true,
            requestingOwnRecord: false,
            rptTabs: false,
            corsTabs: false,
            dgRecordAccess: false,
            dgSensitiveAccess: false,
            resourceConfigItemRel: 'vha.read',
            site: '9E7A',
            isPublicEndpoint: false
        };
        rulesEngine.executeRules(rules, fact, function(result) {
            expect(result.code).to.equal('Deny');
        });
    });
});