define([
    'backbone',
    'marionette'
], function(Backbone, Marionette) {
    "use strict";

    var FlexContainer = Backbone.Marionette.Behavior.extend({
        ui: {
            '$flexRegions': '>'
        },
        onRender: function() {
            this.$el.addClass('flex-display inherit-height flex-direction-' + (this.getOption('direction') || 'column'));
            _.each(this.ui.$flexRegions, function(item) {
                var $item = this.$(item);
                // assumes any element that doesn't specify a width as none.
                // Additional flex properties can be applied here as needed
                var flexWidth = $item.attr('data-flex-width') || 'none';
                $item.addClass('flex-width-' + flexWidth);
            }, this);
        }
    });

    return FlexContainer;
});
