define([
    'backbone',
    'marionette',
    'underscore',
    'main/AppletBuilder',
    'main/ResourceBuilder',
    'main/Session',
    'api/SessionStorage',
    'api/UserDefinedScreens',
    'api/Messaging',
    'api/Navigation'
], function(Backbone, Marionette, _, AppletBuilder, ResourceBuilder, Session, SessionStorage, UserDefinedScreens, Messaging, Navigation) {
    'use strict';

    var ScreensManifest = Messaging.request('ScreensManifest');
    var AppletsManifest = Messaging.request('AppletsManifest');
    var ResourcesManifest = Messaging.request('ResourcesManifest');
    var NewUserScreen = Messaging.request('NewUserScreen');
    var ScreenBuilder = {};

    ScreenBuilder.addNewScreen = function(screenConfig, app, screenIndex, callback) {
        screenConfig.fileName = "NewUserScreen";

        //initialize the screen
        var screenModule = app.module(screenConfig.routeName);
        screenModule.buildPromise = $.Deferred();
        var routeController = initializeRouteController(app, screenConfig.routeName);
        initializeRouter(screenConfig.routeName, routeController);

        var newScreenConfig = _.clone(NewUserScreen);
        newScreenConfig.id = screenConfig.id;
        UserDefinedScreens.addNewScreen(screenConfig, screenIndex, callback);
        ScreenBuilder.build(app, newScreenConfig);
    };


    ScreenBuilder.editScreen = function(newScreenConfig, origId) {
        var screensConfig = UserDefinedScreens.getScreensConfigFromSession();

        var screenIndex;
        _.find(screensConfig.screens, function(screen, Idx) {
            if (screen.id === origId) {
                screenIndex = Idx;
                return true;
            }
        });

        if (newScreenConfig.id !== origId) {
            UserDefinedScreens.updateScreenId(origId, newScreenConfig.id);
            if (ADK.ADKApp.currentScreen.id === origId) {
                ADK.ADKApp.currentScreen.id = newScreenConfig.id;
                $('#screenName').text(newScreenConfig.title);
            }

            ADK.ADKApp[origId] = undefined;

            //initialize the new screen module so the routing can be used right away
            newScreenConfig.fileName = "NewUserScreen";
            var screenModule = ADK.ADKApp.module(newScreenConfig.routeName);
            screenModule.buildPromise = $.Deferred();
            var routeController = initializeRouteController(ADK.ADKApp, newScreenConfig.routeName);
            initializeRouter(newScreenConfig.routeName, routeController);

            var newScreenDescriptor = _.clone(NewUserScreen);
            newScreenDescriptor.id = newScreenConfig.id;

            ScreenBuilder.build(ADK.ADKApp, newScreenDescriptor);
        }

        if (Backbone.history.fragment === origId) {
            //I'm not convinced this is the best approach
            window.history.pushState({}, 'eHMP', '#' + newScreenConfig.id);
            Backbone.history.fragment = newScreenConfig.id;
        }

        screensConfig.screens[screenIndex] = newScreenConfig;
        UserDefinedScreens.saveScreensConfig(screensConfig);
    };

    //Deletes the user screen and checks if removed screen is a default screen
    ScreenBuilder.deleteUserScreen = function(screenId) {
        var screensConfig = UserDefinedScreens.getScreensConfigFromSession();

        var screenToRemove = _.find(screensConfig.screens, function(screen) {
            return screen.id === screenId;
        });
        screensConfig.screens = _.without(screensConfig.screens, screenToRemove);
        UserDefinedScreens.saveScreensConfig(screensConfig, function() {
            UserDefinedScreens.saveGridsterConfig({}, screenToRemove.id);
        });

        UserDefinedScreens.removeOneScreenFromSession(screenId);

        if (screenToRemove.defaultScreen === true) {
            ScreenBuilder.resetUserSelectedDefaultScreen();
            console.log("deleting user default screen, setting defaultscreen from predefined default");
        }

        // if we are trying to delete the screen that we came from, let's go back to the predefined default screen.
        if (Backbone.history.fragment === screenToRemove.id) {
            Navigation.navigate(ADK.ADKApp.userSelectedDefaultScreen, {
                trigger: false
            });
        }
        ADK.ADKApp[screenToRemove.id] = undefined;
    };


    //Processes a new title and returns a different name if title already exists
    ScreenBuilder.titleExists = function(title) {
        var screensConfig = UserDefinedScreens.getScreensConfigFromSession();
        var titleExists = false;
        _.find(screensConfig.screens, function(screen, Idx) {
            if (screen.title.toLowerCase() === title.toLowerCase()) {
                titleExists = true;
            }
        });
        return titleExists;
    };


    //Sets the Overview to Default, sets all other screens as not default
    ScreenBuilder.resetUserSelectedDefaultScreen = function() {
        var screensConfig = UserDefinedScreens.getScreensConfigFromSession();

        var setToDefault = _.map(screensConfig.screens, function(screen) {
            if (screen.id === ADK.ADKApp.predefinedDefaultScreen) {
                screen.defaultScreen = true;
                ADK.ADKApp.userSelectedDefaultScreen = screen.id;

            } else {
                screen.defaultScreen = false;
            }
            return screen;
        });
        var newScreenConfig = {};
        newScreenConfig.screens = setToDefault;
        UserDefinedScreens.saveScreensConfig(newScreenConfig);
    };

    //Set the default screen. Omit the parameter to clear the default screen parameter.
    ScreenBuilder.resetDefaultScreen = function(screenId) {
        var defaultScreenId = screenId || '';
        var screensConfig = UserDefinedScreens.getScreensConfigFromSession();

        var modifiedScreensConfig = _.map(screensConfig.screens, function(screen) {
            screen.defaultScreen = (screen.id === defaultScreenId);
            return screen;
        });

        var newScreenConfig = {};
        newScreenConfig.screens = modifiedScreensConfig;
        UserDefinedScreens.saveScreensConfig(newScreenConfig);
    };

    ScreenBuilder.setNewDefaultScreen = function(newDefaultScreenId) {
        ScreenBuilder.resetDefaultScreen(newDefaultScreenId);
        ADK.ADKApp.userSelectedDefaultScreen = newDefaultScreenId;
    };

    ScreenBuilder.initAllRouters = function(app) {
        var deferred = new $.Deferred();
        var promise = UserDefinedScreens.getScreensConfig();
        promise.done(function(screensConfig) {
            // concat user Session screens into screen manifest
            var additionalScreens = screensConfig.screens;
            _.each(additionalScreens, function(screen) {
                if (_.isUndefined(screen.routeName)) {
                    screen.routeName = screen.id;
                }
                var matchingScreen;
                var containScreen = _.filter(ScreensManifest.screens, function(s) {
                    if (s.routeName === screen.routeName) {
                        matchingScreen = s;
                    }
                    return s.routeName === screen.routeName;
                });

                if (!_.isUndefined(matchingScreen) && matchingScreen.hasOwnProperty('requiredPermissions')) {
                    screen.requiredPermissions = matchingScreen.requiredPermissions;
                }
                if (containScreen.length === 0) ScreensManifest.screens.push(screen);

            });

            _.each(ScreensManifest.screens, function initRouter(screenDescriptor) {
                var screenModule = app.module(screenDescriptor.routeName);
                screenModule.buildPromise = $.Deferred();
                var routeController = initializeRouteController(app, screenDescriptor.routeName);
                initializeRouter(screenDescriptor.routeName, routeController);
            });
            deferred.resolve();
        });
        return deferred;
    };

    ScreenBuilder.buildAll = function(marionetteApp) {
        var applets = AppletsManifest.applets;
        var resources = ResourcesManifest.resources;
        var loggedOut = Session.user.get('status') === 'loggedout';
        /** 
         * Oppimize only building required applets if not logged in
         * The other applets are built after authentication
         **/
        if (loggedOut) {
            applets = _.filter(AppletsManifest.applets, function(applet) {
                if (!_.isUndefined(applet.requiredBeforeLogin) && applet.requiredBeforeLogin === true) {
                    return true;
                }
                return false;
            });
        }

        //resources are applet scoped and don't need to be loaded until it's time to use them
        var resourceId;
        _.each(resources, function(resource) {
            require(['app/resources/' + resource.id + '/resources'], function(resource) {
                ResourceBuilder.build.call(resource);
            });
        });
        Messaging.trigger('ResourcesLoaded');

        var count = 0;
        var appletLength = applets.length;
        var resolveAllAppletsLoadedPromise = function() {
            if (!loggedOut && count === appletLength) {
                Session.allAppletsLoadedPromise.resolve();
            }
        };
        _.each(applets, function(applet) {
            // If applet module is undefined, then no screen has built it yet

            //if (marionetteApp[applet.id] === undefined) {
            // marionetteApp[applet.id] will be defined from now on - another screen won't build it again
            var appletModule = marionetteApp.module(applet.id);

            appletModule.buildPromise = $.Deferred();
            require(['app/applets/' + applet.id + '/applet'], function(appletPojo) {
                appletPojo.requiredPermissions = applet.requiredPermissions;
                if (applet.permissions) {
                    appletPojo.permissions = applet.permissions;
                }
                AppletBuilder.build(marionetteApp, appletPojo);
                count++;
                resolveAllAppletsLoadedPromise();
            }, function(err) {
                // since applet failed to load and we aren't trying to reload the applet, we can decrement the
                // total number of applets in order to correctly resolve the load promise
                console.error('Error loading applet with id of: ' + applet.id + '.', err);
                appletLength--;
                resolveAllAppletsLoadedPromise();
            });
            //}
        });

        _.each(ScreensManifest.screens, function loadScreen(screenDescriptor) {
            if (_.isUndefined(screenDescriptor.fileName) || screenDescriptor.fileName === 'NewUserScreen') {
                var sc = _.clone(NewUserScreen);
                sc.id = screenDescriptor.id;
                if (screenDescriptor.screenId) {
                    sc.screenId = screenDescriptor.screenId;
                }
                onLoadScreen(sc);
            } else {
                require(['app/screens/' + screenDescriptor.fileName], onLoadScreen);
            }
        });

        function onLoadScreen(screenConfig) {
            var matchingScreen;
            var containScreen = _.filter(ScreensManifest.screens, function(s) {
                if (s.routeName === screenConfig.id) {
                    matchingScreen = s;
                }
                return s.routeName === screenConfig.id;
            });
            if (!_.isUndefined(matchingScreen.requiredPermissions)) {
                screenConfig.requiredPermissions = matchingScreen.requiredPermissions;
            }
            ScreenBuilder.build(marionetteApp, screenConfig);
        }
    };

    ScreenBuilder.build = function(marionetteApp, screenConfig) {
        var builtScreen = marionetteApp.module(screenConfig.id);
        initializeScreenModule(marionetteApp, builtScreen, screenConfig);
        builtScreen.buildPromise.resolve();
        if (builtScreen.config && builtScreen.config.predefined === false)
            UserDefinedScreens.updateScreenModuleFromStorage(builtScreen);

        var matchingScreen;
        var containScreen = _.filter(ScreensManifest.screens, function(s) {
            if (s.routeName === screenConfig.id) {
                matchingScreen = s;
            }
            return s.routeName === screenConfig.id;
        });
        if (!_.isUndefined(matchingScreen) && !_.isUndefined(matchingScreen.requiredPermissions)) {
            screenConfig.requiredPermissions = matchingScreen.requiredPermissions;
        }
        return builtScreen;
    };

    function initializeScreenModule(marionetteApp, screenModule, screenConfig) {
        screenModule.id = screenConfig.id;
        screenModule.title = screenConfig.title;
        screenModule.applets = screenConfig.applets;
        if (screenConfig.screenId) {
            screenModule.screenId = screenConfig.screenId;
        }
        if (screenConfig.patientRequired) {
            screenModule.patientRequired = screenConfig.patientRequired;
        } else screenModule.patientRequired = false;
        //console.log(screenConfig.requiredPermissions);
        screenModule.config = screenConfig;
        if (ScreensManifest.testEnvironmentFlag && (ScreensManifest.testEnvironmentFlag === true)) {
            SessionStorage.addModel('patient', Session.patient);
        }

        //Layout to use in the top-region of index
        screenModule.topRegion_layoutPromise = $.Deferred();
        //If screen specifies true to the requiresPatient variable then use layout that shows patient related components.
        var isNonPatientCentricView = (!_.isUndefined(screenConfig.nonPatientCentricView) && screenConfig.nonPatientCentricView === true);
        if (screenConfig.patientRequired === true) {
            screenConfig.topRegionLayout = "default_patientRequired";
        } else if (isNonPatientCentricView) {
            screenConfig.topRegionLayout = "default_nonPatientCentricViewTopRegion";
        } else {
            screenConfig.topRegionLayout = "default_noPatientRequired";
        }
        require(['main/layouts/topRegionLayouts/' + screenConfig.topRegionLayout], function(loadedLayout) {
            screenModule.topRegion_layoutView = loadedLayout;
            screenModule.topRegion_layoutPromise.resolve();
        });

        //Layout to use in the center-region of index
        screenModule.centerRegion_layoutPromise = $.Deferred();
        //Add logic if screen needs to define the appCenterLayout
        screenConfig.centerRegionLayout = "default_fullWidth";
        require(['main/layouts/centerRegionLayouts/' + screenConfig.centerRegionLayout], function(loadedLayout) {
            screenModule.centerRegion_layoutView = loadedLayout;
            screenModule.centerRegion_layoutPromise.resolve();
        });

        //Layout to use in the applet-region
        screenModule.contentRegion_layoutPromise = $.Deferred();
        require(['main/layouts/' + screenConfig.contentRegionLayout], function(loadedLayout) {
            screenModule.contentRegion_layoutView = loadedLayout;
            screenModule.contentRegion_layoutPromise.resolve();
        });
    }

    function initializeRouter(routeName, routeController) {
        var routes = {};
        routes[routeName] = 'displayScreen';

        var routerOptions = {
            appRoutes: routes,
            controller: routeController
        };
        new Marionette.AppRouter(routerOptions);
    }

    function initializeRouteController(marionetteApp, screenName) {
        return {
            displayScreen: function(routeOptions) {
                marionetteApp.execute('screen:display', screenName, routeOptions);
            }
        };
    }

    return ScreenBuilder;
});