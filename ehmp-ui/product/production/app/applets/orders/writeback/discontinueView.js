define([
    'main/ADK',
    'backbone',
    'handlebars',
    'app/applets/orders/writeback/writebackUtils',
], function(ADK, Backbone, Handlebars, Utils) {
    "use strict";

    var getDiscontinueFields = function(attributes) {
        return [{
            control: 'container',
            extraClasses: ['modal-body', 'no-min-height'],
            items: [{
                control: 'container',
                extraClasses: ['container-fluid', 'top-margin-sm'],
                items: [{
                    control: 'container',
                    extraClasses: ['row'],
                    items: [{
                        control: 'alertBanner',
                        name: 'errorBanner',
                        dismissable: false,
                        type: 'danger',
                        icon: 'fa-exclamation-circle',
                        extraClasses: ['col-xs-12'],
                    }]
                }, {
                    control: 'container',
                    extraClasses: ['row'],
                    items: [{
                        control: 'checklist',
                        name: 'discontinueCheck',
                        hideCheckboxForSingleItem: 'true',
                        label: 'The following order will be ' + attributes.orderAction + ':',
                        extraClasses: ['col-xs-12'],
                        itemTemplate: '<p class="well-sm">{{label}} <strong>{{entered}}</strong></p>'
                    }]
                }, {
                    control: 'container',
                    extraClasses: ['row'],
                    items: [{
                        control: 'select',
                        name: 'reason',
                        label: 'Reason',
                        title: 'Select reason for discontinue',
                        required: true,
                        disabled: true,
                        hidden: true,
                        extraClasses: ['col-xs-6'],
                        pickList: []
                    }]
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
                    extraClasses: ["col-xs-12"],
                    items: [{
                        control: "container",
                        extraClasses: ["pull-left", "inProgressContainer"],
                        template: Handlebars.compile('<i class="fa fa-spinner fa-spin pull-left"></i><span>In progress...</span>'),
                        hidden: true
                    }]
                }, {
                    control: "container",
                    extraClasses: ["col-xs-12"],
                    items: [{
                        control: "button",
                        extraClasses: ["btn-default", "btn-sm", "close-modal", "pull-left"],
                        label: "Close",
                        type: "button",
                        name: "close-modal"
                    }, {
                        control: "button",
                        extraClasses: ["btn-danger", "btn-sm", "continue", "pull-right"],
                        type: "submit",
                        label: "Discontinue Order",
                        name: "discontinue"
                    }]
                }]
            }]
        }];
    };


    var DEFAULT_MODEL_ATTRIBUTES = {
        cancel: {
            headerLabel: 'CANCEL ORDER',
            progressLabel: 'Cancelling',
            orderAction: 'Cancelled'
        },
        discontinue: {
            headerLabel: 'DISCONTINUE ORDER',
            progressLabel: 'Discontinuing',
            orderAction: 'Discontinued'
        }
    };

    var DEFAULT_FORM_ATTRIBUTES = {
        cancel: {
            buttonLabel: 'Cancel Order',
            growlTitle: 'Lab Order Cancelled',
            growlMessage: 'Lab order successfully Cancelled.'
        },
        discontinue: {
            buttonLabel: 'Discontinue Order',
            growlTitle: 'Lab Order Discontinued',
            growlMessage: 'Lab order successfully Discontinued.'
        }
    };

    var formView = ADK.UI.Form.extend({
        ui: {
            inprogress_container: ".in-progress",
            errorBanner: ".errorBanner",
            discontinue: ".discontinue",
            cancel: ".close-modal",
            discontinue_reason: ".reason",
            discontinue_check: ".discontinueCheck .form-group"
        },
        initialize: function() {
            var action = this.model.get('action') || 'cancel';

            var formAttributes = _.extend({}, (DEFAULT_FORM_ATTRIBUTES[action] || DEFAULT_FORM_ATTRIBUTES.cancel), {
                isCanceling: (action === 'cancel')
            });

            var modelAttributes = _.extend({}, (DEFAULT_MODEL_ATTRIBUTES[action] || DEFAULT_MODEL_ATTRIBUTES.cancel), {
                discontinueCheck: [{
                    label: this.model.get('summary'),
                    entered: this.model.get('entered')
                }]
            });

            _.extend(this, formAttributes);
            this.model.set(modelAttributes, {silent: true});
            this.fields = getDiscontinueFields(modelAttributes);

            this.listenTo(this.model, 'change:reason', this.onReasonChange);

            ADK.UI.Form.prototype.initialize.apply(this, arguments);
        },
        onRender: function() {
            this.ui.discontinue.trigger('control:label', this.buttonLabel);
            this.hideErrorMessage();

            if (!this.isCanceling) {
                this.enableDiscontinueReasons();
                this.ui.discontinue.trigger('control:disabled', true);
            }

            this.ui.discontinue_check.css('overflow', 'hidden');
        },
        events: {
            'click @ui.cancel': 'formCancel',
            'submit': 'formContinue'
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
            Utils.refreshActionTrayTasks();
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
        },
        onReasonError: function() {
            this.showErrorMessage("Unable to retrieve discontinue reasons due to a system error. Try again later.", "System Error");
            this.ui.discontinue.trigger('control:disabled', true);
        },
        onReasonChange: function() {
            if (this.model.get('reason')) {
                this.ui.discontinue.trigger('control:disabled', false);
            } else {
                this.ui.discontinue.trigger('control:disabled', true);
            }
        },
        showInProgress: function() {
            this.ui.inprogress_container.trigger('control:hidden', false);
        },
        hideInProgress: function() {
            this.ui.inprogress_container.trigger('control:hidden', true);
        },
        showErrorMessage: function(errorMessage, errorTitle) {
            this.ui.errorBanner.trigger('control:title', errorTitle || "Unable To Submit");
            this.ui.errorBanner.trigger('control:message', errorMessage);
            this.ui.errorBanner.trigger('control:hidden', false);
        },
        hideErrorMessage: function() {
            this.ui.errorBanner.trigger('control:message', '');
            this.ui.errorBanner.trigger('control:hidden', true);
        },
        enableButtons: function(isEnabled) {
            this.ui.discontinue.trigger('control:disabled', !isEnabled);
            this.ui.cancel.trigger('control:disabled', !isEnabled);
        },
        enableDiscontinueReasons: function() {
            this.ui.discontinue_reason.trigger('control:hidden', this.isCanceling);
            this.model.getReasons();
        },
        formCancel: function() {
            ADK.UI.Workflow.hide();
        },
        formContinue: function(e) {
            e.preventDefault();
            this.hideErrorMessage();
            this.enableButtons(false);
            this.showInProgress();
            this.model.execute();
        }
    });

    return formView;
});
