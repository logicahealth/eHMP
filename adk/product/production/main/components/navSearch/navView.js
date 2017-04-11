define([
    'backbone',
    'marionette',
    'underscore',
    'hbs!main/components/navSearch/navTemplate',
    'api/UserService',
    'api/Messaging',
    'api/UserDefinedScreens',
    'api/Navigation'
], function(Backbone, Marionette, _, navTemplate, UserService, Messaging, UserDefinedScreens, Navigation) {
    'use strict';
    return Backbone.Marionette.ItemView.extend({
        model: UserService.getUserSession(),
        template: navTemplate,
        behaviors: {
            Tooltip: {}
        },
        events: {
            'click #logoutButton': 'logout',
            'click .navigation-tab': 'navigateToTabbedScreen',
            'click #myNotificationsButton': 'myNotifications'
        },
        navigationTabScreenMap: {},
        initialize: function() {
            var self = this;
            var promise = UserDefinedScreens.getScreensConfig();
            promise.done(function(screensConfig) {
                var screensToAddToTabList = _.filter(screensConfig.screens, function(screen) {
                    var hasPermission = true;
                    if (screen.Permission === false) {
                        hasPermission = false;
                    }
                    var addNavigationTab = false;
                    if (!_.isUndefined(screen.addNavigationTab) && screen.addNavigationTab === true) {
                        addNavigationTab = true;
                    }
                    if (!_.isUndefined(screen) && !_.isUndefined(screen.requiredPermissions)) {
                        _.each(screen.requiredPermissions, function(permission) {
                            if (!UserService.hasPermission(permission)) {
                                hasPermission = false;
                            }
                        });
                    }
                    return (screen.addNavigationTab === true && hasPermission === true);
                });
                self.model.set('navTabs', screensToAddToTabList);
                _.each(self.model.get('navTabs'), function(screenTab) {
                    screenTab.finalID = screenTab.id.toLowerCase() + "-nav-header-tab";
                    screenTab.finalTitle = screenTab.title + " view";
                    self.navigationTabScreenMap[screenTab.finalID] = screenTab.routeName;
                });
                self.render();
            });
        },
        navigateToTabbedScreen: function(e) {
            e.preventDefault();
            var screenName = this.navigationTabScreenMap[$(e.currentTarget).attr('id')];
            if (screenName) {
                Navigation.navigate(screenName);
            }
        },
        myNotifications: function(e) {
            e.preventDefault();
            Backbone.fetchCache._cache = {};
            Navigation.navigate('my-notifications-full');
        },
        logout: function() {
            Messaging.trigger('app:logout');
        },

    });
});