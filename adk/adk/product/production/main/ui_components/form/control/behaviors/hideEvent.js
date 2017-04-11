define([
    'backbone',
    'marionette'
], function(
    Backbone,
    Marionette
) {
    "use strict";

    return Marionette.Behavior.extend({
        events: {
            "control:hidden": "hideControl"
        },
        hideControl: function(e, booleanValue) {
            if (_.isBoolean(booleanValue)) {
                this.view.field.set('hidden', booleanValue, {'silent': true});
                this.toggleHidden();
            }
            e.stopPropagation();
        },
        toggleHidden: function(){
            if (this.view.field.has('hidden') && !!this.view.field.get('hidden')) {
                this.$el.addClass('hidden');
            } else {
                this.$el.removeClass('hidden');
            }
        },
        onRender: function(){
            this.toggleHidden();
        }
    });
});