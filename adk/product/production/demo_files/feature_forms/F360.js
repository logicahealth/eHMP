define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
], function(Backbone, Marionette, $, Handlebars) {

    var F360 = {
        createForm: function() {
            var generalOptionsArray = [{
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


            var TopTwoFields = {
                control: "container",
                extraClasses: ["row"],
                items: [{
                    control: "container",
                    extraClasses: ["col-xs-4"],
                    items: [{
                        control: "radio",
                        name: "immunizationOption",
                        required: true,
                        label: "Choose an option.",
                        options: [{
                            value: "administered",
                            label: "Administered"
                        }, {
                            value: "historical",
                            label: "Historical"
                        }]
                    }]
                }, {
                    control: "container",
                    extraClasses: ["col-xs-4"],
                    items: [{
                        control: "select",
                        name: "immunizationType",
                        label: "Select an immunization type.",
                        title: "Press enter to execute search.",
                        pickList: [{
                            value: "chickenpox",
                            label: "Chickenpox"
                        }, {
                            value: "flu shot, whole",
                            label: "Flue Shot, Whole"
                        }, {
                            value: "hepatitis a",
                            label: "Hepatitis A"
                        }, {
                            value: "hpv",
                            label: "HPV"
                        }, {
                            value: "pnemucoccal",
                            label: "Pnemucoccal"
                        }, {
                            value: "tetanus",
                            label: "Tetanus"
                        }],
                        required: true,
                        disabled: true,
                        showFilter: true
                    }]
                }, {
                    control: "container",
                    extraClasses: ["col-xs-4"],
                    items: [{
                        control: "select",
                        disabled: true,
                        hidden: true,
                        name: "informationSource",
                        label: "Information Source",
                        required: true,
                        title: "Use up and down arrows to view options and then press enter to select",
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
            };

//---------------- Form Fields -------------------//

            var F360Fields = [{
                control: "container",
                extraClasses: ["modal-body"],
                items: [{
                    control: "container",
                    extraClasses: ["container-fluid"],
                    items: [
                        TopTwoFields,
                    {
                        control: "spacer"
                    }, {
                        control: "container",
                        extraClasses: ["adminFields row"],
                        hidden: true,
                        items: [{
                            control: "container",
                            extraClasses: ["col-md-4"],
                            items: [{
                                control: "select",
                                disabled: true,
                                name: "lotNumberSelect",
                                label: "Lot Number",
                                title: "Use up and down arrows to view options and then press enter to select",
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
                        },{
                            control: "container",
                            extraClasses: ["col-md-2"],
                            items: [{
                                control: "input",
                                disabled: true,
                                name: "expirationDateInput",
                                label: "Expiration Date",
                                title: "Enter in a date in the following format, MM/DD/YYYY",
                                readonly: true,
                                required: true,
                            }]
                        }, {
                            control: "container",
                            extraClasses: ["col-md-6"],
                            items: [{
                                control: "input",
                                disabled: true,
                                name: "adminManufacturer",
                                label: "Manufacturer",
                                title: "Please enter in manufacturer",
                                readonly: true,
                                required: true,
                            }]
                        }]
                    }, {
                        control: "container",
                        extraClasses: ["adminFields row"],
                        hidden: true,
                        items:[{
                            control: "container",
                            extraClasses: ["col-md-2"],
                            items: [{
                                control: "datepicker",
                                disabled: true,
                                name: "adminAdministrationDate",
                                label: "Administration Date",
                                required: true,
                                title: "Enter in a date in the following format, MM/DD/YYYY"
                            }]
                        }, {
                            control: "container",
                            extraClasses: ["col-md-5"],
                            items: [{
                                control: "select",
                                disabled: true,
                                name: "administeringProviderSelect",
                                label: "Administered By",
                                title: "Press enter to execute search.",
                                pickList: [{
                                    value: "opt1",
                                    label: "Option 1"
                                }, {
                                    value: "opt2",
                                    label: "Option 2"
                                }, {
                                    value: "opt3",
                                    label: "Option 3"
                                }],
                                required: true,
                                showFilter: true
                            }]
                        }, {
                            control: "container",
                            extraClasses: ["col-md-5"],
                            items: [{
                                control: "select",
                                disabled: true,
                                name: "orderingProvider",
                                label: "Ordering Provider",
                                title: "Press enter to execute search.",
                                pickList: [{
                                    value: "opt1",
                                    label: "Option 1"
                                }, {
                                    value: "opt2",
                                    label: "Option 2"
                                }, {
                                    value: "opt3",
                                    label: "Option 3"
                                }],
                                showFilter: true
                            }]
                        }]
                    }, {
                        control: "container",
                        extraClasses: ["historicalFields row"],
                        hidden: true,
                        items:[{
                            control: "container",
                            extraClasses: ["col-md-4"],
                            items: [{
                                control: "input",
                                disabled: true,
                                name: "lotNumberInput",
                                label: "Lot Number",
                                title: "Please enter in lot number"
                            }]
                        }, {
                            control: "container",
                            extraClasses: ["col-md-2"],
                            items: [{
                                control: "datepicker",
                                disabled: true,
                                name: "expirationDatepicker",
                                label: "Expiration Date",
                            }]
                        }, {
                            control: "container",
                            extraClasses: ["col-md-6"],
                            items: [{
                                control: "input",
                                disabled: true,
                                name: "historicalManufacturer",
                                label: "Manufacturer",
                                title: "Please enter in manufacturer",
                            }]
                        }]
                    }, {
                        control: "container",
                        extraClasses: ["historicalFields row"],
                        hidden: true,
                        items: [{
                            control: "container",
                            extraClasses: ["col-md-2"],
                            items: [{
                                control: "datepicker",
                                disabled: true,
                                name: "historicalAdministrationDate",
                                label: "Administration Date",
                                title: "Enter in a date in the following format, MM/DD/YYYY"
                            }]
                        }, {
                            control: "container",
                            extraClasses: ["col-md-3"],
                            items: [{
                                control: "input",
                                disabled: true,
                                name: "administeringProviderInput",
                                label: "Administered By",
                                title: "Please enter in who this is administered by"
                            }]
                        }, {
                            control: "container",
                            extraClasses: ["col-md-4"],
                            items: [{
                                control: "input",
                                disabled: true,
                                name: "administeredLocation",
                                label: "Administered Location",
                                title: "Please enter the location of administration"
                            }]
                        }, {
                            control: "container",
                            extraClasses: ["col-md-3"],
                            items: [{
                                control: "input",
                                disabled: true,
                                name: "orderingProvider",
                                label: "Ordering Provider",
                                title: "Please enter in ordering provider"
                            }]
                        }]
                    }, {
                        control: "container",
                        extraClasses: ["sharedHidden row"],
                        hidden: true,
                        items: [{
                            control: "container",
                            extraClasses: ["col-md-3"],
                            items: [{
                                control: "select",
                                disabled: true,
                                name: "routeOfAdministration",
                                label: "Route of Administration",
                                title: "Use up and down arrows to view options and then press enter to select",
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
                        }, {
                            control: "container",
                            extraClasses: ["col-md-3"],
                            items: [{
                                control: "select",
                                disabled: true,
                                name: "anatomicLocation",
                                label: "Anatomic Location",
                                title: "Use up and down arrows to view options and then press enter to select",
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
                        }, {
                            control: "container",
                            extraClasses: ["col-md-3"],
                            items: [{
                                control: "input",
                                disabled: true,
                                name: "historical-dosage-unit-text",
                                label: "Dosage/Unit",
                                type: "number",
                                title: "Please enter in dosage",
                                units: [{
                                    label: "Unit 1",
                                    value: "unit1",
                                    title: "Unit 1",
                                }, {
                                    label: "Unit 2",
                                    value: "unit2",
                                    title: "Unit 2",
                                }, {
                                    label: "Unit 3",
                                    value: "unit3",
                                    title: "Unit 3",
                                }, {
                                    label: "Unit 4",
                                    value: "unit4",
                                    title: "Unit 4",
                                }, {
                                    label: "Unit 5",
                                    value: "unit5",
                                    title: "Unit 5",
                                }]
                            }]
                        }, {
                            control: "container",
                            extraClasses: ["col-md-3"],
                            items: [{
                                control: "select",
                                disabled: true,
                                name: "series",
                                label: "Series",
                                title: "Use up and down arrows to view options and then press enter to select",
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
                    }, {
                        control: "container",
                        extraClasses: ["adminFields row"],
                        hidden: true,
                        items: [{
                            control: "container",
                            extraClasses: ["col-md-8"],
                            items: [{
                                control: "select",
                                disabled: true,
                                name: "informationStatement",
                                label: "Vaccine Information Statement (VIS)",
                                title: "Use up and down arrows to view options and then press enter to select",
                                pickList: generalOptionsArray,
                                showFilter: false,
                                groupEnabled: true,
                                multiple: true,
                                size: 10
                            }]
                        }, {
                            control: "container",
                            extraClasses: ["col-md-4"],
                            items: [{
                                control: "datepicker",
                                disabled: true,
                                name: "visDateOffered",
                                label: "VIS Date Offered",
                                title: "Enter in a date in the following format, MM/DD/YYYY"
                            }]
                        }]
                    }, {
                        control: "container",
                        extraClasses: ["sharedHidden row"],
                        hidden: true,
                        items: [{
                            control: "container",
                            extraClasses: ["col-md-12"],
                            items: [{
                                control: "textarea",
                                disabled: true,
                                name: "comments2",
                                label: "Comments",
                                rows: 7,
                                title: "Please enter in comments"
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
                        extraClasses: ["col-md-12"],
                        items: [{
                            control: "button",
                            type: "button",
                            extraClasses: ["btn-default", "btn-sm"],
                            label: "Cancel",
                            title: "Press enter to cancel",
                            id: "close-btn"
                        },{
                            control: 'dropdown',
                            split: true,
                            label: 'Add',
                            id: 'dropdown-accept',
                            title: "Press enter to add or press tab to execute more options",
                            type: "submit",
                            items: [{
                                label: 'Add',
                                id: 'add',
                            }, {
                                label: 'Add and Create Another',
                                id: 'add-create-another'
                            }]
                        }]
                    }]
                }]
            }];

            var FormModel = Backbone.Model.extend({
                defaults: {

                }
            });

            var DeleteMessageView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile('You will lose all work in progress if you delete this task. Would you like to proceed?'),
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

            var FormView = ADK.UI.Form.extend({
                ui: {
                    "immunizationType": ".immunizationType",
                    "hiddenToggle": ".sharedHidden",
                    "hiddenAdministered": ".adminFields",
                    "hiddenHistorical": ".historicalFields, .informationSource",
                    "disabledToggle": ".informationSource, .lotNumberInput, .lotNumberSelect, " +
                                    ".expirationDatepicker, .expirationDateInput, .adminManufacturer, " +
                                    ".historicalManufacturer, .adminAdministrationDate, .historicalAdministrationDate, " +
                                    ".administeringProviderInput, .administeringProviderSelect, .orderingProvider, " +
                                    ".administeredLocation, .routeOfAdministration, .anatomicLocation, " +
                                    ".historical-dosage-unit-text, .series, .informationStatement, " +
                                    ".visDateOffered, .comments2",
                    "requiredAdministered": ".lotNumberSelect, .expirationDateInput, .adminManufacturer, " +
                                    ".adminAdministrationDate, .administeringProviderSelect, " +
                                    ".routeOfAdministration, .historical-dosage-unit-text",
                    "requiredHistorical": ".informationSource",
                    "addSubmit": "#dropdown-accept",
                },
                fields: F360Fields,
                events: {
                    "click #close-btn": function(e) {
                        e.preventDefault();
                        var deleteAlertView = new ADK.UI.Alert({
                            title: 'Are you sure you want to delete?',
                            icon: 'icon-delete',
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
                                title: 'Immunization Submitted',
                                icon: 'fa-check',
                                message: 'Immunization successfully submitted with no errors.',
                                type: "success"
                            });
                            saveAlertView.show();
                            if(this.ui.addSubmit.html() === "Add") {
                                ADK.UI.Workflow.hide();
                            } else {
                                this.model.unset("immunizationOption");
                            }
                        }
                        return false;
                    },
                    "click .dropdown-menu a": function(e) {
                        var dropdownBtnText = $(e.target).html();
                        if(dropdownBtnText !== this.ui.addSubmit.html()) {
                            this.ui.addSubmit.html(dropdownBtnText);
                        }
                    }
                },
                resetAll: function() {
                    this.model.unset("immunizationType");
                    this.model.unset("informationSource");
                    this.model.unset("lotNumberInput");
                    this.model.unset("lotNumberSelect");
                    this.model.unset("expirationDatepicker");
                    this.model.unset("expirationDateInput");
                    this.model.unset("historicalManufacturer");
                    this.model.unset("adminManufacturer");
                    this.model.unset("adminAdministrationDate");
                    this.model.unset("historicalAdministrationDate");
                    this.model.unset("administeringProviderSelect");
                    this.model.unset("administeringProviderInput");
                    this.model.unset("administeredLocation");
                    this.model.unset("orderingProvider");
                    this.model.unset("routeOfAdministration");
                    this.model.unset("anatomicLocation");
                    this.model.unset("historical-dosage-unit-text");
                    this.model.unset("series");
                    this.model.unset("informationStatement");
                    this.model.unset("visDateOffered");
                    this.model.unset("comments2");
                },
                modelEvents: {
                    'change:immunizationOption': function(model) {
                        var immunizationOption = model.get('immunizationOption');
                        this.resetAll();
                        if (immunizationOption === undefined) {
                            this.ui.hiddenToggle.trigger('control:hidden', true);
                            this.ui.hiddenAdministered.trigger('control:hidden', true);
                            this.ui.hiddenHistorical.trigger('control:hidden', true);
                            this.ui.immunizationType.trigger('control:disabled', true);
                        } else if (immunizationOption === 'administered') {
                            this.ui.hiddenToggle.trigger('control:hidden', false);
                            this.ui.hiddenAdministered.trigger('control:hidden', false);
                            this.ui.hiddenHistorical.trigger('control:hidden', true);
                            this.ui.requiredAdministered.trigger('control:required', true);
                            this.ui.requiredHistorical.trigger('control:required', false);
                        } else {
                            this.ui.hiddenToggle.trigger('control:hidden', false);
                            this.ui.requiredAdministered.trigger('control:required', false);
                            this.ui.requiredHistorical.trigger('control:required', true);
                            this.ui.hiddenAdministered.trigger('control:hidden', true);
                            this.ui.hiddenHistorical.trigger('control:hidden', false);
                        }
                        this.ui.immunizationType.trigger('control:disabled', false);
                    },
                    'change:immunizationType': function(model) {
                        if(model.get('immunizationType') === undefined || model.get('immunizationType') === "") {
                            this.ui.disabledToggle.trigger('control:disabled', true);
                        } else {
                            this.ui.disabledToggle.trigger('control:disabled', false);
                        }
                    },
                    'change:lotNumberSelect':function(model) {
                        if(model.get('lotNumberSelect') === "") {
                            this.model.unset('manufacturer');
                            this.model.unset('expirationDate');
                        } else {
                            this.model.set('adminManufacturer', 'Il Loren Ipsum');
                            this.model.set('expirationDateInput', '12/16/1991');
                        }
                    }
                }
            });

            var formModel = new FormModel();

            var workflowOptions = {
                size: "large",
                title: "Enter Immunization",
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
                    view: FormView,
                    viewModel: formModel,
                    stepTitle: 'Enter Immunization Info'
                }]
            };
            var workflow = new ADK.UI.Workflow(workflowOptions);
            workflow.show();
        }
    };
    return F360;
});