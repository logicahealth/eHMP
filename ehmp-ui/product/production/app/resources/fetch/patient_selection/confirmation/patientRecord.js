define([
    'app/resources/fetch/patient_selection/confirmation/collection'
], function(
    BaseCollection
) {
    'use strict';

    var PatientRecord = BaseCollection.extend({
        resource: 'patient-record-patient'
    });

    return PatientRecord;
});
