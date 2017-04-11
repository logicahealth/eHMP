define([
    'main/ADK',
    'backbone',
    'handlebars',
    'app/applets/orders/writeback/writebackUtils',
], function(ADK, Backbone, Handlebars, Utils) {
    "use strict";

    Handlebars.registerHelper("showOrderCheck", function(str, index, size) {
        var labelDiv = '';
        var orderCheckText = str.substring(1);
        index += 1;

        if (str.substring(0, 1) === '1') {
            labelDiv = '<div class="text text-danger bold">* Order Check requires Reason for Override</div><div class="text text-info bold">&nbsp;&nbsp;(' + index + ' of ' + size + ')&nbsp;&nbsp;' + orderCheckText + '</div>';
        } else {
            labelDiv = '<div>&nbsp;&nbsp;(' + index + ' of ' + size + ')&nbsp;&nbsp;' + orderCheckText + '</div>';
        }
        return new Handlebars.SafeString(labelDiv);
    });

    var signFields = [{
        control: 'container',
        template: Handlebars.compile([
            '<div class="modal-header"><h4 class="modal-title all-padding-no"><i class="alert-icon fa fa-exclamation-triangle"></i>&nbsp;&nbsp;ORDER SIGNING</h4></div>',
        ].join('\n'))
    }, {
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
                extraClasses: ["order_summary", "col-xs-12"],
                template: Handlebars.compile('<strong>Order</strong><p class="well all-padding-xs">{{summary}}</p>'),
            }, {
                control: "container",
                extraClasses: ["col-xs-12"],
                template: Handlebars.compile('{{#if orderCheck}}<strong>Order Check</strong></br>{{/if}}{{#each orderCheck}}{{showOrderCheck this @index ../orderCheck.length}}<br/>{{/each}}<hr/>')
            }, {
                control: "input",
                extraClasses: ["text-danger", "col-xs-12", "reason-for-override"],
                maxlength: 80,
                name: "reason_for_override",
                label: "Reason for Override"
            }, {
                control: "container",
                extraClasses: ["override-text", "col-xs-12"],
                template: Handlebars.compile('<p>NOTE: The override reason is for tracking purposes and does not change or place a new order.</p><hr/>')
            }, {
                control: "container",
                extraClasses: ["order_summary", "col-xs-8"],
                template: Handlebars.compile('<br/><b>Sign</b><strong><p class="well all-padding-xs">{{summary}}</p></strong>')
            }, {
                control: "input",
                name: "signature_code",
                type: "password",
                autocomplete: "off",
                maxlength: 20,
                disabled: true,
                extraClasses: ["col-xs-5", "signature-code"],
                label: "Enter Electronic Signature Code",
                title: "Please enter in your electronic signature code."
            }]
        }]
    }, {
        control: "container",
        extraClasses: ["modal-footer"],
        items: [{
            control: "container",
            extraClasses: ["col-sm-12"],
            items: [{
                control: "container",
                extraClasses: ["col-xs-3"],
                items: [{
                    control: "button",
                    label: "Cancel Order",
                    type: "button",
                    title: "Press enter to cancel the order.",
                    extraClasses: ["btn-default", "alert-discontinue", "pull-left"],
                    name: "discontinue"
                }],
            }, {
                control: "container",
                extraClasses: ["col-xs-5", "text-left"],
                items: [{
                    control: "container",
                    extraClasses: ['inProgressContainer'],
                    template: Handlebars.compile('<i class="fa fa-spinner fa-spin pull-left"></i><span>signing in progress...</span>'),
                    hidden: true
                }]

            }, {
                control: "container",
                extraClasses: ["col-xs-1"],
                items: [{
                    control: "button",
                    extraClasses: ["btn-default", "alert-cancel"],
                    type: "button",
                    label: "Close",
                    title: "Press enter to close.",
                    name: "cancel"
                }],
            }, {
                control: "container",
                extraClasses: ["col-xs-3"],
                items: [{
                    control: "button",
                    extraClasses: ["btn-primary", "alert-continue", "pull-left"],
                    type: "button",
                    label: "Sign Order",
                    title: "Press enter to sign order.",
                    name: "continue"
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
            alert_continue: ".continue",
            alert_cancel: ".cancel",
            alert_discontinue: ".discontinue",
        },
        fields: signFields,
        onRender: function() {
            var isDiscontinuedOrder = (this.model.get('isDiscontinued') || false);
            this.ui.alert_discontinue.trigger('control:hidden', isDiscontinuedOrder);
        },
        showInProgress: function(message) {
            this.ui.inprogress_label.text(message || 'signing in progress...');
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
            this.ui.alert_continue.trigger('control:disabled', true);
            this.ui.alert_cancel.trigger('control:disabled', true);
            this.ui.alert_discontinue.trigger('control:disabled', true);
        },
        enabledButton: function() {
            this.ui.alert_continue.trigger('control:disabled', false);
            this.ui.alert_cancel.trigger('control:disabled', false);
            this.ui.alert_discontinue.trigger('control:disabled', false);
        },
        displayErrorState: function(message) {
            this.showErrorMessage(message);
            this.hideInProgress();
            this.enabledButton();
        },
        displayInProgressState: function(message) {
            this.showInProgress(message);
            this.disabledButton();
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
        },
        events: {
            'click .alert-cancel': 'alertCancel',
            'click .alert-continue': 'alertContinue',
            'click .alert-discontinue': 'alertDiscontinue',
            'keyup @ui.reason_for_override': 'toggleSignature'
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
        alertDiscontinue: function(e) {
            e.preventDefault();
            this.displayInProgressState("canceling...");

            var discontinueModel = new ADK.UIResources.Writeback.Orders.Discontinue({
                hash: this.model.get('orderDetailHash')
            });

            this.listenTo(discontinueModel, 'delete:success', this.onDiscontinueSuccess);
            this.listenTo(discontinueModel, 'delete:error', this.onDiscontinueError);

            _.each(this.model.get('orderIds'), function(orderId) {
                discontinueModel.addOrderId(orderId);
            });
            
            discontinueModel.execute();
        },
        onDiscontinueSuccess: function() {
            this.displaySuccess('Lab Order Cancelled', 'Lab order successfully cancelled.');
        },
        onDiscontinueError: function(model, resp) {
            this.displayErrorState(JSON.parse(resp.responseText).message || "Unknown Server Error");
        },
        alertCancel: function() {
            ADK.UI.Workflow.hide();
        },
        alertContinue: function(e) {
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
            var errorMessage = _.get(resp, 'responseJSON.message');
            if (errorMessage === 'The electronic signature code entered is not valid.') {
                this.model.errorModel.set({
                    'signature_code': 'The electronic signature code entered is not valid.'
                });
            } else if (!_.isUndefined(errorMessage)) {
                this.showErrorMessage(errorMessage);
            }
            this.hideInProgress();
            this.enabledButton();
        },
        showOverride: function() {
            if (!this.model.get('showOverride')) {
                this.ui.signature_code.trigger('control:disabled', false);
                this.ui.reason_for_override.trigger('control:hidden', true);
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