'use strict';

module.exports.getResourceConfig = function() {
    return [{
        name: 'orderset-create',
        path: '',
        post: create,
        requiredPermissions: ['add-order-set'], // FUTURE-TODO: Add OrderSet specific permissions
        isPatientCentric: false,
        subsystems: ['pjds', 'orderset']
    }, {
        name: 'orderset-update',
        path: '/:uid',
        put: update,
        requiredPermissions: ['edit-order-set'], // FUTURE-TODO: Add OrderSet specific permissions
        isPatientCentric: false,
        subsystems: ['pjds', 'orderset']
    }, {
        name: 'orderset-get-by-uid',
        path: '/:uid',
        get: getByUid,
        requiredPermissions: ['read-order-set'], // FUTURE-TODO: Add OrderSet specific permissions
        isPatientCentric: false,
        subsystems: ['pjds', 'orderset']
    }, {
        name: 'orderset-search',
        path: '',
        get: search,
        requiredPermissions: ['read-order-set'], // FUTURE-TODO: Add OrderSet specific permissions
        isPatientCentric: false,
        subsystems: ['pjds', 'orderset']
    }, {
        name: 'orderset-delete',
        path: '/:uid',
        delete: callDelete,
        requiredPermissions: ['delete-order-set'], // FUTURE-TODO: Add OrderSet specific permissions
        isPatientCentric: false,
        subsystems: ['pjds', 'orderset']
    }];
};

function create(req, res) {
    req.app.subsystems.orderset.create(req, res);
}

function update(req, res) {
    req.app.subsystems.orderset.updateOrderSet(req, res);
}

function getByUid(req, res) {
    req.app.subsystems.orderset.getOrderSetByUid(req, res);
}

function search(req, res) {
    req.app.subsystems.orderset.getSearch(req, res);
}

function callDelete(req, res) { //jshint ignore:line
    req.app.subsystems.orderset.delete(req, res);
}
