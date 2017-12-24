define([
    'app/resources/fetch/patient_selection/confirmation/collection'
], function(
    BaseCollection
) {
    'use strict';

    var PatientMetaData = BaseCollection.extend({
        resource: 'patient-search-pid'
    });

    return PatientMetaData;
});
