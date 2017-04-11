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
        },
        fireCloseEvent: function(e){
            EventHandler.fireCloseEvent.call(this, e);
        }
    });
});
