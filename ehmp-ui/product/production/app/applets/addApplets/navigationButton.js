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

    var WorkspaceEditorButton = Backbone.Marionette.ItemView.extend({
        tagName: 'li',
        template: Handlebars.compile([
            '<a{{#if isEnabled}} href="#"{{else}} aria-disabled="true"{{/if}} class="workspace-editor-option right-padding-xs left-padding-xs" tabindex="-1" role="menuitem">',
            '<span class="flex-display">',
            '<i class="right-padding-sm top-padding-xs fa {{#if isEnabled}}fa-pencil{{else}}fa-lock{{/if}}"></i> ',
            '<span class="word-break-break-word white-space">{{#if isEnabled}}Customize this workspace{{else}}This workspace is locked and cannot be customized{{/if}}</span>',
            '</span>',
            '</a>',
        ].join('\n')),
        templateHelpers: function() {
            return {
                'isEnabled': this.shouldBeEnabledModel.get('enabled')
            };
        },
        ui: {
            'WorkspaceEditor': 'a:not([aria-disabled])'
        },
        events: {
            'click @ui.WorkspaceEditor': 'openAddApplets'
        },
        initialize: function() {
            this.shouldBeEnabledModel = new Backbone.Model({
                enabled: this.isEnabled()
            });
            this.listenTo(ADK.WorkspaceContextRepository.currentWorkspaceAndContext, 'change:workspace', function(model, newWorkspace) {
                this.shouldBeEnabledModel.set('enabled', this.isEnabled());
            });
            this.listenTo(this.shouldBeEnabledModel, 'change:enabled', this.render);
        },
        isEnabled: function() {
            var enabled = ADK.WorkspaceContextRepository.currentWorkspace.get('predefined');
            return _.isBoolean(enabled) ? !enabled : false;
        },
        openAddApplets: function(e) {
            e.preventDefault();
            var channel = ADK.Messaging.getChannel('addAppletsChannel');
            channel.trigger('addApplets', { triggerElement: this.getOption('optionsButton') });
        }
    });
    ADK.Messaging.trigger('register:component', {
        type: "workspaceSelectorOption",
        group: ["patient"],
        key: "workspaceEditorButton",
        view: WorkspaceEditorButton,
        orderIndex: 10
    });

    return WorkspaceEditorButton;
});
