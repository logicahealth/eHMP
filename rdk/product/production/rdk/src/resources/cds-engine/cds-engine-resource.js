/*jslint node: true */
'use strict';

var cdsEngine = require('./cds-engine');

var interceptors = {
    audit: true,
    metrics: true,
    authentication: true,
    operationalDataCheck: false,
    synchronize: false
};

exports.getResourceConfig = function (app) {

    // db setup
    cdsEngine.init(app);

    return [{
        name: 'cds-engine-cds-engine-get',
        path: '/registry',
        get: cdsEngine.getEngine,
        interceptors: interceptors,
        requiredPermissions: [],
        isPatientCentric: false
    }, {
        name: 'cds-engine-cds-engine-post',
        path: '/registry',
        post: cdsEngine.postEngine,
        interceptors: interceptors,
        requiredPermissions: [],
        isPatientCentric: false
    }, {
        name: 'cds-engine-cds-engine-put',
        path: '/registry',
        put: cdsEngine.putEngine,
        interceptors: interceptors,
        requiredPermissions: [],
        isPatientCentric: false
    }, {
        name: 'cds-engine-cds-engine-delete',
        path: '/registry',
        delete: cdsEngine.deleteEngine,
        interceptors: interceptors,
        requiredPermissions: [],
        isPatientCentric: false
    }];
};
