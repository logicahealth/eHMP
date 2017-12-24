define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/task_forms/common/utils/utils',
    'hbs!app/applets/task_forms/activities/order.consult/templates/request/request_Template',
    'app/applets/task_forms/common/views/alertView'
], function(Backbone, Marionette, _, Handlebars, Utils, RequestTemplate, AlertView) {
    "use strict";

    var selectConsultTypeFields = [{
        control: 'container',
        extraClasses: ['modal-body'],
        items: [{
            control: 'container',
            extraClasses: ['container'],
            items: [{
                control: 'container',
                extraClasses: ['row'],
                items: [{
                    control: 'select',
                    extraClasses: ['color-red col-sm-8'],
                    required: true,
                    label: 'Consult Name',
                    showFilter: true,
                    pickList: [{
                        value: 'List Item 1',
                        label: 'List Item 1'
                    }, {
                        value: 'List Item 2',
                        label: 'List Item 2'
                    }, {
                        value: 'List Item 3',
                        label: 'List Item 3'
                    }, {
                        value: 'List Item 4',
                        label: 'List Item 4'
                    }, {
                        value: 'List Item 5',
                        label: 'List Item 5'
                    }, {
                        value: 'List Item 6',
                        label: 'List Item 6'
                    }, {
                        value: 'List Item 7',
                        label: 'List Item 7'
                    }, {
                        value: 'Physical Therapy',
                        label: 'Physical Therapy'
                    }, {
                        value: 'List Item 9',
                        label: 'List Item 9'
                    }, {
                        value: 'List Item 10',
                        label: 'List Item 10'
                    }, {
                        value: 'List Item 11',
                        label: 'List Item 11'
                    }, {
                        value: 'List Item 12',
                        label: 'List Item 12'
                    }, {
                        value: 'List Item 13',
                        label: 'List Item 13'
                    }, {
                        value: 'List Item 14',
                        label: 'List Item 14'
                    }, {
                        value: 'List Item 15',
                        label: 'List Item 15'
                    }]

                }]
            }]
        }]
    }, {
        control: 'container',
        extraClasses: ['modal-footer'],
        items: [{
            control: 'container',
            extraClasses: 'row',
            items: [{
                control: 'container',
                extraClasses: 'col-xs-12',
                items: [{
                    control: 'button',
                    extraClasses: ['btn-default', 'btn-sm', 'pull-left'],
                    id: 'task-order-entry-delete-button',
                    label: 'Delete',
                    type: 'button'
                }, {
                    control: 'button',
                    extraClasses: ['btn-default', 'btn-sm'],
                    id: 'modal-save-close-button',
                    label: 'Draft',
                    type: 'button'
                }, {
                    control: 'button',
                    extraClasses: ['btn-primary', 'btn-sm'],
                    id: 'modal-accept-button',
                    label: 'Accept',
                    type: 'button'
                }],
            }]
        }]

    }];

    var requestFields = [{
        control: 'container',
        extraClasses: ['modal-body'],
        items: [{
            control: 'container',
            extraClasses: ['all-padding-xs', 'bottom-padding-sm', 'left-padding-sm', 'bottom-border-grey-light'],
            items: [{
                control: 'button',
                name: 'consultOverview',
                label: 'Activity Details',
                type: 'button',
                id: 'consult-overview-button',
                extraClasses: ['btn-primary', 'btn-xs']
            }]
        }, {
            control: 'container',
            extraClasses: ['all-padding-lg', 'bottom-padding-no', 'background-color-pure-white'],
            template: RequestTemplate,
            modelListeners: ['location']
        }, {
            control: 'container',
            extraClasses: ['all-padding-lg'],
            items: [{
                control: 'select',
                name: 'action',
                label: 'Action',
                required: 'true',
                diabled: 'true',
                hidden: 'true'

            }, {
                control: 'select',
                name: 'reason',
                label: 'Reason for Discontinue',
                required: 'true',
                diabled: 'true',
                hidden: 'true',
                pickList: []
            }, {
                control: 'datepicker',
                name: 'scheduledDate',
                label: 'Scheduled Date',
                tite: 'Enter in a date in the following format: MM/DD/YYYY',
                placeholder: 'MM/DD/YYYY',
                startDate: '0d',
                required: 'true',
                diabled: 'true',
                hidden: 'true'
            }, {
                control: 'select',
                name: 'communityCare',
                label: 'Type of community care',
                extraClasses: 'transform-none',
                required: 'true',
                diabled: 'true',
                hidden: 'true',
                pickList: [{
                    value: 'CHOICE',
                    label: 'CHOICE'
                }, {
                    value: 'DoD',
                    label: 'DoD'
                }, {
                    value: 'GEC',
                    label: 'GEC'
                }, {
                    value: 'Non VA Care',
                    label: 'Non VA Care'
                }, {
                    value: 'Sharing agreement',
                    label: 'Sharing agreement'
                }, ]
            }, {
                control: 'select',
                name: 'communityCareStatus',
                label: 'Scheduling Status',
                required: 'true',
                diabled: 'true',
                hidden: 'true',
                pickList: [{
                    value: 'pending',
                    label: 'Pending'
                }, {
                    value: 'scheduled',
                    label: 'Scheduled'
                }, ]
            }, {
                control: 'select',
                name: 'clinic',
                label: 'Clinic',
                required: 'true',
                diabled: 'true',
                hidden: 'true',
                pickList: []
            }, {
                control: 'checkbox',
                name: 'contacted',
                label: 'Patient Responded',
                diabled: 'true',
                hidden: 'true'
            }, {
                control: 'select',
                name: 'attempt',
                label: 'Attempt',
                required: 'true',
                diabled: 'true',
                hidden: 'true',
                pickList: []
            }, {
                control: 'select',
                name: 'provider',
                label: 'Provider',
                title: 'Press enter to open search filter text',
                required: 'true',
                diabled: 'true',
                hidden: 'true',
                showFilter: true,
                options: {
                    placeholder: 'Select person',
                    minimumInputLength: 2,
                    language: {
                        inputTooShort: function() {
                            return 'Enter at least 2 characters of the person\'s name';
                        }
                    }
                },
                attributeMapping: {
                    label: 'name',
                    value: 'personID'
                },
                pickList: []
            }, {
                control: 'select',
                name: 'acceptingProvider',
                extraClasses: 'top-margin-sm',
                label: 'Attention',
                required: 'true',
                disabled: 'true',
                hidden: 'true',
                title: 'Press enter to open search filter text',
                showFilter: true,
                options: {
                    placeholder: 'Member to assign to',
                    minimumInputLength: 2,
                    language: {
                        inputTooShort: function() {
                            return 'Enter at least 2 characters of the person\'s name';
                        }
                    }
                },
                attributeMapping: {
                    label: 'name',
                    value: 'personID'
                },
                pickList: []
            }, {
                control: 'container',
                extraClasses: ['top-padding-sm', 'bottom-padding-xs', 'econsult-reminder-text'],
                template: '<p aria-live="assertive"><strong>Reminder</strong> This action will assign the consult to you for completion by a clinical note.</p>',
                hidden: true
            }, {
                control: 'textarea',
                name: 'comment',
                label: 'Comment',
                title: 'Enter comment(s)',
                diabled: 'true',
                hidden: 'true',
                rows: 8
            }, {
                control: 'textarea',
                name: 'question',
                label: 'Question',
                title: 'Enter question(s)',
                diabled: 'true',
                hidden: 'true',
                required: 'true',
                rows: 8
            }]
        }]
    }, {
        control: 'container',
        extraClasses: ['modal-footer footer-extended'],
        items: [{
            control: 'container',
            extraClasses: ['row'],
            items: [{
                control: 'container',
                extraClasses: ["col-xs-12", "left-padding-sm", "bottom-padding-xs"],
                items: [{
                    control: 'container',
                    extraClasses: ["text-left inProgressContainer"],
                    hidden: true,
                    template: Handlebars.compile('<i class="fa fa-spinner fa-spin pull-left"></i> {{inProgressMessage}}'),
                    modelListeners: ["inProgressMessage"]

                }]
            }]
        }, {
            control: 'container',
            extraClasses: ['col-xs-12'],
            items: [{
                control: 'container',
                extraClasses: 'row',
                items: [{
                    control: 'button',
                    extraClasses: ['btn-default', 'btn-sm'],
                    id: 'modal-close-button',
                    label: 'Cancel',
                    type: 'button'
                }, {
                    control: 'button',
                    extraClasses: ['btn-primary', 'btn-sm'],
                    id: 'modal-done-button',
                    label: 'Accept',
                    type: 'button'
                }]
            }]

        }]
    }];

    var consultSignFields = [{
        control: "container",
        extraClasses: ["modal-body"],
        items: [{
            control: "container",
            extraClasses: ["container-fluid", "col-xs-12"],
            items: [{
                control: "alertBanner",
                name: "sign-error-message",
                title: "Unable to Submit",
                extraClasses: ["col-xs-12"],
                type: "danger",
                dismissible: false
            }, {
                control: "container",
                extraClasses: ["order-summary", "col-xs-12"],
                template: Handlebars.compile('<div class="well bottom-padding-xl top-padding-sm all-padding-sm"><div class="col-xs-10 left-padding-no"><span class="font-size-14"><strong>{{summary}}</strong></span></div><div class="col-xs-2"><div class="sign-activityId"><button type="button" class="btn btn-link all-padding-sm top-padding-no">View Details</button></div></div></div>')
            }, {
                control: "input",
                name: "signature_code",
                type: "password",
                autocomplete: "off",
                maxlength: 20,
                disabled: false,
                required: true,
                extraClasses: ["col-xs-5", "signature-code"],
                label: "Enter Electronic Signature Code",
                title: "Enter in electronic signature code"
            }]
        }]
    }, {
        control: 'container',
        extraClasses: ['modal-footer'],
        items: [{
            control: "container",
            extraClasses: ["row"],
            items: [{
                control: "container",
                extraClasses: ["col-xs-6"],
                items: [{
                    control: "container",
                    extraClasses: ["pull-left", "inProgressContainer", "top-padding-xs"],
                    template: Handlebars.compile('<i class="fa fa-spinner fa-spin pull-left"></i><span>In progress...</span>'),
                    hidden: true
                }]
            }, {
                control: "container",
                extraClasses: ["col-xs-6"],
                items: [{
                    control: 'button',
                    extraClasses: ['btn-default', 'btn-sm'],
                    id: 'modal-cancel-button',
                    label: 'Cancel',
                    name: 'cancel',
                    type: 'button'
                }, {
                    control: 'button',
                    extraClasses: ['btn-primary', 'btn-sm'],
                    id: 'modal-sign-button',
                    label: 'Accept',
                    name: 'sign-accept',
                    type: 'button'
                }]
            }]
        }]
    }];

    return {
        requestFields: requestFields,
        consultSignFields: consultSignFields,
        selectConsultTypeFields: selectConsultTypeFields
    };
});
