define([
    'underscore',
    'backbone',
    'marionette',
    'handlebars'
], function(
    _,
    Backbone,
    Marionette,
    Handlebars
) {
    'use strict';
    var LaunchButton = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile(
            '<button type="button" class="launch-screen btn btn-sm btn-icon"' +
            'title="{{#unless isEnabled}}Unable to launch an empty workspace{{/unless}}"' +
            'aria-label="{{#if isEnabled}}Launch {{#if title}}{{title}}{{else}}this workspace{{/if}}"' +
            '{{else}}Unable to launch an empty workspace" disabled{{/if}}>' +
            'Launch</button>'
        ),
        templateHelpers: function() {
            return {
                isEnabled: !!this.model.get('hasApplets')
            };
        },
        events: {
            'click button': 'launchWorkspace'
        },
        launchWorkspace: function(e) {
            if (_.isEmpty(this.model.get('title'))) {
                return;
            }
            ADK.Navigation.navigate(this.model.get('routeName'));
        }
    });
    return LaunchButton;
});
