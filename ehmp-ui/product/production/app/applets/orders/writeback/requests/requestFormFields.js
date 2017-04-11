define([
    'moment',
    'app/applets/orders/writeback/common/assignmentType/assignmentTypeFields'
], function(moment, AssignmentTypeFields) {
    'use strict';

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

    var bodyContents = [errorMessageContainer, {
        control: 'container',
        extraClasses: ['row', 'top-padding-md', 'bottom-padding-lg'],
        items: [{
            control: 'container',
            extraClasses: ['col-xs-7'],
            template: '<h5 class="font-size-16">Request</h5>'
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
                extraClasses: ['inline-display', 'all-padding-no', 'all-margin-no', 'text-uppercase', 'color-pure-black', 'font-size-16'],
                template: '{{formStatus}}',
                modelListeners: ['formStatus']
            }, {
                control: 'container',
                extraClasses: ['inline-display', 'all-padding-no', 'all-margin-no'],
                template: '{{#if formStatusDescription}}<br /><small class="font-size-12 color-pure-black text-uppercase"><strong>{{formStatusDescription}}</strong></small>{{/if}}',
                modelListeners: ['formStatusDescription']
            }]
        }]
    }, {
        control: 'container',
        extraClasses: ['row', 'bottom-padding-sm'],
        items: [{
            control: 'select',
            extraClasses: ['col-xs-12'],
            name: 'urgency',
            required: true,
            label: 'Urgency',
            title: 'Use up and down arrows to view options and then press enter to select',
            pickList: [{
                label: 'Routine',
                value: 'routine',
            }, {
                label: 'Urgent',
                value: 'urgent',
            }]
        }]
    }, {
        control: 'container',
        extraClasses: ['row', 'bottom-padding-sm'],
        items: [{
            control: 'datepicker',
            extraClasses: ['col-xs-6'],
            name: 'earliest',
            required: true,
            startDate: '0d',
            flexible: true,
            minPrecision: 'day',
            label: 'Earliest date',
        }, {
            control: 'datepicker',
            extraClasses: ['col-xs-6'],
            name: 'latest',
            required: true,
            startDate: '0d',
            label: 'Latest date',
            flexible: true,
            minPrecision: 'day'
        }]
    }, {
        control: 'container',
        extraClasses: ['row', 'bottom-padding-sm'],
        items: [{
            control: 'input',
            extraClasses: ['col-xs-12'],
            name: 'title',
            required: true,
            label: 'Title',
            placeholder: 'Name your request',
            title: 'Enter a title for the request',
            maxlength: 140
        }]
    }];

    _.each(AssignmentTypeFields.getFields(), function(field) {
        bodyContents.push(field);
    });

    bodyContents.push({
        control: 'container',
        extraClasses: ['row', 'bottom-padding-sm'],
        items: [{
            control: 'textarea',
            extraClasses: ['col-xs-12'],
            name: 'requestDetails',
            label: 'Request',
            placeholder: 'Enter your request',
            title: 'Enter details for the request',
            maxlength: 200,
            rows: 4
        }]
    });

    var requestFields = [{
        control: 'container',
        extraClasses: ['modal-body', 'top-padding-no'],
        items: [{
            control: 'container',
            extraClasses: ['row', 'all-margin-no'],
            items: {
                control: 'container',
                extraClasses: ['col-xs-12', 'top-padding-sm', 'bottom-padding-sm', 'bottom-border-grey-light', 'activityDetailsContainer', 'background-color-primary-light-alt'],
                items: {
                    control: 'button',
                    extraClasses: ['btn-primary', 'btn-sm'],
                    id: 'activityDetails',
                    label: 'Activity details',
                    type: 'button',
                    title: 'Press enter for activity details'
                }
            }
        }, {
            control: 'container',
            extraClasses: ['container-fluid'],
            items: bodyContents
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
                    control: 'container',
                    extraClasses: ['flex-grow-loose', 'text-left'],
                    items: [{
                        control: 'popover',
                        behaviors: {
                            Confirmation: {
                                title: 'Delete Request',
                                eventToTrigger: 'request-add-confirm-delete',
                                message: 'Are you sure you want to delete?'
                            }
                        },
                        label: 'Delete',
                        name: 'requestAddConfirmDelete',
                        id: 'requestDeleteButton',
                        extraClasses: ['btn-default', 'btn-sm']
                    }]
                }, {
                    control: 'popover',
                    behaviors: {
                        Confirmation: {
                            title: 'Warning',
                            eventToTrigger: 'request-add-confirm-cancel'
                        }
                    },
                    label: 'Cancel',
                    name: 'requestAddConfirmCancel',
                    extraClasses: ['btn-default', 'btn-sm', 'right-margin-xs']
                }, {
                    control: 'button',
                    extraClasses: ['btn-primary', 'btn-sm'],
                    id: 'requestDraftButton',
                    label: 'Draft',
                    type: 'button',
                    title: 'Press enter to save as draft and close'
                }, {
                    control: 'button',
                    extraClasses: ['btn-primary', 'btn-sm'],
                    id: 'requestAcceptButton',
                    label: 'Accept',
                    type: 'button',
                    title: 'Press enter to accept'
                }]
            }]
        }]
    }];

    return requestFields;
});
