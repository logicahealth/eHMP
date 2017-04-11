define([
    'main/ADK',
    'backbone',
    'handlebars',
    'app/applets/orders/writeback/writebackUtils',
], function(ADK, Backbone, Handlebars, Utils) {
    "use strict";

    var LOADING_ELEMENT = '<i class="loading fa fa-spinner fa-spin" style="position: absolute; top: 28px; left: 17px; z-index: 9;"></i>';

    var discontinueFields = [{
        control: 'container',
        items: [{
            control: 'container',
            extraClasses: ['modal-header'],
            template: Handlebars.compile('<h4 class="modal-title all-padding-xs">{{headerLabel}}</h4>')
        }, {
            control: 'container',
            extraClasses: ['modal-body no-min-height'],
            items: [{
                control: 'container',
                extraClasses: ['container-fluid'],
                items: [{
                    control: 'container',
                    extraClasses: ['row'],
                    items: [{
                        control: 'container',
                        extraClasses: ['col-md-12'],
                        template: Handlebars.compile([
                            '<div class="discontinue-error-container alert alert-danger" role="alert"><div><i class="fa fa-exclamation-circle font-size-18"></i>',
                            '&nbsp;<strong>Unable To Submit</strong></div><div class="discontinue-error-message"></div></div>',
                            '<div><strong>The following orders will be {{orderAction}}:</strong><p class="well all-padding-xs">{{summary}}&nbsp;<strong>{{entered}}</strong></p>'
                        ].join('\n'))
                    }]
                }, {
                    control: 'container',
                    extraClasses: ['row'],
                    items: [{
                        control: 'container',
                        extraClasses: ['col-md-6 discontine-reason-progress-spinner'],
                        template: LOADING_ELEMENT,
                        hidden: true,
                        items: [{
                            control: 'select',
                            name: 'reason',
                            label: 'Reason',
                            required: true,
                            disabled: true,
                            hidden: true,
                            pickList: []
                        }]
                    }]
                }]
            }]
        }, {
            control: "container",
            extraClasses: ["modal-footer"],
            items: [{
                control: "container",
                extraClasses: ["col-sm-12"],
                items: [{
                    control: 'container',
                    items: [{
                        control: "container",
                        extraClasses: ["col-xs-3"],
                        template: '<span/>',
                    }, {
                        control: "container",
                        extraClasses: ["col-xs-3", "text-left", "inProgressContainer"],
                        items: [{
                            control: "container",
                            extraClasses: "in-progress",
                            template: Handlebars.compile('<i class="fa fa-spinner fa-spin pull-left"></i>{{progressLabel}}'),
                            hidden: true
                        }]
                    }, {
                        control: "container",
                        extraClasses: ["col-xs-3"],
                        items: [{
                            control: "button",
                            label: "Close",
                            type: "button",
                            title: "Press enter to close.",
                            extraClasses: ["btn-default", "alert-cancel"],
                            name: "cancel"
                        }]
                    }, {
                        control: "container",
                        extraClasses: ["col-xs-1"],
                        items: [{
                            control: "button",
                            label: "Cancel Order",
                            type: "button",
                            title: "Press enter to cancel order.",
                            extraClasses: ["btn-default", "alert-continue"],
                            name: "continue"
                        }]
                    }]
                }]
            }]
        }]
    }];

    var formView = ADK.UI.Form.extend({
        fields: discontinueFields,
        ui: {
            inprogress_container: ".in-progress",
            discontinue_error_message: ".discontinue-error-message",
            discontinue_error_title: ".discontinue-error-title",
            discontinue_error_container: ".discontinue-error-container",
            alert_continue: ".continue",
            alert_cancel: ".cancel",
            discontinue_reason: ".reason",
            discontinue_reason_spinner: ".discontine-reason-progress-spinner > i"
        },
        onInitialize: function() {
            var action = this.model.get('action') || 'cancel';
            action = (action[0].toUpperCase() + action.slice(1).toLowerCase());
            this.isCanceling = (action === 'Cancel');
            var actionRoot = (this.isCanceling ? 'Cancel' : 'Discontinu');

            this.model.set({
                headerLabel: (action + ' orders').toUpperCase(),
                progressLabel: actionRoot + 'ing...',
                orderAction: actionRoot + 'ed',
            }, {silent: true});

            this.buttonLabel = action + ' Order';
            this.buttonTitle = 'Press enter to ' + action.toLowerCase() + ' order';
            this.growlTitle = 'Lab Order ' + actionRoot + 'ed';
            this.growlMessage = 'Lab order successfully ' + actionRoot.toLowerCase() + 'ed.';
        },
        onRender: function() {
            this.ui.alert_continue.trigger('control:label', this.buttonLabel);
            this.ui.alert_continue.trigger('control:title', this.buttonTitle);
            this.hideErrorMessage();

            if (!this.isCanceling) {
                this.enableDiscontinueReasons();
                this.ui.discontinue_reason_spinner.trigger('control:hidden', false);
            }
        },
        events: {
            'click @ui.alert_cancel': 'alertCancel',
            'click @ui.alert_continue': 'alertContinue',
            'onchange @ui.discontinue_reason': 'onReasonChange'
        },
        modelEvents: {
            'delete:success': 'onSuccess',
            'delete:error': 'onError',
            'read:success': 'onReasonSuccess',
            'read:error': 'onReasonError'
        },
        onSuccess: function() {
            ADK.UI.Workflow.hide();
            var discontinueSuccessView = new ADK.UI.Notification({
                title: this.growlTitle,
                message: this.growlMessage,
                icon: 'fa-check',
                type: "success"
            });
            discontinueSuccessView.show();
            Utils.refreshApplet();
        },
        onError: function(model, resp) {
            var errorMessage = _.get(resp, 'responseJSON.message');
            if (!_.isUndefined(errorMessage)) {
                this.showErrorMessage(errorMessage);
            }
            this.hideInProgress();
            this.enableButtons(true);
        },
        onReasonSuccess: function(model, resp) {
            this.ui.discontinue_reason.trigger('control:disabled', false);
            this.ui.discontinue_reason.trigger('control:picklist:set', model.get('reasonListItems'));
            this.ui.discontinue_reason_spinner.remove();
        },
        onReasonError: function() {
            this.showErrorMessage("Unable to retrieve discontinue reasons due to a system error. Please try again later.", "System Error");
            this.ui.alert_continue.trigger('control:disabled', true);
            this.ui.discontinue_reason_spinner.remove();
        },
        showInProgress: function() {
            this.ui.inprogress_container.trigger('control:hidden', false);
        },
        hideInProgress: function() {
            this.ui.inprogress_container.trigger('control:hidden', true);
        },
        showErrorMessage: function(errorMessage, errorTitle) {
            this.ui.discontinue_error_message.text(errorMessage);
            this.ui.discontinue_error_title.text(errorTitle || "Unable To Submit");
            this.ui.discontinue_error_container.show();
        },
        hideErrorMessage: function() {
            this.ui.discontinue_error_message.text('');
            this.ui.discontinue_error_container.hide();
        },
        enableButtons: function(isEnabled) {
            this.ui.alert_continue.trigger('control:disabled', !isEnabled);
            this.ui.alert_cancel.trigger('control:disabled', !isEnabled);
        },
        enableDiscontinueReasons: function() {
            this.ui.discontinue_reason.trigger('control:hidden', this.isCanceling);
            this.model.getReasons();
        },
        onReasonChange: function() {
            this.model.errorModel.clear();
        },
        alertCancel: function() {
            ADK.UI.Workflow.hide();
        },
        alertContinue: function() {
            this.hideErrorMessage();
            this.enableButtons(false);
            this.showInProgress();
            this.model.execute();
        }
    });

    return formView;
});
