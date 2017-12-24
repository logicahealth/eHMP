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
    var CustomizeButton = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile(
            '{{#if savingWorkspace}}' +
            '<button class="btn btn-icon" disabled title="{{savingWorkspaceDescription}}" aria-label="{{savingWorkspaceDescription}}"><i class="fa fa-spin fa-spinner"></i> Saving</button>' +
            '{{else if isEditable}}' +
            '<a href="#" class="customize-screen btn btn-sm btn-icon btn-block" aria-label="{{getAriaLabel}}">Customize</a>' +
            '{{else}}' +
            '<button class="btn btn-icon" disabled title="{{disabledDescription}}" aria-label="{{disabledDescription}}"><i class="fa fa-lock"></i></button>' +
            '{{/if}}'
        ),
        templateHelpers: function() {
            return {
                isEditable: !this.model.get('predefined'),
                getAriaLabel: 'Customize ' + (this.model.get('title') || 'this workspace'),
                disabledDescription: 'This workspace is locked and cannot be customized',
                savingWorkspaceDescription: 'Please wait while Workspace is saving'
            };
        },
        modelEvents: {
            'change:savingWorkspace': 'render'
        },
        events: {
            'click .customize-screen': 'customizeWorkspace'
        },
        customizeWorkspace: function(e) {
            e.preventDefault();
            if (_.isEmpty(this.model.get('title').trim())) {
                return;
            }
            var modalRegion = ADK.Messaging.request('get:adkApp:region', 'modalRegion');
            var triggerElement = _.get(modalRegion, '$triggerElement[0]');
            ADK.Navigation.navigate(this.model.get('routeName'), {
                extraScreenDisplay: {
                    dontLoadApplets: true
                }
            });
            var channel = ADK.Messaging.getChannel('addAppletsChannel');
            channel.trigger('addApplets', {
                triggerElement: triggerElement
            });
        }
    });
    return CustomizeButton;
});