define([
    'backbone',
    'marionette',
    'underscore',
    'hbs!main/components/applicationHeader/template',
    'api/UserService',
    'api/Messaging',
    'api/Navigation',
    'api/ResourceService',
    'api/UserDefinedScreens',
    'api/WorkspaceContextRepository',
    'main/Session',
    'api/Checks'
], function(Backbone, Marionette, _, HeaderTemplate, UserService, Messaging, Navigation, ResourceService, UserDefinedScreens, WorkspaceContextRepository, Session, Checks) {
    'use strict';

    var LeftHeaderItemCollectionView = Backbone.Marionette.CollectionView.extend({
        itemGroupName: 'left',
        extraClass: 'navbar-left left-margin-no',
        tagName: 'ul',
        className: function() {
            return 'nav navbar-nav ' + this.extraClass;
        },
        childViewOptions: {
            'tagName': 'li'
        },
        getChildView: function(item) {
            return item.get('view');
        },
        filter: function(child) {
            return child.isOfGroup('applicationHeaderItem', this.itemGroupName) && child.shouldShow();
        },
        resortView: function() {} // Turning off the rendering of children on a sort of the collection
    });
    var RightHeaderItemCollectionView = LeftHeaderItemCollectionView.extend({
        itemGroupName: 'right'
    });
    var PatientIconsCollectionView = LeftHeaderItemCollectionView.extend({
        itemGroupName: 'patient-nav-alerts',
        extraClass: 'navbar-left divider-left divider-right',
        getChildView: function(item) {
            return item.get('view').extend({
                align: 'left'
            });
        }
    });
    var UserIconsCollectionView = LeftHeaderItemCollectionView.extend({
        itemGroupName: 'user-nav-alerts',
        extraClass: 'divider-left divider-right'
    });

    var UserActionsCollectionView = LeftHeaderItemCollectionView.extend({
        itemGroupName: 'user-nav-actions',
        extraClass: 'divider-left'
    });

    var ApplicationNavigationView = Backbone.Marionette.LayoutView.extend({
        template: HeaderTemplate,
        ui: {
            'HeaderItemsLeft': '.application-header-items-left',
            'HeaderItemsRight': '.application-header-items-right',
            'UserHeaderIcons': '.application-user-icons',
            'UserHeaderActions': '.application-user-actions',
            'PatientHeaderIcons': '.application-patient-icons'
        },
        regions: {
            'LeftItemsRegion': '@ui.HeaderItemsLeft',
            'RightItemsRegion': '@ui.HeaderItemsRight',
            'UserIconsRegion': '@ui.UserHeaderIcons',
            'UserActionsRegion': '@ui.UserHeaderActions',
            'PatientIconsRegion': '@ui.PatientHeaderIcons'
        },
        behaviors: {
            Tooltip: {}
        },
        modelEvents: {
            "change:firstname, change:lastname": "render"
        },
        initialize: function() {
            this.model = UserService.getUserSession();
            this.headerItemsCollection = Messaging.request('get:components');
        },
        onRender: function() {
            this.LeftItemsRegion.show(new LeftHeaderItemCollectionView({
                collection: this.headerItemsCollection
            }));
            this.RightItemsRegion.show(new RightHeaderItemCollectionView({
                collection: this.headerItemsCollection
            }));
            this.PatientIconsRegion.show(new PatientIconsCollectionView({
                collection: this.headerItemsCollection
            }));
            this.UserIconsRegion.show(new UserIconsCollectionView({
                collection: this.headerItemsCollection
            }));
            this.UserActionsRegion.show(new UserActionsCollectionView({
                collection: this.headerItemsCollection
            }));
        }
    });
    return ApplicationNavigationView;
});