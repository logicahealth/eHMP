'use strict';

var intentResource = require('./cds-intent');

var interceptors = {
    operationalDataCheck: false,
    pep: false,
    synchronize: false
};

exports.getResourceConfig = function(app) {

    return [{
        name: 'cds-intent-cds-intent-get',
        path: '/registry',
        get: intentResource.getIntent,
        interceptors: interceptors,
        requiredPermissions: ['read-cds-intent'],
        isPatientCentric: false
    }, {
        name: 'cds-intent-cds-intent-post',
        path: '/registry',
        post: intentResource.postIntent,
        interceptors: interceptors,
        requiredPermissions: ['manage-cds-intent'],
        isPatientCentric: false
    }, {
        name: 'cds-intent-cds-intent-put',
        path: '/registry',
        put: intentResource.putIntent,
        interceptors: interceptors,
        requiredPermissions: ['manage-cds-intent'],
        isPatientCentric: false
    }, {
        name: 'cds-intent-cds-intent-delete',
        path: '/registry',
        delete: intentResource.deleteIntent,
        interceptors: interceptors,
        requiredPermissions: ['manage-cds-intent'],
        isPatientCentric: false
    }];
};
