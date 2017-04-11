'use strict';

//user authentication resources
var getSession = require('./get-session');
var refreshToken = require('./refresh-token');
var destroySession = require('./destroy-session');
var listResource = require('./list-resource');

//system authentication resources
var getSystemSession = require('./systems/get-session');
var refreshSystemSession = require('./systems/refresh-session');
var destroySystemSession = require('./systems/destroy-session');


/**
 * Returns the configuration for the authentication resources
 *  - authentication : requires the authentication interceptor to run in order to add the user to teh session for returning that data
 *  - refreshToken : expects a session to already occur or it returns a blank object
 *  - destroySession : expects a session to be there in order to destroy it returns nothing
 *  - list : is a readonly resource that gives the list of vistas available returns an array
 *  - /systems
 *
 * @return {Array}      -an array containing the objects needed to configure the authentication resource
 *
 */
function getResourceConfig() {
    return [{
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
    }, {
        name: 'authentication-list',
        path: '/list',
        get: listResource.get,
        interceptors: {
            authentication: false,
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        isPatientCentric: false,
        bypassCsrf: true
    },{
        name: 'authentication-internal-systems-authenticate',
        path: '/systems/internal',
        post: getSystemSession,
        interceptors: {
            authentication: false,
            systemAuthentication: true,
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        isPatientCentric: false,
        bypassCsrf: true
    },{
        name: 'authentication-internal-systems-destroy-session',
        path: '/systems/internal',
        delete: destroySystemSession,
        interceptors: {
            authentication: false,
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        isPatientCentric: false
    },{
        name: 'authentication-internal-systems-refresh-session',
        path: '/systems/internal',
        get: refreshSystemSession,
        interceptors: {
            authentication: false,
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        isPatientCentric: false
    },{
        name: 'authentication-external-systems-authenticate',
        path: '/systems/external',
        post: getSystemSession,
        interceptors: {
            authentication: false,
            systemAuthentication: true,
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        isPatientCentric: false
    },{
        name: 'authentication-external-systems-destroy-session',
        path: '/systems/external',
        delete: destroySystemSession,
        interceptors: {
            authentication: false,
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        isPatientCentric: false
    },{
        name: 'authentication-external-systems-refresh-session',
        path: '/systems/external',
        get: refreshSystemSession,
        interceptors: {
            authentication: false,
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        isPatientCentric: false
    }];
}

module.exports.getResourceConfig = getResourceConfig;
