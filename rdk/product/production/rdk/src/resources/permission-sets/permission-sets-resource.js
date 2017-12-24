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
        put: require('./edit-user-permission-sets'),
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
        get: require('./get-permission-sets'),
        interceptors: {
            synchronize: false
        },
        requiredPermissions: ['read-user-permission-set'],
        isPatientCentric: false,
        subsystems: []
    }, {
        name: 'permission-sets-bulk-edit',
        path: '/multi-user-edit',
        put: require('./multi-user-edit'),
        interceptors: {
            synchronize: false
        },
        requiredPermissions: ['edit-user-permission-set'],
        isPatientCentric: false,
        subsystems: []
    }, {
        name: 'permission-sets-features',
        path: '/features-list',
        get: require('./get-permission-sets-features'),
        interceptors: {
            synchronize: false
        },
        requiredPermissions: ['read-permission-sets'],
        isPatientCentric: false,
        subsystems: []
    }, {
        name: 'permission-set-add',
        path: '',
        post: require('./management/permission-set-add-writer'),
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['add-permission-sets'],
        isPatientCentric: false
    }, {
        name: 'permission-set-update',
        path: '/update',
        put: require('./management/permission-set-update-writer'),
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['edit-permission-sets'],
        isPatientCentric: false
    }, {
        name: 'permission-set-deprecate',
        path: '/deprecate',
        put: require('./management/permission-set-update-writer'),
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['deprecate-permission-sets'],
        isPatientCentric: false
    }, {
        name: 'permission-set-edit-permissions',
        path: '/edit-permissions',
        put: require('./management/permission-set-edit-permissions'),
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['edit-permission-sets'],
        isPatientCentric: false
    }, {
        name: 'permission-sets-categories',
        path: '/categories',
        get: require('./get-permission-sets-categories'),
        interceptors: {
            synchronize: false
        },
        requiredPermissions: ['read-user-permission-set'],
        isPatientCentric: false,
        subsystems: []
    }];
};
