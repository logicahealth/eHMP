'use strict';

var _ = require('lodash');
var _str = require('underscore.string');

// do not uncomment - see DE651
var sessionWhitelist = [
    //'corsTabs',
    'ccowObject',
    //'dgRecordAccess',
    //'dgSecurityOfficer',
    //'dgSensitiveAccess',
    'disabled',
    'division',
    'divisionSelect',
    'duz',
    'expires',
    'facility',
    'firstname',
    'lastname',
    'pcmm',
    'permissions',
    'preferences',
    'provider',
    'requiresReset',
    //'rptTabs',
    'section',
    'sessionLength',
    'site',
    'title',
    'nationalAccess',
    'uid'
    //'username',
    //'vistaKeys'
];

var userListWhitelist = [
    'duz',
    'exactMatchCount',
    'facility',
    'fname',
    'has_paging_data',
    'lname',
    'paging_data',
    //'permissions', not used
    'permissionSet',
    //'permissionSets', not used
    'site',
    'status',
    'title',
    'uid',
    'vistaStatus'
];

var UserUtil = {
    sessionWhitelist: {
        label: 'sessionWhitelist',
        obj: _.clone(sessionWhitelist)
    },
    userListWhitelist: {
        label: 'userListWhitelist',
        obj: _.clone(userListWhitelist)
    }
};

UserUtil.sanitizeUser = function(user, whitelist) {
    if (_.isUndefined(whitelist)) {
        whitelist = UserUtil.sessionWhitelist;
    }
    if (whitelist.label === 'userListWhitelist') {
        for (var key in user) {
            if (_str.include(key.toLowerCase(), 'phone')) {
                whitelist.obj.push(key);
            }
        }
    }
    return _.pick(user, whitelist.obj);
};

module.exports = UserUtil;
