define([
    'handlebars'
], function(Handlebars) {
    'use strict';

    var FormFields = [{
        control: 'container',
        extraClasses: ['modal-body', 'top-padding-no'],
        items: [{
            control: 'container',
            extraClasses: ['sub-tray-container', 'top-padding-sm', 'bottom-padding-sm', 'bottom-border-grey-light', 'background-color-primary-light-alt'],
            items: [{
                control: 'container',
                extraClasses: ['row', 'all-margin-no'],
                items: [{
                    control: 'alertBanner',
                    extraClasses: ['col-xs-12'],
                    name: 'lab-error-message',
                    title: 'Unable to Submit',
                    type: 'danger',
                    dismissible: false
                }, {
                    control: 'container',
                    extraClasses: ['col-xs-12', 'all-padding-no'],
                    items: [{
                        control: 'button',
                        extraClasses: ['btn-primary', 'btn-sm', 'left-margin-md'],
                        id: 'activityDetails',
                        label: 'Activity Details',
                        type: 'button'
                    }]
                }]
            }]
        }, {
            control: 'container',
            extraClasses: ['all-padding-md', 'top-padding-lg', 'background-color-pure-white'],
            items: [{
                control: 'container',
                extraClasses: ['row'],
                items: [{
                    control: 'container',
                    extraClasses: ['col-xs-7'],
                    template: Handlebars.compile('<h5 class="font-size-16">{{taskDescription}}</h5>')
                }, {
                    control: 'container',
                    extraClasses: ['col-xs-5', 'text-right', 'top-margin-xs'],
                    template: Handlebars.compile('<span class="btn btn-icon top-padding-no" data-toggle="tooltip" data-placement="auto" tooltip-data-key="Placeholder" data-original-title="Placeholder" title="{{stateDescription}}"><i class="fa fa-info-circle font-size-16"></i></span><span class="sr-only">{{stateDescription}}</span><h5 class="text-uppercase font-size-16 inline-display">{{state}}<br/><small class="font-size-12 color-pure-black text-uppercase"><strong>{{subState}}</strong></small></h5>')
                }]
            }, {
                control: 'container',
                extraClasses: ['row'],
                items: [{
                    control: 'container',
                    extraClasses: 'col-xs-12',
                    template: Handlebars.compile('<h5 class="bottom-border-grey bottom-margin-sm">Lab Details</h5>{{formatNewLine detail}}<p><strong>Notification Date: {{notificationDate}}</strong></p>')
                }]
            }]
        }, {
            control: 'container',
            extraClasses: ['all-padding-md', 'background-color-primary-light'],
            items: [{
                control: 'container',
                extraClasses: ['row'],
                items: [{
                    control: 'container',
                    extraClasses: ['col-xs-12', 'patient-contact-instruction'],
                    template: Handlebars.compile("<p class='top-margin-sm'><strong>Instructions:</strong></p><p>Lab sample has not been collected within the requested timeframe.</p><p>Follow up accordingly.</p>")
                }]
            }, {
                control: 'container',
                extraClasses: ['row'],
                items: [{
                    control: 'container',
                    extraClasses: ['col-xs-12', 'lab-contact-instruction'],
                    hidden: true,
                    template: Handlebars.compile("<p class='top-margin-sm'><strong>Instructions:</strong></p><p>It appears that the specimen has been received by the lab, but the lab results have not been returned within the desired timeframe.</p><p>Follow up accordingly.</p>")
                }]
            }, {
                control: 'container',
                extraClasses: ['row'],
                items: [{
                    control: 'select',
                    extraClasses: ['col-xs-12', 'action-options'],
                    name: 'action',
                    label: 'Action',
                    required: true,
                    pickList: [{
                        value: 'Remind Me Later',
                        label: 'Remind Me Later'
                    }, {
                        value: 'Reassign Reminder',
                        label: 'Reassign Reminder'
                    }, {
                        value: 'Cancel Reminder',
                        label: 'Cancel Reminder'
                    }]
                }]
            }, {
                control: 'container',
                extraClasses: ['row'],
                items: [{
                    control: 'datepicker',
                    extraClasses: ['col-xs-6', 'notification-datepicker'],
                    required: true,
                    disabled: false,
                    name: 'notificationDate',
                    label: 'Notification Date',
                    startDate: '0d',
                    title: 'Enter in a date in the following format: MM/DD/YYYY'
                }]
            }, {
                control: 'assignTo',
                name: 'assignment',
                hidden: true,
                required: false,
                options: {
                    "me": false
                },
                extraClasses: ['bottom-padding-sm']
            }, {
                control: 'container',
                extraClasses: ['row'],
                items: [{
                    control: 'textarea',
                    extraClasses: 'col-xs-12',
                    name: 'comment',
                    label: 'Comment',
                    title: 'Enter in a comment',
                    required: true,
                    rows: 5
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
                extraClasses: ["col-xs-12", "left-padding-sm", "bottom-padding-xs"],
                items: [{
                    control: 'container',
                    extraClasses: ["text-left inProgressContainer"],
                    hidden: true,
                    template: Handlebars.compile('<i class="fa fa-spinner fa-spin pull-left"></i> {{inProgressMessage}}'),
                    modelListeners: ["inProgressMessage"]

                }]
            }, {
                control: 'container',
                extraClasses: 'col-xs-12',
                items: [{
                    control: 'button',
                    extraClasses: ['btn-default', 'btn-sm'],
                    id: 'modal-cancel-button',
                    label: 'Cancel',
                    type: 'button'
                }, {
                    control: 'button',
                    extraClasses: ['btn-primary', 'btn-sm'],
                    id: 'requestAcceptButton',
                    label: 'Accept',
                    name: 'acceptButton',
                    type: 'submit',
                    disabled: true,
                }]
            }]
        }]
    }];
    return FormFields;
});
