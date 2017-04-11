define([
    "backbone",
    "marionette",
    "underscore",
    "app/applets/task_forms/activities/consults/eventHandler",
    "hbs!app/applets/task_forms/activities/consults/templates/notificationFooter_Template"
], function(Backbone, Marionette, _, EventHandler, NotificationFooterTemplate) {
    'use strict';
    return Backbone.Marionette.ItemView.extend({
        template: NotificationFooterTemplate,
        events: {
            'click #modal-close-button': 'fireCloseEvent',
            'click #modal-goto-task-button': 'fireGotoTaskEvent',
        },
        initialize: function(options) {
            this.formModel = options.formModel;
            this.taskListView = options.taskListView;
        },
        fireCloseEvent: function(e) {
            EventHandler.releaseTask(e, this.model);
        },
        fireGotoTaskEvent: function(e) {
            // Read the value of the complete button
            switch(e.target.innerHTML) {
                case 'Sign':
                    EventHandler.tempTaskProcessing(e, this.model, this.taskListView, 'sign');
                    break;
                case 'Go To Task':
                    EventHandler.tempTaskProcessing(e, this.model, this.taskListView, '');
                    break;
                case 'Complete':
                    EventHandler.completeTask(e, this.model, null, this.taskListView);
            }
        }
    });
});
