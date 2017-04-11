/*jslint node: true */
'use strict';

var cdsExecute = require('./cds-execute');

var interceptors = {
    audit: true,
    metrics: true,
    authentication: true,
    operationalDataCheck: false,
    synchronize: false
};

exports.getResourceConfig = function (app) {

    // db setup
    cdsExecute.init(app);

    return [{
        name: 'cds-execute-cds-execute-get',
        path: '/request',
        get: cdsExecute.getExecute,
        interceptors: interceptors,
        requiredPermissions: [],
        isPatientCentric: false
    }, {
        name: 'cds-execute-cds-execute-post',
        path: '/request',
        post: cdsExecute.postExecute,
        interceptors: interceptors,
        requiredPermissions: [],
        isPatientCentric: false
    }, {
        name: 'cds-execute-cds-execute-put',
        path: '/request',
        put: cdsExecute.putExecute,
        interceptors: interceptors,
        requiredPermissions: [],
        isPatientCentric: false
    }, {
        name: 'cds-execute-cds-execute-delete',
        path: '/request',
        delete: cdsExecute.deleteExecute,
        interceptors: interceptors,
        requiredPermissions: [],
        isPatientCentric: false
    }];
};
