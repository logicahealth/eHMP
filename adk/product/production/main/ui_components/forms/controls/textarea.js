define([
    'backbone',
    'puppetForm',
    'handlebars',
    'underscore',
    'bowser'
], function(
    Backbone,
    PuppetForm,
    Handlebars,
    _,
    Bowser) {
    'use strict';
    // The following code is a fix for $().val().length returning the incorrect length
    //
    // webkit (as of 2016.25.02) counts each newline as length 2 towards the maxlength count
    // while the value counts it as length 1. In other words, if text is entered with 2 line
    // breaks and the user enters enough text to reach the maxlength, the value length will be 2
    // characters short of the maxlength (leaving "2 characters remaining" without this fix)
    // Firefox and IE both count each newline as 1 character towards maxlength, matching value
    // -------
    // From http://api.jquery.com/val/
    // Note: At present, using .val() on textarea elements strips carriage return
    // characters from the browser-reported value. When this value is sent to the
    // server via XHR however, carriage returns are preserved (or added by browsers
    // which do not include them in the raw value). A workaround for this issue can
    // be achieved using a valHook as follows:
    if (Bowser.webkit) {
        $.valHooks.textarea = {
            get: function(elem) {
                return elem.value.replace(/\r?\n/g, "\r\n");
            }
        };
    }

    var CharacterCountView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile([
            '{{charactersRemaining}} of {{maxlength}} characters remaining'
        ].join('\n')),
        tagName: 'span',
        className: 'top-margin-no right-margin-xs pull-right',
        modelEvents: {
            'change:charactersRemaining': 'render',
            'change:maxlength': 'render'
        }
    });

    var TextareaControl = PuppetForm.TextareaControl = PuppetForm.LayoutViewControl.extend({
        defaults: {
            label: "",
            maxlength: 200,
            extraClasses: [],
            helpMessage: "",
            charCount: true
        },
        template: Handlebars.compile([
            '{{ui-form-label (add-required-indicator label required) forID=(clean-for-id name) classes=(is-sr-only-label srOnlyLabel)}}',
            '<textarea class="{{PuppetForm "controlClassName"}}"{{#if placeholder}} placeholder="{{placeholder}}"{{/if}}{{#if hasMaxlength}} maxlength="{{maxlength}}"{{/if}}{{#if cols}} cols="{{cols}}"{{/if}}{{#if rows}} rows="{{rows}}"{{/if}} name="{{name}}"{{#if title}} title="{{title}}"{{/if}} id={{clean-for-id name}}{{#if disabled}} disabled{{/if}}{{#if required}} required{{/if}}>' +
            '{{value}}' +
            '</textarea>',
            '{{#if charCountShouldShow}}<span class="char-count-region"></span>{{/if}}',
            '{{#if helpMessage}} <span {{#if (has-puppetForm-prop "helpMessageClassName")}}class="{{PuppetForm "helpMessageClassName"}}"{{/if}}>{{helpMessage}}</span>{{/if}}'
        ].join("\n")),
        templateHelpers: function() {
            var self = this;
            return {
                'charCountShouldShow': function() {
                    return self.charCountEnabled;
                },
                'hasMaxlength': function() {
                    return _.isNumber(self.maxlengthOption) && self.maxlengthOption > -1;
                }
            };
        },
        regions: {
            'CharacterCountRegion': '.char-count-region'
        },
        ui: {
            'Textarea': 'textarea'
        },
        events: _.defaults({
            "control:required": function(event, booleanValue) {
                this.setBooleanFieldOption("required", booleanValue, event);
            },
            "control:disabled": function(event, booleanValue) {
                this.setBooleanFieldOption("disabled", booleanValue, event);
            },
            "control:cols": function(event, intValue) {
                this.setIntegerFieldOption("cols", intValue, event);
            },
            "control:rows": function(event, intValue) {
                this.setIntegerFieldOption("rows", intValue, event);
            },
            "control:title": function(event, stringValue) {
                this.setStringFieldOption("title", stringValue, event);
            },
            "control:placeholder": function(event, stringValue) {
                this.setStringFieldOption("placeholder", stringValue, event);
            },
            "control:helpMessage": function(event, stringValue) {
                this.setStringFieldOption("helpMessage", stringValue, event);
            },
            "control:maxlength": function(event, intValue) {
                this.setIntegerFieldOption("maxlength", intValue, event);
                if (this.field.get('maxlength') != this.charCountModel.get('maxlength')) {
                    this.charCountModel.set('maxlength', this.field.get('maxlength'));
                }
            },
            "input @ui.Textarea": function(event) {
                var newValue = this.getValueFromDOM();
                if (newValue !== this.currentValue) {
                    if (this.charCountEnabled) {
                        this.updateCharacterCount(this.getValueFromDOM(event));
                    }
                    this.onChange.apply(this, arguments);
                    this.onUserInput.apply(this, arguments);
                }
                this.currentValue = newValue;
            },
            'focusout @ui.Textarea': function(event) {
                var startPosition = event.currentTarget.selectionStart;
                var endPosition = event.currentTarget.selectionEnd;
                if (_.isNumber(endPosition) && _.isNumber(startPosition)) {
                    this.startPosition = startPosition;
                    this.lastCaretPosition = endPosition;
                }
            },
            'control:insert:string': function(event, stringToInsert, options) {
                if (_.isString(stringToInsert)) {
                    var modelValue = this.getModelValue();
                    var stringOptions = options || {};
                    var prependText = stringOptions.prependWith || "";
                    var appendText = stringOptions.appendWith || "";
                    var newStringValue = prependText + stringToInsert + appendText;
                    var changes = {};
                    if (_.isString(modelValue) && modelValue.length > 0) {
                        var startOfValue = modelValue.slice(0, this.startPosition);
                        var endOfValue = modelValue.slice(this.lastCaretPosition, modelValue.length);
                        newStringValue = startOfValue + newStringValue + endOfValue;
                        this.startPosition = startOfValue.length + newStringValue.length;
                        this.lastCaretPosition = this.startPosition;
                    } else {
                        this.startPosition = newStringValue.length;
                        this.lastCaretPosition = this.startPosition;
                    }
                    this.clearErrorModelValue(this.fieldConfigName, this.fieldConfigPath);
                    changes[this.fieldConfigName] = _.isEmpty(this.fieldConfigPath) ? newStringValue : _.clone(this.model.get(this.fieldConfigName)) || {};
                    if (!_.isEmpty(this.fieldConfigPath)) {
                        this.keyPathSetter(changes[this.fieldConfigName], this.fieldConfigPath, newStringValue);
                    }
                    this.model.set(changes);
                    if (!_.isEmpty(this.fieldConfigPath)) {
                        this.render();
                    }
                }
            }
        }, PuppetForm.DefaultTextareaControl.prototype.events),
        initialize: function(options) {
            this.initOptions(options);
            this.hasAllRequiredOptionsDefined();
            this.setFormatter();
            this.setExtraClasses();
            this.setFieldName();
            this.setFieldNamePath();
            var modelValue = this.getModelValue();
            this.lastCaretPosition = _.isString(modelValue) ? modelValue.length : 0;
            this.startPosition = this.lastCaretPosition;
            var defaultModelChangeListener = _.bind(function() {
                if (!this.$('textarea').is(':focus')) {
                    this.render();
                }
                var newModelValue = this.getModelValue();
                this.lastCaretPosition = _.isString(newModelValue) ? newModelValue.length : 0;
                this.startPosition = this.lastCaretPosition;
            }, this);
            this.modelChangeListener = defaultModelChangeListener;
            var charCountOptionEnabled = _.isBoolean(this.field.get('charCount')) ? this.field.get('charCount') : this.getOption('defaults').charCount;
            this.maxlengthOption = _.isNumber(this.field.get('maxlength')) ? this.field.get('maxlength') : this.getOption('defaults').maxlength;
            this.charCountEnabled = charCountOptionEnabled && (_.isNumber(this.maxlengthOption) && this.maxlengthOption > -1);
            if (this.charCountEnabled) {
                var valueFromModel = _.isString(modelValue) ? modelValue : "";
                var CharCountModel = Backbone.Model.extend({
                    defaults: {
                        currentCount: valueFromModel.length || 0,
                        maxlength: this.maxlengthOption,
                        charactersRemaining: this.maxlengthOption - valueFromModel.length,
                        currentString: valueFromModel
                    },
                    determineCharactersRemaining: function() {
                        return this.get('maxlength') - this.get('currentCount');
                    }
                });
                this.charCountModel = new CharCountModel();
                this.modelChangeListener = function() {
                    defaultModelChangeListener();
                    this.updateCharacterCount(this.getModelValue());
                };
            }
            this.listenToFieldName();
            this.listenToFieldOptions();
        },
        onRender: function() {
            PuppetForm.LayoutViewControl.prototype.onRender.apply(this, arguments);
            // this is now in the onRender because events causing a re-render of the control
            // were causing the character count to be no longer shown when this was in onBeforeShow
            if (this.charCountEnabled) {
                this.showChildView('CharacterCountRegion', new CharacterCountView({
                    model: this.charCountModel
                }));
            }
            this.currentValue = this.getValueFromDOM();
        },
        updateCharacterCount: function(newVal) {
            if (_.isString(newVal)) {
                this.charCountModel.set({
                    currentString: newVal,
                    currentCount: newVal.length
                });
            } else {
                this.charCountModel.set({
                    currentString: '',
                    currentCount: 0
                });
            }
            this.charCountModel.set('charactersRemaining', this.charCountModel.determineCharactersRemaining());
        },
        getValueFromDOM: PuppetForm.DefaultTextareaControl.prototype.getValueFromDOM
    });

    return TextareaControl;
});
