define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'app/applets/vitals/writeback/writebackUtils'
    ], function (Backbone, Marionette, $, Handlebars, WritebackUtils) {
    "use strict";

    var VitalsEieModelCheck = ADK.Checks.CheckModel.extend({
        validate: function(attributes, validationOptions) {
            ADK.Checks.unregister('vitals-eie-form-id');
            ADK.UI.Workflow.hide();
            ADK.UI.Modal.hide();
        },
    });

    var EnteredInErrorView = {
        createAndShowEieView: function (vitalsCollection, title, checkedVital) {
            var formModel = new Backbone.Model();
            var site = ADK.UserService.getUserSession().get('site');
            formModel.set('listOfVitals', WritebackUtils.buildEnteredInErrorVitalCollection(vitalsCollection, checkedVital, site));
            var disableReasonField = EnteredInErrorView.shouldDisableReasonField(formModel.get('listOfVitals'));
            var workflowOptions = {
                title: 'Vitals - Entered in Error ' + title,
                showProgress: false,
                steps: [{
                    view: EnteredInErrorView.buildFormView(disableReasonField),
                    viewModel: formModel,
                    stepTitle: 'Step 1',
                    helpMapping: 'vitals_eie_form'
                }],
                keyboard: false,
                size: 'small'
            };

            var workflowController = new ADK.UI.Workflow(workflowOptions);
            workflowController.show();
            ADK.Checks.register(new VitalsEieModelCheck({
                id: 'vitals-eie-form-id',
                label: 'Vitals EIE Form',
                failureMessage: 'Vitals Entered in Error Writeback In Progress! Any unsaved changes will be lost if you continue.'
            }));
            ADK.utils.writebackUtils.applyModalCloseHandler(workflowController);
        },
        shouldDisableReasonField: function(vitalsCollection){
            return _.isUndefined(vitalsCollection.findWhere({itemValue: true}));
        },
        buildFormView: function (disableReasonField) {
             var vitalsChecklistCollection = {
                control: 'checklist',
                name: 'listOfVitals',
                label: 'Vital',
                title: 'Press tab to view options for the checkboxes',
                itemTemplate: "<strong>{{label}}</strong>{{#if itemEIEValue}}<span>{{itemEIEValue}}</span>{{/if}}",
                extraClasses: ["split-checklist bottom-margin-no all-padding-no"],
                attributeMapping: {
                    unique: 'itemName',
                    value: 'itemValue',
                    eIEValue: 'itemEIEValue',
                    label: 'itemLabel'
                },
                selectedCountName: "checklistCount",
                srOnlyLabel: true
            };

            var vitalsChecklistRegion = {
                control: "container",
                extraClasses: "div",
                items: [{
                    control: "container",
                    extraClasses: ["col-xs-12"],
                    items: [{
                        control: "button",
                        extraClasses: ["btn-default btn-sm"],
                        label: "Check All",
                        name: "checkAll",
                        title: "Select all vitals",
                        type: "button"
                    }]
                }, {
                    control: "container",
                    extraClasses: "col-xs-12",
                    template: Handlebars.compile([
                        '<hr class="bottom-margin-xs top-margin-xs" aria-hidden="true">',
                        '<p class="flex-display left-margin-lg bottom-margin-no"><strong aria-hidden=true class="flex-width-1 left-padding-xs">Name</strong><strong aria-hidden=true class="flex-width-1">Result</strong></p>',
                        '<hr class="bottom-margin-xs top-margin-xs" aria-hidden="true">'
                    ].join("\n")),
                }, {
                    control: "container",
                    extraClasses: "col-xs-12",
                    items: [vitalsChecklistCollection]
                }]
            };
            var clioNoteContainer = {
                control: "container",
                extraClasses: "bottom-margin-no",
                tagName: "p",
                template: Handlebars.compile('NOTE: Vital Signs entered using the Flowsheets application can only be removed by the Flowsheets application.')
            };

            var reasonContainer = {
                control: 'container',
                extraClasses: "row",
                items: [{
                    control: 'container',
                    extraClasses: ['col-xs-12'],
                    items: [{
                        control: 'radio',
                        name: 'reason',
                        required: true,
                        extraClasses: ["radio-col-2 all-padding-no"],
                        label: 'Reason',
                        disabled: disableReasonField,
                        options: [{
                                label: 'Incorrect date/time',
                                value: '1',
                                title: 'Incorrect date/time'
                            },
                            {
                                label: 'Incorrect patient',
                                value: '2',
                                title: 'Incorrect patient'
                            },
                            {
                                label: 'Incorrect reading',
                                value: '3',
                                title: 'Incorrect reading'
                            },
                            {
                                label: 'Invalid record',
                                value: '4',
                                title: 'Invalid record'
                            }]
                        }]
                    }]
            };

            var EieFields = [{
                control: 'container',
                extraClasses: ['modal-body'],
                items: [{
                    control: 'container',
                    extraClasses: ['container-fluid'],
                    items: [{
                                control: "container",
                                extraClasses: "row",
                                items: [vitalsChecklistRegion]
                            },
                            {
                                control: "container",
                                extraClasses: "row",
                                items: [{
                                    control: "container",
                                    extraClasses: "col-xs-12",
                                    items: [{
                                        control: 'spacer'
                                    },clioNoteContainer,{
                                        control: 'spacer'
                                    }]
                                }]
                            },
                            reasonContainer]
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
                            extraClasses: ['btn-default', 'btn-sm', 'pull-left'],
                            type: 'button',
                            label: 'Cancel',
                            }, {
                            control: 'button',
                            disabled: true,
                            extraClasses: ['btn-primary', 'btn-sm'],
                            label: 'Enter in Error',
                            name: 'submit-entered-in-error',
                            id: 'submit-entered-in-error'
                            }]
                        }]
                    }]
                }];

                var CancelMessageView = Backbone.Marionette.ItemView.extend({
                    template: Handlebars.compile('All unsaved changes will be lost. Are you sure you want to cancel?'),
                    tagName: 'p'
                });

                var CancelFooterView = Backbone.Marionette.ItemView.extend({
                    template: Handlebars.compile('{{ui-button "No" classes="btn-default btn-sm"}}{{ui-button "Yes" classes="btn-primary btn-sm"}}'),
                    events: {
                        'click .btn-primary': function() {
                            ADK.UI.Alert.hide();
                            ADK.UI.Workflow.hide();
                            ADK.Checks.unregister('vitals-eie-form-id');

                        },
                        'click .btn-default': function() {
                            ADK.UI.Alert.hide();
                            ADK.Checks.unregister('vitals-eie-form-id');

                        }
                    },
                    tagName: 'span'
                });

                var ErrorMessageView = Backbone.Marionette.ItemView.extend({
                    template: Handlebars.compile('Unable to remove this item at this time due to a system error. Try again later.'),
                    tagName: 'p'
                });

                var ErrorFooterView = Backbone.Marionette.ItemView.extend({
                    template: Handlebars.compile('{{ui-button "OK" classes="btn-primary btn-sm"}}'),
                    events: {
                        'click .btn-primary': function() {
                            ADK.UI.Alert.hide();
                            var form = this.getOption('form');
                            if (!_.isUndefined(form)) {
                                form.ui.submitButton.trigger('control:disabled', false);
                            }
                        }
                    },
                    tagName: 'span'
                });

            var FormView = ADK.UI.Form.extend({
                fields: EieFields,
                ui: {
                    'reason': '.reason',
                    'submitButton': '.submit-entered-in-error',
                    'checkAllBtn': '.button-control.checkAll button',
                    'checkAllControl': '.button-control.checkAll',
                    'vitalsChecklist': '.listOfVitals'
                },
                hasBeenClicked: false,
                onRender: function () {
                    var allChecked = true;
                    _.each(this.model.get('listOfVitals').models, function(vital){
                        if(!vital.get('itemValue')){
                            allChecked = false;
                        }
                    });

                    if(allChecked){
                        this.handleChangeCheckAllButton();
                    }
                },
                modelEvents: {
                    'change:reason': function () {
                        if (this.model.get('reason')) {
                            this.ui.submitButton.trigger('control:disabled', false);
                        }else {
                            this.ui.submitButton.trigger('control:disabled', true);
                        }
                    },
                    'change:checklistCount': function(model) {
                        if (model.get('checklistCount') === 0) {
                            this.model.unset('reason');
                            this.ui.reason.trigger('control:disabled', true);
                        } else {
                            this.ui.reason.trigger('control:disabled', false);
                        }
                    }
                },
                handleChangeCheckAllButton: function(){
                    var btnText;
                    var btnTitle;
                    if (!this.hasBeenClicked) {
                        this.hasBeenClicked = !this.hasBeenClicked;
                        btnText = 'Deselect All';
                    } else {
                        this.hasBeenClicked = !this.hasBeenClicked;
                        btnText = 'Check All';
                        btnTitle = 'Select all vitals.';
                    }

                    this.ui.vitalsChecklist.trigger('control:item:value', {
                        value: this.hasBeenClicked
                    });
                    this.ui.checkAllControl.trigger('control:label', btnText);
                    this.ui.checkAllControl.trigger('control:title', btnTitle);
                },
                events: {
                    'click @ui.checkAllBtn': function(e) {
                        e.preventDefault();
                        this.handleChangeCheckAllButton();
                        this.ui.checkAllControl.find('button').focus();
                    },
                    'click #form-cancel-btn': function (e) {
                        e.preventDefault();
                        var cancelAlertView = new ADK.UI.Alert({
                            title: 'Cancel',
                            icon: 'icon-triangle-exclamation',
                            messageView: CancelMessageView,
                            footerView: CancelFooterView
                        });
                        cancelAlertView.show();
                    },
                    'click #submit-entered-in-error': function (e) {
                        e.preventDefault();
                        var self = this;

                        this.ui.submitButton.trigger('control:disabled', true);

                        var eieModel = new ADK.UIResources.Writeback.Vitals.Model();

                        var ienList = [];
                        _.each(this.model.get('listOfVitals').models, function (vital) {
                            if (vital.get('itemValue')) {
                                ienList.push(vital.get('itemName'));
                            }
                        });

                        eieModel.set({
                            'ien': ienList.join(','),
                            'reason': this.model.get('reason'),
                            'localId': ienList[0]
                       });

                        eieModel.enteredInError({
                            success: function() {
                                var saveSuccessAlertView = new ADK.UI.Notification({
                                    title: 'Success',
                                    type: 'success',
                                    message: 'Vitals marked as entered in error'
                                });
                                saveSuccessAlertView.show();
                                ADK.UI.Workflow.hide();
                                ADK.Checks.unregister('vitals-eie-form-id');

                                ADK.ResourceService.clearAllCache('vital');
                                ADK.Messaging.getChannel('vitals').trigger('refreshGridView');
                            },
                            error: function(model, error) {
                                var errorAlertView = new ADK.UI.Alert({
                                    title: 'Error',
                                    icon: 'icon-circle-exclamation',
                                    messageView: ErrorMessageView,
                                    footerView: ErrorFooterView,
                                    form: self
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