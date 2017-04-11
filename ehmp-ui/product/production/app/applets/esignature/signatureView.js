define([
    'backbone',
    'marionette',
    'handlebars',
    'underscore',
    'app/applets/esignature/errorView'
], function(Backbone, Marionette, Handlebars, _, ErrorView) {
    'use strict';

    var esigChannel = ADK.Messaging.getChannel('esignature');

    var getFormFields = function(checklistOptions) {
        return [{
            control: "container",
            extraClasses: ["modal-body"],
            items: [{
                control: "container",
                extraClasses: ["container-fluid"],
                items: [{
                    control: "container",
                    extraClasses: ["container-fluid"],
                    items: [{
                        control: "container",
                        extraClasses: ["row"],
                        items: [{
                            control: "container",
                            extraClasses: ["col-xs-12"],
                            items: [{
                                control: "checklist",
                                label: checklistOptions.label,
                                name: "itemChecklist",
                                extraClasses: ["bordered-checklist"],
                                selectedCountName: checklistOptions.checklistCountField,
                                itemTemplate: checklistOptions.itemTemplate,
                                attributeMapping: {
                                    label: checklistOptions.formUid
                                }
                            }]
                        }]
                    }, {
                        control: "container",
                        extraClasses: ["row"],
                        items: [{
                            control: "container",
                            extraClasses: ["col-xs-6"],
                            items: [{
                                control: "input",
                                label: "Enter Electronic Signature Code",
                                name: "signatureCode",
                                required: true,
                                title: "Please enter your Electronic Signature Code",
                                type: "password"
                            }]
                        }]
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
                    extraClasses: ["col-xs-6"],
                    items: [{
                        control: "container",
                        extraClasses: ["pull-left"],
                        modelListeners: [checklistOptions.checklistCountField],
                        template: Handlebars.compile("<span>Total Selected: {{" + checklistOptions.checklistCountField + "}}</span>")
                    }]
                }, {
                    control: "container",
                    extraClasses: ["col-xs-6"],
                    items: [{
                        control: "button",
                        extraClasses: ["btn-default", "btn-sm"],
                        label: "Cancel",
                        name: "esig-cancel",
                        title: "Press enter to cancel.",
                        id: 'esig-cancel-btn',
                        type: "button"
                    }, {
                        control: "button",
                        extraClasses: ["btn-primary", "btn-sm"],
                        label: "Sign",
                        name: 'esig-sign',
                        id: 'esig-sign-btn',
                        title: "Press enter to sign note"
                    }]
                }]
            }]
        }];
    };

    var DeleteMessageView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('You will lose all work in progress if you cancel this signature process. Would you like to proceed?'),
        tagName: 'p'
    });

    var ParentView = ADK.UI.Form;
    var signatureView = ParentView.extend({
        test: this,
        ui: {
            "FormSignBtn": ".control.esig-sign",
            "FormCancelBtn": ".control.esig-cancel",
            "esignCode": ".esignCode",
            "signatureInput": ".control.signatureCode",
            "checkboxes": ".control.itemChecklist"
        },
        checklistOptionsDefaults: {
            itemTemplate: null,
            label: 'Items',
            checklistCountField: 'checklistCount',
            formUid: 'uid'
        },
        initialize: function(options) {
            this.checklistOptions = _.extend({}, this.checklistOptionsDefaults, this.checklistOptions);
            this.fields = getFormFields(this.checklistOptions);
            this.listenTo(this.model, 'change:' + this.checklistOptions.checklistCountField, this.areAnyChecked);
            ParentView.prototype.initialize.apply(this, arguments);
        },
        events: {
            "keydown @ui.signatureInput input": function(e) {
                if (e.which === 13) {
                    this.$(e.target).trigger('change');
                    this.$el.trigger('submit');
                }
            },
            "click @ui.FormCancelBtn": function(e) {
                var self = this;
                e.preventDefault();
                var deleteAlertView = new ADK.UI.Alert({
                    title: 'Are you sure you want to cancel?',
                    icon: 'fa-warning color-red',
                    messageView: DeleteMessageView,
                    footerView: Backbone.Marionette.ItemView.extend({
                        returnStep: this.returnStep,
                        steps: this.workflow.options.model.get('steps'),
                        tagName: 'span',
                        ui: {
                            'ContinueButton': '#alert-continue-btn',
                            'CancelButton': '#alert-cancel-btn'
                        },
                        template: Handlebars.compile('{{ui-button "Cancel" id="alert-cancel-btn" classes="btn-default btn-sm" title="Press enter to cancel."}}{{ui-button "Continue" id="alert-continue-btn" classes="btn-primary btn-sm" title="Press enter to continue."}}'),
                        events: {
                            'click @ui.ContinueButton': function(e) {
                                e.preventDefault();
                                ADK.UI.Alert.hide();
                                var numWorkflowSteps = this.steps.length;
                                if (!_.isUndefined(this.returnStep) && numWorkflowSteps > 1 && this.returnStep < numWorkflowSteps) {
                                    self.workflow.goToIndex(this.returnStep);
                                } else {
                                    ADK.UI.Workflow.hide();
                                    esigChannel.trigger('esign:cancel');
                                }
                            },
                            'click @ui.CancelButton': function() {
                                ADK.UI.Alert.hide();
                            }
                        }
                    })
                });
                deleteAlertView.show();
            },
            "submit": function(e) {
                e.preventDefault();
                var self = this;

                this.disableForm();

                this.model.save(null, {
                    success: function(model, resp, options) {
                        var successView = new ADK.UI.Notification({
                            title: 'Signature Submitted',
                            icon: 'fa-check',
                            message: 'Signature successfully submitted with no errors.',
                            type: "success"
                        });
                        successView.show();
                        self.enableForm();
                    },
                    error: function(model, resp, options) {
                        var invalidEsig = false;
                        var response = '';
                        try {
                            if (resp.responseText) {
                                response = JSON.parse(resp.responseText);
								console.error('Error: ' + response.message);
                                if (response.message.indexOf('Invalid e-signature') > -1) {
                                    invalidEsig = true;
                                }
                            }
                        } finally {
                            self.enableForm();
                            if (invalidEsig) {
                                self.model.errorModel.set('signatureCode', response.message);
                                self.transferFocusToFirstError();
                            } else {
                                var message = 'There was an error saving your note. Please contact your System Administrator for assistance.';
                                message += response.message ? '<br><b>' + response.message : '';
                                var input = {
                                    message: message,
                                    ok_callback: function() {
                                        ADK.UI.Alert.hide();
                                    }
                                };
                                var errorView = new ErrorView(input);
                                errorView.showModal();
                            }
                        }
                    }
                });
                return false;
            }
        },
        disableForm: function() {
            this.ui.FormCancelBtn.trigger('control:disabled', true);
            this.ui.FormSignBtn.trigger('control:disabled', true);
            this.ui.signatureInput.trigger('control:disabled', true);
            this.ui.checkboxes.trigger('control:disabled', true);
        },
        enableForm: function() {
            this.ui.FormCancelBtn.trigger('control:disabled', false);
            this.ui.FormSignBtn.trigger('control:disabled', false);
            this.ui.signatureInput.trigger('control:disabled', false);
            this.ui.checkboxes.trigger('control:disabled', false);
            this.areAnyChecked(this.model);
        },
        areAnyChecked: function(model) {
            var checklistCount = model.get(this.checklistOptions.checklistCountField);

            if (checklistCount <= 0) {
                this.ui.signatureInput.trigger('control:disabled', true);
            } else {
                this.ui.signatureInput.trigger('control:disabled', false);
            }
        },
        modelEvents: {
            'invalid': function() {
                this.enableForm();
                this.transferFocusToFirstError();
            }
        }
    });
    return signatureView;
});