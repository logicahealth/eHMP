define([
    'backbone',
    'marionette',
    'hbs!app/applets/permission_sets/templates/create-back-message',
    'hbs!app/applets/permission_sets/templates/create-back-footer'
], function(Backbone, Mariontte, messageTemplate, footerTemplate) {
    'use strict';


    /**
     * Permission Sets Warning for Back Button in Create View.
     * Feature: 1285
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
            yes: 'button.alert-yes',
            no: 'button.alert-no'
        },

        events: {
            'click @ui.yes': 'onYes',
            'click @ui.no': 'onNo'
        },

        onYes: function onYes() {
            ADK.UI.Alert.hide();
            this.trigger('alert:selected:yes');
        },

        onNo: function onNo() {
            this.trigger('alert:selected:no');
            ADK.UI.Alert.hide();
        }
    });

    return {
        title: 'Warning',
        messageView: MessageView,
        footerView: FooterView
    };
});