define([
    'moment',
    'app/resources/fetch/video_visits/collection'
], function(Moment, BaseCollection) {
    'use strict';

    var PatientDemographics = BaseCollection.extend({
        resource: 'video-visit-patient-demographics-get',
        cache: false
    });

    return PatientDemographics;
});