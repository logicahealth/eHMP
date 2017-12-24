define([
    'backbone',
    'marionette',
    'handlebars'
], function(Backbone, Marionette, Handlebars) {
    'use strict';

    var AlertBodyView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('<p>If you want to start this Video Visit as the Provider, select Yes to open the visit in a new window.<br />Select No to return to the Appointment Details view.</p>')
    });

    var AlertFooterView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile([
            '{{ui-button "No" classes="btn-default btn-sm alert-cancel"}}',
            '{{ui-button "Yes" classes="btn-primary btn-sm alert-continue" title="Open visit in a new window."}}'
        ].join('\n')),
        events: {
            'click .alert-continue': function() {
                var conferenceURL = _.get(this.model.get('providers'), 'provider[0].virtualMeetingRoom.url');
                if (_.isString(conferenceURL)) {
                    window.open(conferenceURL);
                }
                ADK.UI.Alert.hide();
            },
            'click .alert-cancel': function() {
                ADK.UI.Alert.hide();
            }
        }
    });

    var ConfirmationAlert = ADK.UI.Alert.extend({
        title: 'Start Video Visit',
        icon: '',
        messageView: AlertBodyView,
        footerView: AlertFooterView
    });

    return ConfirmationAlert;
});
