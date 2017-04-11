define([
    'main/ADK',
    'backbone',
    'handlebars',
    'app/applets/orders/writeback/writebackUtils',
    'app/applets/orders/util'
], function(ADK, Backbone, Handlebars, Utils, Util) {
    "use strict";

    var signFields = [{
        control: "container",
        extraClasses: ["modal-body"],
        items: [{
            control: "container",
            extraClasses: ["container-fluid", "col-xs-12"],
            items: [{
                control: "alertBanner",
                name: "sign-error-message",
                title: "Unable To Submit",
                extraClasses: ["col-xs-12"],
                type: "danger",
                dismissible: false
            }, {
                control: "container",
                extraClasses: ["order-summary", "col-xs-8"],
                template: Handlebars.compile('<h5>Order</h5><div class="well all-padding-xs top-margin-xs">{{summary}}</div>')
            }, {
                control: "container",
                extraClasses: ["col-xs-12", "order_checks"],
                hidden: true,
                items: [{
                    control: "container",
                    template: Handlebars.compile([
                        '<strong>Order Check</strong>',
                        '{{#each orderCheckData}}',
                        '  <div class="text-danger bold">{{warning}}</div>',
                        '  <div class="override-text">({{index}} of {{count}}) {{label}}</div><br/>',
                        '{{/each}}',
                    ].join('\n'))
                }],
            }, {
                control: "input",
                extraClasses: ["override-text", "col-xs-12", "reason-for-override"],
                maxlength: 80,
                name: "reason_for_override",
                label: "Reason for Override",
                required: true
            }, {
                control: "container",
                extraClasses: ["override-text", "col-xs-12"],
                template: Handlebars.compile('<p>NOTE: The override reason is for tracking purposes and does not change or place a new order.</p>')
            }, {
                control: "input",
                name: "signature_code",
                type: "password",
                autocomplete: "off",
                maxlength: 20,
                disabled: true,
                required: true,
                extraClasses: ["col-xs-5", "signature-code"],
                label: "Enter Electronic Signature Code",
                title: "Enter in electronic signature code"
            }]
        }]
    }, {
        control: "container",
        extraClasses: ["modal-footer"],
        items: [{
            control: "container",
            extraClasses: ["row"],
            items: [{
                control: "container",
                extraClasses: ["col-xs-6"],
                items: [{
                    control: "container",
                    extraClasses: ["pull-left", "inProgressContainer", "top-padding-xs"],
                    template: Handlebars.compile('<i class="fa fa-spinner fa-spin pull-left"></i><span>In progress...</span>'),
                    hidden: true
                }]
            }, {
                control: "container",
                extraClasses: ["col-xs-6"],
                items: [{
                    control: "button",
                    extraClasses: ["btn-danger", "btn-sm", "alert-discontinue"],
                    label: "Cancel",
                    type: "button",
                    title: "Press enter to cancel the order.",
                    name: "cancel"
                }, {
                    control: "button",
                    extraClasses: ["btn-primary", "btn-sm", "alert-cancel"],
                    label: "Close",
                    type: "button",
                    title: "Press enter to close the form.",
                    name: "closeModal"
                }, {
                    control: "button",
                    extraClasses: ["btn-primary", "btn-sm", "alert-continue"],
                    type: "submit",
                    label: "Sign",
                    title: "Press enter to sign order.",
                    name: "sign"
                }]
            }]
        }]
    }];

    var formView = ADK.UI.Form.extend({
        ui: {
            reason_for_override: ".reason_for_override",
            override_input: ".reason_for_override > input",
            override_text: ".override-text",
            override_label: ".override-label",
            signature_code: ".signature_code",
            inprogress_label: ".inProgressContainer > span",
            inprogress_container: ".inProgressContainer",
            sign_error_message: ".sign-error-message",
            sign_error_container: ".sign-error-container",
            order_checks: ".order_checks",
            sign: ".sign",
            cancel: ".cancel",
            close: ".close",
            closeModal: ".closeModal"
        },
        fields: signFields,
        onRender: function() {
            var isDiscontinued = Util.isDiscontinuedUnsignedOrder(this.model);
            this.ui.cancel.trigger('control:hidden', isDiscontinued);
            this.ui.closeModal.trigger('control:hidden', !isDiscontinued);

            var isOrderCheckEnabled = !!(this.model.get('orderCheckData'));
            this.ui.order_checks.trigger('control:hidden', !isOrderCheckEnabled);
        },
        showInProgress: function(message) {
            this.ui.inprogress_label.text(message || 'In progress...');
            this.ui.inprogress_container.trigger('control:hidden', false);
        },
        hideInProgress: function() {
            this.ui.inprogress_container.trigger('control:hidden', true);
        },
        showErrorMessage: function(errorMessage) {
            this.model.set('sign-error-message', errorMessage);
        },
        hideErrorMessage: function() {
            this.model.unset('sign-error-message');
        },
        disabledButton: function() {
            this.ui.sign.trigger('control:disabled', true);
            this.ui.cancel.trigger('control:disabled', true);
            this.ui.signature_code.trigger('control:disabled', true);
            this.$el.closest('.workflow-container').find('.workflow-header .close').attr('disabled', 'disabled');
        },
        enabledButton: function() {
            this.ui.sign.trigger('control:disabled', false);
            this.ui.cancel.trigger('control:disabled', false);
            this.ui.signature_code.trigger('control:disabled', false);
            this.$el.closest('.workflow-container').find('.workflow-header .close').removeAttr('disabled');
        },
        displaySuccess: function(title, message) {
            this.hideInProgress();
            this.enabledButton();
            ADK.UI.Workflow.hide();
            var signSuccessView = new ADK.UI.Notification({
                title: title,
                icon: 'fa-check',
                message: message,
                type: "success"
            });
            signSuccessView.show();
            Utils.refreshApplet();
            Utils.refreshActionTrayTasks();
        },
        events: {
            'click @ui.cancel': 'formCloseModal',
            'click @ui.closeModal': 'formCloseModal',
            'submit': 'formContinue',
            'click @ui.discontinue': 'alertDiscontinue',
            'keyup @ui.reason_for_override': 'toggleSignature',
            'keydown @ui.signature_code input': function(e) {
                if (e.which === 13) {
                    this.$(e.target).trigger('change');
                    this.$el.trigger('submit');
                }
            },
        },
        modelEvents: {
            'sign:success': 'onSuccess',
            'sign:error': 'onError'
        },
        toggleSignature: function() {
            if (this.ui.override_input.val().length > 2) {
                this.ui.signature_code.trigger('control:disabled', false);
            } else {
                this.model.set('signature_code', '');
                this.ui.signature_code.trigger('control:disabled', true);
            }
        },
        formCloseModal: function() {
            ADK.UI.Workflow.hide();
        },
        formContinue: function(e) {
            e.preventDefault();
            this.hideErrorMessage();
            this.disabledButton();
            this.showInProgress();
            this.model.execute();
        },
        onSuccess: function() {
            this.displaySuccess('Lab Order Signed', 'Lab order successfully signed.');
            Utils.refreshApplet();
        },
        onError: function(model, resp) {
            var errorMessage = _.get(resp, 'responseJSON.message', '');
            if (errorMessage.indexOf('electronic signature') !== -1) {
                this.model.errorModel.set({
                    'signature_code': 'Invalid e-signature.'
                });
            } else if (!_.isEmpty(errorMessage)) {
                this.showErrorMessage(errorMessage);
            }
            this.hideInProgress();
            this.enabledButton();
        },
        showOverride: function() {
            if (!this.model.get('showOverride')) {
                this.ui.signature_code.trigger('control:disabled', false);
                this.ui.reason_for_override.trigger('control:hidden', true);
                this.ui.reason_for_override.trigger('control:required', false);
                this.ui.override_text.trigger('control:hidden', true);
                this.ui.override_label.trigger('control:hidden', true);
            }
        },
        onShow: function() {
            this.showOverride();
        }
    });

    return formView;
});