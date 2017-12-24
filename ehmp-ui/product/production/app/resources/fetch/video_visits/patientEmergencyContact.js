define([
    'moment',
    'app/resources/fetch/video_visits/collection'
], function(Moment, BaseCollection) {
    'use strict';

    var PatientEmergencyContact = BaseCollection.extend({
        resource: 'video-visit-patient-emergency-contact-get',
        cache: false
    });

    return PatientEmergencyContact;
});