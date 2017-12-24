define([
    'backbone',
    'marionette',
    'main/components/behaviors/tooltip',
    'main/components/behaviors/popover',
    'main/components/behaviors/listNav',
    'main/components/behaviors/keySelect',
    'main/components/behaviors/floatingDialog',
    'main/components/behaviors/crs',
    'main/components/behaviors/flexContainer',
    'main/components/behaviors/helpLink',
    'main/components/behaviors/skipLinks',
    'main/components/behaviors/zIndex',
    'main/components/behaviors/infiniteScroll',
    'main/components/behaviors/errorContext',
    'main/components/behaviors/errorComponents',
    'main/components/behaviors/injectable',
    'main/components/behaviors/quickMenu',
    'main/components/behaviors/childBehaviors',
    'main/components/behaviors/quickLooks',
    'main/components/behaviors/quickTile',
    'main/components/behaviors/notifications',
    'main/components/behaviors/actions',
    'main/components/behaviors/collectionOptionsList'
], function(
    Backbone,
    Marionette,
    Tooltip,
    Popover,
    ListNav,
    KeySelect,
    FloatingDialog,
    CRS,
    FlexContainer,
    HelpLink,
    SkipLinks,
    ZIndex,
    InfiniteScroll,
    ErrorContext,
    ErrorComponents,
    Injectable,
    QuickMenu,
    ChildBehaviors,
    QuickLooks,
    QuickTile,
    Notifications,
    Actions,
    CollectionOptionsList
) {
    "use strict";

    //define new behaviors here
    var Behaviors = {
        Tooltip: Tooltip,
        Popover: Popover,
        ListNav: ListNav,
        KeySelect: KeySelect,
        FloatingDialog: FloatingDialog,
        CRS: CRS,
        FlexContainer: FlexContainer,
        HelpLink: HelpLink,
        SkipLinks: SkipLinks,
        ZIndex: ZIndex,
        InfiniteScroll: InfiniteScroll,
        ErrorContext: ErrorContext,
        ErrorComponents: ErrorComponents,
        Injectable: Injectable,
        QuickMenu: QuickMenu,
        ChildBehaviors: ChildBehaviors,
        QuickLooks: QuickLooks,
        QuickTile: QuickTile,
        Notifications: Notifications,
        Actions: Actions,
        CollectionOptionsList: CollectionOptionsList
    };

    Backbone.Marionette.Behaviors.behaviorsLookup = function() {
        return Behaviors;
    };

    return Behaviors;
});