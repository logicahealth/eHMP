'use strict';

module.exports.getResourceConfig = function() {
    return [{
        name: 'quickorder-create',
        path: '',
        post: create,
        requiredPermissions: [],
        isPatientCentric: false,
        subsystems: ['pjds', 'quickorder']
    }, {
        name: 'quickorder-get',
        path: '/:uid',
        get: get,
        requiredPermissions: [],
        isPatientCentric: false,
        subsystems: ['pjds', 'quickorder']
    }, {
        name: 'quickorder-search',
        path: '',
        get: search,
        requiredPermissions: [],
        isPatientCentric: false,
        subsystems: ['pjds', 'quickorder']
    }, {
        name: 'quickorder-delete',
        path: '/:uid',
        delete: callDelete,
        requiredPermissions: [],
        isPatientCentric: false,
        subsystems: ['pjds', 'quickorder']
    }, {
        name: 'quickorder-update',
        path: '/:uid',
        put: update,
        requiredPermissions: [],
        isPatientCentric: false,
        subsystems: ['pjds', 'quickorder']
    }];
};

function create(req, res) {
    req.app.subsystems.quickorder.create(req, res);
}

function get(req, res) {
    req.app.subsystems.quickorder.get(req, res);
}

function search(req, res) {
    req.app.subsystems.quickorder.search(req, res);
}

function callDelete(req, res) {
    req.app.subsystems.quickorder.delete(req, res);
}

function update(req, res) {
    req.app.subsystems.quickorder.update(req, res);
}
