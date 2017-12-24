define([
    'backbone',
    'handlebars',
    'underscore',
    'main/ui_components/form/control/controlService'
], function(
    Backbone,
    Handlebars,
    _,
    ControlService
) {
    'use strict';

    var Fieldset = ControlService.CompositeViewControl.extend({
        defaults: {
            items: [],
            extraClasses: [],
            legend: undefined,
            srOnlyLegend: false
        },
        behaviors: _.defaults({
            NestableContainer: {
                behaviorClass: ControlService.Behaviors.NestableContainer
            }
        }, _.omit(ControlService.CompositeViewControl.prototype.behaviors, ['DefaultClasses', 'ErrorMessages'])),
        requiredFields: ['legend', 'items'],
        tagName: "fieldset",
        template: Handlebars.compile('{{#if legend}}<legend{{#if srOnlyLegend}} class="sr-only"{{/if}}>{{legend}}</legend>{{/if}}'),
        initialize: function(options) {
            this.initOptions(options);
            var items = this.field.get("items") || this.defaults.items;
            if (!(items instanceof Backbone.Collection))
                items = new ControlService.Fields(items, { formView: _.get(this, 'field.formView') });
            this.items = items;
            this.collection = this.items;

            this.collection.bind('remove', this.render);
        },
        getChildView: function(item) {
            return (item.get('control'));
        },
        childViewOptions: function(model, index) {
            return {
                field: model,
                model: this.model
            };
        }
    });

    return Fieldset;
});