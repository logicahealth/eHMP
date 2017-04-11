define([
    'handlebars',
    'app/applets/orders/writeback/common/assignmentType/assignmentTypeFields'
], function(Handlebars, AssignmentTypeFields) {
    'use strict';

    var bodyContents = [];
    _.each(AssignmentTypeFields, function(field) {
        bodyContents.push(field);
    });

    var FormFields = [{
        control: 'container',
        extraClasses: ['modal-body', 'top-padding-no'],
        items: [{
            control: 'container',
            extraClasses: ['sub-tray-container', 'bottom-border-grey-light', 'all-padding-sm', 'left-padding-no'],
            items: [{
                control: 'container',
                extraClasses: 'row',
                items: [{
                    control: 'alertBanner',
                    extraClasses: ['col-xs-12'],
                    name: 'lab-error-message',
                    title: 'Unable to Submit',
                    type: 'danger',
                    hidden: true,
                    dismissible: false
                }, {
                    control: 'container',
                    extraClasses: 'col-xs-12',
                    items: [{
                        control: 'button',
                        extraClasses: ['btn-primary', 'btn-xs', 'left-margin-sm'],
                        id: 'activityDetails',
                        label: 'Activity Details',
                        type: 'button',
                        title: 'Press enter to view activity details'
                    }]
                }]
            }]
        }, {
            control: 'container',
            extraClasses: ['all-padding-sm', 'background-color-pure-white'],
            items: [{
                control: 'container',
                extraClasses: ['row'],
                items: [{
                    control: 'container',
                    extraClasses: ['col-xs-8'],
                    template: Handlebars.compile('<h5 class="font-size-16">{{taskDescription}}</h5>')
                }, {
                    control: 'container',
                    extraClasses: ['col-xs-4', 'text-right', 'top-margin-lg'],
                    template: Handlebars.compile('<span class="btn btn-icon top-padding-xs" data-toggle="tooltip" data-placement="auto" tooltip-data-key="Placeholder" data-original-title="Placeholder" title="{{stateDescription}}"><i class="fa fa-info-circle font-size-16 right-padding-xs"></i></span><span class="sr-only">{{stateDescription}}</span><h5 class="text-uppercase font-size-16 inline-display">{{state}}<br/><small>{{subState}}</small></h5>')
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
            extraClasses: ['all-padding-sm', 'background-color-primary-light'],
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
                    startDate: moment().format('MM/DD/YYYY'),
                    title: 'Enter in a date in the following format: MM/DD/YYYY'
                }]
            }, {
                control: 'container',
                extraClasses: ['row'],
                items: [{
                    control: 'container',
                    extraClasses: ['col-xs-12', 'assign-to-container'],
                    hidden: true,
                    items: bodyContents
                }]
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
                extraClasses: 'col-xs-12',
                items: [{
                    control: 'button',
                    extraClasses: ['btn-default', 'btn-sm'],
                    id: 'modal-cancel-button',
                    label: 'Cancel',
                    title: 'Press enter to cancel',
                    type: 'button'
                }, {
                    control: 'button',
                    extraClasses: ['btn-primary', 'btn-sm'],
                    id: 'requestAcceptButton',
                    label: 'Accept',
                    name: 'acceptButton',
                    type: 'submit',
                    disabled: true,
                    title: 'Press enter to accept'
                }]
            }]
        }]
    }];
    return FormFields;
});