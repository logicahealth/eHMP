'use strict';

var moment = require('moment');
var _ = require('lodash');

var defaultUserData = {
    createdBy: '',
    createdTime: new moment().utc().format(),
    lastSuccessfulLogin: '',
    lastUnsuccessfulLogin: '',
    permissionSet: {
        additionalPermissions: [],
        modifiedBy: null,
        modifiedOn: new moment().utc().format(),
        val: []
    },
    status: 'inactive',
    uid: '',
    unsuccessfulLoginAttemptCount: 0
};

var defaultPermissionData = {
    uid: '',
    value: '',
    label: '',
    description: '',
    example: '',
    note: '',
    version: {
        introduced: '',
        deprecated: null
    },
    status: 'future'
};

var defaultPermissionSetData = {
    uid: '',
    description: '',
    example: '',
    label: '',
    note: '',
    permissions: [],
    status: 'future',
    'sub-sets': [],
    version: {
        introduced: '',
        deprecated: null
    }
};

module.exports = {
    user: defaultUserData,
    permission: defaultPermissionData,
    permissionSet: defaultPermissionSetData,
    getDefaults: function() {
        return _.cloneDeep({
            user: defaultUserData,
            permission: defaultPermissionData,
            permissionSet: defaultPermissionSetData
        });
    }
};
