'use strict';
//user authentication resources
var getSession = require('./get-session');
var refreshToken = require('./refresh-session');
var destroySession = require('../destroy-session');

/**
 * To return the combined endpoints used for access-verify code authentication
 * @return {array}
 */
module.exports = [{
    name: 'authentication-authentication',
    path: '',
    post: getSession,
    interceptors: {
        synchronize: false
    },
    requiredPermissions: [],
    isPatientCentric: false,
    bypassCsrf: true
}, {
    name: 'authentication-refreshToken',
    path: '',
    get: refreshToken,
    //we do not want to re-authenticate here just refresh the token
    interceptors: {
        audit: false,
        metrics: false,
        authentication: false,
        operationalDataCheck: false,
        synchronize: false
    },
    requiredPermissions: [],
    isPatientCentric: false
}, {
    name: 'authentication-destroySession',
    path: '',
    delete: destroySession,
    //we are trying to destroy the session so don't re-authenticate here
    interceptors: {
        authentication: false,
        operationalDataCheck: false,
        synchronize: false
    },
    requiredPermissions: [],
    isPatientCentric: false
}];
