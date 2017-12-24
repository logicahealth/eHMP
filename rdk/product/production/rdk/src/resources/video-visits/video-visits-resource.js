'use strict';

var appointmentsResource = require('./appointments');
var providerContactResource = require('./provider-contact');
var facilityTimezoneResource = require('./facility-timezone');
var instructionsResource = require('./instructions');
var patientProfileResource = require('./patient-profile-service');


function getResourceConfig() {
    return [{
        name: 'video-visit-appointments-get',
        path: '',
        get: appointmentsResource.getVideoVisitAppointments,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: true,
        description: 'Gets available video visit appointments for given patient',
        subsystems: ['videoVisitsService']
    }, {
        name: 'video-visit-appointments-post',
        path: '',
        post: appointmentsResource.createVideoVisitAppointment,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: true,
        description: 'Creates a new video visit appointment',
        subsystems: ['videoVisitsService']
    }, {
        name: 'video-visit-provider-contact-get',
        path: '/provider/contact',
        get: providerContactResource.getProviderContactInfo,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: false,
        description: 'Retrieve provider contact information',
        subsystems: ['videoVisitsService']
    }, {
        name: 'video-visit-provider-contact-post',
        path: '/provider/contact',
        post: providerContactResource.createProviderContactInfo,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: false,
        description: 'Create provider contact information',
        subsystems: ['videoVisitsService']
    }, {
        name: 'video-visit-provider-contact-put',
        path: '/provider/contact',
        put: providerContactResource.updateProviderContactInfo,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: false,
        description: 'Update provider contact information',
        subsystems: ['videoVisitsService']
    }, {
        name: 'video-visit-provider-contact-delete',
        path: '/provider/contact',
        delete: providerContactResource.deleteProviderContactInfo,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: false,
        description: 'Delete provider contact information',
        subsystems: ['videoVisitsService']
    }, {
        name: 'video-visit-facility-timezone-get',
        path: '/facility/timezone',
        get: facilityTimezoneResource.getFacilityTimezone,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: false,
        description: 'Retrieve facility timezone information',
        subsystems: ['videoVisitsService']
    }, {
        name: 'video-visit-instructions-get',
        path: '/instructions',
        get: instructionsResource.getInstructions,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: false,
        description: 'Retrieve instructions list',
        subsystems: ['videoVisitsService']
    }, {
        name: 'video-visit-patient-demographics-get',
        path: '/patient/demographics',
        get: patientProfileResource.getPatientDemographics,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: false,
        description: 'Retrieve patient demographics',
        subsystems: ['patientProfileService']
    }, {
        name: 'video-visit-patient-demographics-post',
        path: '/patient/demographics',
        post: patientProfileResource.createPatientDemographics,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: false,
        description: 'Create patient demographics',
        subsystems: ['patientProfileService']
    }, {
        name: 'video-visit-patient-demographics-put',
        path: '/patient/demographics',
        put: patientProfileResource.updatePatientDemographics,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: false,
        description: 'Update patient demographics',
        subsystems: ['patientProfileService']
    }, {
        name: 'video-visit-patient-emergency-contact-get',
        path: '/patient/emergencycontact',
        get: patientProfileResource.getPatientEmergencyContact,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: false,
        description: 'Retrieve patient emergency contact information',
        subsystems: ['patientProfileService']
    }];
}

module.exports.getResourceConfig = getResourceConfig;
