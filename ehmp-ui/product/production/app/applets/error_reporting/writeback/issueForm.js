define([
    'underscore',
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'moment'
], function(
    _,
    Backbone,
    Marionette,
    $,
    Handlebars,
    Moment
) {
    'use strict';
    var SUBMIT_BUTTON_TEXT = 'Send Report';
    var fields = [{
        control: "container",
        extraClasses: ["modal-body"],
        items: [{
            control: "container",
            extraClasses: ["container-fluid"],
            items: [{
                control: 'alertBanner',
                name: '_incidentBanner',
                type: 'danger',
                icon: 'fa-exclamation-circle',
                title: 'Failed to submit incident report.'
            }, {
                control: "container",
                modelListeners: ['_caughtIncidents'],
                template: '{{#with _caughtIncidents as |errorList|}}' +
                    '<p class="bottom-margin-xs top-margin-xs all-padding-no"><strong>Detected Issues:</strong></p>' +
                    '<ul class="left-padding-lg">{{#each errorList}}<li>{{message}}</li>{{/each}}</ul>' +
                    '{{else}}<p class="bottom-margin-xs top-margin-xs all-padding-no">This report will be sent to the eHMP support team.</p>{{/with}}'
            }, {
                control: "textarea",
                label: "Problem Description",
                name: "comment",
                maxlength: 1000,
                rows: 6
            }]
        }]
    }, {
        control: "container",
        extraClasses: ["modal-footer"],
        items: [{
            control: "container",
            items: [{
                control: "button",
                extraClasses: ["btn-default", "btn-sm", 'cancel-button'],
                label: "Cancel",
                name: "error-reporter-cancel",
                id: "error-reporter-cancel-btn",
                type: "button"
            }, {
                control: "button",
                extraClasses: ["btn-primary", "btn-sm", ],
                label: SUBMIT_BUTTON_TEXT,
                name: "error-reporter-sign",
                id: "error-reporter-sign-btn",
                title: "Send issue report."
            }]
        }]
    }];

    var IssueForm = ADK.UI.Form.extend({
        fields: fields,
        events: {
            'submit': 'onSubmit',
            'click @ui.cancelButton': '_hideWorkflow'
        },
        ui: {
            'cancelButton': 'button.cancel-button',
            'alertBanner': '.alertBanner-control',
            'submitButton': 'button:submit'
        },
        modelEvents: {
            'request': function(model, xhr, options) {
                this._hideAlertBanner();
                this._setPending(true);
                var sentIncidents = [];
                model.get('incidents').each(function(model) {
                    sentIncidents.push(model);
                });
                this._sentIncidents = sentIncidents;
            },
            'error': function(model, response, options) {
                this._setPending(false);
                this.ui.alertBanner.trigger('control:message', ADK.ErrorMessaging.getMessage(_.get(response, 'responseJSON.status')));
            },
            'sync': function(model, response, options) {
                // don't want to overwrite ones added while waiting for save to complete
                ADK.Errors.collection.remove(this._sentIncidents);
                this._hideWorkflow();
                var message;
                var incidentId = _.get(options, 'xhr.getResponseHeader', _.noop)('X-eHMP-Incident-Report-Id');
                if (incidentId) message = "Incident ID: " + incidentId;
                var successNotification = new ADK.UI.Notification({
                    title: "Report successfully submitted",
                    message: message,
                    type: "success",
                    autoClose: false
                });
                successNotification.show();
            }
        },
        onInitialize: function() {
            this._sentIncidents = [];
        },
        onBeforeDestroy: function() {
            this.model.abort();
        },
        onSubmit: function(event) {
            event.preventDefault();
            if (this.model.isValid()) {
                this.model.save(null, _.extend({ omitPrivateAttributes: true }, _.result(this, 'model.fetchOptions', {})));
            } else {
                this.transferFocusToFirstError();
            }
        },
        _hideWorkflow: function() {
            ADK.UI.Workflow.hide();
        },
        _hideAlertBanner: function() {
            this.ui.alertBanner.trigger('control:message', '');
        },
        _setPending: function(pending) {
            if (pending) {
                this.$(this.ui.submitButton.selector).trigger('control:update:config', { icon: 'fa-spinner fa-spin', label: 'Sending', disabled: true });
                return;
            }
            this.$(this.ui.submitButton.selector).trigger('control:update:config', { icon: '', label: SUBMIT_BUTTON_TEXT, disabled: false });
        }
    });

    return IssueForm;
});
