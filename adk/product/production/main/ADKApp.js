define([
    'backbone',
    'marionette',
    'underscore',
    'jquery',
    'handlebars',
    'main/Session',
    'main/ScreenDisplay',
    'main/ScreenBuilder',
    'api/Messaging',
    'api/SessionStorage',
    'api/UserDefinedScreens',
    'api/ResourceService',
    'api/UserService',
    'api/Navigation',
    'main/adk_utils/resizeUtils',
    'main/accessibility/components',
    'main/components/views/notificationsModal'
], function(Backbone, Marionette, _, $, Handlebars, Session, ScreenDisplay, ScreenBuilder, Messaging, SessionStorage, UserDefinedScreens, ResourceService, UserService, Navigation, ResizeUtils, Accessibility, notificationsModal) {
    'use strict';

    var ScreensManifest = Messaging.request('ScreensManifest');
    var ADKApp = new Backbone.Marionette.Application();
    ADKApp.initAllRoutersPromise = new $.Deferred();
    ADKApp.session = Session;
    ADKApp.predefinedDefaultScreen = ScreensManifest.predefinedDefaultScreen;
    ADKApp.userSelectedDefaultScreen = ADKApp.predefinedDefaultScreen;

    ADKApp.on('start', function() {
        Messaging.trigger('app:start');
        ADKApp.initAllRoutersPromise.done(function() {
            if (Backbone.history) {
                Backbone.history.start();
            }
            ADK.Notifications.watch();
        });
        ResizeUtils.register();
    });

    Messaging.on('app:logged-in', function(patient) {
        ScreenBuilder.buildAll(ADKApp);
        ADK.Notifications.watch();
        var options = {
            getAllNotifications: true,
            globalNotificationsCollection: new Backbone.Collection()
        };
        notificationsModal.show(options);
    });

    ADKApp.commands.setHandler('screen:navigate', function(screenName, routeOptions, extraScreenDisplayOptions) {
        ADKApp.router.navigate(screenName);
        ADKApp.execute('screen:display', screenName, routeOptions, extraScreenDisplayOptions);
    });
    var hasPermission = function(screenModule) {
        var hasPermission = true;
        if (!_.isUndefined(screenModule.config) && !_.isUndefined(screenModule.config.requiredPermissions)) {
            _.each(screenModule.config.requiredPermissions, function(permission) {
                if (!UserService.hasPermission(permission)) {
                    hasPermission = false;
                }
            });
        }
        return hasPermission;
    };
    ADKApp.commands.setHandler('screen:display', function(screenName, routeOptions, extraScreenDisplayOptions) {
        var lastWorkspace = SessionStorage.getModel('lastWorkspace').attributes.workspace;

        if (_.isUndefined(screenName)) {
            screenName = lastWorkspace || ADKApp.userSelectedDefaultScreen || ScreensManifest.predefinedDefaultScreen;
        }

        var loggedIn = UserService.checkUserSession();
        if (!loggedIn && screenName !== ScreensManifest.ssoLogonScreen) {
            if (_.isUndefined(ScreensManifest.logonScreen)) {
                console.warn('logonScreen is undefined - unable to navigate.  Update ScreensManifest with logonScreen.');
                return;
            }
            screenName = ScreensManifest.logonScreen;
        }

        //TODO Find a more elegant approach that utilizes the code already
        _.each([ADKApp.modalRegion, ADKApp.workflowRegion, ADKApp.alertRegion], function(region) {
            if (region.hasView()) {
                region.currentView.$el.modal('hide');
            }
        });

        $(document).on('shown.bs.modal', '#mainModal', function() {
            var zIndex = Math.max.apply(null, Array.prototype.map.call($('.modal:visible'), function(el) {
                return +el.style.zIndex;
            })) + 10;
            $(this).css('z-index', zIndex);
        });

        if ($('.modal-backdrop').hasClass('in')) {
            $('#mainModal').trigger('close.bs.modal');
        }

        var screenModule = ADKApp[screenName];
        if (_.isUndefined(screenModule)) {
            console.warn('Screen module is undefined for screen ' + screenName + '. Redirecting to default screen');
            screenName = ADKApp.userSelectedDefaultScreen || ScreensManifest.predefinedDefaultScreen;
            screenModule = ADKApp[screenName];
        }

        if (screenName && screenModule) {
            var screenHasChanged = false;
            screenModule.buildPromise.done(function() {
                if (screenModule.config.patientRequired === true || screenName === ScreensManifest.patientSearchScreen) {
                    if (UserService.hasPermission('read-patient-record')) {
                        if (_.isEmpty(ResourceService.patientRecordService.getCurrentPatient().attributes)) {
                            screenName = ScreensManifest.patientSearchScreen;
                            ADKApp.router.navigate(screenName);
                            screenModule = ADKApp[screenName];
                            screenHasChanged = true;
                        } else {
                            if (hasPermission(screenModule) === false) {
                                console.warn('User does not have permission to access screen ' + screenName + '. Redirecting to default screen');
                                screenName = ADKApp.userSelectedDefaultScreen || ScreensManifest.predefinedDefaultScreen;
                                ADKApp.router.navigate(screenName);
                                screenModule = ADKApp[screenName];
                                screenHasChanged = true;
                            }
                        }
                    } else {
                        screenName = ScreensManifest.providerDefaultScreen;
                        ADKApp.router.navigate(screenName);
                        screenModule = ADKApp[screenName];
                        screenHasChanged = true;
                    }
                }
                if (screenHasChanged) {
                    screenModule.buildPromise.done(function() {
                        ScreenDisplay.createScreen(screenModule, screenName, routeOptions, ADKApp, extraScreenDisplayOptions);
                    });
                } else {
                    ScreenDisplay.createScreen(screenModule, screenName, routeOptions, ADKApp, extraScreenDisplayOptions);
                }
            });
        }
    });

    Messaging.on('patient:selected', function(patient) {
        SessionStorage.clear('appletStorage');
        SessionStorage.delete.sessionModel('globalDate', true);
        SessionStorage.delete.sessionModel('patient');
        SessionStorage.addModel('patient', patient);
    });

    Messaging.reply('get:current:screen', function() {
        return ADKApp.currentScreen;
    });
    Messaging.reply('get:current:workspace', function() {
        return ADKApp.currentWorkspace;
    });

    /**
     * This is the part that WILL take the user to the login screen
     * @return {undefined}
     */
    Messaging.on('user:sessionEnd', function() {
        var screenName = ADKApp.userSelectedDefaultScreen;
        Navigation.navigate(screenName);

        ADK.Notifications.unwatch();
    });

    ADKApp.addRegions({
        ccowRegion: '#ccow-controls',
        topRegion: '#top-region',
        centerRegion: '#center-region',
        bottomRegion: '#bottom-region',
        modalRegion: '#modal-region',
        workflowRegion: '#workflow-region',
        alertRegion: '#alert-region',
        ariaLiveAssertiveRegion: '#aria-live-assertive-region',
        ariaLivePoliteRegion: '#aria-live-polite-region'
    });
    Messaging.reply('get:adkApp:region', function(regionName) {
        return ADKApp[regionName];
    });

    Accessibility.Notification.showAriaLiveViews();

    var Router = Marionette.AppRouter.extend({
        appRoutes: {
            '*default': 'defaultRoute'
        },
        onRoute: function(name, path, args) {
            //console.log('onRoute name:', name);
            //console.log('onRoute path:', path);
            //console.log('onRoute args:', args);
        }
    });

    var AppController = Backbone.Marionette.Controller.extend({
        defaultRoute: function(routeName) {
            if (routeName && routeName.indexOf("?") > -1 && routeName.indexOf("=") > -1 && routeName.split("?")[0] === ScreensManifest.ssoLogonScreen) {
                var routeInfo = routeName.split("?");
                SessionStorage.clear('SSO');
                SessionStorage.addModel('SSO', new Backbone.Model({
                    'CPRSHostIP': routeInfo[1].split("=")[1]
                }));
                ADKApp.execute('screen:navigate', routeInfo[0]);
            } else {
                ADKApp.execute('screen:display');
            }
        }
    });

    ADKApp.router = new Router({
        controller: new AppController()
    });

    ADKApp.initAllRouters = function() {
        var promise = ScreenBuilder.initAllRouters(ADKApp);
        promise.done(function() {
            ScreenBuilder.buildAll(ADKApp);
            ADKApp.initAllRoutersPromise.resolve();
        });
    };

    ADKApp.ScreenPassthrough = {
        setNewDefaultScreen: function(id) {
            return ScreenBuilder.setNewDefaultScreen(id);
        },
        deleteUserScreen: function(id) {
            return ScreenBuilder.deleteUserScreen(id);
        },
        editScreen: function(options, id) {
            return ScreenBuilder.editScreen(options, id);
        },
        titleExists: function(title) {
            return ScreenBuilder.titleExists(title);
        },
        addNewScreen: function(options, app, index, callback) {
            return ScreenBuilder.addNewScreen(options, app, index, callback);
        }
    };

    return ADKApp;
});