'use strict';

var sessionUserInfo = require('./get-session-user-info');
var userList = require('./get-user-list');

var getResourceConfig = function() {
    return [{
        name: 'user-service-userinfo',
        path: '/info',
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        isPatientCentric: false,
        get: sessionUserInfo.getUser,
        healthcheck: {

        }
    }, {
        name: 'user-service-userlist',
        path: '/list',
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['read-user-permission-set'],
        isPatientCentric: false,
        get: userList.getUserList,
        healthcheck: {}
    }, {
        name: 'set-recent-patients',
        path: '/set-recent-patients',
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        isPatientCentric: false,
        put: require('./set-recent-patients'),
        healthcheck: {}
    }, {
        name: 'get-recent-patients',
        path: '/get-recent-patients',
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        isPatientCentric: false,
        get: require('./get-recent-patients'),
        healthcheck: {}
    }];
};

module.exports.getResourceConfig = getResourceConfig;
