define([
    'backbone',
    'marionette',
    'underscore'
], function(Backbone, Marionette, _) {
    'use strict';

    var MessageView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile([
            '<div class="detail-modal-content row">',
            '{{#unless instructionsOther}}',
            '<p class="col-xs-12"><strong>Title:</strong> {{instructionsTitle}}</p>',
            '{{/unless}}',
            '<p class="col-xs-12">{{instruction}}</p>',
            '</div>'
        ].join('\n'))
    });

    var FooterView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('{{ui-button "Close" classes="btn-default alert-cancel"}}'),
        events: {
            'click button': function() {
                ADK.UI.Alert.hide();
            }
        }
    });

    var Alert = ADK.UI.Alert.extend({
        title: "Additional Instructions",
        icon: "",
        messageView: MessageView,
        footerView: FooterView
    });

    return Alert;
});
