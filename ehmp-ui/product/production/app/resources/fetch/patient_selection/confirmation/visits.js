define([
    'app/resources/fetch/patient_selection/confirmation/collection'
], function(
    BaseCollection
) {
    'use strict';

    var Sites = BaseCollection.extend({
        resource: 'patient-record-visit'
    });

    return Sites;
});
