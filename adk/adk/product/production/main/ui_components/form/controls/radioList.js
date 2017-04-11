define([
    'backbone',
    'handlebars',
    'main/ui_components/form/controls/checklist',
    'main/ui_components/form/control/controlService'
], function(
    Backbone,
    Handlebars,
    ChecklistControl,
    ControlService
) {
    'use strict';

    var ChildView = Backbone.Marionette.ItemView.extend({
        getTemplate: function() {
            return Handlebars.compile([
                '<div class="container-fluid">',
                '<div class="row">',
                '<div class="col-md-6 col-xs-6">',
                '<p class="faux-label{{#if disabled}} disabled{{else}}{{#if @root.contorlDisabled}} disabled{{/if}}{{/if}}">{{add-required-indicator label (isRequired required controlRequired)}}</p>',
                '</div>',
                '<div class="col-md-6 col-xs-6">',
                '{{#each radioOptions}}',
                Handlebars.helpers['ui-form-label'].apply(this, ["{{label}}", {
                    hash: {
                        forID: "{{#if prependToDomId}}{{@root.prependToDomId}}-{{/if}}{{@root.formAttributeName}}-{{@root.name}}-{{clean-for-id (@root.getId this @index)}}",
                        classes: [ControlService.radioLabelClassName],
                        extraClassLogic: '{{#if disabled}}disabled {{else}}{{#if @root.contorlDisabled}}disabled {{else}}{{#if @root.disabled}}disabled {{/if}}{{/if}}{{/if}}',
                        content: '<input ' +
                            'type="radio" ' +
                            'id="{{#if prependToDomId}}{{@root.prependToDomId}}-{{/if}}{{@root.formAttributeName}}-{{@root.name}}-{{clean-for-id (@root.getId this @index)}}" ' +
                            'name="{{#if prependToDomId}}{{@root.prependToDomId}}-{{/if}}{{@root.formAttributeName}}-{{@root.name}}" ' +
                            '{{#if title}}title="{{title}}" {{else}}title="Press spacebar to select {{label}} for {{../label}}" {{/if}}' +
                            'value="{{@root.getValueString this}}" ' +
                            '{{@root.isChecked this @root @index}}' +
                            '{{#if disabled}}disabled {{else}}{{#if @root.contorlDisabled}}disabled {{else}}{{#if @root.disabled}}disabled {{/if}}{{/if}}{{/if}}' +
                            '{{#if required}}required {{else}}{{#if @root.controlRequired}}required {{else}}{{#if @root.required}}required {{/if}}{{/if}}{{/if}}' +
                            ' data-option-index="{{@index}}"' +
                            '/>'
                    }
                }]),
                '{{/each}}',
                '</div>',
                '</div>',
                '</div>'
            ].join("\n"));
        },
        templateHelpers: function() {
            var getValueString = function(option) {
                var value = option.value;
                if (!_.isUndefined(value) && !_.isNull(value)) {
                    return value.toString();
                }
                return 'null';
            };
            return {
                isRequired: function(itemLevel, controlLevel) {
                    if (!!itemLevel || !!controlLevel) {
                        return true;
                    }
                    return false;
                },
                isChecked: function(option, model, optionIndex) {
                    if (option.value === model.value) {
                        return new Handlebars.SafeString('checked="checked" ');
                    }
                    return '';
                },
                getValueString: getValueString,
                getId: function(option, index) {
                    return getValueString(option) + '-' + index.toString();
                }
            };
        },
        className: ControlService.Control.prototype.className,
        modelEvents: {
            'optionUpdated': 'render',
            'change': 'render'
        },
        events: _.defaults({
            "change input": "onChange"
        }, ChecklistControl.prototype.events),
        getValueFromDOM: function() {
            var index = this.$("input:checked").data('option-index');
            var field = _.defaults(this.getOption('field').toJSON(), this.getOption('defaults'));
            var selectedOption = field.options[index];
            var value = selectedOption.value;
            if (!_.isUndefined(value)) {
                return value;
            }
            return null;
        },
        onChange: function(e) {
            e.preventDefault();
            var INPUT = this.$(e.target),
                value = this.getValueFromDOM(INPUT);
            this.stopListening(this.model, 'change');
            this.model.set(this.getOption('attributeMapping').value, value);
            this.trigger('checklist-value-change');
            this.listenTo(this.model, 'change', this.render);
        },
        serializeModel: function(model) {
            var field = _.defaults(this.getOption('field').toJSON(), this.getOption('defaults'));
            var attributeMapping = this.getOption('attributeMapping');
            var attributes = model.toJSON(),
                data = {
                    name: attributes[attributeMapping.unique],
                    value: attributes[attributeMapping.value],
                    label: attributes[attributeMapping.label],
                    disabled: attributes[attributeMapping.disabled],
                    required: attributes[attributeMapping.required],
                    radioOptions: field.options,
                    controlRequired: field.required,
                    contorlDisabled: field.disabled,
                    formAttributeName: field.name || this.cid,
                    prependToDomId: field.prependToDomId
                };
            return data;
        }
    });

    var RadioList = ChecklistControl.extend({
        getChildView: function(item) {
            return ChildView;
        },
        events: _.defaults({
            //Events to be Triggered By User
            "control:item:required": function(event, options) {
                this.changeItemBooleanAttribute(event, options, 'required');
            },
            "control:required": function(event, booleanValue) {
                this.changeItemBooleanAttribute(event, {
                    value: booleanValue
                }, 'required');
            },
            "control:item:value": function(event, options) {
                if (!_.isObject(options)) {
                    options = {
                        value: options
                    };
                }
                this.changeItemValue(event, options, 'value');
            }
        }, ChecklistControl.prototype.events),
        attributeMappingDefaults: _.defaults({
            required: 'required'
        }, ChecklistControl.prototype.attributeMappingDefaults),
        behaviors: _.defaults({
            ErrorMessages: {
                behaviorClass: ControlService.Behaviors.ErrorMessages,
                fieldSelector: 'input[type="radio"]'
            }
        }, ChecklistControl.prototype.behaviors),
        changeItemValue: function(event, options, attributeToChange) {
            var item = options.item || null,
                value = options.value;
            if (!_.isUndefined(value)) {
                if (item) {
                    this.collection.each(function(model) {
                        if (model.get(this.attributeMapping.unique) === item) {
                            model.set(this.attributeMapping[attributeToChange], value);
                        }
                    }, this);
                } else {
                    this.collection.each(function(model) {
                        model.set(this.attributeMapping[attributeToChange], value);
                    }, this);
                }
                event.stopPropagation();
            }
        },
        defaults: _.defaults({
            required: false,
            disabled: false,
            options: [],
            prependToDomId: null
        }, ChecklistControl.prototype.defaults)
    });

    return RadioList;
});