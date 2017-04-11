'use strict';

var quickOrder = require('./quick-order');

module.exports.getResourceConfig = function() {
    return [{
        name: 'quickorder-create',
        path: '',
        post: quickOrder.create,
        requiredPermissions: [],
        isPatientCentric: false
    }, {
        name: 'quickorder-get',
        path: '/:uid',
        get: quickOrder.get,
        requiredPermissions: [],
        isPatientCentric: false
    }, {
        name: 'quickorder-search',
        path: '',
        get: quickOrder.search,
        requiredPermissions: [],
        isPatientCentric: false
    }, {
        name: 'quickorder-delete',
        path: '/:uid',
        delete: quickOrder.delete,
        requiredPermissions: [],
        isPatientCentric: false
    }, {
        name: 'quickorder-update',
        path: '/:uid',
        put: quickOrder.update,
        requiredPermissions: [],
        isPatientCentric: false
    }];
};
