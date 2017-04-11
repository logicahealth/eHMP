'use strict';
/**
 * Returns the configuration for the permission sets resources
 *  - getUserPermissionSets : gets the permission sets for an ehmp user
 *  - add: adds a permission set to the list of permission sets for an ehmp user
 *  - edit : replaces a permission set with another permission set for an ehmp user
 *  - delete : deletes a permission set for an ehmp user
 *  - list : list of all RDK Permission Sets
 *
 * @return {Array}      -an array containing the objects needed to configure the authentication resource
 *
 */
module.exports.getResourceConfig = function() {
    return [{
        name: 'permission-sets-edit',
        path: '/edit',
        put: require('./edit'),
        interceptors: {
            synchronize: false
        },
        requiredPermissions: ['edit-user-permission-set'],
        isPatientCentric: false,
        subsystems: []
    }, {
        name: 'permission-sets-getUserPermissionSets',
        path: '/getUserPermissionSets',
        get: require('./get-user-permission-sets'),
        interceptors: {
            synchronize: false
        },
        requiredPermissions: ['read-user-permission-set'],
        isPatientCentric: false,
        subsystems: []
    }, {
        name: 'permission-sets-list',
        path: '/list',
        get: require('./list'),
        interceptors: {
            synchronize: false
        },
        requiredPermissions: ['read-user-permission-set'],
        isPatientCentric: false,
        subsystems: []
    },{
        name: 'permission-sets-bulk-edit',
        path: '/multi-user-edit',
        put: require('./multi-user-edit'),
        interceptors: {
            synchronize: false
        },
        requiredPermissions: ['edit-user-permission-set'],
        isPatientCentric: false,
        subsystems: []
    }];
};
