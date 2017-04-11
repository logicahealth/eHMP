define([
    'api/Messaging',
    'underscore',
    'api/UserService'
], function(Messaging, _, UserService) {
    'use strict';
    var appletBuilder = {
        build: function(marionetteApp, appletPojo) {
            var builtApplet = marionetteApp.module(appletPojo.id, defineAppletModule);

            function defineAppletModule(appletModule, app, backbone, marionette, $, _) {

                appletModule.id = appletPojo.id;
                appletModule.appletConfig = appletPojo;

                // adding permissions
                var hasPermission = function(appletPojo, callback) {
                    var hasPermission = true;
                    if (!_.isUndefined(appletPojo.requiredPermissions)) {
                        _.each(appletPojo.requiredPermissions, function(permission) {
                            if (!UserService.hasPermission(permission)) {
                                hasPermission = false;
                            }
                        });
                    }
                    callback(hasPermission);
                };
                var addItemsToAppletModule = function() {
                    if (appletPojo.viewTypes) {
                        Messaging.getChannel(appletPojo.id).reply('viewTypes', function() {
                            return appletPojo.viewTypes;
                        });
                        appletModule.viewTypes = appletPojo.viewTypes;
                        if (appletPojo.defaultViewType) {
                            appletModule.defaultViewType = appletPojo.defaultViewType;
                        }
                    }
                    if (appletPojo.permissions) {
                        appletModule.permissions = appletPojo.permissions;
                    }

                    if (appletPojo.onDisplay) {
                        appletModule.displayApplet = appletPojo.onDisplay.bind(appletModule);
                    }
                    if (appletPojo.getRootView) {
                        appletModule.getRootView = appletPojo.getRootView.bind(appletModule);
                    }
                };
                hasPermission(appletPojo, function(hasPermission) {
                    appletModule.hasPermission = hasPermission;
                    if (hasPermission === true) {
                        addItemsToAppletModule();
                        appletModule.buildPromise.resolve();
                    }
                });

            }
            return builtApplet;
        }
    };

    return appletBuilder;
});