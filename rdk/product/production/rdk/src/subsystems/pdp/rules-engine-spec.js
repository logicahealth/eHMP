'use strict';

var rulesEngine = require('../pdp/rules-engine');
var _ = require('lodash');

var rules = {
    'name': 'read-access',
    'on': true,
    'condition': function(R) {
        R.when(_.intersection(this.permissionSets, ['read-access']).length > 0);
    },
    'consequence': function(R) {
        var userPermissions = [
            'read-patient-allergy',
            'read-patient-immunization'
        ];

        this.result = userPermissions;
        R.stop();
    }
};

describe('When Rules Engine is executed', function() {
    it('with rules and facts', function() {
        var userPermissionSets = {permissionSets: ['read-access']};

        rulesEngine.executeRules(rules, userPermissionSets, function(results) {
            expect(results).to.eql(['read-patient-allergy', 'read-patient-immunization']);
        });
    });
});
