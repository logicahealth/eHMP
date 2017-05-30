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
    'main/components/behaviors/flexContainer',
    'main/components/behaviors/helpLink',
    'main/components/behaviors/zIndex',
    'main/components/behaviors/infiniteScroll',
    'main/components/behaviors/errorContext',
    'main/components/behaviors/errorComponents'
], function(
    Backbone,
    Marionette,
    Tooltip,
    Popover,
    ListNav,
    KeySelect,
    FloatingDialog,
    FloatingToolbar,
    CRS,
    FlexContainer,
    HelpLink,
    ZIndex,
    InfiniteScroll,
    ErrorContext,
    ErrorComponents
) {
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
        FlexContainer: FlexContainer,
        HelpLink: HelpLink,
        ZIndex: ZIndex,
        InfiniteScroll: InfiniteScroll,
        ErrorContext: ErrorContext,
        ErrorComponents: ErrorComponents
    };

    Backbone.Marionette.Behaviors.behaviorsLookup = function() {
        return Behaviors;
    };

    return Behaviors;
});