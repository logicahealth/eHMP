'use strict';
var rulesEngine = require('./rules-engine');
var rules = require('./permission-rules').rules;


describe('When permissions for a user are returned', function() {
    it.skip('required permissions are empty', function() {
        var fact = {
        'permissions': {
            'required': [],
            'user': []
        }
    };
        rulesEngine.executeRules(rules, fact, function (result) {
            expect(result.to.equal('Permit'));
        });
    });
    it.skip('required permissions are present', function() {
        var fact = {
        'permissions': {
            'required': ['test-role'],
            'user': ['test-role']
        }
    };
        rulesEngine.executeRules(rules, fact, function (result) {
            expect(result.to.equal('Permit'));
        });
    });
    it.skip('required permissions are absent', function() {
        var fact = {
        'permissions': {
            'required': ['test-role'],
            'user': []
        }
    };
        rulesEngine.executeRules(rules, fact, function (result) {
            expect(result.to.equal('Deny'));
        });
    });
});
