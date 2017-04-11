define([
    "backbone",
    "marionette",
    "underscore",
    "hbs!app/applets/task_forms/common/templates/activityOverviewFooter_Template"
], function(Backbone, Marionette, _, ActivityOverviewFooterTemplate) {
    'use strict';
    return Backbone.Marionette.ItemView.extend({
        template: ActivityOverviewFooterTemplate,
        templateHelpers: function() {
            return {
                showOptionButton: function() {
                    return this.optionButtonLabel;
                }
            };
        },
        events: {
            'click #modal-discontinue-button': 'fireDiscontinueEvent',
            'click #modal-close-button': 'fireCloseTaskEvent',
            'click #modal-option-button': 'fireOptionButtonEvent'
        },
        initialize: function(options) {
            this.formModel = options.formModel;
            this.discontinueEvent = options.discontinueEvent;
            this.optionButtonEvent = options.optionButtonEvent;
        },
        fireDiscontinueEvent: function(e) {
            this.discontinueEvent();
        },
        fireOptionButtonEvent: function(e) {
            this.optionButtonEvent();
        },
        fireCloseTaskEvent: function(e) {
            ADK.Messaging.getChannel('task_forms').trigger('modal:close');
        }
    });
});
