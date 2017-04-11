define([
    "backbone",
    "marionette",
    "underscore",
    'app/applets/task_forms/activities/simple_activity/utils/eventHandler',
    "hbs!app/applets/task_forms/activities/simple_activity/templates/activityModalFooterTemplate"

], function(Backbone, Marionette, _, EventHandler, ActivityModalFooterTemplate) {
    'use strict';
    return Backbone.Marionette.ItemView.extend({
        template: ActivityModalFooterTemplate,
        events: {
            'click .btn-success': 'startProcess'
        },
        initialize: function(options){
            this.parentView = options.parentView;
            this.taskListView = options.taskListView;
        },
        startProcess: function(e){

            EventHandler.startProcess.call(this, e, this.taskListView);

        }
    });
});
