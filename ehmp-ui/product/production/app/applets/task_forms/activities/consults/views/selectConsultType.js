define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/task_forms/activities/consults/eventHandler',
    'app/applets/task_forms/activities/fields',
], function(Backbone, Marionette, _, Handlebars, EventHandler, Fields) {
    'use strict';

    var SelectConsultType = ADK.UI.Form.extend({
        fields: Fields.selectConsultTypeFields,
        ui: {
            'delete': '#modal-delete-button',
            'accept': '#modal-accept-button',
            'saveClose': '#modal-save-close-button'
        },
        events: {
            'click button': 'closeTray'
        },
        closeTray: function() {
            var TrayView = ADK.Messaging.request("tray:writeback:actions:trayView");
            if (TrayView) {
                TrayView.$el.trigger('tray.reset');
            }
        }
    });

    return SelectConsultType;

});