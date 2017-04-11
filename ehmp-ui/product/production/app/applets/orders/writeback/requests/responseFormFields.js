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
            extraClasses: ['container-fluid'],
            items: [{
                control: 'container',
                extraClasses: ['row', 'bottom-padding-sm'],
                items: [{
                    control: 'container',
                    extraClasses: ['col-xs-12', 'background-color-primary-light-alt', 'top-padding-sm', 'bottom-padding-sm'],
                    items: [{
                        control: 'button',
                        extraClasses: ['btn-primary', 'btn-sm'],
                        id: 'activityDetails',
                        label: 'Activity Details',
                        type: 'button',
                        title: 'Press enter for activity details'
                    }]
                }]
            }, {
                control: 'container',
                extraClasses: ['row', 'bottom-padding-no'],
                items: [{
                    control: 'container',
                    extraClasses: ['col-xs-8'],
                    items: [{
                        control: 'container',
                        tagName: 'h5',
                        extraClasses: ['font-size-16'],
                        template: '{{displayName}}',
                        modelListeners: ['displayName']
                    }]
                }, {
                    control: 'container',
                    extraClasses: ['col-xs-4', 'text-right'],
                    items: [{
                        control: 'container',
                        tagName: 'span',
                        template: '<span class="btn btn-icon" data-toggle="tooltip" title="Use this activity to request other providers or yourself to complete a patient specific task at any time now or in the future."><i class="fa fa-info-circle font-size-16"/></span><span class="sr-only">Use this activity to request other providers or yourself to complete a patient specific task at any time now or in the future.</span>'
                    }, {
                        control: 'container',
                        tagName: 'h5',
                        extraClasses: ['text-uppercase', 'font-size-16', 'inline-display'],
                        template: '{{ehmpState}}<br /><span><small class="color-pure-black"><strong>{{subState}}</strong></small></span>',
                        modelListeners: ['ehmpState', 'subState']
                    }]
                }]
            }, {
                control: 'container',
                extraClasses: ['row', 'bottom-padding-sm'],
                items: [{
                    control: 'container',
                    extraClasses: ['col-xs-12', 'top-margin-md'],
                    items: [{
                        control: 'container',
                        extraClasses: ['inline-display', 'all-padding-no', 'all-margin-no'],
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
                        template: 'Requested by'
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
                        template: 'Earliest Date'
                    }]
                }, {
                    control: 'container',
                    extraClasses: ['col-xs-6'],
                    items: [{
                        control: 'container',
                        extraClasses: ['inline-display', 'all-padding-no', 'all-margin-no'],
                        tagName: 'h6',
                        template: 'Latest Date'
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
                        template: 'Request'
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
            }, {
                control: 'container',
                extraClasses: ['row', 'bottom-padding-sm'],
                items: [{
                    control: 'container',
                    extraClasses: ['col-xs-12'],
                    items: [{
                        control: 'container',
                        tagName: 'hr'
                    }, {
                        control: 'select',
                        extraClasses: ['action-options'],
                        name: 'action',
                        label: 'Action',
                        required: true,
                        pickList: [{
                            value: 'Mark as Complete',
                            label: 'Mark as Complete'
                        }, {
                            value: 'Return for Clarification',
                            label: 'Return for Clarification'
                        }, {
                            value: 'Decline',
                            label: 'Decline'
                        }, {
                            value: 'Reassign',
                            label: 'Reassign'
                        }]
                    }]
                }]
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
                extraClasses: ['col-xs-12'],
                items: [{
                    control: 'button',
                    extraClasses: ['btn-default', 'btn-sm'],
                    id: 'responseCancelButton',
                    label: 'Cancel',
                    title: 'Press enter to cancel',
                    type: 'button'
                }, {
                    control: 'button',
                    extraClasses: ['btn-primary', 'btn-sm'],
                    id: 'responseAcceptButton',
                    label: 'Accept',
                    title: 'Press enter to accept',
                    type: 'button'
                }]
            }]
        }]
    }];

    return FormFields;
});
