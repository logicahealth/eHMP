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
    'api/WorkspaceContextRepository',
    'main/accessibility/components',
    'bowser'
], function(
    Backbone,
    Marionette,
    _,
    $,
    Handlebars,
    Session,
    ScreenDisplay,
    ScreenBuilder,
    Messaging,
    SessionStorage,
    UserDefinedScreens,
    ResourceService,
    UserService,
    Navigation,
    ResizeUtils,
    WorkspaceContextRepository,
    Accessibility,
    Bowser
) {
    'use strict';

    var ScreensManifest = Messaging.request('ScreensManifest');

    var ADKApp = new Backbone.Marionette.Application();
    ADKApp.initAllRoutersPromise = new $.Deferred();

    ADKApp.session = Session;

    ADKApp.on('start', function() {
        Messaging.trigger('app:start');
        ADKApp.initAllRoutersPromise.done(function() {
            if (Backbone.history) {
                Backbone.history.start();
            }
            //ADK.Notifications.watch();
        });
        ResizeUtils.register();

        if (Bowser.msie) {
            ADKApp.InternetExplorerPolyfills();
        }
    });

    ADKApp.commands.setHandler('route:update', function(workspaceId, contextId) {
        var routeString;
        var contextGetRoutFunction = WorkspaceContextRepository.currentContext.get('getRoute');
        if (_.isFunction(contextGetRoutFunction)) {
            routeString = contextGetRoutFunction(workspaceId, contextId);
        } else {
            routeString = (contextId ? contextId + '/' : '') + workspaceId;
        }
        ADKApp.router.navigate('/' + routeString);
    });
    ADKApp.commands.setHandler('screen:display', function(routeConfig, options) {
        _.each([ADKApp.modalRegion, ADKApp.workflowRegion, ADKApp.alertRegion], function(region) {
            if (region.hasView()) {
                region.currentView.$el.modal('hide');
            }
        });

        if ($('.modal-backdrop').hasClass('in')) {
            $('#mainModal').trigger('close.bs.modal');
        }

        var workspaceModel = routeConfig.workspaceModel;
        var contextModel = routeConfig.contextModel;
        var workspaceId = workspaceModel.get('id');
        var contextId = contextModel.get('id');
        var workspaceModule = ADKApp.Screens[workspaceId];
        workspaceModule.buildPromise.done(function() {
            ScreenDisplay.createScreen(workspaceModule, workspaceId, contextId, workspaceModel, contextModel, ADKApp, options);
        });
    });

    Messaging.on('patient:selected', function(patient) {
        SessionStorage.clear(WorkspaceContextRepository.getContext('patient').get('id') + '-appletStorage');
        SessionStorage.delete.sessionModel('globalDate', true);
        SessionStorage.delete.sessionModel('patient', false, {
            silent: true
        });
        SessionStorage.addModel('patient', patient);
    });

    Messaging.reply('get:current:screen', function() {
        return ADKApp.currentScreen;
    });
    Messaging.reply('get:current:workspace', function() {
        return ADKApp.currentWorkspace;
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
        }
    });

    var AppController = Backbone.Marionette.Controller.extend({
        defaultRoute: function(routeName) {
            if (routeName && routeName.indexOf('?') > -1 && routeName.indexOf('=') > -1 && routeName.split('?')[0] === ScreensManifest.ssoLogonScreen) {
                var routeInfo = routeName.split('?');
                SessionStorage.clear('SSO');
                SessionStorage.addModel('SSO', new Backbone.Model({
                    'CPRSHostIP': routeInfo[1].split('=')[1]
                }));
                Navigation.navigate(routeInfo[0]);
            } else {
                var workspaceId = WorkspaceContextRepository.appDefaultScreen;
                ADKApp.Screens[workspaceId].buildPromise.done(function() {
                    Navigation.navigate(workspaceId);
                });
            }
        }
    });

    ADKApp.router = new Router({
        controller: new AppController()
    });

    ADKApp.initAllRouters = function() {
        var promise = ScreenBuilder.initAllRouters(ADKApp);
        promise.done(function() {
            ADKApp.initAllRoutersPromise.resolve();
            ScreenBuilder.buildAll(ADKApp);
        });
    };

    ADKApp.InternetExplorerPolyfills = function() {
        //Fix for the known bug in Internet Explorer where the select dropdown is incorrectly sized
        //Refer to DE6569 for more information
        $('body').on('mousedown', 'select', function(event) {
            $(event.target).focus();
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

    _.extend(Backbone.History.prototype, {
        getFragment: function(fragment) {
            var routeStripper = /^#|\s+$/g;
            if (!(!!fragment)) {
                if (this._usePushState || !this._wantsHashChange) {
                    fragment = this.getPath();
                } else {
                    fragment = this.getHash();
                }
            }
            var finalFragment = fragment.replace(routeStripper, '');
            if (this.fragment && this.fragment != finalFragment) {
                this._previousFragment = this.fragment;
            }
            return finalFragment;
        }
    });


    return ADKApp;
});