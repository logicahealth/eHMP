define([
    'backbone',
    'marionette'
], function(
    Backbone,
    Marionette
) {
    "use strict";

    return Marionette.Behavior.extend({
        onDomRefresh: function() {
            this.$el.trigger('form:view:update:bound:ui:elements');
        }
    });
});
