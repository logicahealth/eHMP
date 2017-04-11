define([
    'backbone',
    'marionette'
], function(
	Backbone,
	Marionette
) {
    "use strict";

    return Marionette.Behavior.extend({
        onRender: function(){
            this.$el.addClass(this.view.field.get('controlName') + '-control ' + this.view.field.get('name').split('.').shift());
        }
    });
});