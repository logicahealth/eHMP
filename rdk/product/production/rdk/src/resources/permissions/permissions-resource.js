'use strict';
/**
 * Returns the configuration for the permissions resources
 *  - list : list of all RDK Permissions
 *
 * @return {Array}      -an array containing the objects needed to configure the authentication resource
 *
 */
module.exports.getResourceConfig = function() {
    return [{
        name: 'permissions-list',
        path: '/list',
        get: require('./list'),
        interceptors: {
            synchronize: false
        },
        requiredPermissions: ['read-user-permission-set'],
        isPatientCentric: false,
        subsystems: []
    }];
};
