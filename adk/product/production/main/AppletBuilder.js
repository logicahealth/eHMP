define([
    'api/Messaging',
    'underscore',
    'api/UserService',
    'api/WorkspaceContextRepository'
], function(Messaging, _, UserService, WorkspaceContextRepository) {
    'use strict';
    var appletBuilder = {
        build: function(marionetteApp, appletPojo) {
            var builtApplet = marionetteApp.module('Applets.' + appletPojo.id, defineAppletModule);

            function defineAppletModule(appletModule, app, backbone, marionette, $, _) {
                appletModule.id = appletPojo.id;
                appletModule.appletConfig = appletPojo;
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
                appletModule.buildPromise.resolve();
            }
            return builtApplet;
        },
        buildAll: function(options) {
            Messaging.trigger('load.ehmp.applets');
            var allAppletsLoadedPromise = options.loadPromise;
            var appletLoader = new appletBuilder.Loader({
                app: options.app,
                applets: options.applets,
                loadPromise: allAppletsLoadedPromise
            });
            allAppletsLoadedPromise.done(function() {
                appletLoader.destroy();
                Messaging.trigger('loaded.ehmp.applets');
            });
        },
        Loader: Backbone.Marionette.Object.extend({
            initialize: function() {
                this.allAppletsLoadedPromise = this.getOption('loadPromise');
                this.marionetteApp = this.getOption('app');
                this.applets = this.getOption('applets');
                this.totalAppletsLoaded = 0;
                this.loadedApplets = [];
                this.totalApplets = this.applets.length;
                this.loadRestCallCount = 0;
                this.buildAppletModules();
                if (_.isUndefined(WorkspaceContextRepository.currentWorkspace) || !_.isArray(WorkspaceContextRepository.currentWorkspace.get('applets'))) {
                    this.listenToOnce(WorkspaceContextRepository.currentWorkspaceAndContext, 'change:workspace', function(model, changed) {
                        this.loadApplets();
                    });
                } else {
                    this.loadApplets();
                }
            },
            loadApplets: function() {
                var shouldLoadRemaining = true;
                var sortedApplets = this.sortApplets(this.applets, [_.filter(this.applets, function(appletConfig) {
                    return _.isBoolean(appletConfig.requiredByLayout) ? appletConfig.requiredByLayout : _.includes(appletConfig.requiredByLayout, WorkspaceContextRepository.currentContextId);
                }), WorkspaceContextRepository.currentWorkspace.get('applets')]);
                var priorityAppletsComplete = this.requireApplets(sortedApplets.priorityApplets);
                priorityAppletsComplete.done(_.bind(function() {
                    if (shouldLoadRemaining === true) {
                        this.loadRemainingApplets(sortedApplets.remainingApplets);
                    }
                }, this));
                this.listenToOnce(WorkspaceContextRepository.currentWorkspaceAndContext, 'change:workspace', function(model, changed) {
                    shouldLoadRemaining = false;
                    this.loadApplets();
                });
            },
            resolveAppletLoadedPromise: function(appletCount, appletArrayLength, promiseToResolve) {
                if (appletCount === appletArrayLength) {
                    promiseToResolve.resolve();
                }
            },
            sortApplets: function(arrayToSort, priorities) {
                var priorityApplets = [];
                var remainingApplets = [];
                _.each(priorities, function(subPriorities) {
                    if (remainingApplets.length < 1) {
                        _.each(arrayToSort, function(itemToSort) {
                            if (_.some(subPriorities, function(appletToPrioritize) {
                                    return appletToPrioritize.id === itemToSort.id;
                                })) {
                                priorityApplets.push(itemToSort);
                            } else {
                                remainingApplets.push(itemToSort);
                            }
                        });
                    } else {
                        _.each(remainingApplets, function(itemToSort) {
                            if (_.some(subPriorities, function(appletToPrioritize) {
                                    return appletToPrioritize.id === itemToSort.id;
                                })) {
                                priorityApplets.push(itemToSort);
                            }
                        });
                        remainingApplets = _.difference(remainingApplets, priorityApplets);
                    }

                });
                return { priorityApplets: priorityApplets, remainingApplets: remainingApplets };
            },
            loadRemainingApplets: function(remainingApplets) {
                var shouldLoadRemaining = true;
                if (remainingApplets.length > 0) {
                    this.loadRestCallCount++;
                    var remainingAppletsComplete = this.requireApplets(_.take(remainingApplets, 1));
                    remainingApplets = _.drop(remainingApplets, 1);
                    remainingAppletsComplete.done(_.bind(function() {
                        if (shouldLoadRemaining) {
                            this.loadRemainingApplets(remainingApplets);
                        }
                    }, this));
                    this.listenToOnce(WorkspaceContextRepository.currentWorkspaceAndContext, 'change:workspace', function(model, changed) {
                        shouldLoadRemaining = false;
                    });
                }
            },
            requireApplets: function(appletArray) {
                var currentIterationCount = 0;
                var currentIterationLength = appletArray.length;
                var currentIterationComplete = $.Deferred();
                _.each(appletArray, function(applet) {
                    if (_.isArray(applet.dependencies)) {
                        var requiredApplets = _.filter(this.applets, function(appletFromManifest) {
                            return _.some(applet.dependencies, function(requiredAppletId) {
                                return appletFromManifest.id === requiredAppletId;
                            });
                        });
                        this.requireApplets(requiredApplets);
                    }
                    if (!_.some(this.loadedApplets, function(requiredApplet) {
                            return applet.id === requiredApplet.id;
                        })) {
                        this.loadedApplets.push(applet);
                        require(['app/applets/' + applet.id + '/applet'], _.bind(function(appletPojo) {
                            appletPojo.context = applet.context;
                            if (applet.permissions) {
                                appletPojo.permissions = applet.permissions;
                            }
                            appletBuilder.build(this.marionetteApp, appletPojo);
                            this.totalAppletsLoaded++;
                            currentIterationCount++;
                            this.resolveAppletLoadedPromise(this.totalAppletsLoaded, this.totalApplets, this.allAppletsLoadedPromise);
                            this.resolveAppletLoadedPromise(currentIterationCount, currentIterationLength, currentIterationComplete);
                        }, this), _.bind(function(err) {
                            // since applet failed to load and we aren't trying to reload the applet, we can decrement the
                            // total number of applets in order to correctly resolve the load promise
                            console.error('Error loading applet with id of: ' + applet.id + '.', err);
                            this.totalApplets--;
                            currentIterationLength--;
                            this.resolveAppletLoadedPromise(this.totalAppletsLoaded, this.totalApplets, this.allAppletsLoadedPromise);
                            this.resolveAppletLoadedPromise(currentIterationCount, currentIterationLength, currentIterationComplete);
                        }, this));
                    } else {
                        currentIterationLength--;
                        this.resolveAppletLoadedPromise(currentIterationCount, currentIterationLength, currentIterationComplete);
                    }
                }, this);
                return currentIterationComplete;
            },
            buildAppletModules: function() {
                _.each(this.applets, function(applet) {
                    var appletModule = this.marionetteApp.module('Applets.' + applet.id);
                    appletModule.buildPromise = $.Deferred();
                }, this);
            },
            onDestroy: function() {
                this.stopListening(WorkspaceContextRepository.currentWorkspaceAndContext, 'change:workspace');
            }
        })
    };

    return appletBuilder;
});
