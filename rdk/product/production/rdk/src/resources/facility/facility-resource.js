'use strict';
var listResource = require('./list');
/**
 * Return the list of vistas available
 * @return {Array} - a readonly resource that gives the list of vistas available returns an array
 */
function getResourceConfig() {
    return [{
        name: 'facility-list',
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
    }];
}

module.exports.getResourceConfig = getResourceConfig;
