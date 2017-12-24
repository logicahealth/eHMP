define([
    'handlebars',
    'moment',
    'hbs!app/applets/orders/writeback/labs/templates/addToNoteTemplate',
    'app/applets/orders/writeback/labs/formUtils'
], function(Handlebars, moment, AddToNoteTemplate, FormUtils) {
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
            items: [{
                control: "container",
                extraClasses: ["col-xs-12"],
                items: [{
                    control: "select",
                    name: "availableLabTests",
                    label: "Available Lab Tests",
                    title: "Press enter to open search filter text.",
                    required: true,
                    showFilter: true,
                    pickList: [],
                    options: {
                        minimumInputLength: 0,
                        sorter: FormUtils.getSelectControlSorter
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
            }]
        }, {
            control: "container",
            extraClasses: ["row"],
            items: [{
                control: "container",
                extraClasses: ["col-xs-12", "immediateCollectionContainer", "top-margin-md"],
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
                                    name: "immediateCollectionDate",
                                    flexible: true,
                                    minPrecision: "day"
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
                items: [{
                    control: "select",
                    extraClasses: ["col-xs-7"],
                    name: "collectionDateTimePicklist",
                    hidden: true,
                    label: "Collection Date/Time",
                    attributeMapping: {
                        label: 'name',
                        value: 'code'
                    },
                    options: [],
                    pickList: []
                }, {
                    control: "datepicker",
                    extraClasses: ["col-xs-6"],
                    required: true,
                    disabled: true,
                    name: "collectionDate",
                    label: "Collection Date",
                    flexible: true,
                    minPrecision: "day",
                    startDate: '0d'
                }, {
                    control: "timepicker",
                    extraClasses: ["col-xs-6"],
                    disabled: true,
                    placeholder: 'HH:MM',
                    name: "collectionTime",
                    label: "Collection Time",
                    options: {
                        defaultTime: false
                    }
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
                                    label: "Collect Date",
                                    name: "futureLabCollectDate",
                                    flexible: true,
                                    minPrecision: "day",
                                    startDate: '0d'
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
        }, {
            control: "container",
            extraClasses: ["row"],
            items: [{
                control: "container",
                extraClasses: ["col-xs-12"],
                items: [{
                    control: "select",
                    name: "otherCollectionSample",
                    label: "Select Other Collection Sample",
                    showFilter: true,
                    hidden: true,
                    attributeMapping: {
                        label: 'label',
                        value: 'ien'
                    },
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
                    name: "howOften",
                    label: "How Often?",
                    required: false,
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
                    control: "input",
                    name: "howLong",
                    label: "How Long?",
                    title: 'Enter a number of days, or an "X" followed by a number of times.',
                    disabled: true
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
                    disabled: true,
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
                extraClasses: ["col-xs-12"],
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
                extraClasses: ["col-xs-12"],
                items: [{
                    control: "textarea",
                    hidden: true,
                    name: "orderComment",
                    label: "Enter order comment"
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
                    label: "Enter the urine volume"
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
                    label: "Sample drawn at",
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
                    label: "Enter the last dose date",
                    flexible: true,
                    minPrecision: "day"
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
                    label: "Enter draw date",
                    flexible: true,
                    minPrecision: "day",
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
        }]
    };

    var addToNoteContainer = {
        control: "container",
        items: [{
            control: "container",
            extraClasses: ["row background-color-pure-white"],
            items: [{
                control: "select",
                extraClasses: ["col-xs-12"],
                label: "Problem Relationship",
                name: "problemRelationship",
                pickList: [],
                disabled: true
            }]
        }, {
            control: "container",
            template: AddToNoteTemplate,
            modelListeners: ["addToNoteUrgencyText", "specimenText", "availableLabTests"],
            extraClasses: ["row addToNote background-color-pure-white top-padding-sm"]
        }, {
            control: "container",
            extraClasses: ["row background-color-pure-white bottom-padding-md top-padding-lg bottom-border-grey-light"],
            items: [{
                control: "textarea",
                extraClasses: ["col-xs-12"],
                label: "Annotation",
                srOnlyLabel: true,
                name: "annotation",
                placeholder: 'Enter additional note object text here',
                rows: 4
            }]
        }]
    };

    var orderActivityContainer = {
        control: "container",
        items: [{
            control: 'container',
            extraClasses: ["row background-color-pure-white top-margin-xs"],
            items: [{
                control: 'checkbox',
                name: 'isActivityEnabled',
                label: 'Remind me if results are not received by:',
                title: 'Press spacebar to enable or disable results notification',
                extraClasses: ["col-xs-12 bottom-margin-no"],
                disabled: false,
                hidden: false
            }]
        }, {
            control: 'container',
            extraClasses: ["row background-color-pure-white"],
            items: [{
                control: 'container',
                extraClasses: ["col-xs-6"],
                items: [{
                    control: 'datepicker',
                    name: 'notificationDate',
                    label: 'Notification Date',
                    helpMessage: 'Default = Collection date +7d',
                    required: true,
                    startDate: '0d',
                    disabled: true,
                    hidden: false,
                    flexible: true,
                    minPrecision: "day"
                }]
            }]
        }, {
            control: 'container',
            extraClasses: ["row background-color-pure-white left-padding-sm right-padding-sm"],
            template: '<hr aria-hidden="true" />'
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
                items: [errorMessageContainer, alertMessageContainer, availableLabTestsContainer, restOfBodyContainer, orderActivityContainer, addToNoteContainer]
            }]
        }, { // **************************************** Modal Footer Start ******************************************
            control: "container",
            extraClasses: ["modal-footer footer-extended"],
            items: [{
                control: "container",
                extraClasses: ["row"],
                items: [{
                    control: "container",
                    extraClasses: ["col-xs-12", "left-padding-sm", "bottom-padding-xs"],
                    items: [{
                        control: "container",
                        extraClasses: ["text-left inProgressContainer"],
                        hidden: true,
                        template: Handlebars.compile('<i class="fa fa-spinner fa-spin pull-left"></i> {{inProgressMessage}}'),
                        modelListeners: ["inProgressMessage"]
                    }]
                }, {
                    control: "container",
                    extraClasses: ['col-xs-12', 'display-flex', 'valign-bottom'],
                    items: [{
                        control: 'container',
                        extraClasses: ['flex-grow-loose', 'text-left'],
                        items: [{
                            control: 'popover',
                            behaviors: {
                                Confirmation: {
                                    title: 'Delete',
                                    eventToTrigger: 'lab-test-add-confirm-delete',
                                    message: 'Are you sure you want to delete?',
                                    confirmButtonTitle: 'Press enter to delete'
                                }
                            },
                            label: 'Delete',
                            name: 'labtestAddConfirmDelete',
                            extraClasses: ['btn-default', 'btn-sm'],
                            disabled: true
                        }]
                    }, {
                        control: 'popover',
                        behaviors: {
                            Confirmation: {
                                title: 'Warning',
                                eventToTrigger: 'lab-test-add-confirm-cancel'
                            }
                        },
                        label: 'Cancel',
                        name: 'labTestAddConfirmCancel',
                        extraClasses: ['btn-default', 'btn-sm']
                    }, {
                        control: "button",
                        extraClasses: ["btn-primary", "btn-sm", "left-margin-sm", "right-margin-xs"],
                        label: "Draft",
                        id: 'saveButton',
                        name: 'save-button',
                        type: "button",
                        disabled: true
                    }, {
                        control: "dropdown",
                        extraClasses: ["dropup"],
                        split: true,
                        label: "Accept & Add Another",
                        id: "acceptDrpDwnContainer",
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