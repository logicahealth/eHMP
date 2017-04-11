define([
    'underscore',
    'backbone',
    'marionette',
    'jquery',
    'handlebars'
], function(
    _,
    Backbone,
    Marionette,
    $,
    Handlebars
) {
    'use strict';

    var ContextLinkView = Backbone.Marionette.ItemView.extend({
        getContext: function() {
            return ADK.WorkspaceContextRepository.userDefaultContext;
        },
        label: null,
        icon: null,
        tagName: 'li',
        template: Handlebars.compile([
            '{{#if isActive}}<p {{else}}<a href="#" title="Press enter to navigate to the {{getLabel}} centric workspaces." {{/if}}id="current-{{contextName}}-nav-header-tab" class="context-navigation-link{{#if isActive}} active{{/if}}">',
            '{{getIcon}} {{getLabel}}',
            '{{#if isActive}}</p>{{else}}</a>{{/if}}'
        ].join('\n')),
        templateHelpers: function() {
            var self = this;
            return {
                'isActive': function() {
                    return self.templateHelperModel.get('isActive');
                },
                contextName: self.getContext(),
                getIcon: new Handlebars.SafeString(this.icon || ''),
                getLabel: this.label || ''
            };
        },
        events: {
            'click a': 'navigateToContextDefault'
        },
        modelEvents: {
            'change:fullName': 'render'
        },
        isActive: function(model) {
            return _.isEqual(model.get('context'), this.getContext()) ? true : false;
        },
        initialize: function() {
            this.contextDefaultWorkspace = ADK.WorkspaceContextRepository.getDefaultScreenOfContext(this.getContext());
            var currentNavigationPathModel = ADK.WorkspaceContextRepository.currentWorkspaceAndContext;
            this.templateHelperModel = new Backbone.Model({
                'isActive': _.isEqual(currentNavigationPathModel.get('context'), this.getContext()) ? true : false
            });

            this.listenTo(ADK.WorkspaceContextRepository.currentWorkspaceAndContext, 'change', function(model) {
                this.templateHelperModel.set({
                    'isActive': this.isActive(model),
                });
            });
            this.listenTo(this.templateHelperModel, 'change:isActive', this.render);
        },
        navigateToContextDefault: function(e) {
            e.preventDefault();
            var currentWorkspaceAndContextModel = ADK.WorkspaceContextRepository.currentWorkspaceAndContext;
            if (currentWorkspaceAndContextModel.get('context') !== this.getContext() || currentWorkspaceAndContextModel.get('workspace') !== this.contextDefaultWorkspace) {
                ADK.Navigation.navigate(this.contextDefaultWorkspace);
            }
        }
    });

    return ContextLinkView;
});