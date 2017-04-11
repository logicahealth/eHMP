define([
    "backbone",
    "marionette",
    "underscore",
    "hbs!app/applets/task_forms/activities/simple_activity/templates/changedActivityHeaderTemplate"

], function(Backbone, Marionette, _, ChangedActivityHeaderTemplate) {
    'use strict';
    return Backbone.Marionette.ItemView.extend({
        template: ChangedActivityHeaderTemplate,
        initialize: function(options){
            this.parentView = options.parentView;
        }
    });
});
