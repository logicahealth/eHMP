define([
    'handlebars'
], function (Handlebars) {
    'use strict';

    return [{
        control: 'container',
        extraClasses: ['modal-body', 'bottom-padding-no'],
        items: [{
            control: 'container',
            extraClasses: ['container-fluid'],
            items: [{
                control: 'container',
                extraClasses: ['row'],
                items: [{
                    control: 'alertBanner',
                    name: 'error-message',
                    title: 'Error Saving Note',
                    extraClasses: ['col-xs-12'],
                    type: 'danger',
                    dismissible: false
                }]
            }, {
                control: 'container',
                template: Handlebars.compile('<div class="col-xs-12"><h5 class="top-padding-no">Lab Test</h5><p class="bottom-margin-no">{{typeName}}</p></div>'),
                extraClasses: ['row', 'bottom-padding-sm']
            }, {
                control: 'container',
                extraClasses: ['row', 'background-color-primary-lightest', 'top-padding-sm'],
                items: [{
                    control: 'select',
                    extraClasses: ['col-xs-6'],
                    label: 'Problem Relationship',
                    name: 'problemRelationship',
                    pickList: [],
                    disabled: true
                }]
            }, {
                control: 'container',
                template: Handlebars.compile('<div class="col-xs-12"><h5>Note Object Preview</h5><p>{{notePreview}}</p></div>'),
                extraClasses: ['row', 'background-color-primary-lightest', 'top-padding-sm']
            }, {
                control: 'container',
                extraClasses: ['row', 'background-color-primary-lightest', 'bottom-padding-xs'],
                items: [{
                    control: 'textarea',
                    extraClasses: ['col-xs-12'],
                    label: 'Annotation',
                    title: 'Begin typing to enter additional note object',
                    srOnlyLabel: true,
                    name: 'annotation',
                    placeholder: 'Enter additional note object text',
                    rows: 3
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
                    extraClasses: ['btn-primary', 'btn-sm'],
                    label: 'Cancel',
                    type: 'button',
                    name: 'closeModal'
                }, {
                    control: 'button',
                    extraClasses: ['btn-primary', 'btn-sm'],
                    type: 'submit',
                    label: 'Accept',
                    name: 'accept',
                    disabled: true
                }]
            }]
        }]
    }];
});