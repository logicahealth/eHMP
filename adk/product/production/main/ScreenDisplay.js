define([
    'backbone',
    'marionette',
    'underscore',
    'jquery',
    'main/Session',
    'main/ComponentLoader',
    'main/components/views/ccowObjectsView',
    'main/ADKApp',
    'main/Utils',
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
    'api/WorkspaceContextRepository'
], function(Backbone, Marionette, _, $, session, ComponentLoader, CCOWObjectsView, ADKApp, Utils, Messaging, PatientRecordService, SessionStorage, UserDefinedScreens, ViewSwitchboard, Highcharts, ChromeView, AppletControllerView, Handlebars, WorkspaceFilters, chromeContainerTemplate, DefaultCenterRegionLayout, UserService, WorkspaceContextRepository) {
    'use strict';

    var ScreensManifest = Messaging.request('ScreensManifest');
    var ScreenDisplay = {};
    var pendingPromises = [];

    ScreenDisplay.createScreen = function(screenModule, screenName, contextId, workspaceModel, contextModel, ADKApp, options) {
        Messaging.trigger("load.ehmp.workspace");
        session.allUIResourcesLoadedPromise.done(function() {
            _.each(pendingPromises, function(promise) {
                promise.reject();
            });
            options = options || {};
            // e.g. options
            // {
            //   route: true,
            //   extraScreenDisplay: {
            //     dontLoadApplets: true
            //   },
            //   callback: function () {...}
            // }

            if (screenModule) {
                if (typeof OWA !== "undefined") {
                    try {
                        var OWATracker = new OWA.tracker();
                        OWATracker.setSiteId('f6eca28945621473f2cbd850e859ab74');
                        var screenChange = OWATracker.makeEvent();
                        screenChange.setEventType("screenChange");
                        screenChange.set("screenChange", screenName);
                        screenChange.getProperties();
                        OWATracker.trackEvent(screenChange);
                        OWATracker.trackPageView();
                        OWATracker.trackDomStream();
                        // this capability is going to be made available in a future sprint
                        //OWATracker.trackClicks();
                    } catch (err) {
                        console.log("OWA error:  " + err);
                    }
                }
                if (ADKApp.currentScreen && ADKApp.currentScreen.config && ADKApp.currentScreen.config.onStop) {
                    ADKApp.currentScreen.config.onStop();
                }
                ADKApp.currentScreen = screenModule;
                var lastWorkspace = SessionStorage.get.sessionModel('lastWorkspace').get('workspace');
                if (_.isUndefined(lastWorkspace)) {
                    ADKApp.currentWorkspace = screenModule.config.id;
                } else {
                    ADKApp.currentWorkspace = lastWorkspace;
                }
                var screenShowPromise = $.Deferred();
                pendingPromises.push(screenShowPromise);
                screenModule.buildPromise.done(function() {
                    if (screenShowPromise.state() === 'pending') {
                        screenShowPromise.resolve();
                    }
                });
                screenShowPromise.always(function() {
                    _.remove(pendingPromises, function(promise) {
                        return promise === screenShowPromise;
                    });
                }).done(function() {
                    var extraScreenDisplayOptions = _.extend({
                        'dontLoadApplets': false
                    }, options.extraScreenDisplay);

                    // Only show CCOW ActiveX controls in IE & if we have a session already
                    if ("ActiveXObject" in window && (screenName === WorkspaceContextRepository.getDefaultScreenOfContext('staff'))) {
                       //Launch of CCOW
                        Messaging.on('ccow:init', function () {
                                var ccowView = new CCOWObjectsView();
                                ADKApp.ccowRegion.show(ccowView);
                        });
                    }

                    var contentRegion_layoutView, topRegion_layoutView, centerRegion_layoutView;
                    var componentShowPromise = $.Deferred();
                    pendingPromises.push(componentShowPromise);
                    screenModule.topRegion_layoutPromise.done(function() {
                        if (componentShowPromise.state() === 'pending') {
                            componentShowPromise.resolve();
                        }
                    });
                    componentShowPromise.always(function() {
                        _.remove(pendingPromises, function(promise) {
                            return promise === componentShowPromise;
                        });
                    }).done(function() {
                        topRegion_layoutView = ADKApp.topRegion.currentView;
                        if (!(topRegion_layoutView instanceof screenModule.topRegion_layoutView)) {
                            topRegion_layoutView = new screenModule.topRegion_layoutView();
                            ADKApp.topRegion.show(topRegion_layoutView);
                        }

                        centerRegion_layoutView = ADKApp.centerRegion.currentView;
                        var CenterRegionLayout = null;
                        var contextLayout = contextModel.get('layout');
                        contextLayout = _.isFunction(contextLayout) ? contextLayout(workspaceModel) : contextLayout;
                        contextLayout = contextLayout || null;
                        if (!_.isNull(contextLayout)) {
                            CenterRegionLayout = contextLayout;
                        } else {
                            CenterRegionLayout = DefaultCenterRegionLayout;
                        }
                        if (!(centerRegion_layoutView instanceof CenterRegionLayout)) {
                            centerRegion_layoutView = new CenterRegionLayout();
                            ADKApp.centerRegion.show(centerRegion_layoutView);
                        }

                        var currentPatient = PatientRecordService.getCurrentPatient();
                        ComponentLoader.load(ADKApp, topRegion_layoutView, screenModule.config, currentPatient, contextId);

                        var layoutShowPromise = $.Deferred();
                        pendingPromises.push(layoutShowPromise);
                        screenModule.contentRegion_layoutPromise.done(function() {
                            if (layoutShowPromise.state() === 'pending') {
                                layoutShowPromise.resolve();
                            }
                        });
                        layoutShowPromise.always(function() {
                            _.remove(pendingPromises, function(promise) {
                                return promise === layoutShowPromise;
                            });
                        }).done(function() {
                            // Call containerResize to force resizeUtils.dimensions model to update
                            Utils.resize.containerResize();
                            if (screenModule.patientRequired) {
                                WorkspaceFilters.retrieveWorkspaceFilters(screenName);
                            }

                            //creating dynamic template for gridster enabled page
                            if (screenModule.config.predefined === false || screenModule.config.contentRegionLayout === 'gridster') {
                                var deferred = UserDefinedScreens.updateScreenModuleFromStorage(screenModule);
                                deferred.done(function() {
                                    var template = UserDefinedScreens.getGridsterTemplate(screenModule);
                                    contentRegion_layoutView = new screenModule.contentRegion_layoutView({
                                        //template: _.template(template),
                                        template: Handlebars.compile(template),
                                        className: (function() {
                                            var classString = screenModule.contentRegion_layoutView.prototype.className;
                                            var predefinedBoolean = screenModule.config.predefined;
                                            if (!_.isUndefined(predefinedBoolean) && !predefinedBoolean) classString += ' user-defined-workspace';
                                            predefinedBoolean = null;
                                            return classString;
                                        })(),
                                        freezeApplets: screenModule.config.freezeApplets
                                    });
                                    centerRegion_layoutView.content_region.show(contentRegion_layoutView);
                                    screenModule.contentRegion_layoutView_obj = contentRegion_layoutView;
                                });
                            } else {
                                contentRegion_layoutView = new screenModule.contentRegion_layoutView();
                                centerRegion_layoutView.content_region.show(contentRegion_layoutView);
                                screenModule.contentRegion_layoutView_obj = contentRegion_layoutView;
                            }
                            //TEMPORARY FIX FOR LOGIN BACKGROUND IMAGE TO NOT DISPLAY IN APP
                            $('body').removeClass().attr('data-full-screen', false);
                            $('body').addClass(contextId + '-context ' + screenName);
                            if (screenModule.applets.length === 1 && _.isObject(screenModule.applets[0]) && screenModule.applets[0].fullScreen) {
                                // fix so we aren't looking for "-full" in screen name for styling
                                $('body').attr('data-full-screen', true);
                            }
                            if (!extraScreenDisplayOptions.dontLoadApplets) {
                                _.each(screenModule.applets, function(currentApplet) {
                                    var showPromise = $.Deferred();
                                    pendingPromises.push(showPromise);
                                    var appletModule = ADKApp.Applets[currentApplet.id];
                                    appletModule.buildPromise.done(function() {
                                        if (typeof currentApplet.setDefaultView === 'function') {
                                            currentApplet.setDefaultView();
                                        }
                                        var userNotAllowed;
                                        if (_.isUndefined(appletModule)) {
                                            ScreenDisplay.addEmptyAppletToScreen(currentApplet, screenModule);
                                        } else {
                                            $.when(screenModule.contentRegion_layoutPromise,
                                                screenModule.centerRegion_layoutPromise,
                                                screenModule.topRegion_layoutPromise,
                                                appletModule.buildPromise).then(function() {
                                                if (showPromise.state() === 'pending') {
                                                    showPromise.resolve();
                                                }
                                            });
                                            showPromise.done(function() {
                                                if (WorkspaceContextRepository.currentWorkspaceAndContext.get('workspace') === screenModule.id) {
                                                    if (appletModule.permissions) {
                                                        _.each(appletModule.permissions, function(permission) {
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
                                                        ScreenDisplay.addEmptyAppletToScreen(currentApplet, screenModule, userNotAllowed);
                                                        return;
                                                    }
                                                    ScreenDisplay.addAppletToScreen(appletModule, currentApplet, screenModule, options);
                                                }
                                            }).always(function() {
                                                _.remove(pendingPromises, function(promise) {
                                                    return promise === showPromise;
                                                });
                                            });
                                        }
                                    });
                                });
                            }
                            Messaging.trigger("loaded.ehmp.workspace");
                            // Execute user provided optional callback function
                            if (_.isFunction(options.callback)) {
                                options.callback();
                            }
                        });
                    });
                    if (screenModule.config.onStart) {
                        screenModule.config.onStart();
                        $('#screen-reader-screen-description').html('You have navigated to ' + screenName + '. Skip to main content.').focus();
                    }
                });
            }
        });
    };
    ScreenDisplay.addEmptyAppletToScreen = function(currentApplet, screenModule, userNotAllowed) {
        var appletModel = new Backbone.Model({
            title: currentApplet.id,
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
                message: '.applet-div-chrome-container'
            },
            onBeforeShow: function() {
                this.showChildView('message', new MessageView());
            }
        });

        var contentRegion_layoutView = screenModule.contentRegion_layoutView_obj;
        var regionName = currentApplet.region;
        if (regionName !== 'none') {
            if (_.isUndefined(contentRegion_layoutView[regionName])) {
                contentRegion_layoutView.addRegion(regionName, '#' + regionName);
            }
            contentRegion_layoutView[regionName].show(new AppletView({
                'appletConfig': appletModel
            }));
        }
    };

    ScreenDisplay.addAppletToScreen = function(appletModule, appletConfig, screenModule, screenOptions) {
        var routeOptions = screenOptions.route;

        if (appletModule) {
            var regionName = appletConfig.region;
            if (_.isUndefined(appletConfig.instanceId) || _.isNull(appletConfig.instanceId)) {
                appletConfig.instanceId = appletConfig.id;
            }

            var viewType = appletModule.defaultViewType || "";
            var AppletView;
            var options = {
                    appletConfig: appletConfig,
                    routeParam: routeOptions,
                    viewTypes: appletModule.appletConfig.viewTypes,
                    defaultViewType: appletModule.appletConfig.defaultViewType,
                    screenModule: screenModule,
                    fromMinimizedToMaximized: screenOptions.fromMinimizedToMaximized
            };

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
                    contentRegion_layoutView[regionName].show(new AppletView(options));
                } catch (e) {
                    // Changing the workspace before all the applets have finished loading can cause
                    // contentRegion_layoutView[regionName] to be undefined.  In the cases I have seen, the call for
                    // the show is no longer necessary because the region does not need to be displayed any longer.
                    console.warn('Possible error: ', e);
                }

            }

            if (appletModule.displayApplet) {
                appletModule.displayApplet();
            }
        }
    };

    return ScreenDisplay;
});
