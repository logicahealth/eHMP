'use strict';

var _ = require('lodash');
//This is the actually check if a resource requires one or more permissions.
function checkUserPermissions(requiredPermissions, userPermissions) {
    var missingPermissions = _.difference(requiredPermissions, userPermissions);
    return _.isEmpty(missingPermissions);
}

module.exports = {
    rules: [{
        'name': 'emptyRequiredPermissions',
        'on': true,
        'condition': function(R) {
            R.when(this.permissions.required.length === 0);
        },
        'consequence': function(R) {
            this.result = 'Permit';
            R.stop();
        }
    }, {
        'name': 'requiredPermissionsPresent',
        'on': true,
        'condition': function(R) {
            R.when(checkUserPermissions(this.permissions.required, this.permissions.user));
        },
        'consequence': function(R) {
            this.result = 'Permit';
            R.stop();
        }
    }, {
        'name': 'requiredPermissionsAbsent',
        'on': false,
        'condition': function(R) {
            R.when(checkUserPermissions(this.permissions.required, this.permissions.user));
        },
        'consequence': function(R) {
            this.result = 'Deny';
            R.stop();
        }
    }, {
        'name': 'default',
        'on': true,
        'condition': function(R) {
            R.when(true);
        },
        'consequence': function(R) {
            this.result = 'Deny';
            R.stop();
        }
    }]
};
