define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'app/applets/task_forms/activities/order.lab/views/formFields',
    'app/applets/task_forms/activities/order.lab/eventHandler',
    'app/extensions/extensions'
], function(Backbone, Marionette, $, Handlebars, FormFields, EventHandler, Extensions) {
    'use strict';

    var FormModel = new Backbone.Model();

    var formView = ADK.UI.Form.extend({
        controlClass: {
            'assignTo': Extensions.UI.Form.Controls.AssignTo
        },
        onInitialize: function() {
            EventHandler.claimTask(this.model);
        },
        model: FormModel,
        fields: FormFields,
        basicRequiredFields: ['title', 'assignment'],
        actionRequiredFields: {
            'Remind Me Later': ['notificationDate', 'comment'],
            'Reassign Reminder': ['comment'],
            'Cancel Reminder': ['comment']
        },
        ui: {
            'notificationDatepicker': '.notification-datepicker',
            'assignment': '.assignment',
            'actionOptions': '.action',
            'patientContactInstruction': '.patient-contact-instruction',
            'labContactInstruction': '.lab-contact-instruction',
            'acceptButton': '.acceptButton',
            'labErrorMessage': '.lab-error-message',
            'inprogress_label': '.inProgressContainer > span',
            'inprogress_container': '.inProgressContainer'
        },
        events: {
            'click #modal-cancel-button': 'fireCloseEvent',
            'click #requestAcceptButton': 'fireAcceptEvent',
            'click #activityDetails': 'showOverview'
        },
        modelEvents: {
            'change:action': 'handleActionChange',
            'change:assignment': 'changeAssignment',
            'change:comment': 'handleAcceptButton'
        },
        handleAcceptButton: function(model) {
            this.unsetErrorModel();
            var fields = this.actionRequiredFields[model.get('action')];
            var disableAccept = true;
            _.each(fields, function(field) {
                if (fields.length === _.size(_.omit(model.pick(fields), _.isEmpty))) {
                    disableAccept = false;
                } else {
                    disableAccept = true;
                }
            });
            disableAccept = disableAccept || !this.model.isValid();
            this.ui.acceptButton.trigger('control:disabled', disableAccept);
        },
        unsetFields: function(model, fields) {
            _.each(fields, function(field) {
                model.unset(field, {
                    silent: true
                });
            });
        },
        unsetErrorModel: function() {
            this.model.unset('lab-error-message');
        },
        changeAssignment: function() {
            this.handleAcceptButton(this.model);
        },
        handleActionChange: function() {
            var action = this.model.get('action');
            this.showAssignment(_.isEqual(action, 'Reassign Reminder'));
            this.handleAcceptButton(this.model);
            switch (action) {
                case 'Reassign Reminder':
                    this.ui.notificationDatepicker.trigger('control:hidden', true);
                    this.ui.notificationDatepicker.trigger('control:required', false);
                    break;
                case 'Cancel Reminder':
                    this.ui.notificationDatepicker.trigger('control:hidden', true);
                    this.ui.notificationDatepicker.trigger('control:required', false);
                    break;
                default:
                    this.ui.notificationDatepicker.trigger('control:hidden', false);
                    this.ui.notificationDatepicker.trigger('control:required', true);
            }
        },
        showAssignment: function(shouldShow) {
            this.ui.assignment.trigger('control:required', shouldShow);
            this.ui.assignment.trigger('control:hidden', !shouldShow);
        },
        fireCloseEvent: function(event) {
            this.unsetErrorModel();
            event.preventDefault();
            EventHandler.releaseTask(event, this.model);
        },
        fireAcceptEvent: function(event) {
            this.unsetErrorModel();
            event.preventDefault();
            this.showInProgress('Accepting');
            if (EventHandler.validateOutGroupString(this.model)) {
                EventHandler.completeTask(event, this.model);
            } else {
                this.showErrorMessage('groupOutString exceeded 2000 characters');
            }
            this.hideInProgress();
        },
        showOverview: function(event) {
            event.preventDefault();
            ADK.Messaging.getChannel('task_forms').request('activity_detail', {
                processId: this.model.get('processInstanceId')
            });
        },
        onError: function(model, resp) {
            this.showErrorMessage(errorMessage, _.get(resp, 'responseJSON.message', 'error retrieving order tasks'));
            this.hideInProgress();
        },
        showErrorMessage: function(errorMessage) {
            this.model.set('lab-error-message', errorMessage);
        },
        hideInProgress: function hideLoader() {
            this.$el.trigger('tray.loaderHide');
        },
        showInProgress: function showLoader(message) {
            this.$el.trigger('tray.loaderShow', {
                loadingString: message || 'Loading'
            });
        },
        onRender: function() {
            if (this.model.get('processName') === 'Contact_Lab') {
                this.ui.patientContactInstruction.trigger('control:hidden', true);
                this.ui.labContactInstruction.trigger('control:hidden', false);
            }
        }
    });

    return formView;
});
