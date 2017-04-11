define([
    'backbone',
    'puppetForm',
    'handlebars'
], function(Backbone, PuppetForm, Handlebars) {
    'use strict';

    var AlertBannerControlPrototype = {
        attributes: {
            "class": "control",
            "aria-live": "assertive"
        },
        requiredFields: ['name'],
        template: Handlebars.compile([
            '{{#if value}}',
            '<div class="alert alert-{{#if type}}{{type}}{{else}}info{{/if}}' +
            '{{#if dismissible}} alert-dismissible{{/if}}' +
            ' alert-user all-margin-no top-margin-sm bottom-margin-sm">' +
            '{{#if dismissible}}' +
            '<button type="button" class="close" title="Press enter to close this alert.">',
            '<span aria-hidden="true">&times;</span>',
            '</button>' +
            '{{/if}}',
            '<div class="alert-content">',
                '{{#if icon}}<p><strong>{{else}}{{#if title}}<p><strong>{{/if}}{{/if}}' +
                '{{#if icon}}' +
                    '<i class="fa {{icon}}"></i>' +
                '{{/if}}' +
                '{{#if title}} {{title}}{{/if}}' +
                '{{#if icon}}{{#if title}}</strong></p>{{#if value}}<p>{{value}}</p>{{/if}}{{else}}</strong> {{value}}</p>{{/if}}{{else}}{{#if title}}</strong></p>{{/if}}{{#if value}}<p>{{value}}</p>{{/if}}{{/if}}' +
            '</div>',
            '</div>' +
            '{{/if}}'
        ].join('\n')),
        events: {
            'click button.close': function(e) {
                e.preventDefault();
                this.model.unset(this.field.get('name'));
            },
            'control:message': function(e, messageString) {
                e.preventDefault();
                e.stopPropagation();
                if (_.isString(messageString)) {
                    this.model.set(this.field.get('name'), messageString);
                }
            },
            'control:title': function(e, titleString) {
                e.preventDefault();
                this.setStringFieldOption('title', titleString, e);
            },
            'control:type': function(e, typeString) {
                e.preventDefault();
                this.setStringFieldOption('type', typeString, e);
            },
            'control:icon': function(e, iconString) {
                e.preventDefault();
                this.setStringFieldOption('icon', iconString, e);
            },
            'control:dismissible': function(e, dismissibleBool) {
                e.preventDefault();
                this.setBooleanFieldOption('dismissible', dismissibleBool, e);
            }
        }
    };

    var AlertBannerControl = PuppetForm.AlertBannerControl = PuppetForm.Control.extend(
        AlertBannerControlPrototype
    );

    return AlertBannerControl;
});
