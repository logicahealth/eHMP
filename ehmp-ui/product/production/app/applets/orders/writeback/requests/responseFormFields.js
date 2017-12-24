define([
    'handlebars',
    'app/applets/task_forms/activities/requests/responseEventHandler'
], function(Handlebars, responseEventHandler) {
    'use strict';

    var FormFields = [{
        control: 'container',
        extraClasses: ['modal-body', 'top-padding-no'],
        items: [{
            control: 'container',
            extraClasses: ['container-fluid'],
            items: [{
                control: 'container',
                extraClasses: ['row'],
                items: [{
                    control: 'container',
                    extraClasses: ['col-xs-12', 'background-color-primary-light-alt', 'top-padding-sm', 'bottom-padding-sm'],
                    items: [{
                        control: 'button',
                        extraClasses: ['btn-primary', 'btn-sm'],
                        id: 'activityDetails',
                        label: 'Activity Details',
                        type: 'button'
                    }]
                }]
            }, {
                control: 'container',
                extraClasses: ['row', 'background-color-pure-white', 'left-padding-md', 'right-padding-md', 'bottom-padding-sm'],
                items: [{
                    control: 'container',
                    extraClasses: ['row'],
                    items: [{
                        control: 'alertBanner',
                        type: 'info',
                        name: 'beforeEarliestDateBanner',
                        extraClasses: ['col-xs-12'],
                        dismissible: true
                    }]
                },
                {
                    control: 'container',
                    extraClasses: ['col-xs-12', 'all-padding-no'],
                    items: [{
                        control: 'container',
                        extraClasses: ['row', 'top-padding-lg', 'bottom-padding-lg'],
                        items: [{
                            control: 'container',
                            extraClasses: ['col-xs-7'],
                            items: [{
                                control: 'container',
                                tagName: 'h5',
                                extraClasses: ['font-size-16'],
                                template: '{{displayName}}',
                                modelListeners: ['displayName']
                            }]
                        }, {
                            control: 'container',
                            extraClasses: ['col-xs-5', 'text-right', 'top-margin-xs'],
                            items: [{
                                control: 'container',
                                tagName: 'span',
                                template: '<span class="btn btn-icon top-padding-no" data-toggle="tooltip" title="Use this activity to request other providers or yourself to complete a patient specific task at any time now or in the future."><i class="fa fa-info-circle font-size-16"/></span><span class="sr-only">Use this activity to request other providers or yourself to complete a patient specific task at any time now or in the future.</span>'
                            }, {
                                control: 'container',
                                tagName: 'h5',
                                extraClasses: ['inline-display', 'text-uppercase', 'font-size-16'],
                                template: Handlebars.compile('{{ehmpState}}<br /><small class="color-pure-black"><strong>{{subState}}</strong></small>'),
                                modelListeners: ['ehmpState', 'subState']
                            }]
                        }]
                    }, {
                        control: 'container',
                        extraClasses: ['row', 'bottom-padding-sm'],
                        items: [{
                            control: 'container',
                            extraClasses: ['col-xs-12'],
                            items: [{
                                control: 'container',
                                extraClasses: ['inline-display', 'all-padding-no', 'all-margin-no', 'transform-text-capitalize'],
                                tagName: 'h5',
                                template: 'Request Details'
                            }]
                        }, {
                            control: 'container',
                            tagName: 'hr',
                            extraClasses: ['left-margin-md', 'right-margin-md']
                        }]
                    }, {
                        control: 'container',
                        extraClasses: ['row', 'bottom-padding-no'],
                        items: [{
                            control: 'container',
                            extraClasses: ['col-xs-12'],
                            items: [{
                                control: 'container',
                                extraClasses: ['inline-display', 'all-padding-no', 'all-margin-no'],
                                tagName: 'h6',
                                template: 'Requested by:'
                            }]
                        }]
                    }, {
                        control: 'container',
                        extraClasses: ['row', 'bottom-padding-no'],
                        items: [{
                            control: 'container',
                            extraClasses: ['col-xs-12'],
                            template: '{{requestorInformation}}',
                            modelListeners: ['requestorInformation']
                        }],
                    }, {
                        control: 'container',
                        extraClasses: ['row', 'bottom-padding-sm'],
                        items: [{
                            control: 'container',
                            extraClasses: ['col-xs-12'],
                            template: '{{requestorLocation}}',
                            modelListeners: ['requestorLocation']
                        }],
                    }, {
                        control: 'container',
                        extraClasses: ['row', 'bottom-padding-no'],
                        items: [{
                            control: 'container',
                            extraClasses: ['col-xs-6'],
                            items: [{
                                control: 'container',
                                extraClasses: ['inline-display', 'all-padding-no', 'all-margin-no'],
                                tagName: 'h6',
                                template: 'Earliest date'
                            }]
                        }, {
                            control: 'container',
                            extraClasses: ['col-xs-6'],
                            items: [{
                                control: 'container',
                                extraClasses: ['inline-display', 'all-padding-no', 'all-margin-no'],
                                tagName: 'h6',
                                template: 'Latest date'
                            }]
                        }]
                    }, {
                        control: 'container',
                        extraClasses: ['row', 'bottom-padding-sm'],
                        items: [{
                            control: 'container',
                            extraClasses: ['col-xs-6'],
                            template: '{{earliestDateText}}',
                            modelListeners: ['earliestDateText']
                        }, {
                            control: 'container',
                            extraClasses: ['col-xs-6'],
                            template: '{{latestDateText}}',
                            modelListeners: ['latestDateText']
                        }]
                    }, {
                        control: 'container',
                        extraClasses: ['row', 'bottom-padding-no'],
                        items: [{
                            control: 'container',
                            extraClasses: ['col-xs-12'],
                            items: [{
                                control: 'container',
                                extraClasses: ['inline-display', 'all-padding-no', 'all-margin-no'],
                                tagName: 'h6',
                                template: 'Request:'
                            }]
                        }]
                    }, {
                        control: 'container',
                        extraClasses: ['row', 'bottom-padding-sm'],
                        items: [{
                            control: 'container',
                            extraClasses: ['col-xs-12'],
                            template: '{{requestDetails}}',
                            modelListeners: ['requestDetails']
                        }]
                    }]
                }]
            }, {
                control: 'container',
                extraClasses: ['row', 'bottom-padding-sm', 'top-padding-md'],
                items: [{
                    control: 'container',
                    extraClasses: ['col-xs-12'],
                    items: [{
                        control: 'select',
                        extraClasses: ['action-options'],
                        name: 'action',
                        label: 'Action',
                        required: true,
                        pickList: 'actionsPickList'
                    }]
                }]
            }, {
                control: 'assignTo',
                name: 'assignment',
                options: {
                    "me": false
                },
                extraClasses: ['bottom-padding-sm'],
                hidden: true,
                required: false
            }, {
                control: 'container',
                extraClasses: ['row', 'bottom-padding-sm', 'comment-row'],
                hidden: true,
                items: [{
                    control: 'textarea',
                    extraClasses: 'col-xs-12',
                    name: 'comment',
                    label: 'Comment',
                    hidden: true,
                    placeholder: 'Add comment',
                    title: 'Enter a comment for the response',
                    maxlength: 200
                }]
            }, {
                control: 'container',
                extraClasses: ['row', 'bottom-padding-sm', 'request-row'],
                hidden: true,
                items: [{
                    control: 'textarea',
                    extraClasses: 'col-xs-12',
                    name: 'request',
                    label: 'Request',
                    placeholder: 'Add comment',
                    title: 'Enter a comment for the response',
                    maxlength: 200
                }]
            }]
        }]
    }, {
        control: 'container',
        extraClasses: ['modal-footer'],
        items: [{
            control: 'container',
            extraClasses: ['row'],
            items: [{
                control: 'container',
                extraClasses: ['col-xs-12', 'display-flex', 'valign-bottom'],
                items: [{
                    control: 'popover',
                    behaviors: {
                        Confirmation: {
                            title: 'Warning',
                            eventToTrigger: 'response-confirm-cancel-button'
                        }
                    },
                    label: 'Cancel',
                    name: 'responseConfirmCancelButton',
                    extraClasses: ['btn-default', 'btn-sm', 'right-margin-xs']
                }, {
                    control: 'button',
                    extraClasses: ['btn-primary', 'btn-sm'],
                    id: 'responseAcceptButton',
                    label: 'Accept',
                    type: 'button'
                }]
            }]
        }]
    }];

    return FormFields;
});
