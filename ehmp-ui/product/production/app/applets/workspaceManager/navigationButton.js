define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars'
], function(
    Backbone,
    Marionette,
    _,
    Handlebars
) {
    'use strict';

    var WorkspaceManagerButton = Backbone.Marionette.ItemView.extend({
        tagName: 'li',
        template: Handlebars.compile([
            '<a href="#" class="workspace-manager-option right-padding-xs left-padding-xs workspace-manager-option--trigger" tabindex="-1" role="menuitem">',
            '<span class="flex-display">',
            '<i class="right-padding-sm top-padding-xs fa fa-wrench"></i> ',
            '<span class="word-break-break-word white-space">Manage {{context}} workspaces</span>',
            '</span>',
            '</a>',
        ].join('\n')),
        templateHelpers: function() {
            return {
                'context': ADK.WorkspaceContextRepository.currentContextId
            };
        },
        ui: {
            'WorkspaceManager': '.workspace-manager-option--trigger'
        },
        events: {
            'click @ui.WorkspaceManager': 'openWorkspaceManager'
        },
        openWorkspaceManager: function(e) {
            e.preventDefault();
            var channel = ADK.Messaging.getChannel('workspaceManagerChannel');
            channel.trigger('workspaceManager', {triggerElement: this.getOption('optionsButton')});
        }
    });

    ADK.Messaging.trigger('register:component', {
        type: "workspaceSelectorOption",
        group: ["patient"],
        key: "workspaceManagerButton",
        view: WorkspaceManagerButton,
        orderIndex: 5
    });

    return WorkspaceManagerButton;
});