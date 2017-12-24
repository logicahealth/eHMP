'use strict';
var _ = require('lodash');

var apiResource = require('./api/api-resource');
var systemsResource = require('./systems/systems-resource');
var ssoResource = require('./sso/sso-resource');

/**
 * Returns the configuration for the authentication resources
 *  - authentication : requires the authentication interceptor to run in order to add the user to teh session for returning that data
 *  - refreshToken : expects a session to already occur or it returns a blank object
 *  - destroySession : expects a session to be there in order to destroy it returns nothing
 *  - /systems
 *
 * @return {Array}      -an array containing the objects needed to configure the authentication resource
 *
 */
function getResourceConfig() {
    //TODO change this from union to concat for speed when updating to lodash 4+
    return _.union(apiResource, systemsResource, ssoResource);
}

module.exports.getResourceConfig = getResourceConfig;
