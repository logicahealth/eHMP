define([
    'underscore',
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'app/applets/workspace_context_navigation/applicationHeaderItems/contextLinkView'
], function(
    _,
    Backbone,
    Marionette,
    $,
    Handlebars,
    ContextLinkView
) {
    'use strict';

    var StaffContextLinkView = ContextLinkView.extend({
        getContext: function() {
            return 'staff';
        },
        label: 'Staff View',
        icon: '<i class="fa fa-user-md"></i>',
        template: Handlebars.compile([
            '{{#if isActive}}<p {{else}}<a href="#" title="Navigate to the {{getLabel}} workspaces" {{/if}}id="current-{{contextName}}-nav-header-tab" class="context-navigation-link{{#if isActive}} active{{/if}}">',
            '{{getIcon}} {{lastname}}, {{firstname}}',
            '{{#if isActive}}</p>{{else}}</a>{{/if}}'
        ].join('\n')),
        initialize: function() {
            this.model = ADK.UserService.getUserSession();
            ContextLinkView.prototype.initialize.apply(this, arguments);
        }
    });

    var StaffContextLinkHomeButtonView = ContextLinkView.extend({
        getContext: function() {
            return 'staff';
        },
        label: 'Staff View',
        icon: '<i class="fa fa-home fa-lg"></i> Home',
        template: Handlebars.compile([
            '{{#if isActive}}<p {{else}}<a href="#" title="Navigate to the {{getLabel}} workspaces" {{/if}}id="current-{{contextName}}-nav-header-tab-home-button" class="context-navigation-link{{#if isActive}} active{{/if}}">',
            '{{getIcon}}',
            '{{#if isActive}}</p>{{else}}</a>{{/if}}'
        ].join('\n')),
        initialize: function() {
            this.model = ADK.UserService.getUserSession();
            ContextLinkView.prototype.initialize.apply(this, arguments);
        }
    });

    ADK.Messaging.trigger('register:component', {
        type: 'applicationHeaderItem',
        group: 'left',
        orderIndex: 0,
        key: 'staffContextHomeButtonLink',
        view: StaffContextLinkHomeButtonView
    });

    ADK.Messaging.trigger('register:component', {
        type: "applicationHeaderItem",
        group: "right",
        key: "staffContextLink",
        view: StaffContextLinkView,
        orderIndex: 3
    });

    return StaffContextLinkView;
});
