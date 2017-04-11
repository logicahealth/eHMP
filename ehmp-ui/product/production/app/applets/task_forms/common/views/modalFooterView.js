define([
    "backbone",
    "marionette",
    "underscore",
    "app/applets/task_forms/common/utils/eventHandler",
    "hbs!app/applets/task_forms/common/templates/modalFooterTemplate"

], function(Backbone, Marionette, _, EventHandler, ModalFooterTemplate) {
    'use strict';
    return Backbone.Marionette.ItemView.extend({
        template: ModalFooterTemplate,
        events: {
            'click .btn-success': 'completeTask',
            'click #modal-cancel-button': 'fireCloseEvent'
        },
        initialize: function(options){
            this.parentView = options.parentView || null;
            this.taskListView = options.taskListView || null;
        },
        completeTask: function(e){
            var formModel = this.parentView.formModel;
            // Claim and complete task if it is a notification, otherwise, validate form before completing
            if(formModel === undefined) {
                EventHandler.claimAndCompleteTask(e, this);
            } else if (formModel.isValid()) {
                EventHandler.completeTask.call(this, e, this.parentView, this.taskListView);
            }
        },
        fireCloseEvent: function(e){
            EventHandler.fireCloseEvent.call(this, e);
        }
    });
});
