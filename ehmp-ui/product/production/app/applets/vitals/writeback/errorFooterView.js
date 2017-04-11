define([
    'backbone',
    'marionette',
    'handlebars'
], function(Backbone, Marionette, Handlebars) {
	'use strict';
    var ErrorFooterView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('{{ui-button "OK" classes="btn-primary btn-sm" title="Press enter to close."}}'),
        events: {
            'click .btn-primary': function() {
                ADK.UI.Alert.hide();
                if (this.form) {
                    this.form.$(this.form.ui.submitButton.selector).trigger('control:disabled', false);
                }
            }
        },
        tagName: 'span'
    });
    return ErrorFooterView;
});
