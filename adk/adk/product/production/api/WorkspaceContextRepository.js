define([
    'underscore',
    'backbone',
    'marionette',
    'jquery',
    'api/Messaging',
    'api/SessionStorage',
    'api/WorkspaceContextRepository'
], function(
    _,
    Backbone,
    Marionette,
    $,
    Messaging,
    SessionStorage,
    WorkspaceContextRepository
) {
    'use strict';

    var WORKSPACE_COLLECTION = 'workspaces';
    var RUNTIME_CONTEXT_CONFIG = 'runtimeContextConfig';

    var Workspace = Backbone.Model.extend({
        defaults: {
            // set as the default for now to allow for userDefinedWorkspaces to work properly
            context: 'patient'
        },
        shouldShowInWorkspaceSelector: function() {
            return (!this.isMaximizedAppletScreen() && this.belongsToCurrentContext());
        },
        isMaximizedAppletScreen: function() {
            var id = this.get('id') || '';
            return ((id.length > 5) && (id.indexOf('-full') === (id.length - 5)));
        },
        belongsToCurrentContext: function() {
            var currentContextId = ADK.WorkspaceContextRepository.currentContext.get('id');
            return this.get('context') === currentContextId;
        }
    });

    var WorkspaceCollection = Backbone.Collection.extend({
        model: Workspace
    });

    var Context = Backbone.Model.extend({
        defaults: {
            userRequired: true,
            getRoute: null,
            defaultScreen: null,
            layout: null,
            navigateTo: function(workspaceId) {
                return {
                    workspaceId: workspaceId
                };
            }
        }
    });

    var ContextCollection = Backbone.Collection.extend({
        model: Context
    });

    var WorkspaceContextModel = Backbone.Model.extend({
        defaults: {
            workspace: null,
            context: null
        }
    });

    var WorkspaceContextRepository = Marionette.Object.extend({
        userContextPreferences: [{
            name: 'defaultScreen',
            originalName: 'originalDefaultScreen'
        }],
        initialize: function(options) {
            this.sessionSynchronized = {};
            this.runtimeContextConfig = {};
            this.currentWorkspaceAndContext = new WorkspaceContextModel();
            this.defineProperties();
        },
        onLoad: function() {
            this.loadContexts();
            this.loadRuntimeContextConfigFromSession();
            this.loadWorkspacesFromSession();
        },
        loadContexts: function() {
            this.workspaceContextAspect = Messaging.request('getUIContextAspect', 'workspace');
        },
        defineProperties: function() {
            Object.defineProperty(this, 'workspaces', {
                get: function() {
                    return this._workspaces;
                }
            });

            Object.defineProperty(this, 'workspaceContextAspect', {
                get: function() {
                    return this._workspaceContextAspect;
                },
                set: function(newAspect) {
                    this._workspaceContextAspect = newAspect;
                }
            });

            // Returns Backbone Collection
            Object.defineProperty(this, 'contexts', {
                get: function() {
                    return this._workspaceContextAspect.contexts;
                },
                set: function(newContexts) {
                    this._workspaceContextAspect.contexts = new ContextCollection(newContexts);
                }
            });

            Object.defineProperty(this, 'appDefaultScreen', {
                get: function() {
                    return this.appDefaultContext.get('defaultScreen');
                }
            });

            Object.defineProperty(this, 'appDefaultContext', {
                get: function() {
                    return this.contexts.get(this.workspaceContextAspect.appDefaultContext);
                }
            });

            Object.defineProperty(this, 'userDefaultContext', {
                get: function() {
                    return this.contexts.get(this.workspaceContextAspect.userDefaultContext);
                }
            });

            Object.defineProperty(this, 'currentContextDefaultScreen', {
                get: function() {
                    return this.currentContext.get('defaultScreen');
                },
                set: function(defaultScreen) {
                    this.currentContext.set('defaultScreen', defaultScreen);
                }
            });

            Object.defineProperty(this, 'currentWorkspace', {
                get: function() {
                    return this.getWorkspace(this.runtimeContextConfig.currentWorkspace);
                },
                set: function(newWorkspace) {
                    newWorkspace = _.isString(newWorkspace) ? newWorkspace : newWorkspace.get('id') || null;

                    if (!_.isString(newWorkspace)) {
                        newWorkspace = this.currentContext.get('defaultScreen');
                    }

                    if (this.runtimeContextConfig.currentWorkspace !== newWorkspace) {
                        this.runtimeContextConfig.currentWorkspace = newWorkspace;
                        this.saveRuntimeContextConfigToSession();
                    }
                    this.currentWorkspaceAndContext.set('workspace', newWorkspace);
                }
            });

            Object.defineProperty(this, 'currentContextId', {
                get: function () {
                    return this.currentContext.get('id');
                }
            });

            Object.defineProperty(this, 'currentContext', {
                get: function() {
                    var currentContext = this.runtimeContextConfig.currentContext;

                    if (!_.isString(currentContext)) {
                        this.runtimeContextConfig.currentContext = currentContext = this.workspaceContextAspect.userDefaultContext || this.workspaceContextAspect.appDefaultContext;
                        this.saveRuntimeContextConfigToSession();
                    }
                    return this.contexts.get(currentContext);
                },
                set: function(newContext) {
                    newContext = _.isString(newContext) ? newContext : newContext.get('id') || null;

                    if (!_.isString(newContext)) {
                        newContext = this.workspaceContextAspect.userDefaultContext || this.workspaceContextAspect.appDefaultContext;
                    }

                    if (this.runtimeContextConfig.currentContext !== newContext) {
                        this.runtimeContextConfig.currentContext = newContext;
                        this.saveRuntimeContextConfigToSession();
                    }
                    this.currentWorkspaceAndContext.set('context', newContext);
                }
            });

            Object.defineProperty(this, 'userDefaultScreen', {
                get: function() {
                    return this.userDefaultContext.get('defaultScreen');
                },
                set: function(newScreen) {
                    if (this.userDefaultContext.get('id') === 'patient' && _.isString(newScreen) && this.userDefaultContext.get('defaultScreen') !== newScreen) {
                        this.userDefaultContext.set('defaultScreen', newScreen);
                    }
                }
            });
        },
        loadWorkspacesFromSession: function() {
            if (!this.sessionSynchronized[WORKSPACE_COLLECTION]) {
                var jsonObj = window.sessionStorage.getItem(WORKSPACE_COLLECTION);

                if (_.isEmpty(jsonObj)) {
                    this._workspaces = new WorkspaceCollection();
                } else {
                    this._workspaces = new WorkspaceCollection(jsonObj);
                }

                this.sessionSynchronized[WORKSPACE_COLLECTION] = true;
            }
        },
        loadRuntimeContextConfigFromSession: function() {
            if (!this.sessionSynchronized[RUNTIME_CONTEXT_CONFIG]) {
                var jsonObj = SessionStorage.get.sessionObject(RUNTIME_CONTEXT_CONFIG, null, true);
                if (_.isEmpty(jsonObj)) {
                    this.runtimeContextConfig.currentContext = this.appDefaultContext.get('id');
                    this.runtimeContextConfig.currentWorkspace = this.appDefaultContext.get('defaultScreen');
                    this.saveRuntimeContextConfigToSession();
                } else {
                    this.runtimeContextConfig.currentContext = jsonObj.currentContext;
                    this.runtimeContextConfig.currentWorkspace = jsonObj.currentScreen;
                }
                this.sessionSynchronized[RUNTIME_CONTEXT_CONFIG] = true;
            }
        },
        saveRuntimeContextConfigToSession: function() {
            SessionStorage.set.sessionObject(RUNTIME_CONTEXT_CONFIG, this.runtimeContextConfig);
            // this.sessionSynchronized[RUNTIME_CONTEXT_CONFIG] = true;
        },
        getRouteModels: function(workspaceId, contextId) {
            var workspaceModel, contextModel;
            if (!_.isString(workspaceId)) {
                contextModel = this.getContext(contextId) || this.currentContext || this.userDefaultContext || this.appDefaultContext;
                workspaceId = contextModel.get('defaultScreen');
                workspaceModel = this.getWorkspace(workspaceId) || this.getWorkspace(this.currentContextDefaultScreen) || this.getWorkspace(this.userDefaultScreen);

                // make sure the contextModel aligns to the workspaceModel's context
                if (this.getContext(workspaceModel.get('context')) != contextModel) {
                    contextModel = this.getContext(workspaceModel.get('context'));
                }

            } else {
                workspaceModel = this.getWorkspace(workspaceId) || this.currentWorkspace || this.getWorkspace(this.currentContextDefaultScreen) || this.getWorkspace(this.userDefaultScreen);
                contextModel = this.contexts.get(workspaceModel.get('context'));
            }
            return {
                workspaceModel: workspaceModel,
                contextModel: contextModel
            };
        },
        navigateTo: function(routeIdsConfig, promise) {
            // {
            //     workspaceId: workspaceId,
            //     contextId: contextId
            // }
            if (!_.isObject(promise)) {
                promise = $.Deferred();
            }
            var workspaceModule = ADK.ADKApp.Screens[routeIdsConfig.workspaceId];
            if (_.isUndefined(workspaceModule)) {
                workspaceModule = ADK.ADKApp.Screens[this.currentContextDefaultScreen];
                if (_.isUndefined(workspaceModule)){
                    if (this.currentContext.has('originalDefaultScreen') && this.currentContextDefaultScreen !== this.currentContext.get('originalDefaultScreen')){
                        this.currentContextDefaultScreen = this.currentContext.get('originalDefaultScreen');
                    } else {
                        this.currentContext = _.isEqual(this.userDefaultContext, this.currentContext) ? this.appDefaultContext :this.userDefaultContext;
                    }
                }
                routeIdsConfig = {
                    workspaceId: this.currentContextDefaultScreen,
                    contextId: this.currentContext.get('id')
                };
                this.navigateTo(routeIdsConfig, promise);
                return promise;
            }
            $.when(ADK.ADKApp.Screens[routeIdsConfig.workspaceId].buildPromise).done(_.bind(function() {
                var routeModelsConfig = this.getRouteModels(routeIdsConfig.workspaceId, routeIdsConfig.contextId);

                var workspaceId = routeModelsConfig.workspaceModel.get('id');
                var contextId = routeModelsConfig.contextModel.get('id');
                routeIdsConfig = {
                    workspaceId: workspaceId,
                    contextId: contextId
                };

                var newRouteIdsConfig = routeModelsConfig.contextModel.get('navigateTo')(workspaceId);
                if (!_.isEqual(routeIdsConfig.workspaceId, newRouteIdsConfig.workspaceId)) { ///FIX THIS LATER
                    $.when(ADK.ADKApp.Screens[newRouteIdsConfig.workspaceId].buildPromise).done(_.bind(function() {
                        this.navigateTo(newRouteIdsConfig, promise);
                    }, this));
                } else {
                    promise.resolve(routeModelsConfig);
                }
            }, this));
            return promise;
        },
        updateCurrent: function(routeModelsConfig) {
            this.currentContext = routeModelsConfig.contextModel;
            this.currentWorkspace = routeModelsConfig.workspaceModel;
        },
        addWorkspace: function(screenConfig) {
            var workspace = new Workspace(screenConfig);
            this._workspaces.add(workspace);
        },
        removeWorkspace: function(workspaceName) {
            var matchedWorkspace = this._workspaces.get(workspaceName);
            if (matchedWorkspace) {
                this._workspaces.remove(matchedWorkspace);
            }
        },
        getWorkspace: function(workspaceName) {
            return this.workspaces.get(workspaceName);
        },
        getContext: function(contextName) {
            return this.contexts.get(contextName);
        },
        getDefaultScreenOfContext: function(contextName) {
            return this.contexts.get(contextName).get('defaultScreen');
        },
        setDefaultScreenOfContext: function(contextName, newScreen) {
            var contextModel = this.contexts.get(contextName);
            if (!_.isUndefined(contextModel) && _.isString(newScreen) && contextModel.get('defaultScreen') !== newScreen) {
                contextModel.set('defaultScreen', newScreen);
            }
        },
        getWorkspacePermissions: function(workspaceId) {
            return this.getWorkspace(workspaceId).get('requiredPermissions') || [];
        },
        resetWorkspaceContexts: function() {
            var userContextPreferences = this.userContextPreferences;
            this.contexts.each(function(context) {
                _.each(userContextPreferences, function(propertyToReset) {
                    if (context.has(propertyToReset.originalName)) {
                        context.set(propertyToReset.name, context.get(propertyToReset.originalName));
                    }
                });
            });
        }
    });

    return new WorkspaceContextRepository();
});