define([
    "backbone",
    "marionette",
    "underscore",
    "app/applets/task_forms/common/utils/eventHandler",
    "hbs!app/applets/task_forms/activities/sign_note/templates/modalFooterTemplate"
], function(Backbone, Marionette, _, EventHandler, ModalFooterTemplate) {
    'use strict';
    return Backbone.Marionette.ItemView.extend({
        template: ModalFooterTemplate,
        events: {
            'click #modal-cancel-button': 'fireCloseEvent'
        },
        initialize: function(options){
            this.parentView = options.parentView || null;
            this.taskListView = options.taskListView || null;
        },
        fireCloseEvent: function(e){
            // TODO: Uncomment when final decisions are made
            // EventHandler.unclaimTask.call(this, e, this.parentView);
            EventHandler.fireCloseEvent.call(this, e);
        }
    });
});
