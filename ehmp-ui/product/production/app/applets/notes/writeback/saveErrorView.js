define([
    'backbone',
    'marionette',
    'handlebars'
], function(Backbone, Marionette, Handlebars) {
    "use strict";

    var channel = ADK.Messaging.getChannel('notes');

    var BodyView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('Failed to save note. Review log.'),

    });

    var FooterView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('<button type="button" class="btn btn-primary ok-button" data-dismiss="modal">OK</button>'),
        events: {
            'click .ok-button': function(event) {
                if (this.triggerSave) {
                    // channel.trigger('notestray:select', uid);
                    // channel.trigger('notestray:open');
                }
            }
        }
    });

    return {
        showModal: function(fClose) {
            var errorAlertView = new ADK.UI.Alert({
                title: 'Error',
                icon: 'fa-exclamation-triangle font-size-18 color-red',
                messageView: BodyView,
                footerView: FooterView.extend({
                    triggerSave: fClose
                })
            });
            errorAlertView.show();
        }
    };
});
