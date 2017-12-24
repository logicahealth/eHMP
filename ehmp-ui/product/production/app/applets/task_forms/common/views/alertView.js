define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'hbs!app/applets/task_forms/common/templates/alertTemplate'
], function(Backbone, Marionette, _, Handlebars, AlertTemplate) {
    'use strict';

    var MessageView = Backbone.Marionette.ItemView.extend({
        template: AlertTemplate
    });
    var FooterView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('{{ui-button "Ok" classes="btn-primary btn-sm alert-cancel"}}'),
        events: {
            'click button': function() {
                // hide is available on the ADK.UI.Alert constructor
                // see table below for more details
                ADK.UI.Alert.hide();
            }
        }
    });

    return {
        MessageView: MessageView,
        FooterView: FooterView
    };
});
