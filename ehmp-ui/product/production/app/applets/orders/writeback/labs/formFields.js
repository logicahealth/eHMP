define([
    'handlebars',
    'hbs!app/applets/orders/writeback/labs/templates/summaryTemplate',
    'hbs!app/applets/orders/writeback/labs/templates/addToNoteTemplate',
    'app/applets/orders/writeback/labs/formUtils'
], function(Handlebars, SummaryTemplate, AddToNoteTemplate, FormUtils) {
    "use strict";

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

    var errorMessageContainer = {
        control: "container",
        extraClasses: ["row"],
        items: [{
            control: "alertBanner",
            name: "errorMessage",
            title: "Unable To Submit",
            extraClasses: ["col-xs-12"],
            type: "danger",
            dismissible: false
        }]
    };

    var availableLabTestsContainer = {
        control: "container",
        extraClasses: ["row"],
        items: [{
            control: "container",
            extraClasses: ["form-highlight"],
            items: [{
                control: "container",
                extraClasses: ["col-xs-12"],
                items: [{
                    control: "select",
                    name: "availableLabTests",
                    label: "Available Lab Tests",
                    attributeMapping: {
                        label: 'synonym',
                        value: 'ien'
                    },
                    required: true,
                    showFilter: true,
                    pickList: [],
                    options: {
                        minimumInputLength: 0,
                        sorter: FormUtils.getSelectControlSorter
                    }
                }]
            }, {
                control: "container",
                extraClasses: ["col-xs-4"],
                items: [{
                    control: "select",
                    name: "urgency",
                    label: "Urgency",
                    required: true,
                    disabled: true,
                    attributeMapping: {
                        label: 'name',
                        value: 'ien'
                    },
                    options: [],
                    pickList: []
                }]
            }, {
                control: "container",
                extraClasses: ["col-xs-8"],
                items: [{
                    control: "select",
                    name: "collectionDateTimePicklist",
                    hidden: true,
                    label: "Collection Date/Time",
                    attributeMapping: {
                        label: 'name',
                        value: 'code'
                    },
                    options: [],
                    pickList: []
                }]
            }, {
                control: "container",
                items: [{
                    control: "datepicker",
                    extraClasses: ["col-xs-4"],
                    required: true,
                    disabled: true,
                    name: "collectionDate",
                    label: "Collection Date"
                }, {
                    control: "timepicker",
                    extraClasses: ["col-xs-4"],
                    disabled: true,
                    placeholder: 'HH:MM',
                    name: "collectionTime",
                    label: "Collection Time",
                    options: {
                        defaultTime: false
                    }
                }]
            }]
        }]
    };

    var restOfBodyContainer = {
        control: "container",
        items: [{
            control: "container",
            extraClasses: ["row"],
            items: [{
                control: "container",
                extraClasses: ["col-xs-3"],
                items: [{
                    control: "select",
                    name: "howOften",
                    label: "How Often?",
                    required: true,
                    disabled: true,
                    attributeMapping: {
                        label: 'name',
                        value: 'code'
                    },
                    options: [],
                    pickList: []
                }]
            }, {
                control: "container",
                extraClasses: ["col-xs-3"],
                items: [{
                    control: "input",
                    name: "howLong",
                    label: "How Long?",
                    title: 'Enter a number of days, or an "X" followed by a number of times.',
                    disabled: true
                }]
            }, {
                control: "container",
                extraClasses: ["col-xs-6"],
                items: [{
                    control: "select",
                    name: "collectionSample",
                    label: "Collection Sample",
                    required: true,
                    disabled: true,
                    attributeMapping: {
                        label: 'displayName',
                        value: 'ien'
                    },
                    options: [],
                    pickList: []
                }]
            }]
        }, {
            control: "container",
            extraClasses: ["row"],
            items: [{
                control: "container",
                extraClasses: ["col-xs-12", "otherCollectionSampleContainer"],
                hidden: true,
                items: [{
                    control: "select",
                    name: "otherCollectionSample",
                    label: "Select Other Collection Sample",
                    attributeMapping: {
                        label: 'displayName',
                        value: 'ien'
                    },
                    showFilter: true,
                    options: {
                        minimumInputLength: 0,
                        sorter: FormUtils.getSelectControlSorter
                    },
                    pickList: []
                }]
            }]
        }, {
            control: "container",
            extraClasses: ["row"],
            items: [{
                control: "container",
                extraClasses: ["col-xs-6"],
                items: [{
                    control: "select",
                    name: "collectionType",
                    label: "Collection Type",
                    required: true,
                    disabled: true,
                    attributeMapping: {
                        label: 'name',
                        value: 'code'
                    },
                    options: [],
                    pickList: []
                }]
            }, {
                control: "container",
                extraClasses: ["col-xs-6"],
                items: [{
                    control: "select",
                    name: "specimen",
                    label: "Specimen",
                    disabled: true,
                    required: true,
                    attributeMapping: {
                        label: 'name',
                        value: 'ien'
                    },
                    options: [],
                    pickList: []
                }]
            }]
        }, {
            control: "container",
            extraClasses: ["row"],
            items: [{
                control: "container",
                extraClasses: ["col-xs-12", "otherSpecimenContainer"],
                hidden: true,
                items: [{
                    control: "select",
                    name: "otherSpecimen",
                    label: "Select Other Specimen",
                    attributeMapping: {
                        label: 'name',
                        value: 'ien'
                    },
                    showFilter: true,
                    options: {
                        minimumInputLength: 0,
                        sorter: FormUtils.getSelectControlSorter
                    },
                    pickList: [],

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
                    hidden: true,
                    name: "anticoagulant",
                    label: "What Kind of anticoagulant is the patient on?"
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
                    hidden: true,
                    name: "orderComment",
                    label: "Enter order comment:"
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
                    hidden: true,
                    name: "urineVolume",
                    label: "Enter the urine volume:"
                }]
            }]
        }, {
            control: "container",
            extraClasses: ["row"],
            items: [{
                control: "container",
                extraClasses: ["col-xs-12", "sampleDrawnAtContainer"],
                hidden: true,
                items: [{
                    control: "radio",
                    name: "sampleDrawnAt",
                    label: "Sample drawn at:",
                    options: [{
                        label: "Peak",
                        value: "~Dose is expected to be at &PEAK level.",
                    }, {
                        label: "Trough",
                        value: "~Dose is expected to be at &TROUGH level."
                    }, {
                        label: "Mid",
                        value: "~Dose is expected to be at &MID level."
                    }, {
                        label: "Unknown",
                        value: "~Dose is expected to be at &UNKNOWN level."
                    }]
                }]
            }]
        }, {
            control: "container",
            extraClasses: ["row"],
            items: [{
                control: "container",
                extraClasses: ["col-xs-12"],
                items: [{
                    control: "textarea",
                    hidden: true,
                    name: "additionalComments",
                    label: "Additional Comments",
                    rows: 3
                }]
            }]
        }, {
            control: "container",
            extraClasses: ["row"],
            items: [{
                control: "container",
                extraClasses: ["col-xs-6", "doseContainer"],
                hidden: true,
                items: [{
                    control: "datepicker",
                    name: "doseDate",
                    label: "Enter the last dose date:"
                }, {
                    control: "timepicker",
                    name: "doseTime",
                    label: "Enter the last dose time",
                    placeholder: 'HH:MM',
                    options: {
                        defaultTime: false
                    }
                }]
            }, {
                control: "container",
                extraClasses: ["col-xs-6", "drawContainer"],
                hidden: true,
                items: [{
                    control: "datepicker",
                    name: "drawDate",
                    label: "Enter draw date:"
                }, {
                    control: "timepicker",
                    label: "Enter draw time",
                    name: "drawTime",
                    placeholder: 'HH:MM',
                    options: {
                        defaultTime: false
                    }
                }]
            }]
        }, {
            control: "container",
            extraClasses: ["row"],
            items: [{
                control: "container",
                extraClasses: ["col-xs-12", "immediateCollectionContainer"],
                hidden: true,
                items: [{
                    control: "fieldset",
                    legend: "Immediate Collection Times",
                    items: [{
                        control: "container",
                        extraClasses: ["well"],
                        items: [{
                            control: "container",
                            extraClasses: ["row"],
                            items: [{
                                control: "container",
                                extraClasses: ["col-xs-12"],
                                template: Handlebars.compile('{{#each immediateCollection}}{{this}}<br />{{/each}}<br />'),
                                modelListeners: ["immediateCollection"]
                            }]
                        }, {
                            control: "container",
                            extraClasses: ["row"],
                            items: [{
                                control: "container",
                                extraClasses: ["col-xs-6"],
                                items: [{
                                    control: "datepicker",
                                    label: "Date Taken",
                                    name: "immediateCollectionDate"
                                }]
                            }, {
                                control: "container",
                                extraClasses: ["col-xs-6"],
                                items: [{
                                    control: "timepicker",
                                    label: "Time Taken",
                                    placeholder: 'HH:MM',
                                    name: "immediateCollectionTime",
                                    options: {
                                        defaultTime: false
                                    }
                                }]
                            }]
                        }]
                    }]
                }]
            }]
        }, {
            control: "container",
            extraClasses: ["row"],
            items: [{
                control: "container",
                extraClasses: ["col-xs-12", "futureLabCollectTimesContainer"],
                hidden: true,
                items: [{
                    control: "fieldset",
                    legend: "Future Lab Collect Times",
                    items: [{
                        control: "container",
                        extraClasses: ["well"],
                        items: [{
                            control: "container",
                            extraClasses: ["row"],
                            items: [{
                                control: "container",
                                extraClasses: ["col-xs-8"],
                                items: [{
                                    control: "datepicker",
                                    label: "Select a date and a routine lab collect time for that date.",
                                    name: "futureLabCollectDate"
                                }]
                            }]
                        }, {
                            control: "container",
                            extraClasses: ["row"],
                            items: [{
                                control: "select",
                                extraClasses: ["col-xs-8"],
                                name: "futureLabCollectTime",
                                label: "Collect Time",
                                pickList: []
                            }]
                        }, {
                            control: "container",
                            extraClasses: ["row"],
                            items: [{
                                control: "container",
                                extraClasses: ["col-xs-12"],
                                template: Handlebars.compile('{{futureLabCollectErrorMessage}}'),
                                modelListeners: ["futureLabCollectErrorMessage"]
                            }, {
                                control: "container",
                                extraClasses: ["col-xs-12", "text-left", "futureLabCollectInProgress"],
                                template: Handlebars.compile('<p><i class="fa fa-spinner fa-spin"></i> Loading...</p>'),
                            }]
                        }]
                    }]
                }]
            }]
        }]
    };

    var orderPreviewContainer = {
        control: "container",
        template: SummaryTemplate,
        modelListeners: ["availableLabTests", "urgencyText",
            "collectionSampleText", "collectionType", "specimenText", "howOftenText",
            "sampleDrawnAt", "additionalComments", "anticoagulant", "orderComment", "doseDate", "doseTime",
            "drawDate", "drawTime", "immediateCollectErrorMessage"
        ],
        extraClasses: ["row order-preview"]
    };

    var addToNoteContainer = {
        control: "container",
        items: [{
            control: "container",
            template: AddToNoteTemplate,
            modelListeners: ["addToNoteUrgencyText", "specimenText", "availableLabTests"],
            extraClasses: ["row addToNote background-color-grey-lighter top-padding-sm"]
        },{
            control: "container",
            extraClasses: ["row background-color-grey-lighter"],
            items: [{
                control: "select",
                extraClasses: ["col-xs-6"],
                label: "Problem Relationship",
                name: "problemRelationship",
                pickList: [{
                    label: "Diabetes",
                    value: "Diabetes"
                }]
            }]
        },{
            control: "container",
            extraClasses: ["row background-color-grey-lighter"],
            items: [{
                control: "textarea",
                extraClasses: ["col-xs-12"],
                label: "Annotation",
                name: "annotation",
                rows: 3
            }]
        }]
    };

    var orderActivityContainer = {
        control: "container",
        modelListeners: [""],
        extraClasses: ["row order-activity background-color-grey-lighter top-padding-sm"],
        items: [{
            control: "container",
            extraClasses: ["col-xs-12"],
            items: [{
                control: "select",
                name: "activity",
                label: "Select an Activity",
                attributeMapping: {
                    label: 'name',
                    value: 'id'
                },
                required: false,
                disabled: true,
                pickList: []
            }]
        }]
    };

    var ordersFields = [
        // **************************************** Modal Body Start ******************************************
        {
            control: "container",
            extraClasses: ["modal-body order-lab-test"],
            items: [{
                control: "container",
                extraClasses: ["container-fluid"],
                items: [errorMessageContainer, alertMessageContainer, availableLabTestsContainer, restOfBodyContainer, orderPreviewContainer, addToNoteContainer, orderActivityContainer]
            }]
        }, { // **************************************** Modal Footer Start ******************************************
            control: "container",
            extraClasses: ["modal-footer"],
            items: [{
                control: "container",
                extraClasses: ["row"],
                items: [{
                    control: "container",
                    extraClasses: ["col-xs-3"],
                    items: [{
                        /*
                        control: "container",
                        extraClasses: ["text-left favorite"],
                        template: Handlebars.compile('<i class="fa fa-star-o"></i>')
                    },{
                        */
                        control: "container",
                        extraClasses: ["text-left inProgressContainer"],
                        hidden: true,
                        template: Handlebars.compile('<i class="fa fa-spinner fa-spin"></i> {{inProgressMessage}}'),
                        modelListeners: ["inProgressMessage"]
                        }]
                },{
                    control: "container",
                    extraClasses: ["col-xs-9"],
                    items: [{
                        control: "button",
                        extraClasses: ["btn-default", "btn-sm"],
                        label: "Delete",
                        name: 'deleteButton',
                        type: "button",
                        title: "Press enter to delete."
                    }, {
                        control: "button",
                        extraClasses: ["btn-default", "btn-sm"],
                        label: "Save & Close",
                        name: 'cancelButton',
                        type: "button",
                        title: "Press enter to close."
                    }, {
                        control: "dropdown",
                        split: true,
                        label: "Accept & Add Another",
                        id: "acceptDrpDwnContainer",
                        title: "Press enter to accept.",
                        type: 'submit',
                        items: [{
                            label: "Accept & Add Another",
                            id: "accept-add"
                        }, {
                            label: "Accept",
                            id: "accept"
                        }]
                    }]
                }]
            }]
        }
    ];

    return ordersFields;
});
