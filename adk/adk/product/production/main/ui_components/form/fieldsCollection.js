define([
    'backbone',
    'main/ui_components/form/fieldModel'
], function(
	Backbone,
	Field
) {
    "use strict";

    return Backbone.Collection.extend({
        model: Field
    });
});