define([
    'backbone',
    'marionette',
    'underscore',
    'jquery',
    'main/Session',
    'main/ComponentLoader',
    'main/ADKApp',
    'main/Utils',
    'main/AppletBuilder',
    'api/Checks',
    'api/Messaging',
    'api/PatientRecordService',
    'api/SessionStorage',
    'api/UserDefinedScreens',
    'main/components/applets/view_switchboard/optionsSelectionView',
    'highcharts',
    'main/components/applet_chrome/chromeView',
    'main/components/views/appletControllerView',
    'handlebars',
    'main/api/WorkspaceFilters',
    'hbs!main/components/applet_chrome/templates/containerTemplate',
    'main/layouts/centerRegionLayouts/default_fullWidth',
    'api/UserService',
    'api/WorkspaceContextRepository',
    'hbs!main/layouts/templates/gridsterScreenApplets'
], function(Backbone,
    Marionette,
    _,
    $,
    session,
    ComponentLoader,
    ADKApp,
    Utils,
    AppletBuilder,
    Checks,
    Messaging,
    PatientRecordService,
    SessionStorage,
    UserDefinedScreens,
    ViewSwitchboard,
    Highcharts,
    ChromeView,
    AppletControllerView,
    Handlebars,
    WorkspaceFilters,
    chromeContainerTemplate,
    DefaultCenterRegionLayout,
    UserService,
    WorkspaceContextRepository,
    GridsterScreenAppletsTemplate) {
    'use strict';

    var ScreensManifest = Messaging.request('ScreensManifest');
    var ScreenDisplay = {};


    /**
     * A function that takes the same params as requestAnimationFrame but does nothing.
     * @param func
     * @return {*}
     */
    function emptyWrapper(func) {
        return func();
    }


    /**
     * A object to manage pending promises as a controlled memory leak
     * @constructor
     */
    var PendingPromises = function PendingPromises() {
        this.pending = [];
    };


    /**
     * Add a new pending promise
     * @param promise
     */
    PendingPromises.prototype.add = function add(promise) {
        this.pending.push(promise);
    };


    /**
     * Remove a pending promise
     * @param promise
     */
    PendingPromises.prototype.remove = function remove(promise) {
        _.remove(this.pending, function(pending) {
            return promise === pending;
        });
    };


    /**
     * Reject all pending promises
     */
    PendingPromises.prototype.rejectAll = function rejectAll() {
        _.each(this.pending, function(promise) {
            _.get(promise, 'reject', _.noop)();
        });
        this.pending = [];
    };


    var pendingPromises = new PendingPromises();


    // noinspection JSValidateJSDoc
    /**
     * An object to help organize the process of screen creation.  Uses the same signature as ScreenBuilder.createScreen
     * @param screenModule
     * @param screenName
     * @param contextId
     * @param workspaceModel
     * @param contextModel
     * @param ADKApp
     * @param options {
     *      route: true,
     *      extraScreenDisplay: {
     *          dontLoadApplets: true,
     *          dontReloadApplets: true
     *      },
     *      callback: function() {}
     *  }
     * @constructor
     */
    var Screen = function Screen(screenModule, screenName, contextId, workspaceModel, contextModel, ADKApp, options) {
        pendingPromises.rejectAll();

        this.screenModule = screenModule;
        this.screenName = screenName;
        this.contextId = contextId;
        this.workspaceModel = workspaceModel;
        this.contextModel = contextModel;
        this.ADKApp = ADKApp;
        this.options = options || {};

        this.promises = {
            showScreen: this.iPromise(),
            componentShow: this.iPromise(),
            layoutShow: this.iPromise()
        };

        this.layoutViews = {
            contentRegion: null,
            topRegion: null,
            centerRegion: null
        };
    };


    /**
     * Same as a jQuery.Deferred except it manages pending promises, and bind `this` into the resolve
     * @return {jQuery.Deferred}
     */
    Screen.prototype.iPromise = function iPromise() {
        var promise = $.Deferred();
        pendingPromises.add(promise);
        promise.resolve = _.bind(promise.resolve, this);
        promise.always(function alwaysRemovePending() {
            pendingPromises.remove(promise);
        });
        return promise;
    };


    /**
     * Builds the new screen
     */
    Screen.prototype.create = function create() {
        var contentRegion = _.get(this.screenModule, 'app.centerRegion.currentView.content_region');
        var execute = emptyWrapper;
        var hasView = _.get(contentRegion, 'hasView', _.noop);

        this.setOWA();
        this.onStop(this.ADKApp);

        if (hasView.call(contentRegion)) {
            Messaging.trigger('obscure:content');
            execute = requestAnimationFrame;
            this.clearContentRegion(contentRegion);
        }
        execute(_.bind(function createNewScreen() {
            this.ADKApp.currentScreen = this.screenModule;
            this.ADKApp.currentWorkspace = this.getCurrentWorkspace();

            this.onScreenModuleBuildDone(this.ADKApp);
            this.promises.showScreen.done(this.onShowScreen);
            this.promises.componentShow.done(this.onComponentShow);
            this.promises.layoutShow.done(this.onLayoutShow);
            this.onStart();
        }, this));
    };


    /**
     * Removes items from the content region
     * @param contentRegion
     */
    Screen.prototype.clearContentRegion = function(contentRegion) {
        var manager = _.get(contentRegion, 'currentView.regionManager');
        requestAnimationFrame(function() {
            manager.removeRegions();
            Messaging.trigger('reveal:content');
        });
    };


    /**
     * If OWA exists, this initializes it.
     */
    Screen.prototype.setOWA = function setOWA() {
        if (typeof OWA === "undefined") {
            return;
        }

        try {
            var OWATracker = new OWA.tracker();
            OWATracker.setSiteId('f6eca28945621473f2cbd850e859ab74');
            var screenChange = OWATracker.makeEvent();
            screenChange.setEventType("screenChange");
            screenChange.set("screenChange", this.screenName);
            screenChange.getProperties();
            OWATracker.trackEvent(screenChange);
            OWATracker.trackPageView();
            OWATracker.trackDomStream();
        } catch (err) {
            console.log("OWA error:  " + err);
        }
    };


    /**
     * Invokes the onStop function if it exists
     */
    Screen.prototype.onStop = function onStop() {
        var config = _.get(this, 'ADKApp.currentScreen.config');
        _.get(config, 'onStop', _.noop).call(config);
    };


    /**
     * Invokes the onStart function if it exists
     */
    Screen.prototype.onStart = function onStart() {
        var config = _.get(this, 'screenModule.config', _.noop);
        _.get(config, 'onStart', _.noop).call(config);
    };


    /**
     * Returns the id of the current workspace
     */
    Screen.prototype.getCurrentWorkspace = function getCurrentWorkspace() {
        var lastWorkspace = SessionStorage.get.sessionModel('lastWorkspace').get('workspace');
        if (_.isUndefined(lastWorkspace)) {
            return this.screenModule.config.id;
        }
        return lastWorkspace;
    };


    /**
     * Returns the center region layout
     */
    Screen.prototype.getCenterRegionLayout = function getCenterRegionLayout() {
        var contextLayout = this.contextModel.get('layout');
        contextLayout = _.isFunction(contextLayout) ? contextLayout(this.workspaceModel) : contextLayout;
        contextLayout = contextLayout || null;
        return _.isNull(contextLayout) ? DefaultCenterRegionLayout : contextLayout;
    };


    /**
     * Corrects some dome attributes on the body.
     *
     * Comment about it being temporary transferred from original code, about 8 months old now, not so temporary.
     */
    Screen.prototype.fixBody = function fixBody() {
        //TEMPORARY FIX FOR LOGIN BACKGROUND IMAGE TO NOT DISPLAY IN APP
        var $body = $('body');

        $body.removeClass().attr('data-full-screen', false);
        $body.addClass(this.contextId + '-context ' + this.screenName);

        var isFullScreen = _.get(this, 'screenModule.applets[0].fullScreen', false);
        if (this.screenModule.applets.length === 1 && isFullScreen) {
            // fix so we aren't looking for "-full" in screen name for styling
            $body.attr('data-full-screen', true);
        }
    };

    /**
     * Sets up the content and center regions
     */
    Screen.prototype.createRegionsFromModule = function createRegionsFromModule() {
        this.layoutViews.contentRegion = new this.screenModule.contentRegion_layoutView();
        this.layoutViews.centerRegion.content_region.show(this.layoutViews.contentRegion);
        this.screenModule.contentRegion_layoutView_obj = this.layoutViews.contentRegion;
    };


    /**
     * Invokes the callback if it exists
     */
    Screen.prototype.callback = function callback() {
        _.get(this, 'options.callback', _.noop).call(this.options);
    };


    /**
     * Sends the load complete message in a new animation frame to reset call stack.
     */
    Screen.prototype.triggerLoadComplete = function triggerLoadComplete() {
        Messaging.trigger('navigate.ehmp.workspace');
        requestAnimationFrame(function triggerLoaded() {
            Messaging.trigger('loaded.ehmp.workspace');
        });
    };


    /**
     * Deferred Order:
     *      session.allUIResourcesLoadedPromise
     *      CreateScreen.onScreenModuleBuildDone
     */
    Screen.prototype.onScreenModuleBuildDone = function onScreenModuleBuildDone() {
        var screenShowPromise = this.promises.showScreen;
        var contextModel = this.contextModel;
        var options = this.options;
        var ADKApp = this.ADKApp;

        this.screenModule.buildPromise.done(function buildDone() {
            AppletBuilder.requiredByLayoutPromise(ADKApp, contextModel.get('id')).done(function layoutDone() {
                Checks.run('screen-display', function resolveShowScreen() {
                    if (screenShowPromise.state() === 'pending') {
                        screenShowPromise.resolve();
                    }
                }, options);
            });
        });
    };


    /**
     * Deferred Order:
     *      session.allUIResourcesLoadedPromise
     *      CreateScreen.onScreenModuleBuildDone
     *      CreateScreen.onShowScreen
     */
    Screen.prototype.onShowScreen = function onShowScreen() {
        this.onTopRegionDone();
    };


    /**
     * Deferred Order:
     *      session.allUIResourcesLoadedPromise
     *      CreateScreen.onScreenModuleBuildDone
     *      CreateScreen.onShowScreen
     *      CreateScreen.onTopRegionDone
     */
    Screen.prototype.onTopRegionDone = function onTopRegionDone() {
        var componentShowPromise = this.promises.componentShow;

        this.screenModule.topRegion_layoutPromise.done(function topRegionLayoutDone() {
            if (componentShowPromise.state() === 'pending') {
                componentShowPromise.resolve();
            }
        });
    };


    /**
     * Deferred Order:
     *      session.allUIResourcesLoadedPromise
     *      CreateScreen.onScreenModuleBuildDone
     *      CreateScreen.onShowScreen
     *      CreateScreen.onTopRegionDone
     *      CreateScreen.onComponentShow
     */
    Screen.prototype.onComponentShow = function onComponentShow() {
        this.layoutViews.topRegion = this.ADKApp.topRegion.currentView;
        if (!(this.layoutViews.topRegion instanceof this.screenModule.topRegion_layoutView)) {
            this.layoutViews.topRegion = new this.screenModule.topRegion_layoutView();
            this.ADKApp.topRegion.show(this.layoutViews.topRegion);
        }

        this.layoutViews.centerRegion = this.ADKApp.centerRegion.currentView;

        var CenterRegionLayout = this.getCenterRegionLayout();

        if (!(this.layoutViews.centerRegion instanceof CenterRegionLayout)) {
            this.layoutViews.centerRegion = new CenterRegionLayout();
            this.ADKApp.centerRegion.show(this.layoutViews.centerRegion);
        } else {
            this.layoutViews.centerRegion.triggerMethod('context:layout:update', this.options);
        }

        var currentPatient = PatientRecordService.getCurrentPatient();
        ComponentLoader.load(this.ADKApp, this.layoutViews.topRegion, this.screenModule.config, currentPatient, this.contextId);
        this.onCenterRegionDone();
    };


    /**
     * Deferred Order:
     *      session.allUIResourcesLoadedPromise
     *      CreateScreen.onScreenModuleBuildDone
     *      CreateScreen.onShowScreen
     *      CreateScreen.onTopRegionDone
     *      CreateScreen.onComponentShow
     *      CreateScreen.onCenterRegionDone
     */
    Screen.prototype.onCenterRegionDone = function onCenterRegionDone() {
        var layoutShowPromise = this.promises.layoutShow;

        this.screenModule.contentRegion_layoutPromise.done(function moduleLayoutShowDone() {
            if (layoutShowPromise.state() === 'pending') {
                layoutShowPromise.resolve();
            }
        });
    };


    /**
     * Deferred Order:
     *      session.allUIResourcesLoadedPromise
     *      CreateScreen.onScreenModuleBuildDone
     *      CreateScreen.onShowScreen
     *      CreateScreen.onTopRegionDone
     *      CreateScreen.onComponentShow
     *      CreateScreen.onCenterRegionDone
     *      CreateScreen.onLayoutShow
     */
    Screen.prototype.onLayoutShow = function onLayoutShow() {
        var config = _.get(this, 'screenModule.config', {});
        Utils.resize.containerResize();


        if (this.screenModule.patientRequired) {
            WorkspaceFilters.retrieveWorkspaceFilters(this.screenName);
        }

        if (!_.get(this.options, 'dontReloadApplets')) {
            if (config.predefined === false || config.contentRegionLayout === 'gridster') {
                this.updateFromStorage();
            } else {
                this.createRegionsFromModule();
            }

            this.fixBody();

            if (!_.get(this.options, 'dontLoadApplets', false)) {
                _.each(this.screenModule.applets, function(currentApplet) {
                    var showPromise = this.iPromise();
                    var appletModule = this.ADKApp.Applets[currentApplet.id];

                    appletModule.buildPromise.done(_.bind(function moduleBuildDone() {
                        if (_.isFunction(currentApplet.setDefaultView)) {
                            currentApplet.setDefaultView();
                        }
                        if (_.isUndefined(appletModule)) {
                            ScreenDisplay.addEmptyAppletToScreen(currentApplet, this.screenModule);
                        } else {
                            this.onAllReady(showPromise, appletModule);
                            showPromise.done(_.partial(this.onAppletDone, currentApplet, appletModule));
                        }
                    }, this));
                }, this);

                this.triggerLoadComplete();
                this.callback();
            }
        }

    };


    /**
     * Checks that everything is ready to build and resolves final promises
     * @param showPromise
     * @param appletModule
     */
    Screen.prototype.onAllReady = function(showPromise, appletModule) {
        var screenModule = this.screenModule;

        $.when(screenModule.contentRegion_layoutPromise,
            screenModule.centerRegion_layoutPromise,
            screenModule.topRegion_layoutPromise,
            appletModule.buildPromise).then(function() {
            if (showPromise.state() === 'pending') {
                showPromise.resolve();
            }
        });
    };


    /**
     * Handles drawing the applets to the screen.
     * @param currentApplet
     * @param appletModule
     */
    Screen.prototype.onAppletDone = function onAppletDone(currentApplet, appletModule) {
        var userNotAllowed;

        if (WorkspaceContextRepository.currentWorkspaceAndContext.get('workspace') === this.screenModule.id) {
            if (appletModule.permissions) {
                _.each(appletModule.permissions, function checkPermissions(permission) {
                    if (!UserService.hasPermission(permission)) {
                        userNotAllowed = true;
                        return false;
                    }
                });
            }
            if (!userNotAllowed && !_.isEmpty(appletModule.appletConfig.context)) {
                userNotAllowed = !ADK.utils.contextUtils.includesContext(appletModule.appletConfig.context);
            }
            if (userNotAllowed) {
                ScreenDisplay.addEmptyAppletToScreen(currentApplet, this.screenModule, userNotAllowed);
                return;
            }
            ScreenDisplay.addAppletToScreen(appletModule, currentApplet, this.screenModule, this.options);
        }
    };


    /**
     * Deferred Order:
     *      session.allUIResourcesLoadedPromise
     *      CreateScreen.onScreenModuleBuildDone
     *      CreateScreen.onShowScreen
     *      CreateScreen.onTopRegionDone
     *      CreateScreen.onComponentShow
     *      CreateScreen.onCenterRegionDone
     *      CreateScreen.onLayoutShow
     *      CreateScreen.updateFromStorage
     */
    Screen.prototype.updateFromStorage = function updateFromStorage() {
        var self = this;
        var deferred = UserDefinedScreens.updateScreenModuleFromStorage(this.screenModule);

        deferred.done(_.bind(function() {
            var execute = emptyWrapper;

            var GridsterView = this.screenModule.contentRegion_layoutView.extend({
                template: GridsterScreenAppletsTemplate,
                serializeData: function() {
                    var data = this.model.toJSON();
                    data.screenModuleId = self.screenModule.id;
                    data.screenApplets = UserDefinedScreens.getScreenModuleApplets(self.screenModule);
                    _.each(data.screenApplets, function(currentApplet) {
                        _.set(currentApplet, 'filterName', _.get(currentApplet, 'filterName', ''));
                    });
                    return data;
                },
                className: (function() {
                    var classString = self.screenModule.contentRegion_layoutView.prototype.className;
                    var predefinedBoolean = self.screenModule.config.predefined;
                    if (!_.isUndefined(predefinedBoolean) && !predefinedBoolean) classString += ' user-defined-workspace';
                    predefinedBoolean = null;
                    return classString;
                })(),
                freezeApplets: this.screenModule.config.freezeApplets
            });
            this.layoutViews.contentRegion = new GridsterView();

            execute(function() {
                self.layoutViews.centerRegion.content_region.show(self.layoutViews.contentRegion);
                self.screenModule.contentRegion_layoutView_obj = self.layoutViews.contentRegion;
            });
        }, this));
    };


    ScreenDisplay.createScreen = function(screenModule, screenName, contextId, workspaceModel, contextModel, ADKApp, options) {
        Messaging.trigger("load.ehmp.workspace");
        session.allUIResourcesLoadedPromise.done(function() {
            var screen = new Screen(screenModule, screenName, contextId, workspaceModel, contextModel, ADKApp, options);
            screen.create();
        });
    };

    ScreenDisplay.addEmptyAppletToScreen = function(currentApplet, screenModule, userNotAllowed) {
        var contentRegion = _.get(screenModule, 'app.centerRegion.currentView.content_region');
        var execute = _.result(contentRegion, 'hasView') ? requestAnimationFrame : emptyWrapper;

        execute(function() {
            var appletModel = new Backbone.Model({
                title: currentApplet.title || currentApplet.id,
                message: 'This applet is not available at this time.',
                messageTextClass: 'text-info'
            });

            if (userNotAllowed) {
                appletModel.set('message', 'This applet is disabled for this user at this time.');
            }

            var MessageView = Backbone.Marionette.ItemView.extend({
                model: appletModel,
                template: Handlebars.compile('<p class="{{messageTextClass}}">{{message}}</p>'),
                className: 'well well-sm'
            });

            var AppletView = Backbone.Marionette.LayoutView.extend({
                template: chromeContainerTemplate,
                model: appletModel,
                className: 'applet-not-found',
                attributes: {
                    'data-appletid': currentApplet.id,
                    'data-instanceId': currentApplet.instanceId
                },
                regions: {
                    message: '.applet-chrome-body'
                },
                onBeforeShow: function() {
                    this.showChildView('message', new MessageView());
                }
            });

            var contentRegion_layoutView = screenModule.contentRegion_layoutView_obj;
            var regionName = currentApplet.region;
            if (regionName !== 'none') {
                if (_.isUndefined(contentRegion_layoutView[regionName])) {
                    contentRegion_layoutView.addRegion(regionName, {
                        el: '#' + regionName,
                        regionClass: Marionette.Region.extend({
                            empty: function() {
                                var empty = _.bind(function() {
                                    Marionette.Region.prototype.empty.apply(this, arguments);
                                }, this);
                                _.throttle(empty)();
                            }
                        })
                    });
                }
                contentRegion_layoutView[regionName].show(new AppletView({
                    'appletConfig': appletModel
                }));
            }
        });
    };

    ScreenDisplay.addAppletToScreen = function(appletModule, appletConfig, screenModule, screenOptions) {
        var contentRegion = _.get(screenModule, 'app.centerRegion.currentView.content_region');
        var execute = _.result(contentRegion, 'hasView') ? requestAnimationFrame : emptyWrapper;

        var routeOptions = screenOptions.route;


        if (appletModule) {
            var regionName = appletConfig.region;
            if (_.isUndefined(appletConfig.instanceId) || _.isNull(appletConfig.instanceId)) {
                appletConfig.instanceId = appletConfig.id;
            }

            var viewType = appletModule.defaultViewType || "";
            var AppletView;
            var options = _.defaults({
                appletConfig: appletConfig,
                routeParam: routeOptions,
                viewTypes: appletModule.appletConfig.viewTypes,
                defaultViewType: appletModule.appletConfig.defaultViewType,
                screenModule: screenModule
            }, screenOptions);

            if (appletConfig.viewType !== undefined && appletConfig.viewType !== "undefined") {
                viewType = appletConfig.viewType;
            }
            if (appletModule.viewTypes) {
                if (Utils.appletUtils.isChromeEnabled(appletModule.appletConfig, viewType)) {
                    AppletView = ChromeView.extend({
                        appletScreenConfig: appletConfig,
                        appletViewConfig: Utils.appletUtils.getViewTypeConfig(appletModule.appletConfig, viewType),
                        AppletView: Utils.appletUtils.getViewTypeConfig(appletModule.appletConfig, viewType).view,
                        AppletController: AppletControllerView.extend({
                            viewType: viewType
                        }),
                        attributes: {
                            'data-appletid': appletConfig.id,
                            'data-instanceId': appletConfig.instanceId,
                        }
                    });
                } else {
                    AppletView = AppletControllerView.extend({
                        viewType: viewType
                    }).extend({
                        attributes: {
                            'data-appletid': appletConfig.id,
                            'data-instanceId': appletConfig.instanceId
                        }
                    });
                }
            } else {
                //Still use old getRootView as backup until it is deprecated
                AppletView = appletModule.getRootView(viewType).extend({
                    attributes: {
                        'data-appletid': appletConfig.id,
                        'data-instanceId': appletConfig.instanceId
                    }
                });
            }
            var contentRegion_layoutView = screenModule.contentRegion_layoutView_obj;
            if (regionName !== 'none') {
                if (_.isUndefined(contentRegion_layoutView[regionName])) {
                    contentRegion_layoutView.addRegion(regionName, '#' + regionName);
                }
                options.region = contentRegion_layoutView[regionName];
                try {
                    var region = contentRegion_layoutView[regionName];
                    AppletView = AppletView.extend({
                        _uniqueId: _.get(appletConfig, 'instanceId')
                    });
                    execute(function() {
                        region.show(new AppletView(options));
                    });
                } catch (error) {
                    console.warn('Possible error: ', error);
                }
            }
            if (appletModule.displayApplet) {
                appletModule.displayApplet();
            }
        }
    };

    return ScreenDisplay;
});