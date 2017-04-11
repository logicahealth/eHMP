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
                            extraClasses: ["col-xs-12", "top-margin-sm"],
                            items: [{
                                control: "checklist",
                                label: checklistOptions.label,
                                name: "itemChecklist",
                                hideCheckboxForSingleItem: true,
                                extraClasses: ["bordered-checklist", "bottom-margin-lg"],
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
                                title: "Enter your Electronic Signature Code",
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
                        extraClasses: ["row"],
                        items: [{
                            control: "container",
                            extraClasses: ["col-xs-12", "inProgressContainer"],
                            template: Handlebars.compile('<span class="pull-left"><i class="fa fa-spinner fa-spin pull-left"></i><span>In progress...</span></span>'),
                            hidden: true
                        }]
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
        template: Handlebars.compile('All unsaved changes will be lost. Are you sure you want to cancel?'),
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
            "checkboxes": ".control.itemChecklist",
            "inProgressContainer": ".inProgressContainer"
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
                e.preventDefault();
                var numWorkflowSteps = this.workflow.options.model.get('steps').length;
                if (!_.isUndefined(this.returnStep) && numWorkflowSteps > 1 && this.returnStep < numWorkflowSteps) {
                    this.workflow.goToIndex(this.returnStep);
                } else {
                    ADK.UI.Workflow.hide();
                    esigChannel.trigger('esign:cancel');
                }
            },
            "submit": function(e) {
                e.preventDefault();
                this.disableForm();
                this.model.save();
                this.showInProgress();
                return false;
            }
        },
        disableForm: function() {
            this.ui.FormCancelBtn.trigger('control:disabled', true);
            this.ui.FormSignBtn.trigger('control:disabled', true);
            this.ui.signatureInput.trigger('control:disabled', true);
            this.ui.checkboxes.trigger('control:disabled', true);
            this.$el.closest('.workflow-container').find('.workflow-header .close').attr('disabled', 'disabled');
        },
        enableForm: function() {
            this.ui.FormCancelBtn.trigger('control:disabled', false);
            this.ui.FormSignBtn.trigger('control:disabled', false);
            this.ui.signatureInput.trigger('control:disabled', false);
            this.ui.checkboxes.trigger('control:disabled', false);
            this.areAnyChecked(this.model);
            this.$el.closest('.workflow-container').find('.workflow-header .close').removeAttr('disabled');
        },
        areAnyChecked: function(model) {
            var checklistCount = model.get(this.checklistOptions.checklistCountField);

            if (checklistCount <= 0) {
                this.ui.signatureInput.trigger('control:disabled', true);
            } else {
                this.ui.signatureInput.trigger('control:disabled', false);
            }
        },
        triggerMessages: function(model, signedModel) {
            if (model.has('successEvents')) {
                _.each(model.get('successEvents'), function(event) {
                    if (!!event.messagingChannel && event.messagingEventName) {
                        ADK.Messaging.getChannel(event.messagingChannel).trigger(event.messagingEventName, signedModel);
                    }
                });
            }
        },
        modelEvents: {
            'invalid': function() {
                this.enableForm();
                this.transferFocusToFirstError();
            },
            'create:success': function(model, resp, options) {
                var successView = new ADK.UI.Notification({
                    title: 'Signature Submitted',
                    icon: 'fa-check',
                    message: 'Signature successfully submitted with no errors.',
                    type: "success"
                });
                successView.show();
                this.enableForm();
                this.triggerMessages(model, resp);
            },
            'create:error': function(model, resp, options) {
                var invalidEsig = false;
                var response = {};
                var parsing_error = false;
                try {
                    if (resp.responseText) {
                        response = JSON.parse(resp.responseText);
                        if (response.message.indexOf('Invalid e-signature') > -1) {
                            invalidEsig = true;
                        }
                        if (resp.responseText.indexOf('ECONNREFUSED') > -1) {
                            response.message = 'Server connection error.';
                        }
                        if (resp.responseText.indexOf('503 Service Temporarily Unavailable') > -1) {
                            response.message = 'Service Temporarily Unavailable.<br> Try again later.';
                        }
                        if (resp.responseText.indexOf('502 Proxy Error') > -1) {
                            response.message = 'Proxy Error.<br> The proxy server received an invalid response from an upstream server.';
                        }
                    }
                } catch(e) {
                    console.error('Error message parsing error:', e.message);
                    console.error('Sign error server message:', resp.responseText);
                    console.error('Error:', response.message);
                } finally {
                    this.enableForm();
                    if (invalidEsig) {
                        this.model.errorModel.set('signatureCode', response.message);
                        this.transferFocusToFirstError();
                    } else {
                        // Close form in case of server side error
                        ADK.UI.Workflow.hide();
                        esigChannel.trigger('esign:cancel');

                        var message = 'There was an error saving your note. Contact your System Administrator for assistance.';
                        message += response.message ? '<br><strong>' + response.message : '';
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
            },
        },
        showInProgress: function() {
            this.ui.inProgressContainer.trigger('control:hidden', false);
        },
        hideInProgress: function() {
            this.ui.inProgressContainer.trigger('control:hidden', true);
        }
    });
    return signatureView;
});