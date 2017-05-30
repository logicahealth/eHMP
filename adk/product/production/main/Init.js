define([
    'backbone',
    'marionette',
    'jquery',
    'underscore',
    'api/Messaging',
    'main/overrides/overrides',
    'api/SessionStorage',
    'main/AppletsManifest',
    'main/ScreensManifest',
    'main/ResourcesManifest',
    'main/ContextManifest',
    'main/NewUserScreen',
    'main/PreDefinedScreens',
    '_assets/js/browserDetector/browserDetector',
    'main/context/ContextAspectBuilder',
    'moment'
], function(Backbone, Marionette, $, _, Messaging, Overrides, SessionStorage, AppletsManifest, ScreensManifest, ResourcesManifest, ContextManifest, NewUserScreen, PreDefinedScreens, BrowserDetector, ContextAspectBuilder, moment) {
    'use strict';

    var SCREENS = 'app/screens/screens.min.js';
    var APPLETS = 'app/applets/applets.min.js';
    var CONTEXTS = 'app/contexts/contexts.min.js';
    var RESOURCES = 'app/resources/resources.min.js';
    var SCREENS_MANIFEST = 'app/screens/ScreensManifest.js';
    var PREDEFINED_SCREENS = 'app/screens/PreDefinedScreens.js';
    var NEW_USERS_SCREENS = 'app/screens/NewUserScreen.js';
    var APPLETS_MANIFEST = 'app/applets/appletsManifest.js';
    var RESOURCES_MANIFEST = 'app/resources/resourceManifest.js';
    var WORKSPACE_CONTEXT_MANIFEST = 'app/contexts/ContextManifest.js';
    var CONFIG_MANIFEST = 'json!manifest.json';
    var CONFIG_APP = 'json!app.json';
    var JWTSESSION = 'X-Set-JWT';

    /** Start loading the ehmp-ui related files */
    var EhmpUiFilesLoaded = $.Deferred();
    var ScreenManifestsLoaded = $.Deferred();
    var PreDefinedScreensLoaded = $.Deferred();
    var AppletsManifestLoaded = $.Deferred();
    var ResourcesManifestLoaded = $.Deferred();
    var ContextManifestLoaded = $.Deferred();
    var ApplicationContextsLoaded = $.Deferred();

    var facilityMonikers = new Backbone.Collection();
    var Init = {};
    //internal function for grabbing the jwt to send to RDK each time if available
    var getJwt = function(){
        return SessionStorage.get.sessionModel(JWTSESSION);
    };

    // limit browser to supported browsers
    BrowserDetector.enforceBrowserType();

    // This is not necessary but it helps stop moment form spamming the console
    moment.suppressDeprecationWarnings = true;

    // this allows AJAX to send cookies to a server
    // these cookies are needed for the server's session to run
    $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
        var jwt = getJwt().get('jwt');
        if (jwt) {
            jqXHR.setRequestHeader('Authorization', 'Bearer ' + jwt);
        }
        options.xhrFields = {
            withCredentials: true
        };
    });

    $.ajaxSetup({
        cache: false
    });

    Array.prototype.equals = function () {
        return  _.isEqual.apply(this, arguments);
    };

    // Array.prototype.equals = function(array) {
    //     if (!array)
    //         return false;
    //     if (this.length != array.length)
    //         return false;
    //
    //     for (var i = 0, l = this.length; i < l; i++) {
    //         if (this[i] instanceof Array && array[i] instanceof Array) {
    //             if (!this[i].equals(array[i]))
    //                 return false;
    //         } else if (this[i] != array[i]) {
    //             return false;
    //         }
    //     }
    //     return true;
    // };

    Messaging.reply("NewUserScreen", function() {
        return NewUserScreen;
    });

    Messaging.reply("PreDefinedScreens", function() {
        return PreDefinedScreens;
    });

    Messaging.reply("AppletsManifest", function() {
        return AppletsManifest;
    });

    Messaging.reply("ScreensManifest", function() {
        return ScreensManifest;
    });

    Messaging.reply("ResourcesManifest", function() {
        return ResourcesManifest;
    });

    Messaging.reply("facilityMonikers", function() {
        return facilityMonikers;
    });

    Messaging.reply('ContextManifest', function() {
        return ContextManifest;
    });

    Init.beforeStart = function() {
        var onLoadScreens = function() {
            require([SCREENS_MANIFEST], function(data) {
                _.extend(ScreensManifest, data);
                ScreenManifestsLoaded.resolve();
            });
            require([PREDEFINED_SCREENS], function(data) {
                _.extend(PreDefinedScreens, data);
                PreDefinedScreensLoaded.resolve();
            });
        };
        var onLoadApplets = function() {
            require([APPLETS_MANIFEST], function(data) {
                _.extend(AppletsManifest, data);
                AppletsManifestLoaded.resolve();
            });
        };
        var onLoadContexts = function() {
            require([WORKSPACE_CONTEXT_MANIFEST], function(data) {
                _.extend(ContextManifest, data);
                ContextManifestLoaded.resolve();
            });
        };
        var onLoadResources = function() {
            require([RESOURCES_MANIFEST], function(data) {
                _.extend(ResourcesManifest, data);
                ResourcesManifestLoaded.resolve();
            });
        };
        //make sure that we have screens and applets to use first
        require([SCREENS], onLoadScreens, onLoadScreens);
        require([APPLETS], onLoadApplets, onLoadApplets);
        require([CONTEXTS], onLoadContexts, onLoadContexts);
        require([RESOURCES], onLoadResources, onLoadResources);

        $.when(ContextManifestLoaded).then(function(appConfig) {
            ContextAspectBuilder.buildAll(function() {
                ApplicationContextsLoaded.resolve();
            }, function() {
                ApplicationContextsLoaded.reject();
            });
        }).fail(EhmpUiFilesLoaded.reject);

        $.when(ScreenManifestsLoaded, PreDefinedScreensLoaded, AppletsManifestLoaded, ResourcesManifestLoaded, ContextManifestLoaded, ApplicationContextsLoaded).then(function() {
            EhmpUiFilesLoaded.resolve();
            Init.start();
        }, function() {
            EhmpUiFilesLoaded.reject();
        });

    };

    Init.start = function() {
        //make sure that ADK is available to everything
        require([
            'main/ADK'
        ], function(ADK) {
            //now that ADK is ready and global lets allow things to use it
            require([
                'main/ADKApp',
                'main/ResourceDirectory',
                'main/EhmpConfiguration',
                'main/components/views/globalErrorView',
                'api/ResourceService',
                'api/UIComponents',
                CONFIG_APP,
                CONFIG_MANIFEST
            ], function(ADKApp, ResourceDirectory, EhmpConfiguration, GlobalErrorView, ResourceService, UIComponents, appConfigJson, appManifestJson) {
                var appManifest = new Backbone.Model(appManifestJson);
                var appConfig = new Backbone.Model(appConfigJson);
                var resourceDirectoryPathFetch = $.Deferred();
                var resourceDirectoryPathWriteback = $.Deferred();
                var resourceDirectoryPathPicklist = $.Deferred();
                var facilityMonikersLoaded = $.Deferred();
                var ehmpConfigurationLoaded = $.Deferred();

                ADK.Messaging.reply("appManifest", function() {
                    return appManifest;
                });

                ADK.Messaging.reply("appConfig", function() {
                    return appConfig;
                });

                function onError() {
                    var ModalRegionView = new GlobalErrorView({
                        errorMessage: "No Response From Resource Server<br/><small>Ensure that you have a stable network connection.</small>",
                        refreshButton: 'Refresh Page'
                    });
                    ADKApp.modalRegion.show(ModalRegionView);
                    $('#top-region').empty();
                    $('#mainModal').modal({
                        show: true,
                        backdrop: 'static',
                        keyboard: false
                    });
                }

                var resourceDirectoryFetch = ResourceDirectory.instance();
                resourceDirectoryFetch.fetch({
                    url: appConfig.get('resourceDirectoryPathFetch'),
                    success: function() {
                        resourceDirectoryPathFetch.resolve();
                    },
                    error: function() {
                        onError();
                    },
                    remove: false,
                    timeout: appConfig.get('resourceDirectoryTimeout')
                });

                var resourceDirectoryWriteback = ResourceDirectory.instance();
                resourceDirectoryWriteback.fetch({
                    url: appConfig.get('resourceDirectoryPathWriteback'),
                    success: function() {
                        resourceDirectoryPathWriteback.resolve();
                    },
                    error: function() {
                        onError();
                    },
                    remove: false,
                    timeout: appConfig.get('resourceDirectoryTimeout')
                });

                var resourceDirectoryPickList = ResourceDirectory.instance();
                resourceDirectoryPickList.fetch({
                    url: appConfig.get('resourceDirectoryPathPicklist'),
                    success: function() {
                        resourceDirectoryPathPicklist.resolve();
                    },
                    error: function() {
                        onError();
                    },
                    remove: false,
                    timeout: appConfig.get('resourceDirectoryTimeout')
                });

                function fetchFacilityMonikers() {
                    var facilityMonikerUrl = ResourceService.buildUrl('locations-facility-monikers');
                    facilityMonikers.fetch({
                        url: facilityMonikerUrl,
                        success: function() {
                            facilityMonikersLoaded.resolve();
                        },
                        error: function() {
                            console.log('Failed to resolve facility monikers');
                        }
                    });
                }

                function fetchEhmpConfig() {
                    var ehmpConfig = EhmpConfiguration.instance();
                    ehmpConfig.fetch({
                        success: function(model) {
                            ADK.Messaging.reply("ehmpConfig", function() {
                                return model;
                            });
                            Object.freeze(model.attributes);
                            ehmpConfigurationLoaded.resolve();
                        },
                        error: function(model, resp, options) {
                            console.error('Failed to resolve eHMP Configuration from server.', resp);
                            onError();
                        }
                    });
                }

                $.when(resourceDirectoryPathFetch, resourceDirectoryPathWriteback, resourceDirectoryPathPicklist).done(function() {
                    fetchFacilityMonikers();
                    fetchEhmpConfig();
                });

                ADKApp.on('before:start', function() {
                    $.when(resourceDirectoryPathFetch, resourceDirectoryPathWriteback, resourceDirectoryPathPicklist, EhmpUiFilesLoaded, facilityMonikersLoaded, ehmpConfigurationLoaded).done(function() {
                        ADK.WorkspaceContextRepository.onLoad();
                        ADKApp.initAllRouters();
                    });

                });

                ADKApp.start({});
            });
        });

    };

    return Init;
});
