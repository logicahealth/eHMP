define([
    'backbone',
    'puppetForm',
    'handlebars',
    'main/adk_utils/dateUtils',
    'underscore',
    'jquery',
    'jquery.inputmask'
], function(Backbone, PuppetForm, Handlebars, DateUtils,_, $, InputMask) {
    'use strict';

    var TimepickerControl = PuppetForm.TimepickerControl = PuppetForm.DefaultInputControl.extend({
        defaults: {
            type: 'text',
            label: '',
            options: {
                showMeridian: false,
                defaultTime: 'current',
                minuteStep: 5
            },
            extraClasses: [],
            helpMessage: ''
        },
        template: Handlebars.compile([
            '{{ui-form-label (add-required-indicator label required) forID=(clean-for-id name) classes=(is-sr-only-label srOnlyLabel)}}',
            '<div class="input-group bootstrap-timepicker">',
                '<span class="input-group-addon border-top-left-radius" aria-hidden="true"><i class="fa fa-clock-o color-primary"></i></span>',
                '<input type="{{type}}" id="{{clean-for-id name}}" name="{{name}}" value="{{value}}"' +
                    ' class="{{PuppetForm "controlClassName"}}"' +
                    ' placeholder="HH:MM"' +
                    '{{#if title}} title="{{title}}"{{/if}}' +
                    //'{{#if placeholder}} placeholder="{{placeholder}}"{{/if}}' +
                    '{{#if disabled}} disabled{{/if}}' +
                    '{{#if required}} required{{/if}}' +
                    '{{#if readonly}} readonly{{/if}}/>',
            '</div>',
            '{{#if helpMessage}} <span {{#if (has-puppetForm-prop "helpMessageClassName")}}class="{{PuppetForm "helpMessageClassName"}}"{{/if}}>{{helpMessage}}</span>{{/if}}'
        ].join("\n")),
        getFormattedValue: function() {
            var field = _.defaults(this.field.toJSON(), this.defaults),
                attributes = this.model.toJSON(),
                attrArr = field.name.split('.'),
                name = attrArr.shift(),
                path = attrArr.join('.'),
                rawValue = this.keyPathAccessor(attributes[name], path);
            return this.formatter.fromRaw(rawValue, this.model);
        },
        events: _.defaults({
            //Events to be Triggered By User
            'control:required': function(event, booleanValue) {
                this.setBooleanFieldOption('required', booleanValue, event);
            },
            'control:disabled': function(event, booleanValue) {
                this.setBooleanFieldOption('disabled', booleanValue, event);
            },
            'control:title': function(event, stringValue) {
                this.setStringFieldOption('title', stringValue, event);
            },
            'control:placeholder': function(event, stringValue) {
                this.setStringFieldOption('placeholder', stringValue, event);
            },
            'control:helpMessage': function(event, stringValue) {
                this.setStringFieldOption('helpMessage', stringValue, event);
            },
            'change input': function (event) {
                var newVal = this.getValueFromDOM();
                if (this.currVal === newVal) {
                    event.stopPropagation();
                } else {
                    this.currVal = newVal;
                    PuppetForm.DefaultInputControl.prototype.onChange.call(this, event);
                }
            }
        }, PuppetForm.DefaultInputControl.prototype.events),
        onRender: function() {
            PuppetForm.DefaultInputControl.prototype.onRender.apply(this, arguments);

            var customOptions = this.field.get('options') || {};
            customOptions = _.defaults(customOptions, this.defaults.options);

            var formattedValue = this.getFormattedValue();
            formattedValue || (customOptions.setTime = formattedValue);
            this.currVal = formattedValue;

            this.$('input').inputmask('h:s', {
                placeholder: 'HH:MM',
                showMaskOnHover: false,
                disableSmartFocus: true
            });
            this.$('input').timepicker(customOptions);
            this.currVal = this.getValueFromDOM();
            return this;
        },
        getValueFromDOM: function() {
            return this.$el.find('#' + this.field.get('name')).val();
        }
    });

    return TimepickerControl;
});