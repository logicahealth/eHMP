'use strict';
/**
 * Returns the configuration for the roles resources
 *  - getUserRoles : gets the roles for an ehmp user
 *  - add: adds a role to the list of roles for an ehmp user
 *  - edit : replaces a role with another role for an ehmp user
 *  - delete : deletes a role for an ehmp user
 *  - list : list of all RDK Roles
 *
 * @return {Array}      -an array containing the objects needed to configure the authentication resource
 *
 */
module.exports.getResourceConfig = function() {
    return [{
        name: 'roles-edit',
        path: '/edit',
        put: require('./edit'),
        interceptors: {
            synchronize: false
        },
        requiredPermissions: ['edit-user-role'],
        isPatientCentric: false,
        subsystems: []
    }, {
        name: 'roles-getUserRoles',
        path: '/getUserRoles',
        get: require('./get-user-roles'),
        interceptors: {
            synchronize: false
        },
        requiredPermissions: ['read-user-role'],
        isPatientCentric: false,
        subsystems: []
    }, {
        name: 'roles-list',
        path: '/list',
        get: require('./list'),
        interceptors: {
            synchronize: false
        },
        requiredPermissions: ['read-user-role'],
        isPatientCentric: false,
        subsystems: []
    }];
};
