define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars'
], function(Backbone, Marionette, $, Handlebars) {

    //=============================================================================================================
    // PLEASE DO NOT COPY AND PASTE THIS FULL FILE. PLEASE JUST USE AS A REFERENCE AND COPY PARTS THAT ARE NEEDED
    // for more information on how to layout this form for your applet please checkout the following link:
    // http://IP_ADDRESS/documentation/#/adk/conventions#Writeback
    //=============================================================================================================

    var F414 = {
        // DO NOT USE CREATE FORM FUNCTION --- THIS IS FOR DEMO PURPOSES ONLY!!!
        createForm: function() {
            // *********************************************** STATIC COLLECTION ****************************************
            // NOTE: PICKLIST IS ONLY FOR THIS DEMO EXAMPLE
            var yesNoPick = new Backbone.Collection([{
                name: '001',
                label: 'Service Connected Condition',
            }, {
                name: '002',
                label: 'Agent Orange',
            }, {
                name: '003',
                label: 'Radiation',
            }]);

            var pickList1 = new Backbone.Collection([{
                value: 'Option1',
                label: 'Option1'
            }, {
                value: 'Option2',
                label: 'Option2'
            }, {
                value: 'Option3',
                label: 'Option3'
            }, {
                value: 'Option4',
                label: 'Option4'
            }, {
                value: 'Option5',
                label: 'Option5'
            }, {
                value: 'Allergic Headache',
                label: 'Allergic Headache'
            }]);
            // *********************************************** END OF STATIC PICKLISTS **********************************

            // *********************************************** CONTAINERS ***********************************************
            // Okay to copy and paste this !!!!!!!!! BUT ENSURE TO REPLACE STATIC OPTIONS/DATA WITH REAL DATA !!!!!!!
            var warningContainer = {
                control: "container",
                extraClasses: ["row"],
                items: [{
                    control: "alertBanner",
                    extraClasses: ["col-md-12", "bottom-margin-no"],
                    name: "alertMessage",
                    type: "warning",
                    dismissible: true,
                    title: "Warning",
                    icon: "fa-warning"
                }, {
                    control: "checkbox",
                    extraClasses: ["col-md-12", "all-margin-no"],
                    hidden: true,
                    name: "requestNewTerm",
                    label: "Request New Term"
                }]
            };

            var selectProblemContainer = {
                control: "container",
                extraClasses: ["col-md-5"],
                items: [{
                    control: "typeahead",
                    id: "selectProblemTypeahead",
                    name: "selectProblemTypeahead",
                    label: "Select a Problem",
                    srOnlyLabel: false,
                    placeholder: "Search for available problems...",
                    pickList: pickList1,
                    required: true
                }]
            };
            var statusContainer = {
                control: "container",
                extraClasses: ["col-md-3"],
                items: [{
                    control: "radio",
                    required: true,
                    name: "statusRadioValue",
                    label: "Status",
                    options: [{
                        label: "Active",
                        value: "sr-opt1"
                    }, {
                        label: "Inactive",
                        value: "sr-opt2"
                    }]
                }]
            };

            var immediacyContainer = {
                control: "container",
                extraClasses: ["col-md-3"],
                items: [{
                    control: "radio",
                    required: true,
                    name: "immediacyRadioValue",
                    label: "Immediacy",
                    options: [{
                        label: "Acute",
                        value: "ir-opt1"
                    }, {
                        label: "Cronic",
                        value: "ir-opt2"
                    }, {
                        label: "Unknown",
                        value: "ir-opt3"
                    }]
                }]
            };

            var clearSpacer = {
                control: "container",
                extraClasses: ["col-md-12", "clear"],
                items: [{
                    control: "spacer"
                }]
            };

            var onsetDateContainer = {
                control: "container",
                extraClasses: ["col-xs-2"],
                items: [{
                    control: "datepicker",
                    name: "onset-date",
                    label: "Onset Date"
                }]
            };

            var clinicContainer = {
                control: "container",
                extraClasses: ["col-xs-5"],
                items: [{
                    control: "input",
                    name: "clinic",
                    label: "Clinic"
                }]
            };

            var resProviderContainer = {
                control: "container",
                extraClasses: ["col-md-5"],
                items: [{
                    control: "input",
                    name: "res-provider",
                    label: "Res Provider *"
                }]
            };

            var treatmentFactorsContainer = {
                control: "container",
                extraClasses: ["col-md-6"],
                items: [{
                    control: "container",
                    extraClasses: ["well", "top-margin-md"],
                    items: [{
                        control: "fieldset",
                        legend: "Visit Related To",
                        items: [{
                            control: "radio",
                            extraClasses: ["top-margin-xs", "bottom-border-grey-light"],
                            name: "serviceConnectedCondition",
                            label: "Service Connected Condition",
                            title: "Service Connected Condition",
                            options: [{
                                label: "Yes",
                                value: 'true'
                            }, {
                                label: "No",
                                value: 'false'
                            }]
                        }, {
                            control: "radio",
                            extraClasses: ["bottom-border-grey-light"],
                            name: "combatVet",
                            label: "Combat Vet (Combat Related)",
                            title: "Combat Vet (Combat Related)",
                            options: [{
                                label: "Yes",
                                value: 'true'
                            }, {
                                label: "No",
                                value: 'false'
                            }]
                        }, {
                            control: "radio",
                            extraClasses: ["bottom-border-grey-light"],
                            name: "agentOrange",
                            label: "Agent Orange Exposure",
                            title: "Agent Orange Exposure",
                            options: [{
                                label: "Yes",
                                value: 'true'
                            }, {
                                label: "No",
                                value: 'false'
                            }]
                        }, {
                            control: "radio",
                            extraClasses: ["bottom-border-grey-light"],
                            name: "ionizingRadiationExposure",
                            label: "Ionizing Radiation Exposure",
                            title: "Ionizing Radiation Exposure",
                            options: [{
                                label: "Yes",
                                value: 'true'
                            }, {
                                label: "No",
                                value: 'false'
                            }]
                        }, {
                            control: "radio",
                            extraClasses: ["bottom-border-grey-light"],
                            name: "southwestAsiaConditions",
                            label: "Southwest Asia Conditions",
                            title: "Southwest Asia Conditions",
                            options: [{
                                label: "Yes",
                                value: 'true'
                            }, {
                                label: "No",
                                value: 'false'
                            }]
                        }, {
                            control: "radio",
                            extraClasses: ["bottom-border-grey-light"],
                            name: "shipboardHazard",
                            label: "Shipboard Hazard and Defense",
                            title: "Shipboard Hazard and Defense",
                            options: [{
                                label: "Yes",
                                value: 'true'
                            }, {
                                label: "No",
                                value: 'false'
                            }]
                        }, {
                            control: "radio",
                            extraClasses: ["bottom-border-grey-light"],
                            name: "militarySexualTrauma",
                            label: "Military Sexual Trauma",
                            title: "Military Sexual Trauma",
                            options: [{
                                label: "Yes",
                                value: 'true'
                            }, {
                                label: "No",
                                value: 'false'
                            }]
                        }]
                    }]
                }]
            };

            var annotationsContainer = {
                control: "container",
                extraClasses: ["col-md-6"],
                items: [{
                    control: "container",
                    extraClasses: ["well", "top-margin-md"],
                    items: [{
                        control: "fieldset",
                        legend: "Annotations",
                        items: [{
                            control: "commentBox",
                            name: "commentCollection",
                            collection: new Backbone.Collection([{
                                commentString: "The patient is lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                                author: {
                                    name: "Vehu, Five",
                                    duz: {
                                        "9E7A": "10000000255"
                                    }
                                },
                                timeStamp: "12/14/2014 11:15PM"
                            }, {
                                commentString: "The patient is lorem ipsum dolor sit amet.",
                                author: {
                                    name: "Vehu, Five",
                                    duz: {
                                        "9E7A": "10000000238"
                                    }
                                },
                                timeStamp: "12/13/2014 11:17PM"
                            }]),
                            attributeMapping: {
                                comment: "commentString",
                                author: "author",
                                timeStamp: "timeStamp"
                            }
                        }]
                    }]
                }]
            };

            var bottomRow = {
                control: "container",
                extraClasses: ["row"],
                items: [treatmentFactorsContainer, annotationsContainer]
            };

            var lowerBodyContainer = {
                control: "container",
                extraClasses: ["row", "top-margin-sm"],
                items: [selectProblemContainer, statusContainer, immediacyContainer, clearSpacer, onsetDateContainer, clinicContainer, resProviderContainer]
            };
            // *********************************************** END OF CONTAINERS ****************************************

            // *********************************************** FIELDS ***************************************************
            // Okay to copy and paste
            var F414_SelectProblemFields = [{
                // **************************************** Modal Body Start ********************************************
                control: "container",
                extraClasses: ["modal-body"],
                items: [{
                    control: "container",
                    extraClasses: ["container-fluid"],
                    items: [warningContainer, lowerBodyContainer, bottomRow]
                }]
            }, {
                // **************************************** Modal Footer Start ******************************************
                control: "container",
                extraClasses: ["modal-footer"],
                items: [{
                    control: "container",
                    extraClasses: ["row"],
                    items: [{
                        control: "container",
                        extraClasses: ["col-md-3"]
                    }, {
                        control: "container",
                        extraClasses: ["col-md-9"],
                        items: [{
                            control: "button",
                            id: "cancel-btn",
                            name: "cancel-btn",
                            extraClasses: ["btn-default", "btn-sm"],
                            label: "Cancel",
                            type: 'button',
                        }, {
                            control: "button",
                            id: "add-btn",
                            name: 'add-btn',
                            extraClasses: ["btn-primary", "btn-sm"],
                            label: "Add",
                            type: "submit"
                        }]
                    }]
                }]
            }];

            // *********************************************** END OF FIELDS ********************************************

            // *********************************************** MODEL ****************************************************
            // Okay to copy and paste - Please Add additional items to prepopulate the fields
            var FormModel = Backbone.Model.extend({
                defaults: {
                    savedDay: 'MM/dd/YYYY',
                    selectProblemTypeahead: '',
                    requestNewTerm: false
                }
            });
            // *********************************************** END OF MODEL *********************************************

            // *********************************************** FOOTER VIEW **********************************************
            // Okay to copy and paste - WITH 1 EXCEPTION (see below)

            var DeleteMessageView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile('You will lose all work in progress if you delete this task. Would you like to proceed?'),
                tagName: 'p'
            });
            var CloseMessageView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile('You will lose all work in progress if you close this task. Would you like to proceed?'),
                tagName: 'p'
            });
            var FooterView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile('{{ui-button "Cancel" id="cancel-btn" classes="btn-default btn-sm" title="Press enter to cancel"}}{{ui-button "Continue" classes="btn-primary btn-sm" title="Press enter to continue"}}'),
                events: {
                    'click .btn-primary': function() {
                        ADK.UI.Alert.hide();
                        ADK.UI.Workflow.hide();
                    },
                    'click #cancel-btn': function() {
                        console.log("TEST Cancel");
                        ADK.UI.Alert.hide();
                    }
                },
                tagName: 'span'
            });

            var selectProblemView = ADK.UI.Form.extend({
                ui: {
                    "requestNewTerm": ".requestNewTerm",
                    "statusRadio": "#statusRadioValue-sr-opt1"
                },
                events: {
                    "click #cancel-btn": function(e) {
                        // alert
                        e.preventDefault();
                        var deleteAlertView = new ADK.UI.Alert({
                            title: 'Are you sure you want to cancel?',
                            icon: 'icon-cancel',
                            messageView: DeleteMessageView,
                            footerView: FooterView
                        });
                        deleteAlertView.show();
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
                                title: 'Problem Submitted',
                                icon: 'fa-check',
                                message: 'Problem successfully submitted with no errors.',
                                type: "success"
                            });
                            saveAlertView.show();
                            ADK.UI.Workflow.hide();
                        }
                    },
                    "keydown .requestNewTerm input:checked(:focus)": function(e) {
                        if (e.which === 9) {
                            e.preventDefault();
                            this.ui.statusRadio.focus();
                        }
                    }
                },
                fields: F414_SelectProblemFields,
                modelEvents: {
                    'change:selectProblemTypeahead': function(model) {

                        var selectProblem = model.get('selectProblemTypeahead');

                        var checkName = _.find(pickList1.models, function(obj) {
                            return obj.get('label') === selectProblem;
                        });
                        if(selectProblem === "") {
                            this.model.unset('alertMessage');
                            this.model.set('requestNewTerm', false);
                            this.ui.requestNewTerm.trigger('control:hidden', true);
                        } else if (_.isUndefined(checkName)) {
                            this.model.set('alertMessage', 'If you proceed with this nonspecific term, an ICD code of "799.9 - OTHER UNKNOWN AND UNSPECIFIED CAUSE OF MORBIDITY OR MORTALITY" will be filed.');
                            this.ui.requestNewTerm.trigger('control:hidden', false);
                            this.$el.find('.alert-dismissible .close').focus();
                        } else {
                            this.model.unset('alertMessage');
                            this.model.set('requestNewTerm', false);
                            this.ui.requestNewTerm.trigger('control:hidden', true);
                        }
                    },
                    'change:alertMessage': function(model) {
                        if(!model.get('alertMessage')) {
                            this.ui.requestNewTerm.find('input').focus();
                        }
                    }
                },
                clearInput: function() {
                    this.model.unset("statusRadioValue");
                    this.model.unset("immediacyRadioValue");
                    this.model.unset("onset-date");
                    this.model.unset("clinic");
                    this.model.unset("res-provider");
                    this.model.unset("yesNoChecklist");
                }
            });

            // *********************************************** END OF FORM VIEW *****************************************

            // *********************************************** MODEL AND WORKFLOW INSTANCE ******************************
            // Okay to copy and paste
            var formModel = new FormModel();

            var workflowOptions = {
                size: "large",
                title: "Enter Problem",
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
                    view: selectProblemView,
                    viewModel: formModel,
                    stepTitle: 'Select a Problem'
                }]
            };
            var workflow = new ADK.UI.Workflow(workflowOptions);
            workflow.show();
            // *********************************************** END OF MODEL AND WORKFLOW INSTANCE ***********************
        }
    };
    return F414;
});