'use strict';

var rulesEngine = require('./rules-engine');
var rules = require('./patient-access-policy-rules').rules;
var fact = {};

describe('Test all policy rules', function() {
    beforeEach(function() {
        fact = {};
    });
    it('accessOwnRecordPolicy', function() {
        fact = {
            breakglass: false,
            sensitive: false,
            hasSSN: true,
            requestingOwnRecord: true,
            rptTabs: true,
            corsTabs: true,
            dgRecordAccess: false,
            dgSensitiveAccess: false,
            resourceConfigItemRel: 'vha.read',
            site: 'SITE',
            patientPid: 'SITE;3'
        };
        rulesEngine.executeRules(rules, fact, function(result) {
            expect(result.code).to.equal('Deny');
        });
    });
    it('writebackNonLocalPatientPolicy denys when patient has different site to current site and call is a vha.write type', function() {
        fact = {
            breakglass: false,
            sensitive: false,
            hasSSN: true,
            requestingOwnRecord: false,
            rptTabs: true,
            corsTabs: true,
            dgRecordAccess: false,
            dgSensitiveAccess: false,
            isPatientCentric: true,
            resourceConfigItemRel: 'vha.write',
            site: 'SITE',
            patientPid: 'SITE;3'
        };
        rulesEngine.executeRules(rules, fact, function(result) {
            expect(result.code).to.equal('Deny');
        });
    });
    it('writebackNonLocalPatientPolicy permits when patient has different site to current site and call is a vha.write type but the user is a system type', function() {
        fact = {
            breakglass: false,
            sensitive: false,
            hasSSN: true,
            requestingOwnRecord: false,
            rptTabs: true,
            corsTabs: true,
            dgRecordAccess: false,
            dgSensitiveAccess: false,
            isPatientCentric: true,
            resourceConfigItemRel: 'vha.write',
            site: 'SITE',
            patientPid: 'SITE;3',
            consumerType: 'system'
        };
        rulesEngine.executeRules(rules, fact, function(result) {
            expect(result.code).to.equal('Permit');
        });
    });
    it('writebackNonLocalPatientPolicy denies when patient has different site to current site and call is a vha.write type but the user is a non-system type', function() {
        fact = {
            breakglass: false,
            sensitive: false,
            hasSSN: true,
            requestingOwnRecord: false,
            rptTabs: true,
            corsTabs: true,
            dgRecordAccess: false,
            dgSensitiveAccess: false,
            isPatientCentric: true,
            resourceConfigItemRel: 'vha.write',
            site: 'SITE',
            patientPid: 'SITE;3',
            consumerType: 'user'
        };
        rulesEngine.executeRules(rules, fact, function(result) {
            expect(result.code).to.equal('Deny');
        });
    });
    it('writebackNonLocalPatientPolicy permits when patient has different site to current site and call is a vha.read type', function() {
        fact = {
            breakglass: false,
            sensitive: false,
            hasSSN: true,
            requestingOwnRecord: false,
            rptTabs: true,
            corsTabs: false,
            dgRecordAccess: false,
            dgSensitiveAccess: false,
            resourceConfigItemRel: 'vha.read',
            site: 'SITE',
            patientPid: 'SITE;3'
        };
        rulesEngine.executeRules(rules, fact, function(result) {
            expect(result.code).to.equal('Permit');
        });
    });
    it('writebackNonLocalPatientPolicy permits when patient has same site to current site and call is a vha.read type', function() {
        fact = {
            breakglass: false,
            sensitive: false,
            hasSSN: true,
            requestingOwnRecord: false,
            rptTabs: true,
            corsTabs: false,
            dgRecordAccess: false,
            dgSensitiveAccess: false,
            resourceConfigItemRel: 'vha.read',
            site: 'SITE',
            patientPid: 'SITE;3'
        };
        rulesEngine.executeRules(rules, fact, function(result) {
            expect(result.code).to.equal('Permit');
        });
    });
    it('writebackNonLocalPatientPolicy permits when patient has same site to current site and call is a vha.write type', function() {
        fact = {
            breakglass: false,
            sensitive: false,
            hasSSN: true,
            requestingOwnRecord: false,
            rptTabs: true,
            corsTabs: false,
            dgRecordAccess: false,
            dgSensitiveAccess: false,
            resourceConfigItemRel: 'vha.write',
            site: 'SITE',
            patientPid: 'SITE;3'
        };
        rulesEngine.executeRules(rules, fact, function(result) {
            expect(result.code).to.equal('Permit');
        });
    });
    it('undefinedOrNoSSNPolicy', function() {
        fact = {
            breakglass: false,
            sensitive: false,
            hasSSN: false,
            requestingOwnRecord: false,
            rptTabs: true,
            corsTabs: true,
            dgRecordAccess: false,
            dgSensitiveAccess: false,
            resourceConfigItemRel: 'vha.read',
            site: 'SITE',
            patientPid: 'SITE;3'
        };
        rulesEngine.executeRules(rules, fact, function(result) {
            expect(result.code).to.equal('BreakGlass');
            expect(result.reason).to.equal('PatientHasUndefinedSSN');
        });
    });
    it('sensitivePolicyBreakglass', function() {
        fact = {
            breakglass: false,
            sensitive: true,
            hasSSN: true,
            requestingOwnRecord: false,
            rptTabs: true,
            corsTabs: true,
            dgRecordAccess: false,
            dgSensitiveAccess: false,
            resourceConfigItemRel: 'vha.read',
            site: 'SITE',
            patientPid: 'SITE;3'
        };
        rulesEngine.executeRules(rules, fact, function(result) {
            expect(result.code).to.equal('BreakGlass');
            expect(result.reason === 'SensitiveAccessRequired').to.be.true();
        });
    });
    it('sensitivePolicyPermit', function() {
        fact = {
            breakglass: true,
            sensitive: true,
            hasSSN: true,
            requestingOwnRecord: false,
            rptTabs: true,
            corsTabs: false,
            dgRecordAccess: false,
            dgSensitiveAccess: false,
            resourceConfigItemRel: 'vha.read',
            site: 'SITE',
            patientPid: 'SITE;3'
        };
        rulesEngine.executeRules(rules, fact, function(result) {
            expect(result.code).to.equal('Permit');
        });
    });
    it('default', function() {
        fact = {
            breakglass: false,
            sensitive: false,
            hasSSN: true,
            requestingOwnRecord: false,
            rptTabs: true,
            corsTabs: false,
            dgRecordAccess: false,
            dgSensitiveAccess: false,
            resourceConfigItemRel: 'vha.read',
            site: 'SITE',
            patientPid: 'SITE;3'
        };
        rulesEngine.executeRules(rules, fact, function(result) {
            expect(result.code).to.equal('Permit');
        });
    });
});
