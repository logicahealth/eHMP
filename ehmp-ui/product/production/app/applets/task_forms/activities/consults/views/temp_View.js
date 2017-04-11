define([
        'backbone',
        'marionette',
        'underscore',
        'handlebars',
        'app/applets/task_forms/activities/consults/eventHandler',
        'hbs!app/applets/task_forms/activities/consults/templates/temp_Template'
    ],
    function(Backbone, Marionette, _, Handlebars, EventHandler, TempTemplate) {
        "use strict";

        return Backbone.Marionette.LayoutView.extend({
            template: TempTemplate,
            initialize: function(options) {
                EventHandler.claimTask(this.model);
            }
        });
    });
