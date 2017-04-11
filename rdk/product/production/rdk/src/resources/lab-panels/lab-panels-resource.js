'use strict';

var readLabOrders = require('./get-lab-orders');

var interceptors = {
    jdsFilter: true
};

function getResourceConfig() {
    return [{
        name: 'patient-record-labsbypanel',
        path: '',
        get: readLabOrders,
        interceptors: interceptors,
        requiredPermissions: ['read-order'],
        isPatientCentric: true,
        subsystems: ['patientrecord', 'authorization', 'jdsSync', 'jds', 'solr']
    }];
}

module.exports.getResourceConfig = getResourceConfig;
