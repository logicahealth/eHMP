define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/task_forms/activities/consults/eventHandler',
    'app/applets/task_forms/activities/fields'
], function(Backbone, Marionette, _, Handlebars, EventHandler, Fields) {
    "use strict";

    var ProvideTaskModel = Backbone.Model;

    var ProvideTaskForm = ADK.UI.Form.extend({
        _super: ADK.UI.Form.prototype,
        fields: Fields.consultSignFields,
        events: {
            'click #modal-cancel-button': 'fireCancelEvent',
            'consult-submit': 'fireSignEvent',
            'click #modal-sign-button': 'fireSignEvent',
            'keyup @ui.signature_code input': function(e) {
                if (e.which === 13) {
                    this.$(e.target).trigger('change');
                    this.$el.trigger('consult-submit');
                }
            },
            'click #modal-activity-detail-button' : 'showOverview'
        },
        ui: {
            signature_code: ".signature_code",
            sign_error_message: ".sign-error-message",
            inprogress_label: ".inProgressContainer > span",
            inprogress_container: ".inProgressContainer",
            cancel: '.cancel',
            sign: '.goto-task'
        },
        modelEvents: {
            'sign:error': 'onError'
        },
        onInitialize: function(options) {
            EventHandler.claimTask(this.model);
            var orderName = this.model.get('consultName') + ' - ' + this.model.get('earliestDate');
            this.model.set('signature_code', '');
            this.model.set('summary', orderName);
        },
        onRender: function(options) {
            var self = this;
            window.requestAnimationFrame(function() {
                self.$('#modal-goto-task-button').trigger('control:label', self.model.get('button'));
            });
        },
        showOverview: function(e) {
            ADK.Messaging.getChannel('task_forms').request('activity_detail', {
                processId: this.model.get('processInstanceId')
            });
        },
        fireCloseEvent: function(e) {
            EventHandler.releaseTask(e, this.model);
        },
        fireSignEvent: function(e) {
            var sig = this.model.get('signature_code');
            if (sig.length <= 2 || sig === '') {
                this.showErrorMessage('Signature Code Not Valid - Please Enter a Valid Signature Code.');
            } else {
                this.showInProgress();
                EventHandler.signTask(e, this.model, this.taskListView);
            }
        },
        onError: function(model, resp) {
            var errorMessage = _.get(resp, 'responseJSON.message', '');
            if (errorMessage === '0') {
                this.model.errorModel.set({
                    'signature_code': 'Invalid Signature Code.'
                });
            } else if (!_.isEmpty(errorMessage)) {
                this.showErrorMessage(errorMessage);
            }
            this.hideInProgress();
        },
        hideInProgress: function() {
            this.ui.inprogress_container.trigger('control:hidden', true);
            this.enableForm();
        },
        showInProgress: function(message) {
            this.ui.inprogress_label.text(message || 'In progress...');
            this.ui.inprogress_container.trigger('control:hidden', false);
            this.disableForm();
        },
        disableForm: function() {
            this.ui.sign.trigger('control:disabled', true);
            this.ui.cancel.trigger('control:disabled', true);
            this.ui.signature_code.trigger('control:disabled', true);
            this.$el.closest('.workflow-container').find('.workflow-header .close').attr('disabled', 'disabled');
        },
        enableForm: function() {
            this.ui.sign.trigger('control:disabled', false);
            this.ui.cancel.trigger('control:disabled', false);
            this.ui.signature_code.trigger('control:disabled', false);
            this.$el.closest('.workflow-container').find('.workflow-header .close').removeAttr('disabled');
        },
        showErrorMessage: function(errorMessage) {
            this.model.set('sign-error-message', errorMessage);
        },
        hideErrorMessage: function() {
            this.model.unset('sign-error-message');
        }

    });

    return {
        form: ProvideTaskForm,
        model: ProvideTaskModel
    };
});
