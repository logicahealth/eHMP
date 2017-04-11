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
        extraClass: 'navbar-left',
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
        itemGroupName: 'right',
        extraClass: 'pull-left',
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
        extraClass: 'pull-left divider-left divider-right'
    });

    var ApplicationNavigationView = Backbone.Marionette.LayoutView.extend({
        template: HeaderTemplate,
        ui: {
            'HeaderItemsLeft': '.application-header-items-left',
            'HeaderItemsRight': '.application-header-items-right',
            'UserHeaderIcons': '.application-user-icons',
            'PatientHeaderIcons': '.application-patient-icons'
        },
        regions: {
            'LeftItemsRegion': '@ui.HeaderItemsLeft',
            'RightItemsRegion': '@ui.HeaderItemsRight',
            'UserIconsRegion': '@ui.UserHeaderIcons',
            'PatientIconsRegion': '@ui.PatientHeaderIcons'
        },
        behaviors: {
            Tooltip: {}
        },
        events: {
            'click #logoutButton': 'logout'
        },
        modelEvents: {
            "change:firstname, change:lastname": "render"
        },
        initialize: function() {
            this.model = UserService.getUserSession();
            this.headerItemsCollection = Messaging.request('get:components');
            this.leftHeaderItemsCollectionView = new LeftHeaderItemCollectionView({
                collection: this.headerItemsCollection
            });
            this.rightHeaderItemsCollectionView = new RightHeaderItemCollectionView({
                collection: this.headerItemsCollection
            });
            this.patientIconsCollectionView = new PatientIconsCollectionView({
                collection: this.headerItemsCollection
            });
            this.userIconsCollectionView = new UserIconsCollectionView({
                collection: this.headerItemsCollection
            });
        },
        onRender: function() {
            this.LeftItemsRegion.show(this.leftHeaderItemsCollectionView);
            this.RightItemsRegion.show(this.rightHeaderItemsCollectionView);
            this.PatientIconsRegion.show(this.patientIconsCollectionView);
            this.UserIconsRegion.show(this.userIconsCollectionView);
        },
        logout: function(e) {
            e.preventDefault();
            Checks.run('navigation', function() {
                Messaging.trigger('app:logout');
            }, { screenName: 'logon-screen'});
        }
    });
    return ApplicationNavigationView;
});