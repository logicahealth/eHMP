'use strict';

module.exports.getResourceConfig = function() {
    return [{
        name: 'enterprise-orderable-create',
        path: '',
        post: callCreate,
        requiredPermissions: ['manage-enterprise-orderable'],
        isPatientCentric: false,
        subsystems: ['pjds', 'enterpriseOrderable']
    }, {
        name: 'enterprise-orderable-get',
        path: '/:uid',
        get: callGet,
        requiredPermissions: ['read-enterprise-orderable'],
        isPatientCentric: false,
        subsystems: ['pjds', 'enterpriseOrderable']
    }, {
        name: 'enterprise-orderable-search',
        path: '',
        get: callSearch,
        requiredPermissions: ['read-enterprise-orderable'],
        isPatientCentric: false,
        subsystems: ['pjds', 'enterpriseOrderable']
    }, {
        name: 'enterprise-orderable-delete',
        path: '/:uid',
        delete: callDelete,
        requiredPermissions: ['manage-enterprise-orderable'],
        isPatientCentric: false,
        subsystems: ['pjds', 'enterpriseOrderable']
    }, {
        name: 'enterprise-orderable-update',
        path: '/:uid',
        put: callUpdate,
        requiredPermissions: ['manage-enterprise-orderable'],
        isPatientCentric: false,
        subsystems: ['pjds', 'enterpriseOrderable']
    }];
};

function callCreate(req, res) {
    req.app.subsystems.enterpriseOrderable.create(req, res);
}

function callGet(req, res) {
    req.app.subsystems.enterpriseOrderable.get(req, res);
}

function callSearch(req, res) {
    req.app.subsystems.enterpriseOrderable.search(req, res);
}

function callDelete(req, res) {
    req.app.subsystems.enterpriseOrderable.delete(req, res);
}

function callUpdate(req, res) {
    req.app.subsystems.enterpriseOrderable.update(req, res);
}
