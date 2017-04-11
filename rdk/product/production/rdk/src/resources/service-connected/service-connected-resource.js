'use strict';

module.exports.getResourceConfig = function() {
    return [{
        name: 'patient-service-connected-serviceConnected',
        path: '/serviceconnectedrateddisabilities',
        get: require('./get-service-connected-and-rated-disabilities'),
        interceptors: {
            operationalDataCheck: false,
            synchronize: true,
            convertPid: true
        },
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: true,
        subsystems: ['jds']
    }, {
        name: 'patient-service-connected-scButtonSelection',
        path: '/serviceconnectedserviceexposurelist',
        get: require('./get-service-connected-and-service-exposure-list'),
        interceptors: {
            operationalDataCheck: false,
            synchronize: true,
            convertPid: true
        },
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: true,
        subsystems: ['jds']
    }];
};
