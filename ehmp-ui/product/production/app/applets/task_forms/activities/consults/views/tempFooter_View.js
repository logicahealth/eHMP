define([
    "backbone",
    "marionette",
    "underscore",
    "app/applets/task_forms/activities/consults/eventHandler",
    "hbs!app/applets/task_forms/activities/consults/templates/tempFooter_Template"
], function(Backbone, Marionette, _, EventHandler, TempFooterTemplate) {
    'use strict';
    return Backbone.Marionette.ItemView.extend({
        template: TempFooterTemplate,
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
                case 'Respond':
                case 'Complete Review':
                    EventHandler.completeTask(e, this.model, null, this.taskListView);
                    break;
                case 'Sign Note':
                    EventHandler.tempTaskProcessing(e, this.model, this.taskListView, 'signed');
                    break;
                case 'Patient Checked-in':
                    EventHandler.tempTaskProcessing(e, this.model, this.taskListView, 'checked-in');
                    break;
                case 'Satisfied':
                    EventHandler.tempTaskProcessing(e, this.model, this.taskListView, 'satisfied');
                    break;
                case 'Scheduled':
                    EventHandler.tempTaskProcessing(e, this.model, this.taskListView, 'scheduled');
            }
        }
    });
});
