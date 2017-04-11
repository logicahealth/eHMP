'use strict';

module.exports.getResourceConfig = function() {
    return [{
        name: 'search-global-search',
        path: '/global',
        post: require('./global-search').getGlobalSearch,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: false,
        subsystems: ['mvi']
    }, {
        name: 'search-mvi-patient-sync',
        path: '/',
        post: require('./patient-sync').getPatient,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: false,
        subsystems: ['mvi']
    }, {
        name: 'search-mvi-global-patient-sync',
        path: '/',
        get: require('./patient-sync').getGlobalPatient,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: false,
        subsystems: ['mvi']
    }, {
        name: 'search-default-search',
        path: '/cprs',
        get: require('./default-search').getMyCPRS,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: false,
        subsystems: ['mvi']
    }];
};
