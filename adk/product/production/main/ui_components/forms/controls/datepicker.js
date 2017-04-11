define([
    'backbone',
    'puppetForm',
    'handlebars',
    'main/adk_utils/dateUtils',
    'underscore',
    'moment',
    'main/accessibility/components',
    'jquery',
    'jquery.inputmask',
    'bootstrap-datepicker',
    'datejs'
], function(Backbone, PuppetForm, Handlebars, DateUtils, _, Moment, Accessibility, $, InputMask, DatePicker, DateJs) {
    'use strict';
    var ACCEPTABLE_FORMATS = "<p class='text-left bottom-margin-no top-padding-xs left-padding-xs'><strong>Acceptable formats:</strong></p><hr class='top-margin-xs bottom-margin-xs left-margin-no right-margin-no'/><ul class='left-padding-md right-padding-no bottom-padding-xs'><li class='text-left'><span>MM/DD/YYYY (can be M/D/YY)</span></li></span></li><li class='text-left'><span>MM/YYYY (can be M/YYYY)</span></li><li class='text-left'><span>YYYY</span></li><li class='text-left'><span>MM/DD (assumes this year, can be M/D)</span></li><li class='text-left'><span>t</span></li><li class='text-left'><span>t+x or t-x (x = num. of days)</span></li><li class='text-left'><span>t+ym or t-ym (y = num. of months)</span></li><li class='text-left'><span>n (now)</span></li><li class='text-left'><span>yesterday<li class='text-left'><span>tomorrow</span></li></ul>";

    var CommonInputViewPrototype = _.defaults({
        template: Handlebars.compile([
            '{{ui-form-label (add-required-indicator label required) forID=(clean-for-id name) classes=(is-sr-only-label srOnlyLabel)}}',
            '<div class="input-group date calendar-container">',
            '<span class="input-group-addon{{#if disabled}} disabled{{/if}}" aria-hidden="true"><i class="fa fa-calendar color-primary"></i></span>',
            '<input type="{{type}}" id="{{clean-for-id name}}" name="{{name}}" maxlength="{{maxlength}}" value="{{value}}"' +
            ' class="{{PuppetForm "controlClassName"}} datepicker-input"' +
            ' id="{{clean-for-id name}}" name="{{name}}"{{#if maxlength}} maxlength="{{maxlength}}"{{/if}} value="{{value}}"' +
            '{{#if title}} title="{{title}}"{{/if}}' +
            '{{#if placeholder}} placeholder="{{placeholder}}"{{/if}}' +
            '{{#if disabled}} disabled{{/if}}' +
            '{{#if required}} required{{/if}}' +
            '{{#if readonly}} readonly{{/if}}/>',
            '</div>',
            '{{#if helpMessage}} <span {{#if (has-puppetForm-prop "helpMessageClassName")}}class="{{PuppetForm "helpMessageClassName"}}"{{/if}}>{{helpMessage}}</span>{{/if}}'
        ].join("\n")),
        ui: {
            'datepickerInput': 'input.datepicker-input'
        },
        internalModelEvents: {
            'change:startDate': function(fieldModel, newStartDate) {
                this.datepickerOptions.startDate = newStartDate;
                this.$('input.datepicker-input').datepicker('destroy');
                this.initializeDatepicker();
            },
            'change:endDate': function(fieldModel, newEndDate) {
                this.datepickerOptions.endDate = newEndDate;
                this.$('input.datepicker-input').datepicker('destroy');
                this.initializeDatepicker();
            }
        },
        initialize: function(options) {
            this.field = options.field;
            this._datepickerInternalModel = this.getOption('_datepickerInternalModel');
            this.defaults = options.defaults;

            this.datepickerOptions = {
                todayBtn: 'linked',
                orientation: 'auto bottom',
                autoclose: true,
                todayHighlight: true,
                showOnFocus: false,
                endDate: this._datepickerInternalModel.get('endDate'),
                startDate: this._datepickerInternalModel.get('startDate'),
                disableSmartFocus: true,
                showMaskOnHover: false,
                keyboardNavigation: false
            };
            Backbone.Marionette.bindEntityEvents(this, this._datepickerInternalModel, this.internalModelEvents);
        },
        onAttach: function() {
            var container = this.$el.closest('.workflow-container, .modal-content').first();
            if (!_.isEmpty(container)) {
                this.datepickerOptions.container = container[0];
            }
            this.initializeDatepicker();
            return this;
        },
        onDomRefresh: function() {
            this.initializeDatepicker();
        },
        initializeDatepicker: function() {
            DateUtils.datepicker(this.$('input.datepicker-input'), this.datepickerOptions);
        },
        keyPathAccessor: function(obj, path) {
            if (!obj) return undefined;
            var res = obj;
            path = path.split('.');
            for (var i = 0; i < path.length; i++) {
                if (_.isNull(res)) return null;
                if (_.isEmpty(path[i])) continue;
                if (!_.isUndefined(res[path[i]])) res = res[path[i]];
            }
            return res;
        },
        serializeModel: function(model) {
            var field = _.defaultsDeep(this.field.toJSON(), this.defaults);
            var attributes = model.toJSON();
            var attrArr = field.name.split('.');
            var name = attrArr.shift();
            var path = attrArr.join('.');
            var rawValue = this.keyPathAccessor(attributes[name], path);
            if (field.prependToDomId){
                field.name = field.prependToDomId + name;
                if (field.id){
                    field.id = field.prependToDomId + field.id;
                }
            }
            var data = _.defaults({
                rawValue: rawValue,
                value: rawValue,
                attributes: attributes,
                formatter: this.formatter
            }, field);
            return data;
        },
        getValueFromDOM: function() {
            var value = this.$el.find('input.datepicker-input').val();
            return value;
        }
    });

    var DefaultInputViewPrototype = _.defaults({
        events: {
            'change input': function(event) {
                var newVal = this.getValueFromDOM();
                this.currVal = this.currVal || this.model.get(this.field.get('name'));
                if ((_.isEmpty(newVal) && !_.isString(this.model.get(this.field.get('name')))) || (this.currVal === newVal && newVal === this.model.get(this.field.get('name')))) {
                    event.stopPropagation();
                } else {
                    this.currVal = newVal;
                    this.triggerMethod('input:default:change', event);
                }
            }
        },
    }, CommonInputViewPrototype);

    // yyyy - year only
    // mm/yyyy - month and year only
    // m/yyyy - month and year only
    // mm/dd/yyyy - date only
    // mm/dd/yy - date only
    // m/d/yyyy - date only
    // m/d/yy - date only
    // mm/dd - assumes within the last year
    // m/d - assumes within the last year
    // t - today
    // n - now
    // t-x where x is a number of days
    // t-ym where y is a number of months
    // yesterday
    // tomorrow

    var FlexibleInputViewPrototype = _.defaults({
        template: Handlebars.compile([
            '{{ui-form-label (add-required-indicator label required) forID=(clean-for-id name) classes=(is-sr-only-label srOnlyLabel)}}',
            '{{#unless srOnlyLabel}}' +
            '<button type="button" class="btn btn-icon all-padding-no left-margin-xs" data-toggle="tooltip" ' +
            'title="' + ACCEPTABLE_FORMATS + '">' +
            '<i class="fa fa-question-circle color-primary"></i><span class="sr-only">' + ACCEPTABLE_FORMATS + '</span></button>',
            '{{/unless}}',
            '<div class="input-group date calendar-container">',
            '<span class="input-group-addon{{#if disabled}} disabled{{/if}}" aria-hidden="true"' +
            '{{#if srOnlyLabel}} data-toggle="tooltip" title="' + ACCEPTABLE_FORMATS + '"{{/if}}' +
            '><i class="fa fa-calendar color-primary"></i></span>',
            '<input tabindex="-1" id="{{clean-for-id name}}-hidden" class="clone-input datepicker-input" aria-hidden="true"' +
            '{{#if disabled}} disabled{{/if}}' +
            ' name="{{name}}"{{#if maxlength}} maxlength="{{maxlength}}"{{/if}} value="{{value}}"/>',
            '<input type="{{type}}" id="{{clean-for-id name}}" name="{{name}}"{{#if maxlength}} maxlength="{{maxlength}}"{{/if}} value="{{value}}"' +
            ' class="{{PuppetForm "controlClassName"}} flexible-input"' +
            ' id="{{clean-for-id name}}" name="{{name}}" maxlength="{{maxlength}}" value="{{value}}"' +
            '{{#if title}} title="{{title}}"{{/if}}' +
            'placeholder="{{#if placeholder}}{{placeholder}}{{else}}MM/DD/YYYY{{/if}}"' +
            '{{#if disabled}} disabled{{/if}}' +
            '{{#if required}} required{{/if}}' +
            '{{#if readonly}} readonly{{/if}}/>',
            '</div>',
            '{{#if helpMessage}} <span {{#if (has-puppetForm-prop "helpMessageClassName")}}class="{{PuppetForm "helpMessageClassName"}}"{{/if}}>{{helpMessage}}</span>{{/if}}'
        ].join('\n')),
        ui: _.defaults({
            'flexibleInput': 'input.flexible-input',
            'helpTooltip': '[data-toggle="tooltip"]'
        }, CommonInputViewPrototype.ui),
        events: {
            'changeDate @ui.datepickerInput': function(event) {
                this.triggerMethod('flexible-date-selected', event, this.ui.datepickerInput.val());
            },
            'input @ui.flexibleInput': function(event) {
                clearTimeout(this._inputTimeout);
                this._inputTimeout = setTimeout(_.bind(function() {
                    this.onFlexibleInput();
                }, this), 250);
            },
            'change @ui.flexibleInput': function(event) {
                clearTimeout(this._inputTimeout);
                this.onFlexibleInput();
                var newVal = this.getValueFromDOM();
                if (this.currVal === newVal && newVal.length > 0 && newVal === this.model.get(this.field.get('name'))) {
                    event.stopPropagation();
                } else {
                    this.removeTooltip(this.ui.flexibleInput);
                    this.currVal = newVal;
                    this.triggerMethod('input:flexible:change', event);
                    if (!_.isNull(this.datepickerExternalModel.get('formattedDate'))) {
                        this.ui.datepickerInput.datepicker('update', this._flexibleInternalModel.get('parsedDate'));
                    } else {
                        this.ui.datepickerInput.datepicker('update', '');
                    }
                }
            },
            'change @ui.datepickerInput': function(e) {
                // need to stop this from bubbling up and causing errors when embedded
                // in other controls.
                e.stopPropagation();
            }
        },
        initialize: function(options) {
            CommonInputViewPrototype.initialize.apply(this, arguments);
            this._flexibleInternalModel = options._flexibleInternalModel;
            this.datepickerExternalModel = options.datepickerExternalModel;
            this.defaults = _.defaults({
                    title: 'Enter date in text or numerical format.'
                },
                this.defaults);
            this.datepickerOptions = _.defaults({
                    orientation: 'auto bottom',
                    inputmask: '',
                    forceParse: false,
                    keyboardNavigation: false
                },
                this.datepickerOptions);
        },
        onDomRefresh: function() {
            CommonInputViewPrototype.onDomRefresh.apply(this, arguments);
            this.initHelpTooltip();
        },
        onAttach: function() {
            CommonInputViewPrototype.onAttach.apply(this, arguments);
            this.initHelpTooltip();
        },
        initHelpTooltip: function() {
            var self = this;
            this.ui.helpTooltip.tooltip({
                placement: 'auto top',
                container: this.$el.closest('.modal-body, form'),
                html: true,
                template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner top-padding-xs left-padding-xs right-padding-xs"></div></div>',
                trigger: this.field.get('srOnlyLabel') ? 'hover' : 'hover focus',
                viewport: function($el) {
                    return $el.closest('.modal-body, form');
                }
            });
        },
        serializeModel: function(model) {
            var data = _.defaults({
                value: this.field.get('value') || model.get(this.field.get('name')) || this._flexibleInternalModel.get('parsedDate') || "",
                label: this.field.get('srOnlyLabel') ? this.field.get('label') + ". Acceptable formats: MM/DD/YYYY or M/D/YY, MM/YYYY or M/YYYY, YYYY, MM/DD or M/D, t, t+x or t-x where x = number of days, t+ym or t-ym where y = number of months, n, yesterday, and tomorrow" : this.field.get('label')
            }, CommonInputViewPrototype.serializeModel.apply(this, arguments));
            return data;
        },
        onFlexibleInput: function() {
            this.listenToOnce(this._flexibleInternalModel, 'change', function() {
                var parsedDate = this._flexibleInternalModel.get('parsedDate');
                var isOutOfRange = this._flexibleInternalModel.get('outOfRange');
                if (!_.isString(parsedDate) || (_.isString(parsedDate) && isOutOfRange)) {
                    var inputString = this._flexibleInternalModel.get('inputString');
                    if (_.isString(inputString) && inputString.length > 0 && !isOutOfRange && !_.isBoolean(parsedDate)) {
                        this.updateToolTip('Invalid Date');
                        this.announceParseChange('Invalid Date. Enter another date.');
                    } else if (isOutOfRange) {
                        this.updateToolTip('Date must be between ' + this._datepickerInternalModel.get('startDate') + ' - ' + this._datepickerInternalModel.get('endDate'));
                        this.announceParseChange('Date out of range. Date must be between ' + this._datepickerInternalModel.get('startDate') + ' - ' + this._datepickerInternalModel.get('endDate'));
                    } else if (_.isBoolean(parsedDate) && !parsedDate) {
                        this.updateToolTip('Invalid Date Format');
                        // might need to say what the acceptable formats are
                        this.announceParseChange('Invalid Date Format. Date must be in a format specified in the help button above.');
                    } else {
                        this.removeTooltip(this.ui.flexibleInput);
                    }
                } else {
                    this.updateToolTip(this._flexibleInternalModel.get('parsedDate'));
                    this.announceParseChange('Date converted to: ' + this._flexibleInternalModel.get('parsedDate'));
                }
            });
            this.triggerMethod('input:flexible:input', event);
        },
        removeTooltip: function(tooltipElement) {
            tooltipElement.tooltip('destroy');
        },
        updateToolTip: function(string) {
            this.ui.flexibleInput.attr('title', string).tooltip({
                placement: 'auto bottom'
            }).tooltip('fixTitle').tooltip('show');
        },
        announceParseChange: function(announcement) {
            Accessibility.Notification.new({
                'type': 'Assertive',
                'message': announcement
            });
        },
        getValueFromDOM: function() {
            var value = this.$el.find('input.flexible-input').val();
            return value;
        },
        onBeforeDestroy: function() {
            clearTimeout(this._inputTimeout);
            this.removeTooltip(this.ui.flexibleInput);
            this.removeTooltip(this.ui.helpTooltip);
            this.ui.datepickerInput.datepicker('destroy');
        }
    }, CommonInputViewPrototype);

    var FlexibleDatepicker = Backbone.Marionette.ItemView.extend(FlexibleInputViewPrototype);

    var DefaultDatepicker = Backbone.Marionette.ItemView.extend(DefaultInputViewPrototype);

    var DefaultControlLevelPrototype = {
        getValueFromDOM: function() {
            var value = this.$('input').val();
            return value;
        },
        isDateOutOfRange: function(date) {
            var momentDate = new Moment(date);
            if (momentDate.isValid()) {
                var isOutOfRange = momentDate.isBefore(this._datepickerInternalModel.get('startDate')) || momentDate.isAfter(this._datepickerInternalModel.get('endDate'));
                return isOutOfRange;
            }
            return false;
        }
    };

    var FlexibleControlLevelPrototype = {
        setFlexibleModel: function() {
            var inputString = this.getValueFromDOM();
            var convertedDate = this.convertDate(inputString);
            convertedDate = this.enforceInputFormat(convertedDate, inputString, this.defaults.inputFormatRestriction);
            this._flexibleInternalModel.set({
                inputString: inputString,
                parsedDate: convertedDate,
                outOfRange: this.isConvertedDateOutOfRange(convertedDate)
            });
        },
        enforceInputFormat: function(parsedDate, input, regexFormat) {
            if (_.isString(parsedDate) && _.isString(input)) {
                return regexFormat.test(input) ? parsedDate : false;
            }
            return parsedDate;
        },
        isConvertedDateOutOfRange: function(convertedDate) {
            if (_.isString(convertedDate)) {
                // if it is not null, the assumption is that this is a valid date
                var startDate = this._datepickerInternalModel.get('startDate');
                var momentStartDate = new Moment(startDate);
                var endDate = this._datepickerInternalModel.get('endDate');
                var momentEndDate = new Moment(endDate);
                var splitString = _.isString(convertedDate) ? convertedDate.split('/') : "";
                var momentParsedConvertedDate;
                var convertedDateYear;
                if (splitString.length === 3) {
                    // assumption is that converted date is in MM/DD/YYYY format
                    var momentConvertedDate = new Moment(convertedDate);
                    return momentConvertedDate.isBefore(startDate) || momentConvertedDate.isAfter(endDate);
                } else if (splitString.length === 2) {
                    // assumption is that converted date is in MM/YYYY format
                    momentParsedConvertedDate = new Moment(new Date.parse(convertedDate));
                    var convertedDateMonth = momentParsedConvertedDate.get('month');
                    convertedDateYear = momentParsedConvertedDate.get('year');
                    var isGreaterThanEndDate = convertedDateYear > momentEndDate.get('year') || (convertedDateYear === momentEndDate.get('year') && convertedDateMonth > momentEndDate.get('month'));
                    var isLessThanStartDate = convertedDateYear < momentStartDate.get('year') || (convertedDateYear === momentStartDate.get('year') && convertedDateMonth < momentStartDate.get('month'));
                    return (isLessThanStartDate || isGreaterThanEndDate);
                } else if (splitString.length === 1) {
                    // assumption is that convertedDate is in YYYY format
                    momentParsedConvertedDate = new Moment(new Date.parse(convertedDate));
                    convertedDateYear = momentParsedConvertedDate.get('year');
                    return convertedDateYear > momentEndDate.get('year') || convertedDateYear < momentStartDate.get('year');
                }
            }
            return false;
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
            regex = new RegExp("^t(?:oday)?$|^tomorrow$|^yesterday$|^next$|^last$|^n(?:ow)?$|^y(?:ear)?$|^m(?:onth)?$|^d(?:ay)?$|^w(?:eek)?$|" +
                "^s(?:u)?(?:n)?(?:d)?(?:ay)?$|^mo(?:n)?(?:d)?(?:ay)?$|^t(?:u)?(?:e)?(?:s)?(?:d)?(?:ay)?$|^w(?:e)?(?:d)?(?:n)?(?:esday)?$|" +
                "^t(?:h)?(?:u)?(?:r)?(?:s)?(?:d)?(?:ay)?$|^f(?:r)?(?:i)?(?:d)?(?:ay)?$|^s(?:a)?(?:t)?(?:urday)?$", "i");
            if (regex.test(strArray[0])) {
                return oldDate.toString("MM/dd/yyyy");
            }

            regex = new RegExp("^jan(?:uary)?$|^feb(?:ruary)?$|^mar(?:ch)?$|^apr(?:il)?$|^may$|^jun(?:e)?$|" +
                "^jul(?:y)?$|^aug(?:ust)?$|^sep(?:tember)?$|^oct(?:ober)?$|^nov(?:ember)?$|^dec(?:ember)?$", "i");
            if (regex.test(strArray[0]) && strArray.length == 1) {
                return oldDate.toString("MM/yyyy");
            }

            if (strArray.length == 3) {
                return oldDate.toString("MM/dd/yyyy");
            } else if (strArray.length == 2) {
                if (strArray[1].length === 2 || strArray[1].length === 1) {
                    // this means format is 11/02 for November 2nd. Assume this year.
                    var currentYear = new Moment().year();
                    var month = strArray[0].length === 1 ? '0' + strArray[0] : strArray[0];
                    var day = strArray[1].length === 1 ? '0' + strArray[1] : strArray[1];
                    return month + '/' + day + '/' + currentYear;
                }
                return oldDate.toString("MM/yyyy");
            } else if (strArray.length == 1) {
                return oldDate.toString("yyyy");
            } else {
                return oldDate;
            }
        },
        getValueFromDOM: function() {
            var value = this.$el.find('input.flexible-input').val();
            return value;
        }
    };

    var DatepickerControlPrototype = {
        defaults: {
            type: 'text',
            label: '',
            startDate: '01/01/1900',
            endDate: new Moment().add(100, 'years').format('MM/DD/YYYY'),
            outputFormat: 'MM/DD/YYYY',
            displayFormat: 'MM/DD/YYYY',
            extraClasses: [],
            helpMessage: '',
            title: 'Enter in a date in the following format, MM/DD/YYYY',
            inputFormatRestriction: /^((?:\d{4}|\d{1,2}\/(\d{4}|\d{1,2})|\d{1,2}\/\d{1,2}\/(?:\d{2}){1,2})|(?:[tn]|(?:today|now))(?:[+-]|[+-]\d{1,3}(?:m)?)?|(?:yesterday|tomorrow))$/,
            flexible: false,
            datepickerOptions: {}
        },
        getTemplate: function() {
            if (this.field.get('flexible')) {
                return Handlebars.compile([
                    '<div class="flexible-datepicker-region"></div>'
                ].join("\n"));
            }
            return Handlebars.compile([
                '<div class="default-datepicker-region"></div>'
            ].join("\n"));
        },
        ui: {
            'flexibleDatepickerContainer': '.flexible-datepicker-region',
            'defaultDatepickerContainer': '.default-datepicker-region'
        },
        regions: {
            'flexibleDatepickerRegion': '@ui.flexibleDatepickerContainer',
            'defaultDatepickerRegion': '@ui.defaultDatepickerContainer'
        },
        events: _.defaults({
                //Events to be Triggered By User
                'control:required': function(event, booleanValue) {
                    this.setBooleanFieldOption('required', booleanValue, event);
                },
                'control:disabled': function(event, booleanValue) {
                    this.setBooleanFieldOption('disabled', booleanValue, event);
                    if (_.isBoolean(booleanValue)) {
                        if (booleanValue) {
                            this.$('.input-group-addon').addClass('disabled');
                        } else {
                            this.$('.input-group-addon').removeClass('disabled');
                        }
                    }
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
                'control:startDate': function(event, dateValue) {
                    var newDateValue = this.formatDate(dateValue);
                    this._datepickerInternalModel.set('startDate', newDateValue);
                    this.field.set('startDate', newDateValue, { silent: true });
                    if (this.isFlexible) {
                        var outOfRange = this.isConvertedDateOutOfRange(this._flexibleInternalModel.get('parsedDate'));
                        this._flexibleInternalModel.set('outOfRange', outOfRange);
                    }
                    event.stopPropagation();
                },
                'control:endDate': function(event, dateValue) {
                    var newDateValue = this.formatDate(dateValue);
                    this._datepickerInternalModel.set('endDate', newDateValue);
                    this.field.set('endDate', newDateValue, { silent: true });
                    if (this.isFlexible) {
                        var outOfRange = this.isConvertedDateOutOfRange(this._flexibleInternalModel.get('parsedDate'));
                        this._flexibleInternalModel.set('outOfRange', outOfRange);
                    }
                    event.stopPropagation();
                },
                'click .input-group-addon:not(.disabled)': function(event) {
                    this.$('input.datepicker-input').datepicker('show', this.datepickerOptions);
                }
            },
            PuppetForm.Control.prototype.events),
        childEvents: {
            'flexible-date-selected': function(child, event, dateValue) {
                this._flexibleInternalModel.set({
                    parsedDate: dateValue,
                    inputString: "",
                    outOfRange: false
                });
                this.onChange(event);
                this.onUserInput.apply(this, arguments);
            },
            'input:flexible:change': function(child, event) {
                this.setFlexibleModel();
                this.onChange(event);
                this.onUserInput.apply(this, arguments);
            },
            'input:flexible:input': function(child, event) {
                this.setFlexibleModel();
            },
            'input:default:change': function(child, event) {
                this.onChange(event);
                this.onUserInput.apply(this, arguments);
            }
        },
        initialize: function(options) {
            this.initOptions(options);
            this.hasAllRequiredOptionsDefined();
            this.setFormatter();
            this.setExtraClasses();
            var legacyDatepickerOptions = this.field.get('options');
            this.isFlexible = this.field.get('flexible');
            this.isFlexible = _.isBoolean(this.isFlexible) && this.isFlexible;
            this._datepickerInternalModel = new Backbone.Model({
                startDate: this.formatDate(this.field.get('startDate') || (_.isObject(legacyDatepickerOptions) && !_.isUndefined(legacyDatepickerOptions.startDate) ? legacyDatepickerOptions.startDate : this.defaults.startDate)),
                endDate: this.formatDate(this.field.get('endDate') || (_.isObject(legacyDatepickerOptions) && !_.isUndefined(legacyDatepickerOptions.endDate) ? legacyDatepickerOptions.endDate : this.defaults.endDate)),
                outputFormat: this.field.get('outputFormat') || this.defaults.outputFormat
            });
            this.datepickerExternalModel = new Backbone.Model({
                date: null,
                formattedDate: null,
                format: this._datepickerInternalModel.get('outputFormat'),
                year: null,
                month: null,
                day: null
            });
            this.listenTo(this.datepickerExternalModel, 'change', function() {
                this.model.trigger('change:_' + this.field.get('name'));
            });
            this.listenTo(this.model, 'change:' + this.field.get('name'), function(model, change) {
                if (_.isUndefined(change) || (_.isString(change) && change === "") || _.isNull(change)) {
                    this.model.unset('_' + this.field.get('name'));
                }
            });
            var childOptions = {
                field: this.field,
                model: this.model,
                _datepickerInternalModel: this._datepickerInternalModel,
                datepickerExternalModel: this.datepickerExternalModel,
                defaults: this.defaults
            };
            if (this.isFlexible) {
                this.convertDate = FlexibleControlLevelPrototype.convertDate;
                this.isConvertedDateOutOfRange = FlexibleControlLevelPrototype.isConvertedDateOutOfRange;
                this.enforceInputFormat = FlexibleControlLevelPrototype.enforceInputFormat;
                this.setFlexibleModel = FlexibleControlLevelPrototype.setFlexibleModel;
                var dateFromModel = this.model.get(this.field.get('name'));
                dateFromModel = _.isString(dateFromModel) ? this.convertDate(dateFromModel) : null;
                if (!_.isNull(dateFromModel)) {
                    this.model.set(this.field.get('name'), dateFromModel, {
                        silent: true
                    });
                }
                var flexibleModelDefaults = {
                    parsedDate: dateFromModel,
                    inputString: null,
                    outOfRange: this.isConvertedDateOutOfRange(dateFromModel)
                };
                this._flexibleInternalModel = childOptions._flexibleInternalModel = new Backbone.Model(flexibleModelDefaults);
                childOptions.datepickerExternalModel = this.datepickerExternalModel;
                this.flexibleDatepicker = new FlexibleDatepicker(childOptions);
                this.fieldChangeListener = this.flexibleDatepicker.render;
                this.modelChangeListener = _.bind(function(model, change) {
                    if (_.isUndefined(change) || (_.isString(change) && change === "") || _.isNull(change)) {
                        this._flexibleInternalModel.set({
                            parsedDate: null,
                            inputString: null,
                            outOfRange: false
                        });
                        this.flexibleDatepicker.render.apply(this, arguments);
                    } else {
                        this.flexibleDatepicker.render.apply(this, arguments);
                        this.setFlexibleModel();
                    }
                }, this);
                this.getValueFromDOM = FlexibleControlLevelPrototype.getValueFromDOM;
            } else {
                this.isOutOfRange = DefaultControlLevelPrototype.isDateOutOfRange;
                this.defaultDatepicker = new DefaultDatepicker(childOptions);
                this.modelChangeListener = this.fieldChangeListener = this.defaultDatepicker.render;
                this.getValueFromDOM = DefaultControlLevelPrototype.getValueFromDOM;
            }
            this.listenToFieldOptions();
            this.listenToFieldName();
        },
        onShow: function() {
            if (this.isFlexible) {
                this.showChildView('flexibleDatepickerRegion', this.flexibleDatepicker);
                // when registering a validate method, it is imperative that the message is passed through even
                // if the control's validation passes. Otherwise, the form will get a false positive on validation.
                this.$el.trigger('register:control:validate:method', _.bind(function(formErrorMessage) {
                    var selectedDate = this.model.get(this.field.get('name'));
                    var parsedDate = this._flexibleInternalModel.get('parsedDate');
                    var isOutOfRange = this._flexibleInternalModel.get('outOfRange');
                    var parsedDateIsFalse = _.isBoolean(parsedDate) && !parsedDate;
                    if ((!_.isString(parsedDate) || (_.isString(parsedDate) && isOutOfRange) || parsedDateIsFalse) && _.isString(selectedDate) && selectedDate.length > 0) {
                        var invalidDateMessage = isOutOfRange ? 'Date must be between ' + this._datepickerInternalModel.get('startDate') + ' - ' + this._datepickerInternalModel.get('endDate') + '.' : parsedDateIsFalse ? 'Enter a date in a valid format.' : 'Enter a valid date.';
                        this.model.errorModel.set(this.field.get('name'), invalidDateMessage);
                        return formErrorMessage || invalidDateMessage;
                    }
                    return formErrorMessage;
                }, this));
            } else {
                this.showChildView('defaultDatepickerRegion', this.defaultDatepicker);
                this.$el.trigger('register:control:validate:method', _.bind(function(formErrorMessage) {
                    var selectedDate = this.model.get(this.field.get('name'));
                    if (_.isString(selectedDate) && selectedDate.length > 0) {
                        var momentSelectedDate = new Moment(selectedDate);
                        if (this.isOutOfRange(selectedDate)) {
                            var outOfRangeDateMessage = 'Date must be between ' + this._datepickerInternalModel.get('startDate') + ' - ' + this._datepickerInternalModel.get('endDate') + '.';
                            this.model.errorModel.set(this.field.get('name'), outOfRangeDateMessage);
                            return formErrorMessage || outOfRangeDateMessage;
                        } else if (!momentSelectedDate.isValid()) {
                            var invalidDefaultDateMessage = 'Invalid date';
                            this.model.errorModel.set(this.field.get('name'), invalidDefaultDateMessage);
                            return formErrorMessage || invalidDefaultDateMessage;
                        }
                    }
                    return formErrorMessage;
                }, this));
            }
        },
        onChange: function(event) {
            event.preventDefault();
            event.stopPropagation();
            var model = this.model;
            var attrArr = this.field.get("name").split('.');
            var name = attrArr.shift();
            var path = attrArr.join('.');
            var changes = {};
            var value = this.getValueFromDOM();
            var inputString = value;
            var parsedDate;
            if (this.isFlexible) {
                inputString = this._flexibleInternalModel.get('inputString');
                value = parsedDate = this._flexibleInternalModel.get('parsedDate');
            }
            this.setExternalModel(this.datepickerExternalModel, value, this._datepickerInternalModel.get('outputFormat'));
            value = this.datepickerExternalModel.get('formattedDate') || this.datepickerExternalModel.get('date');
            this.clearErrorModelValue(name, path);
            changes[name] = _.isEmpty(path) ? this.datepickerExternalModel.get('formattedDate') || value || inputString : _.clone(model.get(name)) || {};
            changes['_' + name] = _.isEmpty(path) ? this.datepickerExternalModel : _.clone(model.get('_' + name)) || {};
            if (!_.isEmpty(path)) this.keyPathSetter(changes[name], path, this.datepickerExternalModel.get('formattedDate') || value || inputString);
            this.stopListening(this.model, "change:" + name, this.onModelChange);
            if (_.isFunction(this.getSelectedLabelFromDOM)) {
                this.model.trigger('labelsForSelectedValues:update', name, this.getSelectedLabelFromDOM());
            }
            model.set(changes);
            this.listenTo(this.model, "change:" + name, this.onModelChange);
            if (this.isFlexible && _.isString(parsedDate) && parsedDate != inputString) {
                this.$('input.flexible-input').val(parsedDate);
            }
        },
        formatDate: function(date, format) {
            format = format || this.defaults.displayFormat;
            if (date && _.isString(format)) {
                if (_.isString(date)) {
                    if (date === '0d') {
                        // though this is not ideal, "0d" was previously supported
                        date = new Moment();
                    } else {
                        date = new Date(date);
                    }
                }
                return (Moment.isMoment(date) ? date.format(format) : date instanceof Date ? new Moment(date).format(format) : false);
            }
            return false;
        },
        setExternalModel: function(model, date, format) {
            var year = null;
            var month = null;
            var day = null;
            if (_.isString(date)) {
                var splitString = _.isString(date) ? date.split('/') : "";
                var splitStringLength = splitString.length;
                var transformFormat = format;

                if (splitStringLength === 3) {
                    year = splitString[2];
                    month = splitString[0];
                    day = splitString[1];
                } else if (splitStringLength === 2) {
                    year = splitString[1];
                    month = splitString[0];
                    transformFormat = null;
                } else if (splitStringLength === 1) {
                    year = splitString[0];
                    transformFormat = null;
                }
                model.set({
                    formattedDate: this.transformOutputFormat(date, transformFormat, format, splitStringLength),
                    date: date,
                    year: year,
                    month: month,
                    day: day
                });
            } else {
                model.set({
                    formattedDate: null,
                    date: null,
                    year: year,
                    month: month,
                    day: day
                });
            }
        },
        transformOutputFormat: function(dateToConvert, inputFormat, outputFormat, splitStringLength) {
            if (_.isString(dateToConvert) && _.isString(inputFormat) && _.isString(outputFormat)) {
                return new Moment(dateToConvert).format(outputFormat);
            }
            return null;
        }
    };

    var DatepickerControl = PuppetForm.DatepickerControl = Backbone.Marionette.LayoutView.extend(
        _.defaults(DatepickerControlPrototype, _.defaults(PuppetForm.Control.prototype, PuppetForm.CommonEventsFunctions))
    );

    return DatepickerControl;
});
