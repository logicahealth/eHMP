define([
    'backbone',
    'main/ui_components/form/fieldModel'
], function(
    Backbone,
    Field
) {
    "use strict";

    return Backbone.Collection.extend({
        model: Field,
        set: function(models, options) {
            return Backbone.Collection.prototype.set.call(this, models, _.defaults({ formView: _.get(this, 'options.formView') }, options));
        },
        initialize: function(models, opts) {
            this.options = opts;
        }
    });
});
