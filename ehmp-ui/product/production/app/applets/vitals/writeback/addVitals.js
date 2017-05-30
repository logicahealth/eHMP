define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'moment',
    'app/applets/vitals/writeback/validationUtils',
    'app/applets/vitals/writeback/writebackUtils',
    'app/applets/vitals/writeback/errorFooterView'
], function(Backbone, Marionette, $, Handlebars, moment, validationUtils, writebackUtils, ErrorFooterView) {
    "use strict";

    var rowSubheader = {
        control: "container",
        extraClasses: ["row"],
        items: [{
            control: "container",
            extraClasses: ["col-xs-12", "left-padding-xs right-padding-xs"],
            items: [{
                control: 'container',
                extraClasses: ["col-xs-4", "all-padding-xs"],
                items: [{
                    control: "datepicker",
                    name: "dateTakenInput",
                    label: "Date Taken",
                    flexible: true,
                    minPrecision: 'day',
                    required: true,
                    options: {
                        endDate: '0d',
                        startDate: moment().subtract(100, 'y')
                    }
                }]
            }, {
                control: "container",
                extraClasses: ["col-xs-3", "all-padding-xs"],
                items: [{
                    control: "timepicker",
                    name: "time-taken",
                    title: "Enter in a time in the following format, HH:MM",
                    label: "Time Taken",
                    options: {
                        defaultTime: false
                    }
                }]

            }, {
                control: "container",
                extraClasses: ["col-xs-2", "top-margin-xs", "all-padding-no"],
                items: [{
                    control: "button",
                    type: "button",
                    title: "Press enter to pass",
                    name: "facility-name-pass-po",
                    label: "Pass",
                    extraClasses: ["btn-primary", "btn-xs", "top-margin-xl", "font-size-12"]
                }]
            }, {
                control: "container",
                extraClasses: ["col-xs-3", "top-margin-xs", "all-padding-no"],
                items: [{
                    control: 'button',
                    type: 'button',
                    label: 'Expand All',
                    name: 'expandCollapseAll',
                    extraClasses: ["btn-default", "btn-xs", "top-margin-xl", "left-margin-xs", "background-color-pure-white", "font-size-12"],
                    title: "Press enter to expand all vitals"
                }]
            }, {
                control: 'spacer'
            }]
        }]
    };

    var bloodPressureBody = {
        control: "container",
        items: [{
            control: "select",
            name: "bp-location-po",
            disabled: true,
            label: "Location",
            title: "Use up and down arrows to view options and then press enter to select",
            extraClasses: ["col-xs-12"],
            pickList: []
        }, {
            control: "select",
            name: "bp-method-po",
            disabled: true,
            label: "Method",
            title: "Use up and down arrows to view options and then press enter to select",
            extraClasses: ["col-xs-12"],
            pickList: []
        }, {
            control: "select",
            label: "Cuff Size",
            title: "Use up and down arrows to view options and then press enter to select",
            name: "bp-cuff-size-po",
            disabled: true,
            extraClasses: ["col-xs-12"],
            pickList: []
        }, {
            control: "select",
            label: "Position",
            title: "Use up and down arrows to view options and then press enter to select",
            name: "bp-position-po",
            disabled: true,
            extraClasses: ["col-xs-12"],
            pickList: []
        }]
    };

    var bloodPressureSection = {
        control: 'collapsibleContainer',
        name: 'bpSection',
        headerItems: [{
            control: "container",
            extraClasses: ["col-xs-7", "bpInput"],
            items: [{
                control: "input",
                name: "bpInputValue",
                label: "Blood Pressure",
                title: "Enter in a numeric value",
                extraClasses: ["vitalInput"],
                units: "mm[HG]"
            }]
        }, {
            control: "container",
            extraClasses: ["col-xs-5"],
            items: [{
                control: "radio",
                name: "bp-radio-po",
                label: "Blood Pressure Vital",
                srOnlyLabel: true,
                extraClasses: ["top-margin-lg", "left-padding-xs"],
                options: [{
                    value: "Unavailable",
                    label: "Unavailable"
                }, {
                    value: "Refused",
                    label: "Refused"
                }]
            }]
        }],
        collapseItems: [bloodPressureBody]
    };

    var temperatureHeader = {
        control: "container",
        items: [{
            control: "container",
            extraClasses: ["col-xs-7"],
            items: [{
                control: "input",
                name: "temperatureInputValue",
                label: "Temperature",
                title: "Enter in a numeric value",
                maxlength: '6',
                extraClasses: ["vitalInput", "inputWithRadio"],
                units: [{
                    label: "F",
                    value: "F",
                    title: "fahrenheit"
                }, {
                    label: "C",
                    value: "C",
                    title: "celsius"
                }]
            }]
        }, {
            control: "container",
            extraClasses: ["col-xs-5"],
            items: [{
                control: "radio",
                name: "temperature-radio-po",
                label: "Temperature Vital",
                srOnlyLabel: true,
                extraClasses: ["top-margin-lg", "left-padding-xs"],
                options: [{
                    value: "Unavailable",
                    label: "Unavailable"
                }, {
                    value: "Refused",
                    label: "Refused"
                }]
            }]
        }]
    };
    var pulseHeader = {
        control: "container",
        items: [{
            control: "container",
            extraClasses: ["col-xs-7"],
            items: [{
                control: "input",
                label: "Pulse",
                name: "pulseInputValue",
                units: "/min",
                extraClasses: ["vitalInput"],
                title: "Enter in a numeric value"
            }]
        }, {
            control: "container",
            extraClasses: ["col-xs-5"],
            items: [{
                control: "radio",
                name: "pulse-radio-po",
                label: "Pulse Vital",
                srOnlyLabel: true,
                extraClasses: ["top-margin-lg", "left-padding-xs"],
                options: [{
                    value: "Unavailable",
                    label: "Unavailable"
                }, {
                    value: "Refused",
                    label: "Refused"
                }]
            }]
        }]
    };

    var pulseBody = {
        control: "container",
        items: [{
            control: "select",
            name: "pulse-method-po",
            disabled: true,
            label: "Method",
            title: "Use up and down arrows to view options and then press enter to select",
            extraClasses: ["col-xs-12"],
            pickList: []
        }, {
            control: "select",
            name: "pulse-position-po",
            disabled: true,
            label: "Position",
            title: "Use up and down arrows to view options and then press enter to select",
            extraClasses: ["col-xs-12"],
            pickList: []
        }, {
            control: "select",
            name: "pulse-site-po",
            disabled: true,
            label: "Site",
            title: "Use up and down arrows to view options and then press enter to select",
            extraClasses: ["col-xs-12"],
            pickList: []
        }, {
            control: "select",
            name: "pulse-location-po",
            disabled: true,
            label: "Location",
            title: "Use up and down arrows to view options and then press enter to select",
            extraClasses: ["col-xs-12"],
            pickList: []
        }]
    };

    var pulseSection = {
        control: 'collapsibleContainer',
        name: 'pulseSection',
        headerItems: [pulseHeader],
        collapseItems: [pulseBody]
    };

    var respirationHeader = {
        control: "container",
        items: [{
            control: "container",
            extraClasses: ["col-xs-7"],
            items: [{
                control: "input",
                label: "Respiration",
                units: "/min",
                extraClasses: ["vitalInput"],
                title: "Enter in a numeric value",
                name: "respirationInputValue"
            }]
        }, {
            control: "container",
            extraClasses: ["col-xs-5"],
            items: [{
                control: "radio",
                name: "respiration-radio-po",
                label: "Respiration Vital",
                srOnlyLabel: true,
                extraClasses: ["top-margin-lg", "left-padding-xs"],
                options: [{
                    value: "Unavailable",
                    label: "Unavailable"
                }, {
                    value: "Refused",
                    label: "Refused"
                }]
            }]
        }]
    };

    var respirationBody = {
        control: "container",
        items: [{
            control: "select",
            name: "respiration-method-po",
            disabled: true,
            label: "Method",
            title: "Use up and down arrows to view options and then press enter to select",
            extraClasses: ["col-xs-12"],
            pickList: []
        }, {
            control: "select",
            name: "respiration-position-po",
            disabled: true,
            label: "Position",
            title: "Use up and down arrows to view options and then press enter to select",
            extraClasses: ["col-xs-12"],
            pickList: []
        }]
    };

    var respirationSection = {
        control: 'collapsibleContainer',
        name: 'respirationSection',
        headerItems: [respirationHeader],
        collapseItems: [respirationBody]
    };

    var temperatureBody = {
        control: "container",
        extraClasses: ["col-xs-12"],
        items: [{
            control: "select",
            label: "Location",
            title: "Use up and down arrows to view options and then press enter to select",
            name: "temperature-location-po",
            disabled: true,
            pickList: []
        }]
    };

    var temperatureSection = {
        control: 'collapsibleContainer',
        name: 'temperatureSection',
        headerItems: [temperatureHeader],
        collapseItems: [temperatureBody]
    };

    var pulseOximetryHeader = {
        control: "container",
        items: [{
            control: "container",
            extraClasses: ["col-xs-7"],
            items: [{
                control: "input",
                name: "O2InputValue",
                label: "Pulse Oximetry",
                title: "Enter in a numeric value",
                units: "%",
                extraClasses: ["vitalInput"]
            }]
        }, {
            control: "container",
            extraClasses: ["col-xs-5"],
            items: [{
                control: "radio",
                name: "po-radio-po",
                label: "Pulse Oximetry Vital",
                srOnlyLabel: true,
                extraClasses: ["top-margin-lg", "left-padding-xs"],
                options: [{
                    value: "Unavailable",
                    label: "Unavailable"
                }, {
                    value: "Refused",
                    label: "Refused"
                }]
            }]
        }]
    };

    var pulseOximetryBody = {
        control: "container",
        items: [{
            control: "input",
            label: "Supplemental Oxygen Flow Rate",
            name: "suppO2InputValue",
            disabled: true,
            units: "(liters/minute)",
            title: "Enter in a numeric value",
            extraClasses: ["col-xs-12"]
        }, {
            control: "select",
            label: "Method",
            name: "po-method-po",
            disabled: true,
            title: "Use up and down arrows to view options and then press enter to select",
            extraClasses: ["col-xs-12"],
            pickList: []
        }]
    };

    var pulseOximetrySection = {
        control: 'collapsibleContainer',
        name: 'poSection',
        headerItems: [pulseOximetryHeader],
        collapseItems: [pulseOximetryBody]
    };

    var heightHeader = {
        control: "container",
        items: [{
            control: "container",
            extraClasses: ["col-xs-7"],
            items: [{
                control: "input",
                name: "heightInputValue",
                label: "Height",
                title: "Enter in a numeric value",
                extraClasses: ["vitalInput", "input-with-radio"],
                units: [{
                    label: "in",
                    value: "in",
                    title: "inches"
                }, {
                    label: "cm",
                    value: "cm",
                    title: "centimeters"
                }]
            }]
        }, {
            control: "container",
            extraClasses: ["col-xs-5"],
            items: [{
                control: "radio",
                name: "height-radio-po",
                label: "Height Vital",
                srOnlyLabel: true,
                extraClasses: ["top-margin-lg", "left-padding-xs"],
                options: [{
                    value: "Unavailable",
                    label: "Unavailable"
                }, {
                    value: "Refused",
                    label: "Refused"
                }]
            }]
        }]
    };

    var heightBody = {
        control: "container",
        extraClasses: ["col-xs-12"],
        items: [{
            control: "select",
            label: "Quality",
            name: "height-quality-po",
            disabled: true,
            title: "Use up and down arrows to view options and then press enter to select",
            pickList: []
        }]
    };

    var heightSection = {
        control: 'collapsibleContainer',
        name: 'heightSection',
        headerItems: [heightHeader],
        collapseItems: [heightBody]
    };

    var weightHeader = {
        control: "container",
        items: [{
            control: "container",
            extraClasses: ["col-xs-7"],
            items: [{
                control: "input",
                name: "weightInputValue",
                label: "Weight",
                title: "Enter in a numeric value",
                extraClasses: ["vitalInput", "input-with-radio"],
                units: [{
                    label: "lb",
                    value: "lb",
                    title: "lb Units"
                }, {
                    label: "kg",
                    value: "kg",
                    title: "kg Units"
                }]
            }]
        }, {
            control: "container",
            extraClasses: ["col-xs-5"],
            items: [{
                control: "radio",
                name: "weight-radio-po",
                label: "Weight Vital",
                srOnlyLabel: true,
                extraClasses: ["top-margin-lg", "left-padding-xs"],
                options: [{
                    value: "Unavailable",
                    label: "Unavailable"
                }, {
                    value: "Refused",
                    label: "Refused"
                }]
            }]
        }]
    };

    var weightBody = {
        control: "container",
        items: [{
            control: "select",
            name: "weight-method-po",
            disabled: true,
            label: "Method",
            title: "Use up and down arrows to view options and then press enter to select",
            extraClasses: ["col-xs-12"],
            pickList: []
        }, {
            control: "select",
            name: "weight-quality-po",
            disabled: true,
            label: "Quality",
            title: "Use up and down arrows to view options and then press enter to select",
            extraClasses: ["col-xs-12"],
            pickList: []
        }]
    };

    var weightSection = {
        control: 'collapsibleContainer',
        name: 'weightSection',
        headerItems: [weightHeader],
        collapseItems: [weightBody]
    };

    var painHeader = {
        control: "container",
        extraClasses: ["row", "form-group"],
        items: [{
            control: "container",
            extraClasses: ["well", "well-collapse"],
            items: [{
                control: "container",
                extraClasses: ["col-xs-2", "right-padding-xs"],
                items: [{
                    control: "input",
                    name: "pain-value-po",
                    label: "Pain",
                    extraClasses: ["vitalInput"],
                    maxlength: 2,
                    placeholder: "0-10",
                    title: "Enter in numeric value for pain from 0 to 10, 0 being no pain and 10 being the greatest amount of pain"
                }]
            }, {
                control: "container",
                extraClasses: ["col-xs-4", "all-padding-no", " percent-width-35"],
                items: [{
                    control: "checkbox",
                    label: "Unable to Respond",
                    name: "pain-checkbox-po",
                    extraClasses: ["top-margin-xl"],
                    title: "To select this checkbox, press the spacebar"
                }]
            }, {
                control: "container",
                extraClasses: ["col-xs-5", "left-padding-xl"],
                items: [{
                    control: "radio",
                    name: "pain-radio-po",
                    label: "Pain Vital",
                    srOnlyLabel: true,
                    extraClasses: ["top-margin-lg", "left-padding-xs"],
                    options: [{
                        value: "Unavailable",
                        label: "Unavailable"
                    }, {
                        value: "Refused",
                        label: "Refused"
                    }]
                }]
            }]
        }]
    };

    var painSection = {
        control: 'container',
        name: 'painSection',
        items: [painHeader]
    };

    var circumferenceHeader = {
        control: "container",
        items: [{
            control: "container",
            extraClasses: ["col-xs-7"],
            items: [{
                control: "input",
                label: "Circumference/Girth",
                name: "circumValue",
                title: "Enter in a numeric value",
                extraClasses: ["vitalInput", "input-with-radio"],
                units: [{
                    label: "in",
                    value: "in",
                    title: "in Units"
                }, {
                    label: "cm",
                    value: "cm",
                    title: "cm Units"
                }]
            }]
        }, {
            control: "container",
            extraClasses: ["col-xs-5"],
            items: [{
                control: "radio",
                name: "cg-radio-po",
                label: "Circumference / Girth Vital",
                srOnlyLabel: true,
                extraClasses: ["top-margin-lg", "left-padding-xs"],
                options: [{
                    value: "Unavailable",
                    label: "Unavailable"
                }, {
                    value: "Refused",
                    label: "Refused"
                }]
            }]
        }]
    };

    var circumferenceBody = {
        control: "container",
        items: [{
            control: "select",
            name: "cg-site-po",
            disabled: true,
            label: "Site",
            title: "Use up and down arrows to view options and then press enter to select",
            extraClasses: ["col-xs-12"],
            pickList: []
        }, {
            control: "select",
            label: "Location",
            name: "cg-location-po",
            disabled: true,
            title: "Use up and down arrows to view options and then press enter to select",
            extraClasses: ["col-xs-12"],
            pickList: []
        }]
    };

    var circumferenceSection = {
        control: 'collapsibleContainer',
        name: 'cgSection',
        headerItems: [circumferenceHeader],
        collapseItems: [circumferenceBody]
    };

    var F423Fields = [{
        //*************************** Modal Body START ***************************
        control: "container",
        extraClasses: ["modal-body", "vitals-writeback"],
        items: [{
            control: "container",
            extraClasses: ["container-fluid"],
            items: [rowSubheader, bloodPressureSection, temperatureSection, pulseSection,
                respirationSection, pulseOximetrySection, heightSection,
                weightSection, painSection, circumferenceSection
            ]
        }]

    }, { //*************************** Modal Footer START ***************************
        control: "container",
        extraClasses: ["modal-footer"],
        items: [{
            control: "container",
            extraClasses: ["row"],
            items: [{
                control: "container",
                extraClasses: ["col-xs-6"],
                template: Handlebars.compile('{{#if savedTime}}<p><span id="vitals-saved-at">Saved at: {{savedTime}}</span></p>{{/if}}'),
                modelListeners: ["savedTime"]
            }, {
                control: "container",
                extraClasses: ['col-xs-12','display-flex','valign-bottom'],
                items: [
                {
                    control: 'popover',
                    behaviors: {
                        Confirmation: {
                            title: 'Warning',
                            eventToTrigger: 'vitals-confirm-cancel'
                        }
                    },
                    label: 'Cancel',
                    name: 'vitalsConfirmCancel',
                    extraClasses: ['btn-default', 'btn-sm','right-margin-xs']
                },
                {
                    control: "button",
                    extraClasses: ["btn-primary", "btn-sm", "left-margin-xs"],
                    label: "Accept",
                    type: "button",
                    name: "form-add-btn",
                    title: "Press enter to accept"
                }]
            }]
        }]
    }];

    var FormModel = Backbone.Model.extend({
        defaults: function(){
            return {
                'time-taken': moment().format('HH:mm'),
                dateTakenInput: moment().format('MM/DD/YYYY'),
                errorModel: new Backbone.Model()
            };
        },
        validate: function(attributes, options) {
            return validationUtils.validateModel(this);
        }
    });

    var saveAlertView = new ADK.UI.Notification({
        title: 'Success',
        type: 'success',
        message: 'Vitals Submitted'
    });
    var OpDataErrorMessageView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('We\'re sorry. {{message}}'),
        templateHelpers: function() {
            var self = this;
            return {
                'message': function() {
                    return self.msg;
                }
            };
        },
        msg: 'There was an error submitting your form.',
        tagName: 'p'
    });

    var ErrorMessageView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('Unable to save your data at this time due to a system error. Try again later.'),
        tagName: 'p'
    });

    var WarningFooterView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('{{ui-button "Cancel" classes="btn-default btn-sm" title="Press enter to go back."}}{{ui-button "Submit" classes="btn-primary btn-sm" title="Press enter to submit."}}'),
        events: {
            'click .btn-primary': function() {
                var self = this;
                ADK.UI.Alert.hide();
                writebackUtils.addVitals(this.form.model, this.form.isPassSelected(), this.form.model.get('vitalsIENMap'), function() {
                        saveAlertView.show();
                        self.form.workflow.close();
                        ADK.ResourceService.clearAllCache('vital');
                        var vitalsChannel = ADK.Messaging.getChannel('vitals');
                        vitalsChannel.trigger('refreshGridView');
                    },
                    function() {
                        var errorAlertView = new ADK.UI.Alert({
                            title: 'Error',
                            icon: 'icon-circle-exclamation',
                            messageView: ErrorMessageView,
                            footerView: ErrorFooterView.extend({
                                form: self.form
                            })
                        });
                        errorAlertView.show();
                    });
            },
            'click .btn-default': function() {
                this.form.$(this.form.ui.submitButton.selector).trigger('control:disabled', false);
                ADK.UI.Alert.hide();
            }
        },
        tagName: 'span'
    });

    var toggleBooleanExpandCollapse, toggleBooleanPassBtn;

    var formView = ADK.UI.Form.extend({
        initialize: function() {
            this._super = ADK.UI.Form.prototype;
            this.model = new FormModel();
            this._super.initialize.apply(this, arguments);
            toggleBooleanExpandCollapse = false;
            toggleBooleanPassBtn = true;
        },
        ui: {
            'submitButton': '.form-add-btn',
            "bpInput": ".bpInput",
            "tempLocation": ".temperature-location-po",
            "heightQuality": ".height-quality-po",
            "bpFields": ".bp-location-po, .bp-method-po, .bp-cuff-size-po, .bp-position-po",
            "pulseFields": ".pulse-location-po, .pulse-method-po, .pulse-position-po, .pulse-site-po",
            "respirationFields": ".respiration-method-po, .respiration-position-po",
            "poFields": ".suppO2InputValue, .po-method-po",
            "weightFields": ".weight-quality-po, .weight-method-po",
            "cgFields": ".cg-site-po, .cg-location-po",
            "ExpandCollapseAllButton": ".expandCollapseAll button",
            "ExpandCollapseAllControl": ".expandCollapseAll",
            "PassButton": ".button-control.facility-name-pass-po",
            "AllCollapsibleContainers": ".bpSection, .temperatureSection, .pulseSection, .respirationSection, .poSection, .heightSection, .weightSection, .cgSection",
            // used for mapping selectors to model attributes (should be same as `name` attr)
            'dateTakenInput': '.dateTakenInput input.flexible-input',
            'bpInputValue': '.bpInputValue input',
            'temperatureInputValue': '.temperatureInputValue input[type="text"]',
            'pulseInputValue': '.pulseInputValue input',
            'respirationInputValue': '.respirationInputValue input',
            'O2InputValue': '.O2InputValue input',
            'suppO2InputValue': '.suppO2InputValue input',
            'heightInputValue': '.heightInputValue input[type="text"]',
            'weightInputValue': '.weightInputValue input[type="text"]',
            'circumValue': 'circumValue input[type="text"]',
            'pain-value-po': '.pain-value-po input'
        },
        fields: F423Fields,
        getNextVitalInput: function(current) {
            var inputs = this.$('.vitalInput input:not(:radio)');
            var currentIndex = _.lastIndexOf(inputs, current);
            return inputs[currentIndex + 1];
        },
        isPassSelected: function() {
            return this.$(this.ui.PassButton.selector).hasClass('active');
        },
        allFields: ["bpInputValue", "bp-radio-po", "bp-location-po", "bp-method-po", "bp-cuff-size-po", "bp-position-po",
            "pulse-method-po", "pulse-position-po", "pulse-site-po", "pulse-location-po", "pulseInputValue", "pulse-radio-po",
            "respirationInputValue", "respiration-radio-po", "respiration-method-po", "respiration-position-po",
            "temperatureInputValue", "temperature-radio-po", "temperature-location-po",
            "O2InputValue", "po-radio-po", "suppO2InputValue", "po-method-po",
            "heightInputValue", "height-radio-po", "height-quality-po",
            "weightInputValue", "weight-radio-po", "weight-method-po", "weight-quality-po",
            "pain-value-po", "pain-checkbox-po", "pain-radio-po",
            "circumValue", "cg-radio-po", "cg-site-po", "cg-location-po"
        ],
        onRender: function() {
            this.listenToOnce(this.model, 'change.inputted', this.registerChecks);
            writebackUtils.retrievePickLists(this, function() {}, function() {
                var errorAlertView = new ADK.UI.Alert({
                    title: 'Error',
                    icon: 'icon-circle-exclamation',
                    messageView: OpDataErrorMessageView.extend({
                        msg: 'Failed to load picklist data.'
                    }),
                    footerView: ErrorFooterView
                });
                errorAlertView.show();
            });
        },
        registerChecks: function() {
            var checkOptions = {
                id: 'vitals-writeback-in-progress',
                label: 'Vital',
                failureMessage: 'Vitals Writeback Workflow In Progress! Any unsaved changes will be lost if you continue.',
                onContinue: _.bind(function() {
                    this.workflow.close();
                }, this)
            };
            ADK.Checks.register([new ADK.Navigation.PatientContextCheck(checkOptions),
                new ADK.Checks.predefined.VisitContextCheck(checkOptions)]);
        },
        onDestroy: function() {
            writebackUtils.unregisterChecks();
        },
        events: {
            'blur @ui.dateTakenInput': function() {
                this.validateFormField('dateTakenInput', validationUtils.validateMeasuredDateAndTime);
            },
            'blur @ui.bpInputValue': function() {
                this.validateFormField('bpInputValue', validationUtils.validateBPFields);
            },
            'blur @ui.temperatureInputValue': function() {
                this.validateFormField('temperatureInputValue', validationUtils.validateTemperatureFields);
            },
            'blur @ui.pulseInputValue': function() {
                this.validateFormField('pulseInputValue', validationUtils.validatePulseFields);
            },
            'blur @ui.respirationInputValue': function() {
                this.validateFormField('respirationInputValue', validationUtils.validateRespirationFields);
            },
            'blur @ui.O2InputValue': function() {
                this.validateFormField('O2InputValue', validationUtils.validateO2Fields);
            },
            'blur @ui.suppO2InputValue': function() {
                this.validateFormField('suppO2InputValue', validationUtils.validateSuppO2Fields);
            },
            'blur @ui.heightInputValue': function() {
                this.validateFormField('heightInputValue', validationUtils.validateHeightFields);
            },
            'blur @ui.weightInputValue': function() {
                this.validateFormField('weightInputValue', validationUtils.validateWeightFields);
            },
            'blur @ui.circumValue': function() {
                this.validateFormField('circumValue', validationUtils.validateCircumferenceFields);
            },
            'blur .pain-value-po input': function() { // not using @ui cuz of dash separated name
                this.validateFormField('pain-value-po', validationUtils.validatePainFields);
            },
            'input @ui.bpInputValue': function(e) {
                this.inputDisableHandler(e.target.value, 'bloodPressure');
            },
            'input @ui.temperatureInputValue': function(e) {
                this.inputDisableHandler(e.target.value, 'temperature');
            },
            'input @ui.pulseInputValue': function(e) {
                this.inputDisableHandler(e.target.value, 'pulse');
            },
            'input @ui.respirationInputValue': function(e) {
                this.inputDisableHandler(e.target.value, 'respiration');
            },
            'input @ui.O2InputValue': function(e) {
                this.inputDisableHandler(e.target.value, 'pulseOximetry');
            },
            'input @ui.heightInputValue': function(e) {
                this.inputDisableHandler(e.target.value, 'height');
            },
            'input @ui.weightInputValue': function(e) {
                this.inputDisableHandler(e.target.value, 'weight');
            },
            'input .pain-value-po input': function(e) { // not using @ui cuz of dash separated name
                var val = e.target.value;

                if (val) {
                    this.model.unset('pain-radio-po');
                    $('.pain-radio-po').trigger("control:disabled", true);
                    this.model.unset('pain-checkbox-po');
                } else {
                    if (!this.model.get('pain-checkbox-po')) {
                        $('.pain-radio-po').trigger("control:disabled", false);
                    }
                }
            },
            'input @ui.circumValue': function(e) {
                this.inputDisableHandler(e.target.value, 'circumferenceGirth');
            },
            'click @ui.PassButton': function(e) {
                e.preventDefault();
                this.ui.PassButton.toggleClass('active');

                var fieldsToUnset = _.transform(this.allFields, function(existingFields, field) {
                    if (this.model.get(field)) existingFields[field] = null;
                    if (($('.' + field + ':disabled').length < 1)) {
                        $('.' + field).trigger("control:disabled", toggleBooleanPassBtn);
                    }
                }, {}, this);
                
                if (_.size(fieldsToUnset) > 0) {
                    this.model.set(fieldsToUnset, {unset: true});
                } else {
                    this.checkSubmitButtonState();
                }
                
                toggleBooleanPassBtn = !toggleBooleanPassBtn;

                if (this.ui.PassButton.hasClass('active')) {
                    this.ui.PassButton.trigger('control:label', 'Enable').trigger('control:title', 'Press enter to enable all vitals');
                } else {
                    this.ui.PassButton.trigger('control:label', 'Pass').trigger('control:title', 'Press enter to pass all vitals');
                }
                this.ui.PassButton.find('button').focus();

                this.registerChecks();
            },
            "keyup .vitalInput:not(:last) input:not(:radio):focus": function(e) {
                if (e.which == 13) {
                    if (this.getNextVitalInput(e.currentTarget)) {
                        this.getNextVitalInput(e.currentTarget).focus();
                    }
                }
            },
            'keyup .vitalInput:last input:not(:radio):focus': function(e) {
                if (e.which == 13) {
                    $(this.ui.submitButton).focus();
                }
            },
            "click @ui.ExpandCollapseAllButton": function(e) {
                e.preventDefault();
                this.ui.AllCollapsibleContainers.trigger("control:collapsed", toggleBooleanExpandCollapse);

                if (toggleBooleanExpandCollapse) {
                    this.ui.ExpandCollapseAllControl.trigger("control:label", 'Expand All').trigger("control:title", 'Press enter to expand all vitals');
                } else {
                    this.ui.ExpandCollapseAllControl.trigger("control:label", 'Collapse All').trigger("control:title", 'Press enter to collapse all vitals');
                }
                this.ui.ExpandCollapseAllControl.find('button').focus();
                toggleBooleanExpandCollapse = !toggleBooleanExpandCollapse;
            },
            'vitals-confirm-cancel':function(e){
                writebackUtils.unregisterChecks();
                this.workflow.close();
            },
            "click @ui.submitButton": function(e) {
                var self = this;
                e.preventDefault();

                if (!this.model.isValid()){
                    this.model.set("formStatus", {
                        status: "error",
                        message: self.model.validationError
                    });
                    this.transferFocusToFirstError();
                }
                else {
                    this.model.unset("formStatus");
                    this.$(this.ui.submitButton.selector).trigger('control:disabled', true);
                    validationUtils.validateHistorical(this.model, function(showRulesMessage, warningMessagesHTML) {
                        if (showRulesMessage) {
                            var WarningMessageView = Backbone.Marionette.ItemView.extend({
                                template: Handlebars.compile(warningMessagesHTML),
                                tagName: 'p'
                            });
                            var warningView = new ADK.UI.Alert({
                                title: 'Warning',
                                icon: 'icon-triangle-exclamation',
                                messageView: WarningMessageView,
                                footerView: WarningFooterView.extend({
                                    form: self
                                })
                            });
                            warningView.show();
                        } else {
                            self.$el.trigger('tray.loaderShow',{
                                loadingString:'Accepting'
                            });
                            writebackUtils.addVitals(self.model, self.isPassSelected(), self.model.get('vitalsIENMap'), function() {
                                    self.$el.trigger('tray.loaderHide');
                                    saveAlertView.show();
                                    writebackUtils.unregisterChecks();
                                    self.workflow.close();

                                    ADK.ResourceService.clearAllCache('vital');
                                    var vitalsChannel = ADK.Messaging.getChannel('vitals');
                                    vitalsChannel.trigger('refreshGridView');
                                },
                                function() {
                                    self.$el.trigger('tray.loaderHide');
                                    var errorAlertView = new ADK.UI.Alert({
                                        title: 'Error',
                                        icon: 'icon-circle-exclamation',
                                        messageView: ErrorMessageView,
                                        footerView: ErrorFooterView.extend({
                                            form: self
                                        })
                                    });
                                    errorAlertView.show();
                                });
                        }

                    });
                }

                return false;
            }
        },
        vitalsMapping: {
            bloodPressure: {
                radio: "bp-radio-po",
                fields: "bpFields",
                qualifierModelFields: ['bp-location-po', 'bp-method-po', 'bp-cuff-size-po', 'bp-position-po']
            },
            temperature: {
                radio: "temperature-radio-po",
                fields: "tempLocation",
                qualifierModelFields: ['temperature-location-po']
            },
            pulse: {
                radio: "pulse-radio-po",
                fields: "pulseFields",
                qualifierModelFields: ['pulse-location-po', 'pulse-method-po', 'pulse-position-po', 'pulse-site-po']
            },
            respiration: {
                radio: "respiration-radio-po",
                fields: "respirationFields",
                qualifierModelFields: ['respiration-method-po', 'respiration-position-po']
            },
            pulseOximetry: {
                radio: "po-radio-po",
                fields: "poFields",
                qualifierModelFields: ['suppO2InputValue', 'po-method-po']
            },
            height: {
                radio: "height-radio-po",
                fields: "heightQuality",
                qualifierModelFields: ['height-quality-po']
            },
            weight: {
                radio: "weight-radio-po",
                fields: "weightFields",
                qualifierModelFields: ['weight-quality-po', 'weight-method-po']
            },
            circumferenceGirth: {
                input: "cg-value-po",
                radio: "cg-radio-po",
                fields: "cgFields",
                qualifierModelFields: ['cg-site-po', 'cg-location-po']
            }
        },
        inputDisableHandler: function(val, vitalName) {
            var self = this;
            if (val) {
                this.ui[this.vitalsMapping[vitalName].fields].trigger("control:disabled", false);
                this.model.unset(this.vitalsMapping[vitalName].radio);
                $('.' + this.vitalsMapping[vitalName].radio).trigger("control:disabled", true);
            } else {
                $('.' + this.vitalsMapping[vitalName].radio).trigger("control:disabled", false);
                this.ui[this.vitalsMapping[vitalName].fields].trigger("control:disabled", true);
            }
        },
        radioDisableHandler: function(vitalName) {
            var self = this;
            var val = this.model.get(this.vitalsMapping[vitalName].radio);

            if (val) {
                this.ui[this.vitalsMapping[vitalName].fields].trigger("control:disabled", true);
                _.each(this.vitalsMapping[vitalName].qualifierModelFields, function(property) {
                    self.model.unset(property);
                });
            }
        },
        modelEvents: {
            'change:dateTakenInput': function() {
                this.validateFormField('dateTakenInput', validationUtils.validateMeasuredDateAndTime);
            },
            'change:temperatureInputValue': function() {
                this.validateFormField('temperatureInputValue', validationUtils.validateTemperatureFields);
            },
            'change:heightInputValue': function() {
                this.validateFormField('heightInputValue', validationUtils.validateHeightFields);
            },
            'change:weightInputValue': function() {
                this.validateFormField('weightInputValue', validationUtils.validateWeightFields);
            },
            'change:circumValue': function() {
                this.validateFormField('circumValue', validationUtils.validateCircumferenceFields);
            },
            'change:bp-radio-po': function() {
                this.radioDisableHandler("bloodPressure");
            },
            'change:temperature-radio-po': function() {
                this.radioDisableHandler("temperature");
            },
            'change:pulse-radio-po': function() {
                this.radioDisableHandler("pulse");
            },
            'change:respiration-radio-po': function() {
                this.radioDisableHandler("respiration");
            },
            'change:po-radio-po': function() {
                this.radioDisableHandler("pulseOximetry");
            },
            'change:height-radio-po': function() {
                this.radioDisableHandler("height");
            },
            'change:weight-radio-po': function() {
                this.radioDisableHandler("weight");
            },
            'change:pain-checkbox-po': function() {
                var val = this.model.get('pain-checkbox-po');

                if (val) {
                    this.model.unset('pain-radio-po');
                    $('.pain-radio-po').trigger("control:disabled", true);
                    this.model.unset('pain-value-po');
                } else {
                    if (!this.model.get('pain-value-po')) {
                        $('.pain-radio-po').trigger("control:disabled", false);
                    }
                }
                this.model.errorModel.unset('pain-value-po');
            },
            'change:pain-radio-po': function() {
                var val = this.model.get('pain-radio-po');

                if (val) {
                    $('.pain-radio-po').trigger("control:disabled", false);
                    this.model.unset('pain-value-po');
                    this.model.unset('pain-checkbox-po');
                }
            },
            'change:cg-radio-po': function() {
                this.radioDisableHandler("circumferenceGirth");
            },
            change: function() {
                _.defer(_.bind(this.checkSubmitButtonState, this));
            }
        },
        checkSubmitButtonState: function() {
            var isButtonDisabled = validationUtils.areAllDataFieldsEmpty(this.model, this.isPassSelected()) || !this.model.errorModel.isEmpty();
            this.ui.submitButton.trigger('control:disabled', isButtonDisabled);
        },
        validateFormField: function(formField, validationFunction) {
            validationFunction(this.model, this.model.get(formField));

            if (this.model.errorModel.get(formField)) {
                window.requestAnimationFrame(_.bind(function() {
                    this.$(this.ui[formField].selector).focus();
                }, this));
            }
        }
    });

    return formView;
});