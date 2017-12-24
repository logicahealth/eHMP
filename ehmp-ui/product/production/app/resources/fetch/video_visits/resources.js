define([
    'app/resources/fetch/video_visits/appointments',
    'app/resources/fetch/video_visits/timezone',
    'app/resources/fetch/video_visits/patientDemographics',
    'app/resources/fetch/video_visits/providerContactInfo',
    'app/resources/fetch/video_visits/patientEmergencyContact'
], function(Appointments, Timezone, PatientDemographics, ProviderContactInfo, PatientEmergencyContact) {
    'use strict';

    return {
        Appointments: Appointments,
        Timezone: Timezone,
        PatientDemographics: PatientDemographics,
        ProviderContactInfo: ProviderContactInfo,
        PatientEmergencyContact: PatientEmergencyContact
    };
});