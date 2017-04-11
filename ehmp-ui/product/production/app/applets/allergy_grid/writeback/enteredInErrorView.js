define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'app/applets/allergy_grid/writeback/writebackUtils'
], function(Backbone, Marionette, $, Handlebars, writebackUtils){
    "use strict";

    var AllergyModelCheck = ADK.Checks.CheckModel.extend({
        validate: function(attributes, validationOptions) {
            ADK.Checks.unregister('allergy-eie-form-id');
            ADK.UI.Workflow.hide();
            ADK.UI.Modal.hide();
        },
    });

    var EnteredInErrorView = {
        createAndShowEieView: function(model) {
            var formModel = new Backbone.Model();
            formModel.set('allergen', model.get('name'));
            formModel.set('localId', model.get('localId'));

            var workflowOptions = {
                size: "small",
                title: 'Allergies - Entered in Error',
                showProgress: false,
                keyboard: false,
                steps: [{
                    view: EnteredInErrorView.buildFormView(),
                    viewModel: formModel,
                    stepTitle: 'Step 1'
                }]
            };

            var workflowController = new ADK.UI.Workflow(workflowOptions);
            ADK.Checks.register(new AllergyModelCheck({
                id: 'allergy-eie-form-id',
                label: 'Allergy EIE Form',
                failureMessage: 'Allergy Entered in Error Writeback In Progress! Any unsaved changes will be lost if you continue.'
            }));
            workflowController.show();
            ADK.utils.writebackUtils.applyModalCloseHandler(workflowController);
        },
        buildFormView: function() {

            // cols definitions
            var reasonContainer = {
                control: "container",
                extraClasses: ["row"],
                items: [{
                    control: "container",
                    extraClasses: ["col-xs-12"],
                    items: [{
                        control: "textarea",
                        name: "reason",
                        title: "Enter a reason",
                        label: "Reason",
                        rows: 10,
                        required: false,
                        maxlength: 255
                    }]
                }]
            };

            var ErrorMessageView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile('Unable to remove this item at this time due to a system error. Try again later.'),
                tagName: 'p'
            });

            var ErrorFooterView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile('{{ui-button "OK" classes="btn-primary" title="Press enter to close."}}'),
                events: {
                    'click .btn-primary': function() {
                        ADK.Checks.unregister('allergy-eie-form-id');
                        ADK.UI.Alert.hide();
                    }
                },
                tagName: 'span'
            });

            // fields obj
            var EieFields = [{
                control: "container",
                extraClasses: ["modal-body"],
                items: [{
                    control: "container",
                    extraClasses: ["container-fluid"],
                    items: [reasonContainer]
                }]
            }, {
                control: 'container',
                extraClasses: ['modal-footer'],
                items: [{
                    control: 'container',
                    extraClasses: ['row'],
                    items: [{
                        control: 'container',
                        extraClasses: ['col-xs-12'],
                        items: [{
                            control: 'button',
                            id: 'form-cancel-btn',
                            extraClasses: ["btn-primary", "btn-sm", "pull-left"],
                            type: 'button',
                            label: 'Cancel',
                            title: 'Press enter to cancel'
                        }, {
                            control: 'button',
                            disabled: false,
                            extraClasses: ['btn-primary', 'btn-sm', 'pull-right'],
                            label: 'Enter in Error',
                            name: 'submit-entered-in-error',
                            id: 'submit-entered-in-error',
                            title: 'Press enter to submit entered in error form'
                        }]
                    }]
                }]
            }];

            var CancelMessageView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile('All unsaved changes will be lost. Are you sure you want to cancel?'),
                tagName: 'p'
            });

            var FooterView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile('{{ui-button "No" classes="btn-default btn-sm" title="Press enter to go back."}}{{ui-button "Yes" classes="btn-primary btn-sm" title="Press enter to cancel."}}'),
                events: {
                    'click .btn-primary': function() {
                        ADK.UI.Alert.hide();
                        ADK.UI.Workflow.hide();
                        ADK.Checks.unregister('allergy-eie-form-id');
                        writebackUtils.unregisterChecks();
                        this.options.workflow.close();
                    },
                    'click .btn-default': function() {
                        ADK.UI.Alert.hide();
                        ADK.Checks.unregister('allergy-eie-form-id');
                    }
                },
                tagName: 'span'
            });

            // form view
            var FormView = ADK.UI.Form.extend({
                fields: EieFields,
                ui: {
                    'reason': '.reason',
                    'submitButton': '.submit-entered-in-error'
                },
                events: {
                    // cancel
                    "click #form-cancel-btn": function(e) {
                        e.preventDefault();
                        var cancelAlertView = new ADK.UI.Alert({
                            title: 'Cancel',
                            icon: 'icon-cancel',
                            messageView: CancelMessageView,
                            footerView: FooterView,
                            workflow: this.workflow
                        });
                        cancelAlertView.show();
                    },
                    // submit
                    'click #submit-entered-in-error': function(e) {
                        e.preventDefault();
                        var self = this;
                        var user = ADK.UserService.getUserSession();

                        var eieModel = new ADK.UIResources.Writeback.Allergies.Model();
                        eieModel.set({
                            'localId': this.model.get('localId'),
                            'comments': [this.model.get('reason')],
                            'enteredBy': user.get('lastname') + ',' + user.get('firstname')
                        });

                        eieModel.enteredInError({
                            success: function() {
                                var saveSuccessAlertView = new ADK.UI.Notification({
                                    title: 'Allergy Entered in Error Submitted',
                                    icon: 'fa-check',
                                    message: 'Allergy successfully marked entered in error.'
                                });
                                saveSuccessAlertView.show();
                                ADK.Checks.unregister('allergy-eie-form-id');
                                writebackUtils.unregisterChecks();
                                ADK.UI.Alert.hide();
                                ADK.UI.Workflow.hide();
                                self.workflow.close();

                                ADK.ResourceService.clearAllCache('allergy');
                                ADK.Messaging.getChannel('allergy_grid').trigger('refreshGridView');
                            },
                            error: function(model, error) {
                                var errorAlertView = new ADK.UI.Alert({
                                    title: 'Save Failed (System Error)',
                                    icon: 'icon-error',
                                    messageView: ErrorMessageView,
                                    footerView: ErrorFooterView
                                });
                                errorAlertView.show();
                            }
                        });
                    }
                }
            });
            return FormView;
        }
    };

    return EnteredInErrorView;
});