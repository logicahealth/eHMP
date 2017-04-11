define([
    'backbone',
    'handlebars',
    'main/ui_components/form/controls/select',
    'main/ui_components/form/controls/checklist',
    'main/ui_components/form/control/controlService'
], function(
    Backbone,
    Handlebars,
    SelectControlView,
    ChecklistControlView,
    ControlService
) {
    'use strict';

    var ChecklistCollectionContainer = Backbone.Marionette.CollectionView.extend({
        addChild: function(child, ChildView, index) {
            var valueCheckObj = {};
            valueCheckObj[this.selectView.attributeMapping.value] = this.selectedValue;
            if (child == this.collection.where(valueCheckObj)[0]) {
                Marionette.CollectionView.prototype.addChild.apply(this, arguments);
            }
        },
        childView: ChecklistControlView.extend({
            behaviors: _.omit(ChecklistControlView.prototype.behaviors, 'ErrorMessages'),
        }),
        childViewOptions: function(model, index) {
            var field = this.checklistOptions.set('label', model.get(this.selectView.attributeMapping.label));
            field.set('attributeMapping', _.defaults({
                label: "label"
            }, this.checklistOptions.get('attributeMapping') || {}));
            return {
                field: field,
                model: model
            };
        },
        collectionEvents: {
            'change.inputted': function() {
                this.$el.trigger('dc.change.user.input', arguments);
            }
        },
        initialize: function(options) {
            this.checklistOptions = options.checklistOptions;
            this.selectView = options.selectView;
            this.selectOptions = this.selectView.field;
            this.collection = this.selectView.pickList;
            this.selectedValue = options.selectedValue || "";
        },
        updateChecklist: function(selectedValue) {
            this.selectedValue = selectedValue;
            this.render();
        },
        className: "well read-only-well"
    });
    var SelectControl = SelectControlView.extend({
        behaviors: _.omit(SelectControlView.prototype.behaviors(), 'ErrorMessages'),
        getTemplate: function() {
            var selectTemplate = [
                '{{ui-form-label (add-required-indicator label required) forID=(clean-for-id name) classes=(is-sr-only-label srOnlyLabel)}}' +
                '<select class="{{form-class-name "controlClassName"}}" id="{{clean-for-id name}}" name="{{name}}"' +
                '{{#if title}} title="{{title}}"{{/if}} ' +
                '{{#if disabled}} disabled{{/if}}' +
                '{{#if required}} required{{/if}}' +
                '{{#if disabled}} disabled{{/if}}' +
                '{{#if multiple}} multiple{{/if}}' +
                '{{#if size}} size={{size}}{{/if}}' +
                '>'
            ].join("\n");

            if (this.groupEnabled) {
                selectTemplate = [selectTemplate,
                    '{{#each groups}}' +
                    '<optgroup label=' + this.mappedAttribute('group', true, true) + '>',
                    '{{#each pickList}}' +
                    '<option value=' + this.mappedAttribute('value', true, true) +
                    '{{#compare ' + this.mappedAttribute('value') +
                    ' ../../rawValue}} selected="selected"{{/compare}}' +
                    '{{#if disabled}} disabled="disabled"{{/if}}>' +
                    this.mappedAttribute('label', true) +
                    '</option>' +
                    '{{/each}}',
                    '</optgroup>',
                    '{{/each}}'
                ].join("\n");
            } else {
                selectTemplate = [selectTemplate,
                    '{{#each options}}' +
                    '<option value="{{formatter-from-raw ../formatter ' + this.mappedAttribute('value') + '}}"' +
                    '{{#compare ' + this.mappedAttribute('value') +
                    ' ../rawValue}} selected="selected"{{/compare}}' +
                    '{{#if disabled}} disabled="disabled"{{/if}}>' +
                    this.mappedAttribute('label', true) +
                    '</option>' +
                    '{{/each}}'
                ].join("\n");
            }
            selectTemplate = [selectTemplate, '</select>'].join("\n");
            return Handlebars.compile(selectTemplate);
        }
    });

    var DrilldownChecklist = ControlService.LayoutViewControl.extend({
        template: Handlebars.compile([
            '<div class="col-xs-4 left-padding-md right-padding-xs drilldown-select-region"></div>',
            '<div class="col-xs-8 left-padding-xs drilldown-checklist-region"></div>'
        ].join('\n')),
        ui: {
            'SelectRegion': '.drilldown-select-region',
            'ChecklistRegion': '.drilldown-checklist-region'
        },
        regions: {
            'SelectRegion': '@ui.SelectRegion',
            'ChecklistRegion': '@ui.ChecklistRegion'
        },
        events: _.defaults({
            'dc.change.user.input': function(event) {
                event.stopPropagation();
                this.onUserInput.apply(this, arguments);
            }
        }, ControlService.LayoutViewControl.prototype.events),
        behaviors: _.omit(ControlService.LayoutViewControl.prototype.behaviors, 'ErrorMessages'),
        requiredFields: ['selectOptions', 'checklistOptions'],
        initialize: function(options) {
            this.initOptions(options);
            this.setFormatter();

            this.selectOptions = new ControlService.Field(this.field.get('selectOptions') || {});
            this.checklistOptions = new ControlService.Field(this.field.get('checklistOptions') || {});
            this.selectedValue = this.model.get(this.selectOptions.get('name')) || "";
            this.selectView = new SelectControl({
                field: this.selectOptions,
                model: this.model
            });
            this.checklistContainerView = new ChecklistCollectionContainer({
                checklistOptions: this.checklistOptions,
                selectView: this.selectView,
                selectedValue: this.selectedValue
            });

            this.listenTo(this.model, 'change:' + this.selectOptions.get('name'), function(model, value) {
                this.selectedValue = model.get(this.selectOptions.get('name'));
                this.checklistContainerView.updateChecklist(this.selectedValue);
            });
        },
        onRender: function() {
            this.showChildView('SelectRegion', this.selectView);
            this.showChildView('ChecklistRegion', this.checklistContainerView);
        }
    });

    return DrilldownChecklist;
});