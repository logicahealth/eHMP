define([
    'backbone',
    'marionette',
    'hbs!app/applets/permission_sets/templates/fetch-fail-message',
    'hbs!app/applets/permission_sets/templates/fetch-fail-footer'
], function(Backbone, Mariontte, messageTemplate, footerTemplate) {
    'use strict';


    /**
     * Permission Sets Loading failure.
     * Feature: 1285
     *
     *  This is displayed when any of the fetches for forms failed, while still on
     *  loading screen
     *
     * Original Specification: https://wiki.vistacore.us/x/o4igAQ
     */
    var MessageView = Backbone.Marionette.ItemView.extend({
        template: messageTemplate
    });

    var FooterView = Backbone.Marionette.ItemView.extend({
        behaviors: {
            KeySelect: {}
        },

        template: footerTemplate,

        ui: {
            abort: 'button.alert-fail'

        },

        events: {
            'click @ui.abort': 'onAcknowledge'
        },

        onAcknowledge: function onAcknowledge() {
            this.trigger('fetch:aborted:confirm');
            ADK.UI.Alert.hide();
        }
    });

    return {
        title: 'Error',
        messageView: MessageView,
        footerView: FooterView
    };
});
