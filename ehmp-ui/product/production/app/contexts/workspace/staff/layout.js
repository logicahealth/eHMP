define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'hbs!app/contexts/workspace/staff/template'
], function(
    Backbone,
    Marionette,
    _,
    Handlebars,
    LayoutTemplate
) {
    "use strict";

    var LeftNavigationItemCollectionView = Backbone.Marionette.CollectionView.extend({
        itemGroupName: 'staff-left',
        getChildView: function(item) {
            return item.get('view');
        },
        filter: function(child) {
            return child.isOfGroup('contextNavigationItem', this.itemGroupName) && child.shouldShow();
        },
        resortView: function() {} // Turning off the rendering of children on a sort of the collection
    });

    var RightNavigationItemCollectionView = LeftNavigationItemCollectionView.extend({
        itemGroupName: 'staff-right',
        className: 'flex-display flex-align-center flex-justify-content-end'
    });

    var ContextSidebarCollectionView = Backbone.Marionette.CollectionView.extend({
        itemGroupName: 'staff-sidebar',
        getChildView: function(item) {
            return item.get('view');
        },
        filter: function(child) {
            return child.isOfGroup('trayContainer', this.itemGroupName) && child.shouldShow();
        },
        resortView: function() {} // Turning off the rendering of children on a sort of the collection
    });

    var LayoutView = Backbone.Marionette.LayoutView.extend({
        className: "container-fluid percent-height-100",
        template: LayoutTemplate,
        ui: {
            LeftNavigationBarContainer: '.context-navigation-bar.left',
            RightNavigationBarContainer: '.context-navigation-bar.right',
            ContextSidebarContainer: '.context-sidebar--left'
        },
        regions: {
            ContentLeftRegion: 'aside',
            LeftNavigationRegion: '@ui.LeftNavigationBarContainer',
            RightNavigationRegion: '@ui.RightNavigationBarContainer',
            ContextSidebarRegion: '@ui.ContextSidebarContainer',
            content_region: '#content-region'
        },
        initialize: function(options) {
            this.registeredComponentsCollection = ADK.Messaging.request('get:components');
            this.leftNavigationItemsCollectionView = new LeftNavigationItemCollectionView({
                collection: this.registeredComponentsCollection
            });
            this.rightNavigationItemsCollectionView = new RightNavigationItemCollectionView({
                collection: this.registeredComponentsCollection
            });
        },
        onBeforeShow: function() {
            this.showChildView('LeftNavigationRegion', this.leftNavigationItemsCollectionView);
            this.showChildView('RightNavigationRegion', this.rightNavigationItemsCollectionView);
            this.showChildView('ContextSidebarRegion', new ContextSidebarCollectionView({
                collection: this.registeredComponentsCollection
            }));
        },
        onBeforeDestroy: function() {
            ADK.utils.resize.containerResize();
        }
    });

    return LayoutView;
});