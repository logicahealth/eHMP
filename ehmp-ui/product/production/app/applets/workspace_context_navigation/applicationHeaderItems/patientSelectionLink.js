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

    var PatientSelectionLinkView = Backbone.Marionette.ItemView.extend({
        tagName: 'li',
        className: 'patient-selection-link-style',
        template: Handlebars.compile([
            '{{#if isActive}}<p {{else}}<a href="#" title="Return to patient search and choose another patient" {{/if}}id="patientSearchButton" class="context-navigation-link{{#if isActive}} active{{/if}}">',
            '<i class="fa fa-user font-size-15" aria-hidden="true"></i><i class="fa fa-search" aria-hidden="true"></i> Patient Selection',
            '{{#if isActive}}</p>{{else}}</a>{{/if}}'
        ].join('\n')),
        events: {
            'click a': 'navigateToPatientSelection'
        },
        modelEvents: {
            'change:shouldShow change:isActive': 'render'
        },
        initialize: function() {
            var currentNavigationPathModel = ADK.WorkspaceContextRepository.currentWorkspaceAndContext;
            this.model = new Backbone.Model({
                isActive: _.isEqual(currentNavigationPathModel.get('workspace'), 'patient-search-screen') ? true : false,
            });
            this.listenTo(ADK.WorkspaceContextRepository.currentWorkspaceAndContext, 'change', function(model) {
                this.model.set({
                    isActive: _.isEqual(model.get('workspace'), 'patient-search-screen') ? true : false,
                });
            });
        },
        navigateToPatientSelection: function(e) {
            e.preventDefault();
            if (ADK.WorkspaceContextRepository.currentWorkspaceAndContext.get('workspace') !== 'patient-search-screen') {
                ADK.Navigation.navigate('patient-search-screen');
            }
        }
    });

    ADK.Messaging.trigger('register:component', {
        type: "applicationHeaderItem",
        group: "left",
        key: "patientSelectionLink",
        view: PatientSelectionLinkView,
        orderIndex: 1,
        shouldShow: function() {
            return (ADK.UserService.hasPermissions('read-patient-record'));
        }
    });

    return PatientSelectionLinkView;
});