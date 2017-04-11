define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'hbs!demo_files/feature_forms/supporting_templates/F432_summaryTemplate'
], function(Backbone, Marionette, $, Handlebars, SummaryTemplate) {

    var F432 = {
        createForm: function() {
            var alertMessageContainer = {
                control: "container",
                extraClasses: ["row"],
                items: [{
                    control: "alertBanner",
                    name: "alertMessage",
                    extraClasses: ["col-xs-12"],
                    dismissible: true
                }]
            };

            var firstSection = {
                control: "container",
                extraClasses: ["row"],
                items: [{
                    control: "typeahead",
                    name: "availableLabTests",
                    extraClasses: ["col-xs-12"],
                    label: "Lab Test",
                    required: true,
                    pickList: [{
                        label: "Option 1",
                        value: "opt1"
                    }, {
                        label: "Option 2 - this shows alert banner and radio buttons",
                        value: "opt2"
                    }, {
                        label: "Option 3 - this shows additional text input",
                        value: "opt3"
                    }, {
                        label: "Option 4 - this shows additional date field",
                        value: "opt4"
                    }, {
                        label: "Option 5",
                        value: "opt5"
                    }]
                }, {
                    control: "select",
                    name: "urgency",
                    label: "Urgency",
                    extraClasses: ["col-xs-3"],
                    title: "Use up and down arrow keys to view options and press enter to select",
                    pickList: [{
                        label: "ASAP",
                        value: "opt1"
                    }, {
                        label: "PRE-OP",
                        value: "opt2"
                    }, {
                        label: "Call Result",
                        value: "opt3"
                    }]
                }, {
                    control: "select",
                    title: "Use up and down arrow keys to view options and press enter to select",
                    name: "collectionDateTime",
                    label: "Collection Date/Time",
                    extraClasses: ["col-xs-6"],
                    pickList: [{
                        label: "Next scheduled lab collection",
                        value: "opt1"
                    }, {
                        label: "AM Collection: 09:30 (Tomorrow)",
                        value: "opt2"
                    }, {
                        label: "Future",
                        value: "future"
                    }, {
                        label: "Immediate",
                        value: "immediate"
                    }]
                }, {
                    control: "datepicker",
                    name: "collectionDate",
                    label: "Collection Date",
                    extraClasses: ["col-xs-4"],
                    hidden: true
                }, {
                    control: "timepicker",
                    name: "collectionTime",
                    label: "Collection Input",
                    extraClasses: ["col-xs-4"],
                    hidden: true
                }]
            };

            var restOfBodyContainer = {
                control: "container",
                extraClasses: ["row"],
                items: [{
                    control: "select",
                    name: "howOften",
                    label: "How Often?",
                    title: "Use up and down arrow keys to view options and press enter to select",
                    extraClasses: ["col-xs-3"],
                    pickList: [{
                        label: "Option 1",
                        value: "opt1"
                    }, {
                        label: "Hourly",
                        value: "opt2"
                    }, {
                        label: "Option 3",
                        value: "opt3"
                    }]
                }, {
                    control: "select",
                    name: "howLong",
                    label: "How Long?",
                    title: "Use up and down arrow keys to view options and press enter to select",
                    disabled: true,
                    extraClasses: ["col-xs-3"],
                    pickList: [{
                        label: "Option 1",
                        value: "opt1"
                    }, {
                        label: "Option 2",
                        value: "opt2"
                    }, {
                        label: "Option 3",
                        value: "opt3"
                    }]
                }, {
                    control: "select",
                    name: "collectionSample",
                    label: "Collection Sample",
                    title: "Use up and down arrow keys to view options and press enter to select",
                    extraClasses: ["col-xs-6"],
                    pickList: [{
                        label: "Option 1",
                        value: "opt1"
                    }, {
                        label: "Option 2",
                        value: "opt2"
                    }, {
                        label: "Option 3",
                        value: "opt3"
                    }]
                }, {
                    control: "select",
                    name: "collectionType",
                    label: "Collection Type",
                    title: "Use up and down arrow keys to view options and press enter to select",
                    extraClasses: ["col-xs-6"],
                    pickList: [{
                        label: "Option 1",
                        value: "opt1"
                    }, {
                        label: "Option 2",
                        value: "opt2"
                    }, {
                        label: "Option 3",
                        value: "opt3"
                    }]
                }, {
                    control: "select",
                    name: "specimen",
                    label: "Specimen",
                    title: "Use up and down arrow keys to view options and press enter to select",
                    extraClasses: ["col-xs-6"],
                    pickList: [{
                        label: "Option 1",
                        value: "opt1"
                    }, {
                        label: "Option 2",
                        value: "opt2"
                    }, {
                        label: "Option 3",
                        value: "opt3"
                    }]
                }, {
                    control: "input",
                    name: "anticoagulant",
                    label: "What Kind of anticoagulant is the patient on?",
                    title: "Please enter in text",
                    extraClasses: ["col-xs-6"],
                    hidden: true
                }, {
                    control: "radio",
                    name: "sampleDrawnAt",
                    label: "Sample Drawn At",
                    extraClasses: ["col-xs-6"],
                    hidden: true,
                    options: [{
                        label: "Peak",
                        value: "peak",
                    }, {
                        label: "Trough",
                        value: "trough"
                    }, {
                        label: "Mid",
                        value: "mid"
                    }, {
                        label: "Unknown",
                        value: "unknown"
                    }]
                }, {
                    control: "datepicker",
                    name: "doneDate",
                    label: "Enter last done date:",
                    extraClasses: ["col-xs-6"],
                    hidden: true
                }, {
                    control: "timepicker",
                    name: "drawTime",
                    placeholder: "HH:MM",
                    label: "Enter draw time:",
                    options: {
                        defaultTime: false
                    },
                    extraClasses: ["col-xs-6"],
                    hidden: true
                }, {
                    control: "textarea",
                    name: "additionalComments",
                    label: "Additional Comments",
                    title: "Please enter in additional comments",
                    rows: 3,
                    extraClasses: ["col-xs-12"],
                    hidden: true
                }, {
                    control: "typeahead",
                    name: "herpesSimplexCommonA",
                    label: "Herpes Simplex Common A",
                    extraClasses: ["col-xs-12"],
                    hidden: true,
                    pickList: [{
                        label: "Option 1",
                        value: "opt1"
                    }, {
                        label: "Option 2",
                        value: "opt2"
                    }, {
                        label: "Option 3",
                        value: "opt3"
                    }]
                }, {
                    control: "fieldset",
                    legend: "Immediate Collection Times",
                    extraClasses: ["col-xs-12", "immediateCollectionContainer"],
                    hidden: true,
                    items: [{
                        control: "container",
                        extraClasses: ["well"],
                        template: Handlebars.compile([
                            '<div class="row"><div class="col-xs-12">',
                            '<p>No Collection on Holidays</p>',
                            '<p> MON - FRI: Collection between 06:00 and 23:00</p>',
                            '<p>Laboratory Service requires at least 5 minutes to collect this order.</p>',
                            '</div></div>'
                        ].join("\n")),
                        items: [{
                            control: "container",
                            extraClasses: ["row"],
                            items: [{
                                control: "container",
                                extraClasses: ["col-xs-6"],
                                items: [{
                                    control: "datepicker",
                                    label: "Date Taken",
                                    title: "Please enter in date",
                                    name: "immediateCollectionDate"
                                }]
                            }, {
                                control: "container",
                                extraClasses: ["col-xs-6"],
                                items: [{
                                    control: "timepicker",
                                    label: "Time Taken",
                                    title: "Please enter in time",
                                    name: "immediateCollectionTime",
                                    options: {
                                        defaultTime: false
                                    }
                                }]
                            }]
                        }]
                    }]

                }]
            };

            var orderPreviewContainer = {
                control: "container",
                extraClasses: ["row", "text-left"],
                items: [{
                    control: "container",
                    template: SummaryTemplate,
                    modelListeners: ["availableLabTests", "urgency", "collectionDateTime",
                        "collectionSample", "collectionType", "specimen", "howOften", "howLong",
                        "sampleDrawnAt", "additionalComments", "anticoagulant", "doneDate",
                        "drawTime", "herpesSimplexCommonA", "immediateCollectionDate", "immediateCollectionTime"
                    ],
                    extraClasses: ["order-preview", "col-xs-12"]
                }]
            };

            var orderNoteObjectPreviewContainer = {
                control: "container",
                extraClasses: ["row", "text-left", "note-object-container"],
                hidden: true,
                items: [{
                    control: "spacer"
                }, {
                    control: "container",
                    template: Handlebars.compile('<label for="notesObjectString">Add to Note</label><p class="bottom-margin-md" id="notesObjectString">{{noteObjectString}}</p>'),
                    modelListeners: ["noteObjectString"],
                    extraClasses: ["order-preview", "col-xs-12"]
                }, {
                    control: "select",
                    name: "noteObjectActivity",
                    label: "Select an Activity",
                    title: "Use up and down arrow keys to view options and press enter to select",
                    extraClasses: ["col-xs-6"],
                    required: true,
                    pickList: [{
                        label: "None",
                        value: "none"
                    }, {
                        label: "FIT/FOBT Colorectal Cancer Screening Activity",
                        value: "FIT/FOBT Colorectal Cancer Screening Activity"
                    }]
                }]
            };

            var spacer = {
                control: "spacer"
            };
            var F432Fields = [
                // **************************************** Modal Body Start ******************************************
                {
                    control: "container",
                    extraClasses: ["modal-body"],
                    items: [{
                        control: "container",
                        extraClasses: ["container-fluid"],
                        items: [alertMessageContainer, firstSection, spacer, restOfBodyContainer]
                    }]
                }, { // **************************************** Modal Footer Start ******************************************
                    control: "container",
                    extraClasses: ["modal-footer"],
                    items: [orderPreviewContainer, orderNoteObjectPreviewContainer, {
                        control: "container",
                        extraClasses: ["row"],
                        items: [spacer]
                    }, {
                        control: "container",
                        extraClasses: ["row"],
                        items: [{
                            control: "container",
                            extraClasses: ["col-xs-3"]
                        }, {
                            control: "container",
                            extraClasses: ["col-xs-9"],
                            items: [{
                                control: "button",
                                id: "form-close-btn",
                                extraClasses: ["btn-default", "btn-sm"],
                                label: "Cancel",
                                type: "button",
                                name: "cancel",
                                title: "Press enter to close"
                            }, {
                                control: "dropdown",
                                split: true,
                                label: "Accept",
                                id: "dropdown-accept",
                                title: "Press enter to accept",
                                type: "submit",
                                items: [{
                                    label: "Accept",
                                    id: "add"
                                }, {
                                    label: "Accept & Add Another",
                                    id: "add-create-another"
                                }, {
                                    label: "Accept & Sign",
                                    id: "sign"
                                }]
                            }]
                        }]
                    }]
                }
            ];

            var DeleteMessageView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile('You will lose all work in progress if you delete this lab order. Would you like to proceed?'),
                tagName: 'p'
            });
            var CloseMessageView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile('You will lose all work in progress if you close this lab order. Would you like to proceed?'),
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

            var FormModel = Backbone.Model.extend({
                defaults: {
                    additionalComments: '',
                    alertMessage: '',
                    anticoagulant: '',
                    availableLabTests: '',
                    collectionDateTime: '',
                    collectionSample: '',
                    collectionType: '',
                    doneDate: '',
                    drawTime: '',
                    herpesSimplexCommonA: '',
                    howLong: '',
                    howOften: '',
                    sampleDrawnAt: '',
                    specimen: '',
                    theoSection: '',
                    urgency: '',
                    noteObjectString: ''
                }
            });

            var formView = ADK.UI.Form.extend({
                ui: {
                    "acceptBtn": ".acceptBtn",
                    "howLong": ".howLong",
                    "anticoagulant": ".anticoagulant",
                    "sampleDrawnAt": ".sampleDrawnAt",
                    "additionalComments": ".additionalComments",
                    "doneDate": ".doneDate",
                    "doneTime": ".doneTime",
                    "herpes": ".herpes",
                    "herpesSimplexCommonA": ".herpesSimplexCommonA",
                    "immediateCollectionContainer": ".immediateCollectionContainer",
                    "immediateCollectionDate": ".immediateCollectionDate",
                    "immediateCollectionTime": ".immediateCollectionTime",
                    "acceptSubmit": "#dropdown-accept",
                    "noteObjectContainer": ".note-object-container",
                    "noteObjectActivity": '.noteObjectActivity'
                },
                fields: F432Fields,
                events: {
                    "click #form-delete-btn": function(e) {
                        e.preventDefault();
                        var deleteAlertView = new ADK.UI.Alert({
                            title: 'Are you sure you want to delete?',
                            icon: 'icon-delete',
                            messageView: DeleteMessageView,
                            footerView: FooterView
                        });
                        deleteAlertView.show();
                    },
                    "click #form-close-btn": function(e) {
                        e.preventDefault();
                        var closeAlertView = new ADK.UI.Alert({
                            title: 'Are you sure you want to close this form?',
                            icon: 'icon-warning',
                            messageView: CloseMessageView,
                            footerView: FooterView
                        });
                        closeAlertView.show();
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
                                title: 'Lab Order Submitted',
                                icon: 'fa-check',
                                message: 'Lab order successfully submitted with no errors.',
                                type: "success"
                            });
                            saveAlertView.show();
                            if(this.ui.acceptSubmit.html() === "Accept") {
                                ADK.UI.Workflow.hide();
                            } else if(this.ui.acceptSubmit.html() === "Accept &amp; Sign") {
                                ADK.UI.Workflow.hide();
                                //add code to show the Sign modal
                            } else {
                                //clear all fields to add another
                                this.resetAll();
                            }
                        }
                        return false;
                    },
                     "click .dropdown-menu a": function(e) {
                        var dropdownBtnText = $(e.target).html();
                        if(dropdownBtnText !== this.ui.acceptSubmit.html()) {
                            this.ui.acceptSubmit.html(dropdownBtnText);
                        }
                    }
                },
                resetAll: function() {
                    this.model.unset("alertMessage");
                    this.model.unset("availableLabTests");
                    this.model.unset("urgency");
                    this.model.unset("collectionDateTime");
                    this.model.unset("collectionDate");
                    this.model.unset("collectionTime");
                    this.model.unset("howOften");
                    this.model.unset("howLong");
                    this.model.unset("collectionSample");
                    this.model.unset("collectionType");
                    this.model.unset("specimen");
                    this.model.unset("anticoagulant");
                    this.model.unset("sampleDrawnAt");
                    this.model.unset("doneDate");
                    this.model.unset("drawTime");
                    this.model.unset("additionalComments");
                    this.model.unset("herpesSimplexCommonA");
                    this.model.unset("immediateCollectionDate");
                    this.model.unset("immediateCollectionTime");
                },
                hideAll: function() {
                    this.$(this.ui.anticoagulant).addClass('hidden');
                    this.$(this.ui.sampleDrawnAt).addClass('hidden');
                    this.$(this.ui.additionalComments).addClass('hidden');
                    this.$(this.ui.doneDate).addClass('hidden');
                    this.$(this.ui.doneTime).addClass('hidden');
                    this.$(this.ui.herpes).addClass('hidden');
                },
                modelEvents: {
                    'change:howOften': function(model) {
                        var howOften = model.get('howOften');
                        if (howOften == "opt2") {
                            this.$(this.ui.howLong).find('select').attr('disabled', false);
                        } else {
                            this.$(this.ui.howLong).find('select').attr('disabled', true);
                        }
                    },
                    'change:availableLabTests': function(model) {
                        var method = model.get('availableLabTests');

                        this.hideAll();
                        this.model.unset('alertMessage');

                        if (method === "opt2") {
                            this.$(this.ui.sampleDrawnAt).removeClass('hidden');
                            this.$(this.ui.additionalComments).removeClass('hidden');
                            this.model.set('alertMessage', 'Please note if specimen is Random, Trough or Peak, label both the tube and the order slip');
                        } else if (method === "opt3") {
                            this.$(this.ui.anticoagulant).removeClass('hidden');
                        } else if (method === "opt4") {
                            this.$(this.ui.doneDate).removeClass('hidden');
                            this.$(this.ui.doneTime).removeClass('hidden');
                        } else if (method === "opt5") {
                            this.$(this.ui.herpes).removeClass('hidden');
                        }

                        if (method) {
                            this.ui.acceptBtn.find('button').attr('disabled', false).removeClass('disabled');
                            this.ui.noteObjectContainer.trigger('control:hidden', false);
                            this.ui.noteObjectActivity.trigger('control:required', true);
                        } else {
                            this.ui.acceptBtn.find('button').attr('disabled', true).addClass('disabled');
                            this.ui.noteObjectContainer.trigger('control:hidden', true);
                            this.ui.noteObjectActivity.trigger('control:required', false);
                        }
                        this.saveNoteObject();
                    },
                    'change:collectionDateTime': function(model) {
                        var method = model.get('collectionDateTime');
                        if (method === "immediate") {
                            this.$(this.ui.immediateCollectionContainer).removeClass('hidden');
                        } else {
                            this.$(this.ui.immediateCollectionContainer).addClass('hidden');
                        }
                    },
                    'change:urgency' : 'saveNoteObject',
                    'change:collectionSample': 'saveNoteObject'
                },
                saveNoteObject: function(){
                    var string = '',
                        model = !_.isUndefined(this.model.get('_labelsForSelectedValues')) ? _.defaults(this.model.get('_labelsForSelectedValues').toJSON(), this.model.toJSON()) : this.model.toJSON();
                    if(model.availableLabTests){
                        string = 'Ordered a'+(model.urgency ? ' '+ model.urgency : '')+(model.collectionSample ? ' '+ model.collectionSample : '')+' collection sample for a '+ model.availableLabTests +' test.';
                    }
                    this.model.set('noteObjectString', string);
                }
            });

            var formModel = new FormModel();

            var workflowOptions = {
                title: "Order a Lab Test",
                showProgress: false,
                keyboard: true,
                steps: [{
                    view: formView,
                    viewModel: formModel,
                    stepTitle: 'Step 1'
                }]
            };
            var workflow = new ADK.UI.Workflow(workflowOptions);
            workflow.show();
        }
    };
    return F432;
});