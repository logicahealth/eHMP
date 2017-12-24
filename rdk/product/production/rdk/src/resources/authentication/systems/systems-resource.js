'use strict';
//system authentication resources
var getSession = require('./get-session');
var refreshSession = require('../refresh-session');
var destroySession = require('../destroy-session');

/**
 * To return the combined endpoints used for system authentication
 * @return {array}
 */
module.exports = [{
    name: 'authentication-internal-systems-authenticate',
    path: '/systems/internal',
    post: getSession,
    interceptors: {
        operationalDataCheck: false,
        synchronize: false
    },
    requiredPermissions: [],
    isPatientCentric: false,
    bypassCsrf: true
}, {
    name: 'authentication-internal-systems-destroy-session',
    path: '/systems/internal',
    delete: destroySession,
    //we are trying to destroy the session so don't re-authenticate here
    interceptors: {
        authentication: false,
        operationalDataCheck: false,
        synchronize: false
    },
    requiredPermissions: [],
    isPatientCentric: false
}, {
    name: 'authentication-internal-systems-refresh-session',
    path: '/systems/internal',
    get: refreshSession,
    //we are trying to destroy the session so don't re-authenticate here
    interceptors: {
        authentication: false,
        operationalDataCheck: false,
        synchronize: false
    },
    requiredPermissions: [],
    isPatientCentric: false
}, {
    name: 'authentication-external-systems-authenticate',
    path: '/systems/external',
    post: getSession,
    interceptors: {
        operationalDataCheck: false,
        synchronize: false
    },
    requiredPermissions: [],
    isPatientCentric: false,
    bypassCsrf: true
}, {
    name: 'authentication-external-systems-destroy-session',
    path: '/systems/external',
    delete: destroySession,
    interceptors: {
        authentication: false,
        operationalDataCheck: false,
        synchronize: false
    },
    requiredPermissions: [],
    isPatientCentric: false
}, {
    name: 'authentication-external-systems-refresh-session',
    path: '/systems/external',
    get: refreshSession,
    interceptors: {
        authentication: false,
        operationalDataCheck: false,
        synchronize: false
    },
    requiredPermissions: [],
    isPatientCentric: false
}];
