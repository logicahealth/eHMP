define([
    'backbone',
    'marionette',
    'main/components/behaviors/tooltip',
    'main/components/behaviors/popover',
    'main/components/behaviors/listNav',
    'main/components/behaviors/keySelect'
], function(Backbone, Marionette, Tooltip, Popover, ListNav, KeySelect) {
    "use strict";

    //define new behaviors here
    var Behaviors = {
        Tooltip: Tooltip,
        Popover: Popover,
        ListNav: ListNav,
        KeySelect: KeySelect
    };

    Backbone.Marionette.Behaviors.behaviorsLookup = function() {
        return Behaviors;
    };

    return Behaviors;
});