define([
    'backbone',
    'puppetForm',
    'handlebars',
    'main/adk_utils/dateUtils',
    'moment',
    'underscore',
    'jquery',
    'jquery.inputmask'
], function(Backbone, PuppetForm, Handlebars, DateUtils, Moment, _, $, InputMask) {
    'use strict';

    var TimepickerControl = PuppetForm.TimepickerControl = PuppetForm.DefaultInputControl.extend({
        defaults: {
            type: 'text',
            label: '',
            options: {
                showMeridian: false,
                minuteStep: 5,
                explicitMode: true,
                defaultTime: 'current'
            },
            extraClasses: [],
            helpMessage: ''
        },
        template: Handlebars.compile([
            '{{ui-form-label (add-required-indicator label required) forID=(clean-for-id name) classes=(is-sr-only-label srOnlyLabel)}}',
            '<div class="input-group bootstrap-timepicker">',
            '<span class="input-group-addon" aria-hidden="true"><i class="fa fa-clock-o color-primary"></i></span>',
            '<input type="{{type}}" id="{{clean-for-id name}}" name="{{name}}" value="{{value}}"' +
            ' class="{{PuppetForm "controlClassName"}}"' +
            ' placeholder="HH:MM"' +
            '{{#if title}} title="{{title}}"{{/if}}' +
            '{{#if disabled}} disabled{{/if}}' +
            '{{#if required}} required{{/if}}' +
            '{{#if readonly}} readonly{{/if}}/>',
            '</div>',
            '{{#if helpMessage}} <span {{#if (has-puppetForm-prop "helpMessageClassName")}}class="{{PuppetForm "helpMessageClassName"}}"{{/if}}>{{helpMessage}}</span>{{/if}}'
        ].join("\n")),
        getFormattedValue: function() {
            var field = _.defaultsDeep(this.field.toJSON(), this.defaults),
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
            'change input': function(event) {
                var newVal = this.getValueFromDOM();
                if (this.currVal === newVal) {
                    event.stopPropagation();
                } else {
                    this.currVal = newVal;
                    PuppetForm.DefaultInputControl.prototype.onChange.call(this, event);
                    this.onUserInput.apply(this, arguments);
                }
            }
        }, PuppetForm.DefaultInputControl.prototype.events),
        onRender: function() {
            PuppetForm.DefaultInputControl.prototype.onRender.apply(this, arguments);
            var customOptions = _.defaultsDeep({}, this.field.get('options'), this.defaults.options);
            var formattedValue = this.getFormattedValue();
            this.currVal = formattedValue;
            var $input = this.$('input');
            $input.timepicker(customOptions);

            if (!_.isEmpty(formattedValue)) {
                $input.timepicker('setTime', formattedValue);
            }

            this.currVal = this.getValueFromDOM();
            return this;
        },
        getValueFromDOM: function() {
            var fieldName = this.field.get('name');

            if (this.field.get('prependToDomId')) {
                fieldName = this.field.get('prependToDomId') + fieldName;
            }
            var timeValue = this.$el.find('#' + fieldName).val();

            if (!_.isEmpty(timeValue) && timeValue.length === 4) {
                timeValue = '0' + timeValue;
            }

            return timeValue;
        },
        onBeforeDestroy: function() {
            this.$('input').timepicker('remove');
        }
    });

    return TimepickerControl;
});