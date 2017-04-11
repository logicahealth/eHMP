define([
    'backbone',
    'puppetForm',
    'handlebars',
    'underscore',
    'main/ui_components/forms/component'
], function(Backbone, PuppetForm, Handlebars, _) {
    'use strict';

    var CustomTemplateView = Backbone.Marionette.ItemView.extend({
        initialize: function(options) {
            var getCustomTemplate = options.getCustomTemplate;
            if (_.isFunction(getCustomTemplate)) {
                this.getTemplate = function() {
                    var template = getCustomTemplate(options.model, options.index) || this.defaultTemplate;
                    return this.processTemplate(template);
                };
            }
        },
        getTemplate: function() {
            return this.processTemplate(this.getOption('customTemplate') || this.defaultTemplate);
        },
        processTemplate: function(template) {
            return _.isFunction(template) ? template : Handlebars.compile(template);
        }
    });

    var LabelView = CustomTemplateView.extend({
        defaultTemplate: '{{ui-form-label (add-required-indicator label (isRequired required controlRequired)) forID=(clean-for-id (id this)) classes=(classes (is-sr-only-label srOnlyLabel) (disabledClass disabled controlDisabled))}}',
        templateHelpers: function() {
            return {
                isRequired: function(itemLevel, controlLevel) {
                    return !!itemLevel || !!controlLevel;
                },
                disabledClass: function(itemLevel, controlLevel) {
                    return (itemLevel || controlLevel) ? 'disabled' : '';
                },
                id: function(model) {
                    var prefix = model.prependToDomId ? model.prependToDomId + '-' : '';
                    return prefix + model.formAttributeName + '-' + model.name;
                },
                classes: function() {
                    return _.trim(_.initial(arguments).join(' '));
                }
            };
        },
        className: PuppetForm.CommonPrototype.className,
        serializeModel: function(model) {
            var field = _.defaults(this.getOption('field').toJSON(), this.getOption('defaults'));
            var attributeMapping = this.getOption('attributeMapping');
            var attributes = model.toJSON();
            var data = {
                name: attributes[attributeMapping.unique],
                label: attributes[attributeMapping.label],
                disabled: attributes[attributeMapping.disabled],
                required: attributes[attributeMapping.required],
                controlRequired: field.required,
                controlDisabled: field.disabled,
                formAttributeName: field.name || this.cid,
                srOnlyLabel: attributes[attributeMapping.srOnlyLabel]
            };
            return data;
        }
    });

    var SelectView = CustomTemplateView.extend({
        defaultTemplate: [
                '<div class="select-list-caret"></div>',
                '<select ' +
                    'id="{{clean-for-id (id this)}}" ' +
                    'name="{{clean-for-id (id this)}}"' +
                    '{{#if title}}title="{{title}}" {{else}}title="Use up and down arrow keys to view options and press enter to select" {{/if}}' +
                    '{{#if disabled}}disabled {{else}}{{#if controlDisabled}}disabled {{/if}}{{/if}}' +
                    '{{#if required}}required {{else}}{{#if controlRequired}}required {{/if}}{{/if}}' +
                    '{{#if multiple}}multiple {{else}}{{#if controlMultiple}}multiple {{/if}}{{/if}}' +
                    '>',
                '<option value=""></option>',
                '{{#each selectOptions}}',
                '<option value="{{@root.getValueString this}}"{{#if disabled}} disabled{{/if}}{{@root.isSelected this @root @index}}>{{label}}</option>',
                '{{/each}}',
                '</select>',
            ].join('\n'),
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
                    return !!itemLevel || !!controlLevel;
                },
                isSelected: function(option, model, optionIndex) {
                    if (option.value === model.value) {
                        return new Handlebars.SafeString(' selected');
                    }
                    return '';
                },
                id: function(model) {
                    var prefix = model.prependToDomId ? model.prependToDomId + '-' : '';
                    return prefix + model.formAttributeName + '-' + model.name;
                },
                selectedLabel: function(model) {
                    return _.result(_.find(model.selectOptions, {value: model.value}) || {label: ''}, 'label');
                },
                getValueString: getValueString
            };
        },
        className: PuppetForm.CommonPrototype.className,
        modelEvents: {
            'optionUpdated': 'render',
            'change': 'render'
        },
        events: _.defaults({
            'change': function(e) {
                e.preventDefault();
                var value = this.getValueFromDOM();
                this.stopListening(this.model, 'change');
                this.model.set(this.getOption('attributeMapping').value, value);
                this.triggerMethod('select-value-change', e, value);
                this.listenTo(this.model, 'change', this.render);
            }
        }, PuppetForm.ChecklistControl.events),
        getValueFromDOM: function() {
            return this.$('select').val();
        },
        serializeModel: function(model) {
            var field = _.defaults(this.getOption('field').toJSON(), this.getOption('defaults'));
            var attributeMapping = this.getOption('attributeMapping');
            var attributes = model.toJSON(),
                data = {
                    name: attributes[attributeMapping.unique],
                    value: attributes[attributeMapping.value],
                    label: attributes[attributeMapping.label],
                    title: attributes[attributeMapping.title],
                    disabled: attributes[attributeMapping.disabled],
                    required: attributes[attributeMapping.required],
                    multiple: attributes[attributeMapping.multiple],
                    selectOptions: field.options,
                    controlRequired: field.required,
                    controlDisabled: field.disabled,
                    controlMultiple: field.multiple,
                    formAttributeName: field.name || this.cid,
                    prependToDomId: field.prependToDomId
                };
            return data;
        }
    });

    var ChildView = Backbone.Marionette.LayoutView.extend({
        template: Handlebars.compile([
            '<div class="selectList-label"></div>',
            '<div class="selectList-value"></div>',
        ].join('\n')),
        ui: {
            label: '.selectList-label',
            value: '.selectList-value'
        },
        regions: {
            label: '@ui.label',
            value: '@ui.value'
        },
        className: PuppetForm.CommonPrototype.className() + ' selectList-container',
        onRender: function() {
            var options = this.options;
            function childOptions(templateName) {
                return _.defaults({
                    customTemplate: options[templateName],
                    getCustomTemplate: options['get' + templateName.charAt(0).toUpperCase() + templateName.substring(1)]
                }, options);
            }
            this.showChildView('label', new LabelView(childOptions('labelTemplate')));
            this.showChildView('value', new SelectView(childOptions('valueTemplate')));
        },
        childEvents: {
            'select-value-change': function(child, event, value) {
                this.triggerMethod('checklist-value-change', event, value);
            }
        }
    });

    var SelectList = PuppetForm.SelectListControl = PuppetForm.RadioListControl.extend({
        getChildView: function(item) {
            return ChildView;
        },
        childViewOptions: function(model, index) {
            var field = this.getOption('field');
            return _.defaults({
                model: model,
                index: index,
                attributeMapping: this.attributeMapping
            }, this.options, field.toJSON());
        },
        attributeMappingDefaults: _.defaults({
            srOnlyLabel: 'srOnlyLabel',
            multiple: 'multiple'
        }, PuppetForm.RadioListControl.prototype.attributeMappingDefaults)
    });

    return SelectList;
});