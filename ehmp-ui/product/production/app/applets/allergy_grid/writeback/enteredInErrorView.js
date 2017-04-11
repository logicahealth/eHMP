define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'app/applets/allergy_grid/writeback/writebackUtils'
], function(Backbone, Marionette, $, Handlebars, writebackUtils){
    "use strict";

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
                        title: "Please enter a reason",
                        label: "Reason",
                        rows: 10,
                        required: false,
                        maxlength: 255
                    }]
                }]
            };

            var ErrorMessageView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile('Unable to remove this item at this time due to a system error. Please try again later.'),
                tagName: 'p'
            });

            var ErrorFooterView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile('{{ui-button "OK" classes="btn-primary" title="Press enter to close."}}'),
                events: {
                    'click .btn-primary': function() {
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
                            extraClasses: ["btn-primary", "btn-sm", "left-margin-xs"],
                            type: 'button',
                            label: 'Cancel',
                            title: 'Press enter to cancel'
                        }, {
                            control: 'button',
                            disabled: false,
                            extraClasses: ['btn-primary', 'btn-sm'],
                            label: 'Enter in Error',
                            name: 'submit-entered-in-error',
                            id: 'submit-entered-in-error',
                            title: 'Press enter to submit entered in error form'
                        }]
                    }]
                }]
            }];

            var CancelMessageView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile('You will lose all work in progress if you cancel this task. Would you like to proceed?'),
                tagName: 'p'
            });

            var FooterView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile('{{ui-button "Cancel" classes="btn-default btn-sm" title="Press enter to cancel."}}{{ui-button "Continue" classes="btn-primary btn-sm" title="Press enter to continue."}}'),
                events: {
                    'click .btn-primary': function() {
                        ADK.UI.Alert.hide();
                        writebackUtils.unregisterNavigationCheck();
                        this.options.workflow.close();
                    },
                    'click .btn-default': function() {
                        ADK.UI.Alert.hide();
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
                            title: 'Are you sure you want to cancel?',
                            icon: 'fa-warning color-red',
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
                                writebackUtils.unregisterNavigationCheck();
                                self.workflow.close();

                                ADK.ResourceService.clearAllCache('allergy');
                                ADK.Messaging.getChannel('allergy_grid').trigger('refreshGridView');
                            },
                            error: function(model, error) {
                                var errorAlertView = new ADK.UI.Alert({
                                    title: 'Save Failed (System Error)',
                                    icon: 'fa-exclamation-circle font-size-18 color-red',
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