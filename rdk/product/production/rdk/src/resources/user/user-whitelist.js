'use strict';


var _ = require('lodash');
var _str = require('underscore.string');

// do not uncomment - see DE651
var sessionWhitelist = [
    //'corsTabs',
    //'dgRecordAccess',
    //'dgSecurityOfficer',
    //'dgSensitiveAccess',
    'disabled',
    'divisionSelect',
    'duz',
    'expires',
    'facility',
    //'username',
    'firstname',
    'lastname',
    'permissions',
    'pcmm',
    'requiresReset',
    //'rptTabs',
    'section',
    'sessionLength',
    'site',
    'title',
    //'vistaKeys',
    'ccowObject',
    'provider'
];

var userListWhitelist = [
    'uid',
    'facility',
    'fname',
    'lname',
    'site',
    'duz',
    'permissionSets',
    'title',
    'vistaStatus',
    'ehmpStatus',
    'paging_data',
    'has_paging_data'
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
