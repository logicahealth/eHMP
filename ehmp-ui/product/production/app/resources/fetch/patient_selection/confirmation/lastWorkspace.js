define([
    'app/resources/fetch/patient_selection/confirmation/collection'
], function(
    BaseCollection
) {
    'use strict';

    var LastWorkspace = BaseCollection.extend({
        resource: 'patient-last-workspace'
    });

    return LastWorkspace;
});
