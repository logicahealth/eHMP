define([
    'backbone',
    'marionette',
    'main/components/behaviors/tooltip',
    'main/components/behaviors/popover',
    'main/components/behaviors/listNav',
    'main/components/behaviors/keySelect',
    'main/components/behaviors/floatingDialog',
    'main/components/behaviors/floatingToolbar',
    'main/components/behaviors/crs',
    'main/components/behaviors/flexContainer'
], function(Backbone, Marionette, Tooltip, Popover, ListNav, KeySelect, FloatingDialog, FloatingToolbar, CRS, FlexContainer) {
    "use strict";

    //define new behaviors here
    var Behaviors = {
        Tooltip: Tooltip,
        Popover: Popover,
        ListNav: ListNav,
        KeySelect: KeySelect,
        FloatingDialog: FloatingDialog,
        FloatingToolbar: FloatingToolbar,
        CRS: CRS,
        FlexContainer: FlexContainer
    };

    Backbone.Marionette.Behaviors.behaviorsLookup = function() {
        return Behaviors;
    };

    return Behaviors;
});