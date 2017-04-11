'use strict';
/**
 * Returns the configuration for the roles resources
 *  - getMeta : gets the metadata objects for a patient
 *  - edit : replaces the metadata objects for a patient
 *
 * @return {Array}      -an array containing the meta data objects stored for a patient
 *
 */
module.exports.getResourceConfig = function() {
    return [{
        name: 'patient-meta-edit',
        path: '/',
        put: require('./save-meta-data'),
        interceptors: {
            synchronize: false,
            convertPid: true
        },
        requiredPermissions: [],
        isPatientCentric: true,
        subsystems: []
    }, {
        name: 'patient-meta-get',
        path: '/',
        get: require('./get-meta-data'),
        interceptors: {
            synchronize: false,
            convertPid: true
        },
        requiredPermissions: [],
        isPatientCentric: true,
        subsystems: []
    }];
};
