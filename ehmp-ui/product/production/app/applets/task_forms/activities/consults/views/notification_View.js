define([
        'backbone',
        'marionette',
        'underscore',
        'handlebars',
        'app/applets/task_forms/activities/consults/eventHandler',
        'hbs!app/applets/task_forms/activities/consults/templates/notification_Template'
    ],
    function(Backbone, Marionette, _, Handlebars, EventHandler, NotificationTemplate) {
        "use strict";

        return Backbone.Marionette.LayoutView.extend({
            template: NotificationTemplate,
            initialize: function(options) {
                EventHandler.claimTask(this.model);
            }
        });
    });
