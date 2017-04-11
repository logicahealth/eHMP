define([
    'app/applets/orders/writeback/common/assignmentType/assignmentTypeFields'
], function(AssignmentTypeFields) {
    'use strict';

    var bodyContents = [{
        control: 'container',
        extraClasses: ['row', 'top-padding-lg', 'bottom-padding-lg'],
        items: [{
            control: 'container',
            extraClasses: ['col-xs-8'],
            template: '<h5 class="font-size-16">Request</h5>'
        }, {
            control: 'container',
            extraClasses: ['col-xs-4', 'text-right', 'top-margin-xs'],
            items: [{
                control: 'container',
                tagName: 'span',
                template: '<span class="btn btn-icon top-padding-no" data-toggle="tooltip" title="Use this activity to request other providers or yourself to complete a patient specific task at any time now or in the future."><i class="fa fa-info-circle font-size-16"/></span><span class="sr-only">Use this activity to request other providers or yourself to complete a patient specific task at any time now or in the future.</span>'
            }, {
                control: 'container',
                tagName: 'h4',
                extraClasses: ['inline-display', 'all-padding-no', 'all-margin-no', 'text-capitalize', 'color-pure-black'],
                template: '{{formStatus}}',
                modelListeners: ['formStatus']
            }]
        },{
            control: 'container',
            extraClasses: ['col-xs-8']
        }, {
            control: 'container',
            extraClasses: ['col-xs-4', 'text-right'],
            items: [{
                control: 'container',
                extraClasses: ['inline-display', 'all-padding-no', 'all-margin-no'],
                template: '{{#if formStatusDescription}}<h5>{{formStatusDescription}}</h5>{{/if}}',
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
            startDate: moment(),
            label: 'Earliest Date',
            title: 'Enter the earliest date for the request in the following format, MM/DD/YYYY',
            outputFormat: 'MM/DD/YYYY'
        }, {
            control: 'datepicker',
            extraClasses: ['col-xs-6'],
            name: 'latest',
            required: true,
            startDate: moment(),
            label: 'Latest Date',
            title: 'Enter the latest date for the request in the following format, MM/DD/YYYY',
            outputFormat: 'MM/DD/YYYY'
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

    _.each(AssignmentTypeFields, function(field) {
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
            maxlength: 200
        }]
    });

    var requestFields = [{
        control: 'container',
        extraClasses: ['modal-body', 'top-padding-no'],
        items: [{
            control: 'container',
            extraClasses: ['all-padding-md', 'top-padding-xs', 'bottom-padding-md', 'bottom-border-grey-light', 'activityDetailsContainer'],
            items: {
                control: 'button',
                extraClasses: ['btn-primary'],
                id: 'activityDetails',
                label: 'Activity Details',
                type: 'button',
                title: 'Press enter for activity details'
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
                extraClasses: ['col-xs-12'],
                items: [{
                    control: 'button',
                    extraClasses: ['btn-danger', 'btn-sm', 'pull-left'],
                    id: 'requestDeleteButton',
                    label: 'Delete',
                    type: 'button',
                    title: 'Press enter to delete'
                }, {
                    control: 'button',
                    extraClasses: ['btn-default', 'btn-sm'],
                    id: 'requestCancelButton',
                    label: 'Cancel',
                    type: 'button',
                    title: 'Press enter to cancel'
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
