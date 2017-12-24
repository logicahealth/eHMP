define([
    'app/resources/fetch/patient_selection/confirmation/collection'
], function(
    BaseCollection
) {
    'use strict';

    var Sites = BaseCollection.extend({
        resource: 'facility-list'
    });

    return Sites;
});
