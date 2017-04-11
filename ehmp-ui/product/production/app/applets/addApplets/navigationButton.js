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
        template: Handlebars.compile([
            '{{#if shouldShow}}',
            '<div class="left-padding-xs">',
            '<button type="button" class="btn btn-primary workspace-editor-trigger-button workspace-manager-btn" title="Press enter to open the workspace editor.">',
            '<i class="fa fa-pencil font-size-14"></i>',
            '</button>',
            '</div>',
            '{{/if}}'
        ].join('\n')),
        templateHelpers: function() {
            var self = this;
            return {
                'shouldShow': function() {
                    return self.shouldShowModel.get('show');
                }
            };
        },
        className: 'btn-group',
        ui: {
            'WorkspaceEditorButton': '.workspace-editor-trigger-button'
        },
        events: {
            'click @ui.WorkspaceEditorButton': 'openAddApplets'
        },
        initialize: function() {
            this.shouldShowModel = new Backbone.Model({
                show: this.shouldShow()
            });
            this.listenTo(ADK.WorkspaceContextRepository.currentWorkspaceAndContext, 'change:workspace', function(model, newWorkspace) {
                this.shouldShowModel.set('show', this.shouldShow());
            });
            this.listenTo(this.shouldShowModel, 'change:show', this.render);
        },
        shouldShow: function(){
            var show = ADK.WorkspaceContextRepository.currentWorkspace.get('predefined');
            return _.isBoolean(show) ? !show : false;
        },
        openAddApplets: function(e) {
            var channel = ADK.Messaging.getChannel('addAppletsChannel');
            channel.trigger('addApplets');
        }
    });
    ADK.Messaging.trigger('register:component', {
        type: "contextNavigationItem",
        group: ["patient","patient-right"],
        key: "workspaceEditorButton",
        view: WorkspaceEditorButton,
        orderIndex: 5,
    });

    return WorkspaceEditorButton;
});