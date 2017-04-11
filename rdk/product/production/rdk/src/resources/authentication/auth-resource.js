'use strict';
var _ = require('lodash');

/**TODO remove this facility list and use the new facility list resource */
//facility list resource
var listResource = require('../facility/list');

var apiResource = require('./api/api-resource');
var systemsResource = require('./systems/systems-resource');
var ssoResource = require('./sso/sso-resource');

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
    var resourceList = [];

    resourceList.push({
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
    });
    //TODO change this from union to concat for speed when updating to lodash 4+
    return _.union(resourceList, apiResource, systemsResource, ssoResource);
}

module.exports.getResourceConfig = getResourceConfig;
