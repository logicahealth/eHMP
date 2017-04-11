define([
    'backbone',
    'handlebars',
    'main/ui_components/form/control/controlService'
], function(
    Backbone,
    Handlebars,
    ControlService
) {
    'use strict';

    var ContainerControl = ControlService.CompositeViewControl.extend({
        defaults: {
            items: [],
            extraClasses: []
        },
        behaviors: _.defaults({
          NestableContainer: {
            behaviorClass: ControlService.Behaviors.NestableContainer
          }
        }, _.omit(ControlService.CompositeViewControl.prototype.behaviors, ['DefaultClasses', 'ErrorMessages'])),
        template: Handlebars.compile(''),
        initialize: function(options) {
            this.collection = new Backbone.Collection();
            this.initOptions(options);
            this.formModel = options.model;
            this.tagName = this.field.get('tagName') || "div";
            this.setElement(document.createElement(this.tagName));
            this.containerTemplate = this.field.get('template') || null;
            if (this.containerTemplate) {
                this.template = (_.isFunction(this.containerTemplate) ? this.containerTemplate : Handlebars.compile(this.containerTemplate));
            }
            var items = this.field.get("items") || this.defaults.items;
            if (!(items instanceof Backbone.Collection))
                items = new ControlService.Fields(items);
            this.items = items;
            this.collection = this.items;

            this.collection.bind('remove', this.render);

            this.modelListeners = this.field.get('modelListeners') || null;

            this.listenToModelChanges();
            this.listenToFieldOptions();
        },
        serializeModel: function(model, moreOptions) {
            var field = _.defaultsDeep(this.field.toJSON(), this.defaults);
            _.defaults(field, moreOptions || {});
            _.defaults(field, model.toJSON());

            return !_.isUndefined(model.get('_labelsForSelectedValues')) ? _.defaults(model.get('_labelsForSelectedValues').toJSON(), field) : field;
        },
        getChildView: function(item) {
            return (item.get('control'));
        },
        childViewOptions: function(model, index) {
            return {
                field: model,
                model: this.model
            };
        },
        onChildviewGetWorkflowParentContainer: function(childView, args) {
            this.triggerMethod('get:workflow:parent:container', args);
        },
        listenToModelChanges: function() {
            if (this.modelListeners && _.isArray(this.modelListeners) && this.modelListeners.length > 0) {
                var listenerString = "change:_labelsForSelectedValues";
                _.each(this.modelListeners, function(listener) {
                    if (_.isString(listener)) {
                        listenerString += ' change:' + listener;
                    }
                }, this);
                this.listenTo(this.formModel, listenerString, function() {
                    this.render();
                }, this);
            }
        },
        events: _.defaults({
            //Events to be Triggered By User
            "control:items": function(event, arrayValue) {
                var items = arrayValue || this.defaults.items;
                if (!(items instanceof Backbone.Collection))
                    items = new ControlService.Fields(items);
                this.items = items;
                this.collection.set(this.items.models);
                event.stopPropagation();
            }
        }, ControlService.CompositeViewControl.prototype.events)
    });

    return ContainerControl;
});