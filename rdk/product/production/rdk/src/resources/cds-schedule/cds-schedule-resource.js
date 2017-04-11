'use strict';

var cdsSchedule = require('./cds-schedule');

var interceptors = {
    audit: true,
    metrics: true,
    authentication: true,
    operationalDataCheck: false,
    synchronize: false
};

exports.getResourceConfig = function (app) {

    // db setup
    cdsSchedule.init(app);

    return [{
        name: 'cds-schedule-cds-schedule-get',
        path: '/job',
        get: cdsSchedule.getJob,
        interceptors: interceptors,
        requiredPermissions: [],
        isPatientCentric: false
    }, {
        name: 'cds-schedule-cds-schedule-post',
        path: '/job',
        post: cdsSchedule.postJob,
        interceptors: interceptors,
        requiredPermissions: [],
        isPatientCentric: false
    }, {
        name: 'cds-schedule-cds-schedule-put',
        path: '/job',
        put: cdsSchedule.putJob,
        interceptors: interceptors,
        requiredPermissions: [],
        isPatientCentric: false
    }, {
        name: 'cds-schedule-cds-schedule-delete',
        path: '/job',
        delete: cdsSchedule.deleteJob,
        interceptors: interceptors,
        requiredPermissions: [],
        isPatientCentric: false
    }];
};
