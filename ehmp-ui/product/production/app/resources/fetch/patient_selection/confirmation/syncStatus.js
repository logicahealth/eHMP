define([
    'app/resources/fetch/patient_selection/confirmation/collection'
], function(
    BaseCollection
) {
    'use strict';

    var SyncStatus = BaseCollection.extend({
        resource: 'synchronization-datastatus'
    });

    return SyncStatus;
});
