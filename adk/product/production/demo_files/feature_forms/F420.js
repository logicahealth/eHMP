define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
], function(Backbone, Marionette, $, Handlebars) {

    var F420 = {
        createForm: function() {
            var genericPicklist = [{
                group: 'Group 1',
                pickList: [{
                    value: 'opt1',
                    label: 'Option 1'
                }, {
                    value: 'opt2',
                    label: 'Option 2'
                }]
            }, {
                group: 'Group 2',
                pickList: [{
                    value: 'opt3',
                    label: 'Option 3'
                }, {
                    value: 'opt4',
                    label: 'Option 4'
                }, {
                    value: 'opt5',
                    label: 'Option 5'
                }, {
                    value: 'opt6',
                    label: 'Option 6'
                }]
            }, {
                group: 'Group 3',
                pickList: [{
                    value: 'opt7',
                    label: 'Option 7'
                }, {
                    value: 'opt8',
                    label: 'Option 8'
                }, {
                    value: 'opt9',
                    label: 'Option 9'
                }]
            }];

            var allergenRow = {
                control: "container",
                extraClasses: ["row"],
                items: [{
                    control: "container",
                    extraClasses: ["col-md-9"],
                    items: [{
                        control: "select",
                        name: "allergen",
                        label: "Allergen",
                        title: "Press enter to activate search.",
                        options: {
                            'minimumInputLength': 0
                        },
                        pickList: genericPicklist,
                        required: true,
                        showFilter: true,
                        groupEnabled: true
                    }]
                }]
            };
            var topFields = {
                control: "container",
                extraClasses: ["row"],
                items: [{
                    control: "container",
                    extraClasses: ["col-md-6", "all-padding-no"],
                    items: [{
                        control: "radio",
                        extraClasses: ["top-padding-xs", "col-xs-5"],
                        name: "allergyType",
                        options: [{
                            value: "observed",
                            label: "Observed"
                        }, {
                            value: "historical",
                            label: "Historical"
                        }],
                        label: "Choose an option",
                        required: true
                    }, {
                        extraClasses: ["col-xs-4"],
                        control: "datepicker",
                        name: "reaction-date",
                        label: "Reaction Date",
                        required: true,
                        disabled: true
                    }, {
                        extraClasses: ["col-xs-3"],
                        control: "timepicker",
                        name: "reaction-time",
                        label: "Time",
                        placeholder: "HH:MM",
                        disabled: true,
                        options: {
                            defaultTime: false
                        }
                    }]
                }, {
                    control: "container",
                    extraClasses: ["col-md-6", "all-padding-no"],
                    items: [{
                        control: "select",
                        extraClasses: ["col-xs-6"],
                        name: "severity",
                        label: "Severity",
                        required: true,
                        disabled: true,
                        pickList: [{
                            value: "opt1",
                            label: "Option 1"
                        }, {
                            value: "opt2",
                            label: "Option 2"
                        }, {
                            value: "opt3",
                            label: "Option 3"
                        }]
                    }, {
                        control: "container",
                        extraClasses: ["col-xs-6"],
                        items: [{
                            control: "select",
                            name: "nature-of-reaction",
                            label: "Nature of Reaction",
                            required: true,
                            pickList: [{
                                value: "opt1",
                                label: "Option 1"
                            }, {
                                value: "opt2",
                                label: "Option 2"
                            }, {
                                value: "opt3",
                                label: "Option 3"
                            }]
                        }]
                    }]
                }]
            };

            var SignsAndSymptoms = {
                control: "multiselectSideBySide",
                name: "signsSymptoms",
                label: "Signs / Symptoms",
                extraClasses: ["top-margin-xs"],
                attributeMapping: {
                    id: 'id',
                    value: 'booleanValue',
                    label: 'description'
                },
                itemColumn: {columnClasses:["flex-width-2"]},
                additionalColumns: [{
                    columnClasses: ["text-center percent-width-25"],
                    columnTitle: "Date",
                    control: 'datepicker',
                    extraClasses: ["cell-valign-middle", "bottom-margin-no"],
                    name: "symptomDate",
                    label: "Symptom Date",
                    srOnlyLabel: true
                }, {
                    columnClasses: ["text-center"],
                    columnTitle: "Time",
                    control: 'timepicker',
                    extraClasses: ["cell-valign-middle", "bottom-margin-no"],
                    name: "symptomTime",
                    label: "Symptom Time",
                    options: {
                        defaultTime: false
                    },
                    placeholder: "HH:MM",
                    srOnlyLabel: true
                }]
            };

            var Comments = {
                control: "container",
                extraClasses: ["row"],
                items: [{
                    control: "container",
                    extraClasses: ["col-md-12"],
                    items: [{
                        control: "textarea",
                        rows: 4,
                        name: "moreInfo",
                        label: "Comments",
                        title: "Please enter in comments"
                    }]
                }]
            };

            var bottomView = {
                control: "container",
                items: [{
                    control: "container",
                    extraClasses: ["col-xs-12"],
                    template: Handlebars.compile('<h6>Signs/Symptoms (Required if Observed)</h6>'),
                    items: [{
                        control: "container",
                        template: Handlebars.compile('<h4>Multi-Select Side By Side with date and time picker</h4>')
                    }]
                }, {
                    control: 'textarea',
                    name: "comments",
                    label: "Comments",
                    rows: 3
                }]
            };

            var F420Fields = [{
                control: "container",
                extraClasses: ["modal-body"],
                items: [{
                    control: "container",
                    extraClasses: ["container-fluid"],
                    items: [allergenRow, topFields, {
                        control: "spacer"
                    }, SignsAndSymptoms, Comments]
                }]
            }, { //*************************** Modal Footer START ***************************
                control: "container",
                extraClasses: ["modal-footer"],
                items: [{
                    control: 'container',
                    extraClasses: ["row"],
                    items: [{
                        control: "container",
                        extraClasses: ["col-xs-6"],
                        template: Handlebars.compile('<p aria-hidden="true">(* indicates a required field.)</p>{{#if savedTime}}<p><span id="allergies-saved-at">Saved at: {{savedTime}}</span></p>{{/if}}')
                    }, {
                        control: "container",
                        extraClasses: ["col-xs-6"],
                        items: [{
                            control: "button",
                            id: "form-cancel-btn",
                            extraClasses: ["btn-default", "btn-sm", "right-margin-lg"],
                            label: "Cancel",
                            type: 'button',
                            title: "Press enter to cancel",
                            name: "cancelBtn"
                        }, {
                            control: "button",
                            id: "form-close-btn",
                            extraClasses: ["btn-default", "btn-sm"],
                            label: "Close",
                            type: 'button',
                            title: "Press enter to close",
                            name: "closeBtn"
                        }, {
                            control: "button",
                            extraClasses: ["btn-primary", "btn-sm"],
                            label: "Add",
                            name: "addBtn",
                            title: "Press enter to add",
                            type: 'submit'
                        }]
                    }]
                }]
            }];

            var FormModel = Backbone.Model.extend({
                defaults: {
                    signsSymptoms: new Backbone.Collection([{
                        id: 'coughing',
                        description: 'Coughing',
                        booleanValue: false
                    }, {
                        id: 'irritatedSkin',
                        description: 'Irritated Skin',
                        booleanValue: false
                    }, {
                        id: 'itchyWateryEyes',
                        description: 'Itchy / Watery Eyes',
                        booleanValue: false
                    }, {
                        id: 'congestion',
                        description: 'Nasal Congestion',
                        booleanValue: false
                    }, {
                        id: 'runnyNose',
                        description: 'Runny Nose',
                        booleanValue: false
                    }, {
                        id: 'sneezing',
                        description: 'Sneezing',
                        booleanValue: false
                    }, {
                        id: 'soreThroat',
                        description: 'Sore Throat',
                        booleanValue: false
                    }, {
                        id: 'irritatedSkin2',
                        description: 'Irritated Skin 2',
                        booleanValue: false
                    }, {
                        id: 'itchyWateryEyes2',
                        description: 'Itchy / Watery Eyes 2',
                        booleanValue: false
                    }, {
                        id: 'congestion2',
                        description: 'Nasal Congestion 2',
                        booleanValue: false
                    }, {
                        id: 'runnyNose2',
                        description: 'Runny Nose 2',
                        booleanValue: false
                    }, {
                        id: 'sneezing2',
                        description: 'Sneezing 2',
                        booleanValue: false
                    }, {
                        id: 'soreThroat2',
                        description: 'Sore Throat 2',
                        booleanValue: false
                    }])
                }
            });

            var DeleteMessageView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile('You will lose all work in progress if you cancel. Would you like to proceed?'),
                tagName: 'p'
            });
            var CloseMessageView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile('You will lose all work in progress if you close this task. Would you like to proceed?'),
                tagName: 'p'
            });
            var FooterView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile('{{ui-button "Cancel" classes="btn-default btn-sm" title="Press enter to cancel"}}{{ui-button "Continue" classes="btn-primary btn-sm" title="Press enter to continue"}}'),
                events: {
                    'click .btn-primary': function() {
                        ADK.UI.Alert.hide();
                        ADK.UI.Workflow.hide();
                    },
                    'click .btn-default': function() {
                        ADK.UI.Alert.hide();
                    }
                },
                tagName: 'span'
            });

            var formView = ADK.UI.Form.extend({
                ui: {
                    "dateTimeSeverity": ".reaction-date, .reaction-time, .severity",
                    "toggleRequired": ".reaction-date, .severity",
                    "allergyType": ".allergyType",
                    "addBtn": ".addBtn"
                },
                fields: F420Fields,
                events: {
                    "click #form-cancel-btn": function(e) {
                        e.preventDefault();
                        var deleteAlertView = new ADK.UI.Alert({
                            title: 'Are you sure you want to cancel?',
                            icon: 'icon-cancel',
                            messageView: DeleteMessageView,
                            footerView: FooterView
                        });
                        deleteAlertView.show();
                    },
                    "click #form-close-btn": function(e) {
                        e.preventDefault();
                        var saveAlertView = new ADK.UI.Notification({
                            title: 'Allergy Saved',
                            message: 'Allergy successfully saved without errors.',
                            type: "success"
                        });
                        saveAlertView.show();
                        ADK.UI.Workflow.hide();
                    },
                    "submit": function(e) {
                        e.preventDefault();
                        if (!this.model.isValid())
                            this.model.set("formStatus", {
                                status: "error",
                                message: self.model.validationError
                            });
                        else {
                            this.model.unset("formStatus");
                            var saveAlertView = new ADK.UI.Notification({
                                title: 'Allergy Submitted',
                                icon: 'fa-check',
                                message: 'Allergy successfully submitted with no errors.',
                                type: "success"
                            });
                            saveAlertView.show();
                            ADK.UI.Workflow.hide();
                        }
                    }
                },
                modelEvents: {
                    'change:allergyType': function(model) {
                        var allergyType = model.get('allergyType');
                        if (allergyType === 'observed') {
                            this.ui.dateTimeSeverity.trigger("control:disabled", false);
                            this.ui.toggleRequired.trigger('control:required', true);
                            this.model.set('reaction-date', moment().format('MM/DD/YYYY'));
                        } else {
                            this.ui.dateTimeSeverity.trigger("control:disabled", true);
                            this.ui.toggleRequired.trigger('control:required', false);
                            this.model.unset('reaction-date');
                            this.model.unset('reaction-time');
                            this.model.unset('severity');
                        }
                    },
                    'change:allergen': function(model) {
                        var searchAllergies = model.get('allergen');
                        if (searchAllergies) {
                            this.model.unset('reaction-date');
                        }
                    }
                }
            });

            var formModel = new FormModel();

            var workflowOptions = {
                size: "large",
                title: "Allergies",
                showProgress: false,
                keyboard: true,
                headerOptions: {
                    actionItems: [{
                        label: 'Preview',
                        onClick: function() {
                            // Preview functionality to go here
                        }
                    }, {
                        label: 'Print',
                        onClick: function() {
                            // Print functionality to go here
                        }
                    }]
                },
                steps: [{
                    view: formView,
                    viewModel: formModel,
                    stepTitle: 'Select an Allergy'
                }]
            };
            var workflow = new ADK.UI.Workflow(workflowOptions);
            workflow.show();
        }
    };
    return F420;
});
