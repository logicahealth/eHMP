define([
    'app/resources/writeback/activities/signal/model'
], function(Model) {
    var activities = ADK.Resources.Writeback.Collection.extend({
        resource: 'activities-signal',
        vpr: 'activities',
        model: Model
    });

    return activities;
});