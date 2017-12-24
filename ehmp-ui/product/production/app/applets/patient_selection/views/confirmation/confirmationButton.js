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

    var ConfirmationButton = Backbone.Marionette.ItemView.extend({
        attributes: {
            'aria-live': 'assertive'
        },
        ButtonModel: Backbone.Model.extend({
            defaults: {
                state: null // 'loading' or 'syncing'
            }
        }),
        buttonText: 'Confirm Selection',
        buttonAction: 'selection',
        template: Handlebars.compile(
            '<button' +
            ' type="button"' +
            ' id="{{getId}}"' +
            ' class="confirm btn btn-success btn-block btn-lg"' +
            '{{#if isDisabled}} disabled{{/if}}' +
            '>' +
            '{{#if isInProgress}}' +
            '<i class="fa fa-spinner fa-spin right-margin-xs"></i>' +
            '{{#if isLoading}}' +
            'Loading Patient Data' +
            '{{else if isSyncing}}' +
            'Syncing Patient Data...' +
            '{{else if isCCOWing}}' +
            'Fetching New Patient Records...' +
            '{{/if}}' +
            '{{else}}' +
            '<div aria-hidden="true">{{getButtonText}}</div>' +
            '<div class="sr-only">Confirm {{displayName}} {{getAction}}</div>' +
            '{{/if}}' +
            '</button> '
        ),
        templateHelpers: function() {
            var buttonState = this.buttonModel.get('state');
            return {
                isLoading: _.isEqual(buttonState, 'loading'),
                isSyncing: !this.getOption('ccowWorkflow') && _.isEqual(buttonState, 'syncing'),
                isCCOWing: !!this.getOption('ccowWorkflow') && _.isEqual(buttonState, 'syncing'),
                isInProgress: function() {
                    return this.isLoading || this.isSyncing || this.isCCOWing;
                },
                isDisabled: function() {
                    return !!_.result(this, 'isInProgress') || _.isEqual(buttonState, 'disabled');
                },
                getId: this.getOption('buttonId') || ('confirmationButton' + this.cid),
                getButtonText: this.getOption('buttonText'),
                getAction: this.getOption('buttonAction')
            };
        },
        ui: {
            'ConfirmButton': 'button.confirm'
        },
        events: {
            'click @ui.ConfirmButton': function() {
                this.ui.ConfirmButton.html("<i class='fa fa-spinner fa-spin'></i> <span>Fetching Patient Data...</span>");
                this.triggerMethod('confirmation');
            }
        },
        buttonModelEvents: {
            'change:state': 'render'
        },
        initialize: function() {
            this.buttonModel = this.getOption('buttonModel');
            this.bindEntityEvents(this.buttonModel, this.getOption('buttonModelEvents'));
        },
        onDestroy: function() {
            this.unbindEntityEvents(this.buttonModel, this.getOption('buttonModelEvents'));
        }
    });
    return ConfirmationButton;
});
