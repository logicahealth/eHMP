define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
], function(Backbone, Marionette, $, Handlebars) {

    //=============================================================================================================
    // PLEASE DO NOT COPY AND PASTE THIS FULL FILE. PLEASE JUST USE AS A REFERENCE AND COPY PARTS THAT ARE NEEDED
    // for more information on how to layout this form for your applet please checkout the following link:
    // http://IP_ADDRESS/documentation/#/adk/conventions#Writeback
    //=============================================================================================================

    var F170 = {
        // DO NOT USE CREATE FORM FUNCTION --- THIS IS FOR DEMO PURPOSES ONLY!!!
        createForm: function() {
            // *********************************************** FIELDS ***************************************************
            // Okay to copy and paste
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
                        title: "Press enter to select all vitals",
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

            var vitalsNoteRegion = {
                control: "container",
                extraClasses: "bottom-margin-no",
                tagName: "p",
                template: Handlebars.compile('NOTE: To mark CLIO records as "Enter in Error" use the Flowsheet application.')
            };

            var vitalsRadioCollection = {
                control: "radio",
                label: "Reason",
                name: "eieReason",
                disabled: true,
                required: true,
                extraClasses: ["radio-col-2 all-padding-no"],
                options: [{
                    label: "Incorrect date/time",
                    value: "opt1",
                    title: "Press enter to select and then press the up or down arrows to view options"
                }, {
                    label: "Incorrect patient",
                    value: "opt2",
                    title: "Press enter to select and then press the up or down arrows to view options"
                }, {
                    label: "Incorrect reading",
                    value: "opt3",
                    title: "Press enter to select and then press the up or down arrows to view options"
                }, {
                    label: "Invalid record",
                    value: "opt4",
                    title: "Press enter to select and then press the up or down arrows to view options"
                }]
            };

            var connectionAndDisabilitiesInfo = {
                control: "container",
                extraClasses: ["col-xs-12"],
                modelListeners: ["connectionPercent", "ratedDisabilities"],
                template: Handlebars.compile('<h6>Service Connection &amp; Rated Disabilities</h6><p>Service Connected: {{connectionPercent}}%</p><p>Rated Disabilities: {{ratedDisabilities}}</p>'),
            };

            var F170Fields = [{
                control: "container",
                extraClasses: ["modal-body"],
                items: [{
                    control: "container",
                    extraClasses: ["container-fluid"],
                    items: [{
                        control: "container",
                        extraClasses: "row",
                        items: [vitalsChecklistRegion]
                    }, {
                        control: "container",
                        extraClasses: "row",
                        items: [{
                            control: "container",
                            extraClasses: "col-xs-12",
                            items: [{
                                control: 'spacer'
                            }, vitalsNoteRegion, {
                                control: 'spacer'
                            }]
                        }]
                    }, {
                        control: "container",
                        extraClasses: "row",
                        items: [{
                            control: "container",
                            extraClasses: "col-xs-12",
                            items: [vitalsRadioCollection]
                        }]
                    }]
                }]
            }, {
                control: "container",
                extraClasses: ["modal-footer"],
                items: [{
                    control: "container",
                    extraClasses: ["col-xs-12"],
                    items: [{
                        control: "container",
                        extraClasses: ["row"],
                        items: [{
                            control: "button",
                            extraClasses: ["btn-default btn-sm"],
                            label: "Cancel",
                            name: "cancel",
                            title: "Press enter to cancel.",
                            type: "button"
                        }, {
                            control: "button",
                            extraClasses: ["btn-primary btn-sm"],
                            label: "Entered in error",
                            name: 'enterInError',
                            title: "Press enter to submit."
                        }]
                    }]
                }]
            }];
            // *********************************************** END OF FIELDS ********************************************

            // *********************************************** MODEL ****************************************************
            // Okay to copy and paste - Please Add additional items to prepopulate the fields
            var FormModel = Backbone.Model.extend({
                defaults: {
                    'listOfVitals': new Backbone.Collection([{
                        itemName: 'item1',
                        itemValue: false,
                        itemLabel: 'Blood Pressure',
                        itemEIEValue: '143/73 mmHG',
                        title: 'Press tab to view options for the checkboxes'
                    }, {
                        itemName: 'item2',
                        itemValue: false,
                        itemLabel: 'Temperature',
                        itemEIEValue: '98.7 F (73.1 C)'
                    }, {
                        itemName: 'item3',
                        itemValue: false,
                        itemLabel: 'Pulse',
                        itemEIEValue: '67 /min'
                    }, {
                        itemName: 'item4',
                        itemValue: false,
                        itemLabel: 'Respiration',
                        itemEIEValue: '10 /min'
                    }, {
                        itemName: 'item5',
                        itemValue: false,
                        itemLabel: 'Pulse Oximetry',
                        itemEIEValue: '92 %'
                    }, {
                        itemName: 'item6',
                        itemValue: false,
                        itemLabel: 'Height',
                        itemEIEValue: '68 in (172.72 cm)'
                    }, {
                        itemName: 'item7',
                        itemValue: false,
                        itemLabel: 'Weight',
                        itemEIEValue: '167 Ib (75.91 kg)'
                    }, {
                        itemName: 'item8',
                        itemValue: false,
                        itemLabel: 'Pain',
                        itemEIEValue: '0'
                    }, {
                        itemName: 'item9',
                        itemValue: false,
                        itemLabel: 'Circumference/Girth',
                        itemEIEValue: 'Unavailable'
                    }])
                }
            });
            // *********************************************** END OF MODEL *********************************************

            // *********************************************** VIEWS **********************************************

            var DeleteMessageView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile('You will lose all work in progress if you delete this task. Would you like to proceed?'),
                tagName: 'p'
            });     

            var FooterView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile('{{ui-button "Cancel" id="alert-cancel-btn" classes="btn-default btn-sm" title="Press enter to cancel."}}{{ui-button "Continue" id="alert-continue-btn" classes="btn-primary btn-sm" title="Press enter to Continue!"}}'),
                events: {
                    'click #alert-continue-btn': function() {
                        ADK.UI.Alert.hide();
                        ADK.UI.Workflow.hide();
                    },
                    'click #alert-cancel-btn': function() {
                        ADK.UI.Alert.hide();
                    }
                },
                tagName: 'span'
            });

            var formView = ADK.UI.Form.extend({
                ui: {
                    "checkAllBtn": ".button-control.checkAll button",
                    "checkAllControl": ".button-control.checkAll",
                    "formSignBtn": ".button-control.sign",
                    "formCancelBtn": ".button-control.cancel button",
                    "eieReason": ".eieReason",
                    "vitalsChecklist": ".listOfVitals"
                },
                fields: F170Fields,
                hasBeenClicked: false,
                events: {
                    "click @ui.checkAllBtn": function(e) {
                        e.preventDefault();
                        // conditional to toggle check all button
                        var btnText;
                        var btnTitle;
                        if (!this.hasBeenClicked) {
                            this.hasBeenClicked = !this.hasBeenClicked;
                            btnText = "Deselect All";
                            btnTitle = "Press enter to deselect all vitals.";
                        } else {
                            this.hasBeenClicked = !this.hasBeenClicked;
                            btnText = "Check All";
                            btnTitle = "Press enter to select all vitals.";
                        }

                        this.ui.vitalsChecklist.trigger('control:item:value', {
                            booleanValue: this.hasBeenClicked
                        });
                        this.ui.checkAllControl.trigger('control:label', btnText);
                        this.ui.checkAllControl.trigger('control:title', btnTitle);
                        this.ui.checkAllControl.find('button').focus();
                    },
                    "click @ui.formCancelBtn": function(e) {
                        e.preventDefault();
                        var deleteAlertView = new ADK.UI.Alert({
                            title: 'Are you sure you want to cancel?',
                            icon: 'icon-warning',
                            messageView: DeleteMessageView,
                            footerView: FooterView
                        });
                        deleteAlertView.show();
                    },
                    "submit": function(e) {
                        e.preventDefault();
                        if (!this.model.isValid()) {
                            this.model.set("formStatus", {
                                status: "error",
                                message: self.model.validationError
                            });
                        } else {
                            this.model.unset("formStatus");
                            var saveAlertView = new ADK.UI.Notification({
                                title: 'Vitals entered in error Submitted',
                                icon: 'fa-check',
                                message: 'Vitals entered in error items submitted with no errors.',
                                type: "success"

                            });
                            saveAlertView.show();
                            ADK.UI.Workflow.hide();
                        }
                        return false;
                    }
                },
                modelEvents: {
                    "change:checklistCount": function(model) {
                        if (model.get('checklistCount') === 0) {
                            this.model.unset('eieReason');
                            this.ui.eieReason.trigger('control:disabled', true);
                        } else {
                            this.ui.eieReason.trigger('control:disabled', false);
                        }
                    }
                }
            });
            // *********************************************** END OF FORM VIEW *****************************************

            // *********************************************** MODEL AND WORKFLOW INSTANCE ******************************
            // Okay to copy and paste
            var formModel = new FormModel();

            var workflowOptions = {
                size: "small",
                title: "Vitals - Entered In Error 04/11/2015 - 03:30",
                showProgress: false,
                keyboard: true,
                headerOptions: {},
                steps: [{
                    view: formView,
                    viewModel: formModel
                }]
            };
            var workflow = new ADK.UI.Workflow(workflowOptions);
            workflow.show();
            // *********************************************** END OF MODEL AND WORKFLOW INSTANCE ***********************
        }
    };
    return F170;
});