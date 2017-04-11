define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/task_forms/activities/fields',
], function(Backbone, Marionette, _, Handlebars,  Fields) {
    'use strict';

    var SelectConsultType = ADK.UI.Form.extend({
        fields: Fields.selectConsultTypeFields,
        ui: {
            'delete': '#task-order-entry-delete-button',
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
