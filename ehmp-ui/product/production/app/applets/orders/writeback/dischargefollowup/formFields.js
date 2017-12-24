define([
    'handlebars',
    'app/applets/task_forms/activities/order.dischargefollowup/utils'
], function(Handlebars, Utils) {
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
                        name: 'alert',
                        extraClasses: ['col-xs-12'],
                        dismissible: true,
                        hidden: true,
                    }]
                }, {
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
                                template: '{{instanceName}}',
                                modelListeners: ['instanceName']
                            }]
                        }, {
                            control: 'container',
                            extraClasses: ['col-xs-5', 'text-right', 'top-margin-xs'],
                            items: [{
                                control: 'container',
                                tagName: 'span',
                                template: '<span class="btn btn-icon top-padding-no" data-toggle="tooltip" title="Inpatient Discharge Follow-Up is used to document patient contact after discharge from the hospital."><i class="fa fa-info-circle font-size-16"/></span><div class="sr-only">Inpatient Discharge Follow-Up is used to document patient contact after discharge from the hospital.</div>'
                            }, {
                                control: 'container',
                                tagName: 'h5',
                                extraClasses: ['inline-display', 'text-uppercase', 'font-size-16'],
                                template: Handlebars.compile('{{state}}<br /><small class="color-pure-black"><strong>{{subState}}</strong></small>'),
                                modelListeners: ['state', 'subState']
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
                                template: 'Task Details'
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
                                template: 'Contact by:'
                            }]
                        }]
                    }, {
                        control: 'container',
                        extraClasses: ['row', 'bottom-padding-sm'],
                        items: [{
                            control: 'container',
                            extraClasses: ['col-xs-12'],
                            template: '{{contactBy}}',
                            modelListeners: ['contactBy']
                        }],
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
                                template: 'Instructions:'
                            }]
                        }]
                    }, {
                        control: 'container',
                        extraClasses: ['row', 'bottom-padding-sm'],
                        items: [{
                            control: 'container',
                            extraClasses: ['col-xs-12'],
                            template: '{{instructions}}',
                            modelListeners: ['instructions']
                        }],
                    }]
                }]
            }, {
                control: 'container',
                extraClasses: ['row', 'top-padding-md'],
                items: [{
                    control: 'container',
                    extraClasses: ['col-xs-12'],
                    items: [{
                        control: 'select',
                        extraClasses: ['action-options'],
                        name: 'action',
                        label: 'Action',
                        required: true,
                        pickList: [{
                            value: Utils.TASK_ACTION_SUCCESFUL_CONTACT,
                            label: 'Successful Contact'
                        }, {
                            value: Utils.TASK_ACTION_UNABLE_TO_CONTACT,
                            label: 'Unable to Contact'
                        }, {
                            value: Utils.TASK_ACTION_FINAL_ATTEMPT,
                            label: 'Unable to Contact - Final Attempt'
                        }, {
                            value: Utils.TASK_ACTION_REASSIGN,
                            label: 'Reassign'
                        }]
                    }]
                }]
            }, {
                control: 'container',
                extraClasses: ['row', 'help-text-container'],
                items: [{
                    control: 'container',
                    extraClasses: ['col-xs-12', 'all-margin-sm', 'top-margin-xs']
                }],
            }, {
                control: 'assignTo',
                name: 'assignment',
                extraClasses: ['bottom-padding-sm', 'assignment'],
                hidden: true,
                required: false
            }, {
                control: 'container',
                extraClasses: ['row', 'bottom-padding-sm', 'comment-row'],
                items: [{
                    control: 'textarea',
                    extraClasses: 'col-xs-12',
                    name: 'comment',
                    label: 'Comment',
                    placeholder: 'Add comment',
                    maxlength: 200,
                    required: false
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