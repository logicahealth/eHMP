'use strict';

var orderSet = require('./order-set');

module.exports.getResourceConfig = function() {
    return [{
        name: 'orderset-create',
        path: '',
        post: orderSet.create,
        requiredPermissions: [], // TODO: Add OrderSet specific permissions
        isPatientCentric: false
    }, {
        name: 'orderset-update',
        path: '/:uid',
        put: orderSet.updateOrderSet,
        requiredPermissions: [], // TODO: Add OrderSet specific permissions
        isPatientCentric: false
    }, {
        name: 'orderset-get-by-uid',
        path: '/:uid',
        get: orderSet.getOrderSetByUid,
        requiredPermissions: [], // TODO: Add OrderSet specific permissions
        isPatientCentric: false
    }, {
        name: 'orderset-search',
        path: '',
        get: orderSet.getSearch,
        requiredPermissions: [], // TODO: Add OrderSet specific permissions
        isPatientCentric: false
    }, {
        name: 'orderset-delete',
        path: '/:uid',
        delete: orderSet.delete,
        requiredPermissions: [], // TODO: Add OrderSet specific permissions
        isPatientCentric: false
    }];
};
