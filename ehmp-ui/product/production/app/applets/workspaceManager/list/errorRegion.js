define([
    'marionette',
    'hbs!app/applets/workspaceManager/list/errorMessage'
], function(Mn, template) {
    'use strict';

    return Mn.ItemView.extend({
        behaviors: {
            KeySelect: {}
        },
        template: template,
        className: 'all-padding-xs',
        ui: {
            button: 'button'
        },
        events: {
            'click @ui.button': 'destroy'
        }
    });
});