'use strict';

module.exports.getResourceConfig = function() {
    return [{
        name: 'patient-search-full-name',
        path: '/full-name',
        get: require('./full-name'),
        interceptors: {
            jdsFilter: true,
            synchronize: false
        },
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: false,
        subsystems: ['mvi', 'jdsSync']
    }, {
        name: 'patient-search-last5',
        path: '/last5',
        get: require('./last5'),
        interceptors: {
            jdsFilter: true,
            synchronize: false
        },
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: false,
        subsystems: ['mvi', 'jdsSync']
    }, {
        name: 'patient-search-pid',
        path: '/pid',
        get: require('./pid').performPatientSearch,
        interceptors: {
            jdsFilter: true,
            synchronize: false
        },
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: false
    }, {
        name: 'patient-last-workspace',
        path: '/last-workspace',
        get: require('./last-workspace').getLastWorkspace,
        interceptors: {
            jdsFilter: true,
            synchronize: false
        },
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: false
    }];
};
