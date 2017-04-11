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
        template: Handlebars.compile([
            '<button class="btn btn-primary workspace-manager-btn" title="Press enter to open the workspace manager." type="button" id="workspaceManagerButton"><i class="fa fa-th-large"></i></button>'
        ].join('\n')),
        className: 'btn-group left-padding-xs',
        events: {
            'click': 'openWorkspaceManager'
        },
        openWorkspaceManager: function(e) {
            var channel = ADK.Messaging.getChannel('workspaceManagerChannel');
            channel.trigger('workspaceManager');
        }
    });
    ADK.Messaging.trigger('register:component', {
        type: "contextNavigationItem",
        group: ["patient", "patient-right", "staff", "admin"],
        key: "workspaceManagerButton",
        view: WorkspaceManagerButton,
        orderIndex: 4
    });

    return WorkspaceManagerButton;
});