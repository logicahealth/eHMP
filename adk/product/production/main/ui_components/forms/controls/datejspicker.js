define([
    'backbone',
    'puppetForm',
    'handlebars',
    'main/adk_utils/dateUtils',
    'underscore',
    'jquery',
    'jquery.inputmask',
    'bootstrap-datepicker',
    'datejs'
], function(Backbone, PuppetForm, Handlebars, DateUtils,_, $, InputMask, DatePicker, DateJs) {
    'use strict';

    var DatejspickerControl = PuppetForm.DatejspickerControl = PuppetForm.DefaultInputControl.extend({
        defaults: {
            type: 'text',
            label: '',
            options: {
                todayBtn: 'linked',
                orientation: 'top right',
                autoclose: true,
                todayHighlight: true,
                showOnFocus: false,
                endDate: '12/31/2099',
                inputmask: '',
                forceParse: false,
                keyboardNavigation: false
            },
            extraClasses: [],
            helpMessage: '',
            title: 'Enter date in text or numerical format.'
        },
        template: Handlebars.compile([
            '{{ui-form-label (add-required-indicator label required) forID=(clean-for-id name) classes=(is-sr-only-label srOnlyLabel)}}',
            '{{#if instructions}} <p class="help-block">{{instructions}}</p>{{/if}}',
            '<div id="{{clean-for-id name}}-calendar-container" class="input-group date">',
                '<input data-toggle="tooltip" data-placement="top" data-trigger="focus" type="{{type}}" id="{{clean-for-id name}}" name="{{name}}" maxlength="{{maxlength}}" value="{{value}}"' +
                    ' class="{{PuppetForm "controlClassName"}}"' +
                    ' id="{{clean-for-id name}}" name="{{name}}" value="{{value}}"' +
                    '{{#if title}} title="{{title}}"{{/if}}' +
                    '{{#if disabled}} disabled{{/if}}' +
                    '{{#if required}} required{{/if}}' +
                    '{{#if readonly}} readonly{{/if}}/>',
                '<span class="input-group-addon" aria-hidden="true" for="{{clean-for-id name}}"><i class="fa fa-calendar color-primary"></i></span>',
            '</div>',
            '{{#if helpMessage}} <span {{#if (has-puppetForm-prop "helpMessageClassName")}}class="{{PuppetForm "helpMessageClassName"}}"{{/if}}>{{helpMessage}}</span>{{/if}}'
        ].join("\n")),
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
                'click .input-group-addon': function (event) {
                    this.$('input').datepicker('show');
                },
                'click input': function (event) {
                    this.$('input').datepicker('hide');
                },
                'changeDate': function (event) {
                    this.updateToolTip();
                },
                'keyup input': function (event) {
                    this.updateToolTip();
                },
                'change input': function (event) {
                    var newVal = this.getValueFromDOM();
                    if (this.currVal === newVal) {
                        event.stopPropagation();
                    } else {
                        this.currVal = newVal;
                        this.onChange(event);
                    }

                    this.$('input').val(this.currVal);
                }
            },
            PuppetForm.Control.prototype.events),
        onRender: function() {
            PuppetForm.DefaultInputControl.prototype.onRender.apply(this, arguments);

            var customOptions = this.field.get('options') || {};

            if (this.field.get('prependToDomId')){
                customOptions.container = '#' + this.field.get('prependToDomId') + this.field.get('name') + '-calendar-container';
            } else {
                customOptions.container = '#' + this.field.get('name') + '-calendar-container';
            }

            customOptions = _.defaults(customOptions, this.defaults.options);

            //var self = this;
            //var eventOptions = [
            //    {
            //        type: 'show',
            //        handler: function(e) {
            //            var calendarIconWidth = self.$('.input-group-addon').css('width');
            //            console.log('calendarIconWidth', calendarIconWidth);
            //            self.$('div.datepicker').css('left', calendarIconWidth);
            //        }
            //    }
            //];
            //DateUtils.datepicker(this.$('input'), customOptions, eventOptions);

            DateUtils.datepicker(this.$('input'), customOptions);

            this.currVal = this.getValueFromDOM();

            return this;
        },
        getValueFromDOM: function() {
            var value = this.$('input').val();
            return this.convertDate(value);
        },
        updateToolTip: function() {
            var target = this.$('input');
            var targetValue = target.val();
            var targetDate = new Date.parse(targetValue);

            if (!isNaN(targetDate)) {
                //  d3 = d3.toString("dddd, MMMM d, yyyy");
                targetDate = this.convertDate(targetValue);
                target.attr('title', targetDate).tooltip().tooltip('fixTitle').tooltip('show');
            } else {
                //target.parent().addClass('has-error');
                target.tooltip('destroy');
            }
        },
        convertDate: function(rawString) {
            //  Converts the input naively as such
            //  3 terms present is mm/dd/yyyy
            //  2 terms present is mm/yyyy
            //  1 term present is yyyy
            //  Currently supports today, tomorrow, yesterday, next, last, now, n, t, and +-
            rawString = rawString.toLowerCase();

            var oldDate = new Date.parse(rawString);
            if (isNaN(oldDate)) {
                return null;
            }

            var strArray = rawString.split("/");
            var regex;
            if (strArray.length == 1) {
                strArray = rawString.split(" ");
            }
            if (strArray.length == 1) {
                strArray = rawString.split(".");
            }
            if (strArray.length == 1) {
                strArray = rawString.split("-");
            }
            if (strArray.length == 1) {
                strArray = rawString.split(",");
            }
            if (strArray.length == 1) {
                strArray = rawString.split("+");
                if (strArray.length > 1) {
                    return oldDate.toString("MM/dd/yyyy");
                }
            }
            if (strArray.length == 1) {
                strArray = rawString.split("-");
                if (strArray.length > 1) {
                    return oldDate.toString("MM/dd/yyyy");
                }
            }

            regex = new RegExp("^t(?:oday)?$|^tomorrow$|^yesterday$|^next$|^last$|^n(?:ow)?$|^y(?:ear)?$|^m(?:onth)?$|^d(?:ay)?$|^w(?:eek)?$|"+
                "^s(?:u)?(?:n)?(?:d)?(?:ay)?$|^mo(?:n)?(?:d)?(?:ay)?$|^t(?:u)?(?:e)?(?:s)?(?:d)?(?:ay)?$|^w(?:e)?(?:d)?(?:n)?(?:esday)?$|"+
                "^t(?:h)?(?:u)?(?:r)?(?:s)?(?:d)?(?:ay)?$|^f(?:r)?(?:i)?(?:d)?(?:ay)?$|^s(?:a)?(?:t)?(?:urday)?$", "i");
            if (regex.test(strArray[0])) {
                return oldDate.toString("MM/dd/yyyy");
            }

            regex = new RegExp("^jan(?:uary)?$|^feb(?:ruary)?$|^mar(?:ch)?$|^apr(?:il)?$|^may$|^jun(?:e)?$|"+
                "^jul(?:y)?$|^aug(?:ust)?$|^sep(?:tember)?$|^oct(?:ober)?$|^nov(?:ember)?$|^dec(?:ember)?$", "i");
            if (regex.test(strArray[0]) && strArray.length == 1) {
                return oldDate.toString("MM/yyyy");
            }

            if (strArray.length == 3) {
                return oldDate.toString("MM/dd/yyyy");
            } else if (strArray.length == 2) {
                return oldDate.toString("MM/yyyy");
            } else if (strArray.length == 1) {
                return oldDate.toString("yyyy");
            } else {
                return oldDate;
            }
        }
    });

    return DatejspickerControl;
});