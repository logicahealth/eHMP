define([
    'backbone',
    'main/ui_components/form/fieldModel'
], function(
    Backbone,
    FieldModel
) {
    "use strict";

    return {
         addModel: function(collection, model, e) {
            if (!_.isUndefined(collection) && !_.isUndefined(model)) {
                if (this[collection] instanceof Backbone.Collection) {
                    model = new FieldModel(model);
                    this[collection].add(model);
                }
            }
            e.stopPropagation();
        },
        removeModel: function(collection, model, e) {
            if (!_.isUndefined(collection) && !_.isUndefined(model)) {
                if (this[collection] instanceof Backbone.Collection) {
                    if (!_.isUndefined(model.control)) {
                        model.controlName = model.control;
                        delete model.control;
                    }
                    var models = this[collection].where(model);
                    this[collection].remove(models);
                }
            }
            e.stopPropagation();
        },
        updateCollection: function(collection, model, e) {
            if (!_.isUndefined(collection) && !_.isUndefined(model)) {
                if (this[collection] instanceof Backbone.Collection) {
                    if (model instanceof Array) {
                        model = _.map(model, function(m) {
                            return new FieldModel(m);
                        });
                    } else {
                        model = new FieldModel(model);
                    }
                    this[collection].reset(model);
                }
            }
            e.stopPropagation();
        }
    };
});