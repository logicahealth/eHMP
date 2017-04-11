'use strict';

module.exports.getResourceConfig = function() {
    return [{
        name: 'quickorder-create',
        path: '',
        post: create,
        requiredPermissions: ['add-quick-order'],
        isPatientCentric: false,
        subsystems: ['pjds', 'quickorder']
    }, {
        name: 'quickorder-get',
        path: '/:uid',
        get: get,
        requiredPermissions: ['read-quick-order'],
        isPatientCentric: false,
        subsystems: ['pjds', 'quickorder']
    }, {
        name: 'quickorder-search',
        path: '',
        get: search,
        requiredPermissions: ['read-quick-order'],
        isPatientCentric: false,
        subsystems: ['pjds', 'quickorder']
    }, {
        name: 'quickorder-delete',
        path: '/:uid',
        delete: callDelete,
        requiredPermissions: ['delete-quick-order'],
        isPatientCentric: false,
        subsystems: ['pjds', 'quickorder']
    }, {
        name: 'quickorder-update',
        path: '/:uid',
        put: update,
        requiredPermissions: ['edit-quick-order'],
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

function callDelete(req, res) { //jshint ignore:line
    req.app.subsystems.quickorder.delete(req, res);
}

function update(req, res) {
    req.app.subsystems.quickorder.update(req, res);
}
