define([
    'backbone',
    'marionette'
], function(Backbone, Marionette) {
    "use strict";

    var Popover = Backbone.Marionette.Behavior.extend({
        ui: {
            '$popover': '[data-toggle=popover]'
        },
        onRender: function() {
            _.each(this.ui.$popover, function(popover) {
                var $popover = $(popover);
                if ($popover.data('bs.popover')) return;
                $popover.popover(_.defaults({}, this.options));
            }, this);
        },
        onBeforeDestroy: function() {
            this.ui.$popover.popover('destroy');
        }
    });

    return Popover;
});