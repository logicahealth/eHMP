define([
    'app/resources/writeback/activities/signal/model'
], function(Model) {
    'use strict';

    var activities = ADK.Resources.Writeback.Collection.extend({
        resource: 'activities-signal',
        vpr: 'activities',
        model: Model
    });

    return activities;
});