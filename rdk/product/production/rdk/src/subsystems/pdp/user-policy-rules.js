'use strict';
module.exports = {
    rules: [{
        'name': 'publicResourcePolicy',
        'on': true,
        'condition': function(R) {
            R.when(this.isPublicEndpoint);
        },
        'consequence': function(R) {
            this.result = {
                code: 'Permit'
            };
            R.stop();
        }
    }, {
        'name': 'systemUserPolicy',
        'on': true,
        'condition': function(R) {
            R.when(this.consumerType === 'system');
        },
        'consequence': function(R) {
            this.result = {
                code: 'Permit'
            };
            R.stop();
        }
    }, {
        'name': 'cprsUserPolicy',
        'on': true,
        'condition': function(R) {
            R.when(!this.corsTabs && !this.rptTabs);
        },
        'consequence': function(R) {
            this.result = {
                code: 'Deny'
            };
            R.stop();
        }
    }, {
        'name': 'vaEmployeeRecordAccessPolicy',
        'on': true,
        'condition': function(R) {
            R.when(false); //TODO: When a user is trying to access a VA employee's patient record and does not have dgSecurityAccess (need to verify)
        },
        'consequence': function(R) {
            this.result = {
                code: 'Deny'
            };
            R.stop();
        }
    }, {
        'name': 'hmpUIContextPolicy',
        'on': true,
        'condition': function(R) {
            R.when(false); //TODO: When a user does not have HMP UI CONTEXT
        },
        'consequence': function(R) {
            this.result = {
                code: 'Deny'
            };
            R.stop();
        }
    }, {
        'name': 'default',
        'on': true,
        'condition': function(R) {
            R.when(true);
        },
        'consequence': function(R) {
            this.result = {
                code: 'Permit'
            };
            R.stop();
        }
    }]
};
