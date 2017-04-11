'use strict';

var cdsCriteria = require('./criteria');
var cdsDefinition = require('./definition');
var cdsPatientList = require('./patient-list');

var interceptors = {
    operationalDataCheck: false,
    synchronize: false
};

exports.getResourceConfig = function(app) {

    // db setup
    cdsCriteria.init(app);
    cdsDefinition.init(app);
    cdsPatientList.init(app);

    return [{
        name: 'cds-patient-list-cds-criteria-get',
        path: '/criteria',
        get: cdsCriteria.getCriteria,
        interceptors: interceptors,
        requiredPermissions: [],
        isPatientCentric: false
    }, {
        name: 'cds-patient-list-cds-criteria-post',
        path: '/criteria',
        post: cdsCriteria.postCriteria,
        interceptors: interceptors,
        requiredPermissions: [],
        isPatientCentric: false
    }, {
        name: 'cds-patient-list-cds-criteria-delete',
        path: '/criteria',
        delete: cdsCriteria.deleteCriteria,
        interceptors: interceptors,
        requiredPermissions: [],
        isPatientCentric: false
    }, {
        name: 'cds-patient-list-cds-definition-get',
        path: '/definition',
        get: cdsDefinition.getDefinition,
        interceptors: interceptors,
        requiredPermissions: [],
        isPatientCentric: false
    }, {
        name: 'cds-patient-list-cds-definition-post',
        path: '/definition',
        post: cdsDefinition.postDefinition,
        interceptors: interceptors,
        requiredPermissions: [],
        isPatientCentric: false
    }, {
        name: 'cds-patient-list-cds-definition-delete',
        path: '/definition',
        delete: cdsDefinition.deleteDefinition,
        interceptors: interceptors,
        requiredPermissions: [],
        isPatientCentric: false
    }, {
        name: 'cds-patient-list-cds-definition-copy',
        path: '/definition/copy',
        post: cdsDefinition.copyDefinition,
        interceptors: interceptors,
        requiredPermissions: [],
        isPatientCentric: false
    }, {
        name: 'cds-patient-list-cds-patientlist-get',
        path: '/list',
        get: cdsPatientList.getPatientList,
        interceptors: interceptors,
        requiredPermissions: [],
        isPatientCentric: false
    }, {
        name: 'cds-patient-list-cds-patientlist-post',
        path: '/list',
        post: cdsPatientList.postPatientlist,
        interceptors: interceptors,
        requiredPermissions: [],
        isPatientCentric: false
    }, {
        name: 'cds-patient-list-cds-patientlist-delete',
        path: '/list',
        delete: cdsPatientList.deletePatientlist,
        interceptors: interceptors,
        requiredPermissions: [],
        isPatientCentric: false
    }, {
        name: 'cds-patient-list-cds-patientlist-add',
        path: '/list/patients',
        post: cdsPatientList.addPatient,
        interceptors: interceptors,
        requiredPermissions: [],
        isPatientCentric: false
    }, {
        name: 'cds-patient-list-cds-patientlist-remove',
        path: '/list/patients',
        delete: cdsPatientList.removePatient,
        interceptors: interceptors,
        requiredPermissions: [],
        isPatientCentric: false
    }, {
        name: 'cds-patient-list-cds-patientlist-status',
        path: '/list/status',
        get: cdsPatientList.checkPatientMembershipStatus,
        interceptors: interceptors,
        requiredPermissions: [],
        isPatientCentric: false
    }, {
        name: 'cds-patient-list-cds-patientlist-copy',
        path: '/list/copy',
        post: cdsPatientList.copyPatientlist,
        interceptors: interceptors,
        requiredPermissions: [],
        isPatientCentric: false
    }];
};
