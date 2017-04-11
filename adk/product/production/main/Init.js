define([
    'backbone',
    'marionette',
    'jquery',
    'underscore',
    'api/Messaging',
    'api/UIComponents',
    'main/AppletsManifest',
    'main/ScreensManifest',
    'main/ResourcesManifest',
    'main/NewUserScreen',
    'main/PreDefinedScreens',
    '_assets/js/browserDetector/browserDetector',
    'api/UserService',
    'api/ResourceService',
    'moment'
], function(Backbone, Marionette, $, _, Messaging, UIComponents, AppletsManifest, ScreensManifest, ResourcesManifest, NewUserScreen, PreDefinedScreens, BrowserDetector, UserService, ResourceService, moment) {
    'use strict';

    var SCREENS_MANIFEST = 'app/screens/ScreensManifest.js';
    var PREDEFINED_SCREENS = 'app/screens/PreDefinedScreens.js';
    var NEW_USERS_SCREENS = 'app/screens/NewUserScreen.js';
    var APPLETS_MANIFEST = 'app/applets/appletsManifest.js';
    var RESOURCES_MANIFEST = 'app/resources/resourceManifest.js';

    /** Start loading the ehmp-ui related files */
    var EhmpUiFilesLoaded = $.Deferred();
    var ScreenManifestsLoaded = $.Deferred();
    var PreDefinedScreensLoaded = $.Deferred();
    var NewUserScreenLoaded = $.Deferred();
    var AppletsManifestLoaded = $.Deferred();
    var ResourcesManifestLoaded = $.Deferred();

    var appManifest = new Backbone.Model();
    var appConfig = new Backbone.Model();
    var facilityMonikers = new Backbone.Collection();
    var Init = {};

    // limit browser to supported browsers
    BrowserDetector.enforceBrowserType();


    /*
     TODO: This should be a temporary fix and removed at some point!
     The newer versions of moment are AMD compatible, and because we are using require.js moment is no longer
     placed into the window. However there are several applets that expect it to be there.  These applets should
     switch to using require to access moment.
     */
    window.moment = moment;

    // This is not necessary but it helps stop moment form spamming the console
    moment.suppressDeprecationWarnings = true;

    // this allows AJAX to send cookies to a server
    // these cookies are needed for the server's session to run
    $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
        options.xhrFields = {
            withCredentials: true
        };
    });


    $.ajaxSetup({cache: false});

    Array.prototype.equals = function(array) {
        if (!array)
            return false;
        if (this.length != array.length)
            return false;

        for (var i = 0, l = this.length; i < l; i++) {
            if (this[i] instanceof Array && array[i] instanceof Array) {
                if (!this[i].equals(array[i]))
                    return false;
            } else if (this[i] != array[i]) {
                return false;
            }
        }
        return true;
    };

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

    Init.beforeStart = function() {

        //make sure that we have screens and applets to use first
        require([SCREENS_MANIFEST], function(data) {
            _.extend(ScreensManifest, data);
            ScreenManifestsLoaded.resolve();
        });

        require([PREDEFINED_SCREENS], function(data) {
            _.extend(PreDefinedScreens, data);
            PreDefinedScreensLoaded.resolve();
        });

        require([NEW_USERS_SCREENS], function(data) {
            _.extend(NewUserScreen, data);
            NewUserScreenLoaded.resolve();
        });

        require([APPLETS_MANIFEST], function(data) {
            _.extend(AppletsManifest, data);
            AppletsManifestLoaded.resolve();
        });

        require([RESOURCES_MANIFEST], function(data) {
            _.extend(ResourcesManifest, data);
            ResourcesManifestLoaded.resolve();
        });

        $.when(ScreenManifestsLoaded, PreDefinedScreensLoaded, NewUserScreenLoaded, AppletsManifestLoaded, ResourcesManifestLoaded).then(function() {
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
                'main/components/views/globalErrorView'
            ], function(ADKApp, ResourceDirectory, GlobalErrorView) {

                var resourceDirectoryPathFetch = $.Deferred();
                var resourceDirectoryPathWriteback = $.Deferred();
                var resourceDirectoryPathPicklist = $.Deferred();
                var facilityMonikersLoaded = $.Deferred();

                appManifest.fetch({
                    url: '../manifest.json',
                    global: false
                });
                ADK.Messaging.reply("appManifest", function() {
                    return appManifest;
                });

                ADK.Messaging.reply("appConfig", function() {
                    return appConfig;
                });

                function fetchAppConfig() {
                    var deferred = $.Deferred();
                    appConfig.fetch({
                            url: '../app.json',
                            global: false
                        })
                        .done(function() {
                            deferred.resolve(appConfig);
                        })
                        .fail(function() {
                            console.log('Failed to resolve app.json');
                            deferred.reject();
                        });

                    return deferred.promise();
                }

                function onError() {
                    var ModalRegionView = new GlobalErrorView({
                        errorMessage: "No Response From Resource Server<br/><small>Ensure that you have a stable network connection.</small>",
                        refreshButton: 'Refresh Page'
                    });
                    ADKApp.modalRegion.show(ModalRegionView);
                    $('#mainModal').modal({
                        show: true,
                        backdrop: 'static',
                        keyboard: false
                    });
                }

                $.when(fetchAppConfig()).then(function(appConfig) {
                    var resourceDirectory = ResourceDirectory.instance();
                    resourceDirectory.fetch({
                        url: appConfig.get('resourceDirectoryPathFetch'),
                        success: function() {
                            resourceDirectoryPathFetch.resolve();
                        },
                        error: function() {
                            onError();
                        },
                        remove: false
                    });
                }).fail(onError);

                $.when(fetchAppConfig()).then(function(appConfig) {
                    var resourceDirectory = ResourceDirectory.instance();
                    resourceDirectory.fetch({
                        url: appConfig.get('resourceDirectoryPathWriteback'),
                        success: function() {
                            resourceDirectoryPathWriteback.resolve();
                        },
                        error: function() {
                            onError();
                        },
                        remove: false
                    });
                }).fail(onError);

                $.when(fetchAppConfig()).then(function(appConfig) {
                    var resourceDirectory = ResourceDirectory.instance();
                    resourceDirectory.fetch({
                        url: appConfig.get('resourceDirectoryPathPicklist'),
                        success: function() {
                            resourceDirectoryPathPicklist.resolve();
                        },
                        error: function() {
                            onError();
                        },
                        remove: false
                    });
                }).fail(onError);

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

                $.when(resourceDirectoryPathFetch, resourceDirectoryPathWriteback, resourceDirectoryPathPicklist).done(function() {
                    fetchFacilityMonikers();
                });

                ADKApp.on('before:start', function() {
                    $.when(resourceDirectoryPathFetch, resourceDirectoryPathWriteback, resourceDirectoryPathPicklist, EhmpUiFilesLoaded, facilityMonikersLoaded).done(function() {
                        ADKApp.initAllRouters();
                    });

                });

                ADKApp.start({});
            });
        });

    };

    return Init;
});
