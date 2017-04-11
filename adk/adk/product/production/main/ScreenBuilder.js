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
    'api/Navigation',
    'api/WorkspaceContextRepository'
], function(
    Backbone,
    Marionette,
    _,
    AppletBuilder,
    ResourceBuilder,
    Session,
    SessionStorage,
    UserDefinedScreens,
    Messaging,
    Navigation,
    WorkspaceContextRepository) {
    'use strict';
    var AppletsManifest = Messaging.request('AppletsManifest');
    var NewUserScreen = Messaging.request('NewUserScreen');
    var ScreenBuilder = {};

    ScreenBuilder.addNewScreen = function(screenConfig, app, screenIndex, callback) {
        screenConfig.fileName = "NewUserScreen";

        //initialize the screen
        var screenModule = app.module('Screens.' + screenConfig.routeName);
        screenModule.buildPromise = $.Deferred();

        Navigation.initWorkspaceRoute(screenConfig.routeName, app);

        var newScreenConfig = _.clone(NewUserScreen);
        newScreenConfig.id = screenConfig.id;
        UserDefinedScreens.addNewScreen(screenConfig, screenIndex, callback);
        if (_.isUndefined(screenConfig.context) && !_.isUndefined(WorkspaceContextRepository.currentContext)) {
            screenConfig.context = WorkspaceContextRepository.currentContextId;
        }
        ScreenBuilder.build(app, newScreenConfig);
    };

    ScreenBuilder.editScreen = function(newScreenConfig, origId) {
        var screensConfig = UserDefinedScreens.getScreensConfigFromSession();

        var screenIndex = null;
        var oldScreenConfig = null;
        _.find(screensConfig.screens, function(screen, Idx) {
            if (screen.id === origId) {
                screenIndex = Idx;
                oldScreenConfig = screen;
                return true;
            }
        });

        var newId = newScreenConfig.id;
        var currentWorkspaceId = WorkspaceContextRepository.currentWorkspace.get('id');
        if (newId !== origId) {
            UserDefinedScreens.updateScreenId(origId, newId);

            var attributesToChangeObject = _.pick(newScreenConfig, ['id', 'screenId', 'title']);
            ADK.ADKApp.Screens[newId] = _.extend(ADK.ADKApp.Screens[origId], _.defaults({
                moduleName: newId
            }, attributesToChangeObject));

            // Update the module's config object and the workspace's model
            attributesToChangeObject = _.pick(newScreenConfig, ['id', 'screenId']);
            _.extend(ADK.ADKApp.Screens[newId].config, attributesToChangeObject);
            WorkspaceContextRepository.getWorkspace(origId).set(attributesToChangeObject);

            // Update the workspace routes
            Navigation.removeWorkspaceRoute(oldScreenConfig.routeName || null, ADK.ADKApp);
            Navigation.initWorkspaceRoute(newScreenConfig.routeName, ADK.ADKApp);

            ADK.ADKApp.Screens[origId].stop();
            delete ADK.ADKApp.Screens[origId];

            var contextId = WorkspaceContextRepository.getWorkspace(newId).get('context');
            var formattedFragmentPrefix = '/' + contextId + '/';
            var newformattedFragment = formattedFragmentPrefix + newScreenConfig.routeName;

            // If the current Workspace was changed, make the following updates after the id change has been processed
            if (_.isEqual(currentWorkspaceId, origId)) {
                WorkspaceContextRepository.currentWorkspace = newId;
                ADK.Messaging.trigger('workspace:change:currentWorkspaceTitle', newScreenConfig.title);
                var previousFragment = Backbone.history._previousFragment;
                Navigation.updateRouter(newId, contextId);
                // we have to persist the previous fragment since updateRouter updates the history's _previousFragment
                Backbone.history._previousFragment = previousFragment;
            }

            var oldformattedFragment = formattedFragmentPrefix + oldScreenConfig.routeName;
            if (_.isEqual(Backbone.history._previousFragment, oldformattedFragment)) {
                Backbone.history._previousFragment = newformattedFragment;
            }
        }
        if (!_.isNull(screenIndex)) {
            screensConfig.screens[screenIndex] = newScreenConfig;
        } else {
            screensConfig.screens.push(newScreenConfig);
        }
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

        if (screenToRemove.id === WorkspaceContextRepository.currentContextDefaultScreen) {
            // ScreenBuilder.resetUserSelectedDefaultScreen();
            WorkspaceContextRepository.setDefaultScreenOfContext('patient',
                WorkspaceContextRepository.currentContext.get('originalDefaultScreen')
            );

            var preferences = ADK.UserService.getPreferences();
            var currentContextId = WorkspaceContextRepository.currentContextId;

            if (_.get(preferences, 'defaultScreen.' + currentContextId)) {
                delete preferences.defaultScreen[currentContextId];
            }

            ADK.UserService.savePreferences({append: false, preferences: preferences});
            ADK.UserService.getUserSession().trigger('change:preferences:defaultScreen');
        }

        // if we are trying to delete the screen that we came from, let's go back to the predefined default screen.
        if (ADK.ADKApp.currentScreen.id === screenToRemove.id) {
            // if we are also on the default screen, then set the default to the original, non-delete-able, default screen
            var currentContext = WorkspaceContextRepository.currentContext;
            if (ADK.ADKApp.currentScreen.id === currentContext.get('defaultScreen')) {
                WorkspaceContextRepository.setDefaultScreenOfContext(currentContext.get('id'), currentContext.get('originalDefaultScreen'));
            }
            Navigation.navigate(currentContext.get('defaultScreen'), {
                route: {
                    trigger: false
                }
            });
        }

        // Remove the workspace routes asscoiated with the acreen
        Navigation.removeWorkspaceRoute(screenToRemove.routeName || null, ADK.ADKApp);

        WorkspaceContextRepository.removeWorkspace(screenToRemove.id);

        ADK.ADKApp.Screens[screenToRemove.id].stop();
        delete ADK.ADKApp.Screens[screenToRemove.id];
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

    //Set the default screen. Omit the parameter to clear the default screen parameter.
    ScreenBuilder.resetDefaultScreen = function(screenId) {
        var defaultScreenId = screenId || '';
        var defaultScreen = {};
        defaultScreen[WorkspaceContextRepository.currentContextId] = defaultScreenId;
        ADK.UserService.savePreferences({preferences: {defaultScreen: defaultScreen}});
    };

    ScreenBuilder.setNewDefaultScreen = function(newDefaultScreenId) {
        ScreenBuilder.resetDefaultScreen(newDefaultScreenId);
        WorkspaceContextRepository.setDefaultScreenOfContext(WorkspaceContextRepository.currentWorkspaceAndContext.get('context'), newDefaultScreenId);
        ADK.UserService.getUserSession().trigger('change:preferences:defaultScreen');
    };

    ScreenBuilder.initAllRouters = function(app) {
        var deferred = new $.Deferred();
        var promise = UserDefinedScreens.getScreensConfig();
        promise.done(function(screensConfig) {
            var ScreensManifest = Messaging.request('ScreensManifest');
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
                if (!app.hasOwnProperty(screenDescriptor.routeName)) {
                    var screenModule = app.module('Screens.' + screenDescriptor.routeName);
                    screenModule.buildPromise = $.Deferred();
                    Navigation.initWorkspaceRoute(screenDescriptor.routeName, app);
                }
            });

            Navigation.initContextRoutes(app);
            deferred.resolve();
        });
        return deferred;
    };

    ScreenBuilder.buildAll = function(marionetteApp) {
        var applets = AppletsManifest.applets;
        ResourceBuilder.buildAll();

        var ScreensManifest = Messaging.request('ScreensManifest');
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
            var matchingScreen = _.findWhere(ScreensManifest.screens, {
                routeName: screenConfig.id
            });

            if (!_.isEmpty(matchingScreen.requiredPermissions)) {
                screenConfig.requiredPermissions = matchingScreen.requiredPermissions;
            }
            ScreenBuilder.build(marionetteApp, screenConfig);
        }
        if (Session.allAppletsLoadedPromise.state() === 'pending') {
            AppletBuilder.buildAll({
                app: marionetteApp,
                applets: applets,
                loadPromise: Session.allAppletsLoadedPromise
            });
        }
    };

    ScreenBuilder.build = function(marionetteApp, workspaceConfig) {
        var workspaceModule = marionetteApp.module('Screens.' + workspaceConfig.id);
        initializeScreenModule(workspaceModule, workspaceConfig);
        if (workspaceModule.config && workspaceModule.config.predefined === false) {
            // For not predefined config
            UserDefinedScreens.updateScreenModuleFromStorage(workspaceModule);
        }

        var ScreensManifest = Messaging.request('ScreensManifest');
        var matchingScreenManifest = _.findWhere(ScreensManifest.screens, {
            routeName: workspaceConfig.id
        }) || {};
        if (!_.isEmpty(matchingScreenManifest.requiredPermissions)) {
            workspaceConfig.requiredPermissions = matchingScreenManifest.requiredPermissions;
        }

        WorkspaceContextRepository.addWorkspace(workspaceConfig);

        workspaceModule.buildPromise.resolve();
        return workspaceModule;
    };

    function initializeScreenModule(screenModule, screenConfig) {
        var ScreensManifest = Messaging.request('ScreensManifest');
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
        screenConfig.topRegionLayout = "default";
        require(['main/layouts/topRegionLayouts/' + screenConfig.topRegionLayout], function(loadedLayout) {
            screenModule.topRegion_layoutView = loadedLayout;
            screenModule.topRegion_layoutPromise.resolve();
        });

        //Layout to use in the applet-region
        screenModule.contentRegion_layoutPromise = $.Deferred();
        require(['main/layouts/' + screenConfig.contentRegionLayout], function(loadedLayout) {
            screenModule.contentRegion_layoutView = loadedLayout;
            screenModule.contentRegion_layoutPromise.resolve();
        });
    }

    return ScreenBuilder;
});
