define([
    'underscore',
    'backbone',
    'jquery',
    'api/Messaging',
    'handlebars',
    'main/ui_components/alert/component',
    'api/Checks',
    'api/WorkspaceContextRepository'
], function(
    _,
    Backbone,
    $,
    Messaging,
    Handlebars,
    UIAlert,
    Checks,
    WorkspaceContextRepository) {
    'use strict';
    var DefaultPatientContextCheck = Checks.CheckModel.extend({
        validate: function(attributes, validateOptions) {
            // FUTURE-TODO - future implementations of shouldNavigate will also contain the context you are navigating to.
            validateOptions = validateOptions || {};
            var options = validateOptions.options || {};
            var screenName = options.screenName || {};
            if (_.some(['logon-screen', 'patient-search-screen', 'ehmp-administration', 'provider-centric-view'], function(screen) {
                    return _.isEqual(screen, screenName);
                })) {
                return "Change of domain";
            }
        },
        defaults: {
            onFailure: null,
            onCancel: null,
            onContinue: null,
            group: 'navigation',
            subGroup: '100-writeback-in-progress',
            subGroupMessage: 'Unsaved changes will be lost in the following forms',
            onInvalid: function(invalidOptions) {
                invalidOptions = invalidOptions || {};
                var options = invalidOptions.options || {};
                var screenName = options.screenName || {};
                var checkConfig = invalidOptions.checkConfig || {};
                var onPassCallback = invalidOptions.onPass || function() {
                    return true;
                };
                var ConsolidatedCheckBody = Backbone.Marionette.CompositeView.extend({
                    template: Handlebars.compile([
                        '<h5 class="bottom-margin-xs top-margin-no top-padding-no">Are you sure you want to navigate away?</h5>',
                        '<div class="check-container well well-sm background-color-primary-lightest"></div>'
                    ].join('\n')),
                    emptyView: Backbone.Marionette.ItemView.extend({
                        template: Handlebars.compile('<p>Your form has now been saved via the auto-save feature.</p>')
                    }),
                    childViewContainer: '.check-container',
                    childView: Backbone.Marionette.CompositeView.extend({
                        template: Handlebars.compile([
                            '<p class="bottom-margin-xs top-margin-xs all-padding-no"><strong>{{subGroupMessage}}:</strong></p>',
                            '<ul class="failing-check-container left-padding-lg"></ul>'
                        ].join('\n')),
                        childViewContainer: '.failing-check-container',
                        childView: Backbone.Marionette.ItemView.extend({
                            tagName: 'li',
                            template: Handlebars.compile('{{label}}'),
                        }),
                        initialize: function(options) {
                            this.collection = Checks._checkCollection;
                        },
                        filter: function(child, index, collection) {
                            return child.get('group') === checkConfig.group && child.get('subGroup') === this.model.get('subGroup');
                        }
                    }),
                    initialize: function(options) {
                        this.setUpCollection();
                        this.listenTo(Checks._checkCollection, 'update', this.setUpCollection);
                    },
                    setUpCollection: function() {
                        var failingChecks = Checks.getFailingChecks(checkConfig.group, options);
                        var failingSubGroups = [];
                        failingSubGroups = _.uniq(failingChecks, function(checkModel) {
                            return checkModel.get('subGroup');
                        });
                        if (!_.isUndefined(this.collection)) {
                            this.collection.set(failingSubGroups);
                        } else {
                            this.collection = new Backbone.Collection(failingSubGroups, { comparator: 'subGroup' });
                        }
                    }
                });
                var SimpleAlertFooterItemView = Backbone.Marionette.ItemView.extend({
                    template: Handlebars.compile([
                        '{{ui-button "No" classes="btn-default alert-cancel btn-sm" title="Press enter to go back"}}',
                        '{{ui-button "Yes" classes="btn-primary alert-continue btn-sm" title="Press enter to continue"}}'
                    ].join('\n')),
                    events: {
                        'click button.alert-cancel': function() {
                            UIAlert.hide();
                            if (_.isFunction(checkConfig.onCancel)) {
                                checkConfig.onCancel();
                            }
                        },
                        'click button.alert-continue': function() {
                            UIAlert.hide();
                            _.each(this.failingChecks, function(checkModel) {
                                if (_.isFunction(checkModel.get('onContinue'))) {
                                    checkModel.get('onContinue')();
                                }
                                Checks.unregister(checkModel.get('id'));
                            });
                            Checks.run('navigation', onPassCallback, options);
                        }
                    },
                    initialize: function() {
                        this.failingChecks = Checks.getFailingChecks(checkConfig.group, options);
                        this.listenTo(Checks._checkCollection, 'update', function() {
                            this.failingChecks = Checks.getFailingChecks(checkConfig.group, options);
                        });
                    }
                });
                var alertView = new UIAlert({
                    title: "Warning",
                    icon: "icon-triangle-exclamation",
                    messageView: ConsolidatedCheckBody,
                    footerView: SimpleAlertFooterItemView
                });
                if (_.isFunction(checkConfig.onFailure)) {
                    checkConfig.onFailure();
                }
                alertView.show();
            }
        }
    });
    var Navigation = {
        PatientContextCheck: DefaultPatientContextCheck,
        registerCheck: function(model) {
            return Checks.register(model);
        },
        unregisterCheck: function(unique) {
            // unique is either the id string or the whole model
            return Checks.unregister(unique);
        },
        runChecks: function(methodToExecuteOnPass, screenName) {
            Checks.run('navigation', methodToExecuteOnPass, { screenName: screenName });
        },
        getMessagesOfAllChecks: function() {
            return Checks.getAllMessages('navigation');
        },
        updateRouter: function(workspaceId, contextId) {
            var globalChannel = Backbone.Wreqr.radio.channel('global');
            globalChannel.commands.execute('route:update', workspaceId, contextId);
        },
        getWorkspaceId: function(id) {
            if (!_.isString(id)) {
                id = WorkspaceContextRepository.appDefaultScreen;
            }

            if (id.charAt(0) === '#') {
                id = id.slice(1);
            }
            return id;
        },
        changeRouteIfReady: function(routeConfig, options, callback) {
            this.runChecks(_.bind(function() {
                WorkspaceContextRepository.updateCurrent(routeConfig);
                if (_.isFunction(callback)) {
                    _.bind(callback, this)(routeConfig);
                }
                var globalChannel = Backbone.Wreqr.radio.channel('global');
                globalChannel.commands.execute('screen:display', routeConfig, options);
            }, this), routeConfig.workspaceModel.get('id'));
        },
        rerouter: function(workspaceId, options, callback) {
            var routeConfigPromise = this._determineRoute(workspaceId);
            routeConfigPromise.done(_.bind(function(routeConfig) {
                if (!_.isUndefined(routeConfig.workspaceBuildPromise)) {
                    $.when(routeConfig.workspaceBuildPromise).done(_.bind(function() {
                        this.changeRouteIfReady(routeConfig, options, callback);
                    }, this));
                } else {
                    this.changeRouteIfReady(routeConfig, options, callback);
                }
            }, this));
        },
        navigate: function(workspaceId, options) {
            options = options || {};
            this.rerouter(workspaceId, options, function(routeConfig) {
                Messaging.trigger('screen:navigate', routeConfig.workspaceModel.get('id'));
                this.updateRouter(routeConfig.workspaceModel.get('id'), routeConfig.contextModel.get('id'));
            });
        },
        displayScreen: function(workspaceId) {
            this.rerouter(workspaceId);
        },
        _determineRoute: function(workspaceId, contextId) {
            workspaceId = this.getWorkspaceId(workspaceId);

            return WorkspaceContextRepository.navigateTo({
                workspaceId: workspaceId,
                contextId: contextId
            });
        },
        initContextRoute: function(context, app) {
            var Navigation = this;

            function setupRouteController(context) {
                return {
                    displayDefaultScreen: function(routeOptions) {
                        WorkspaceContextRepository.currentContext = context;
                        //WorkspaceContextRepository.currentScreen = ?????;
                        Navigation.navigate(WorkspaceContextRepository.currentContextDefaultScreen);
                    },
                    displayScreen: function(screenName, routeOptions) {
                        WorkspaceContextRepository.currentContext = context;
                        //WorkspaceContextRepository.currentScreen = screenName;
                        Navigation.navigate(screenName);
                    }
                };
            }

            function intializeRouter(name, controller) {
                var routes = {};
                routes['/' + name] = 'displayDefaultScreen';
                routes['/' + name + '/'] = 'displayDefaultScreen';
                routes['/' + name + '/:screenName'] = 'displayScreen';

                var routerOptions = {
                    appRoutes: routes,
                    controller: controller
                };
                app.router.processAppRoutes(controller, routes);
            }

            var routeController = setupRouteController(context);
            intializeRouter(context.get('routeName'), routeController);
        },
        initContextRoutes: function(app) {
            WorkspaceContextRepository.contexts.each(function(context) {
                this.initContextRoute(context, app);
            }, this);
        },
        initWorkspaceRoute: function(routeName, app) {
            var Navigation = this;

            function setupRouteController(name) {
                return {
                    displayWorkspace: function(routeOptions) {
                        Navigation.navigate(name);
                    }
                };
            }

            function intializeRouter(name, controller) {
                var routes = {};
                routes[name] = 'displayWorkspace';

                var routerOptions = {
                    appRoutes: routes,
                    controller: controller
                };
                app.router.processAppRoutes(controller, routes);
            }

            var routeController = setupRouteController(routeName);
            intializeRouter(routeName, routeController);
        },
        removeWorkspaceRoute: function(routeName, app) {
            if (_.isString(routeName)) {
                console.log('Before: ', Backbone.history.handlers.length, ' routing handlers available.');
                Backbone.history.handlers = _.filter(Backbone.history.handlers, function(handler) {
                    return (handler.route.toString() !== ADK.ADKApp.router._routeToRegExp(routeName).toString());
                });
                console.log('After: ', Backbone.history.handlers.length, ' routing handlers available.');
            }
        },
        back: function() {
            var previous = Backbone.history._previousFragment;
            if (previous) {
                if (this._isFirstScreenForCurrentContext(previous)) {
                    Navigation.navigate(WorkspaceContextRepository.currentContextDefaultScreen);
                } else {
                    var routePieces = previous.split('/');
                    Navigation.navigate(routePieces[routePieces.length - 1]);
                }
            } else {
                Navigation.navigate(WorkspaceContextRepository.appDefaultScreen);
            }
        },
        hasPreviousRoute: function() {
            return _.isString(Backbone.history._previousFragment);
        },
        _isFirstScreenForCurrentContext: function (previous) {
            previous = previous || Backbone.history._previousFragment;
            return _.includes(previous, 'patient-search') || !_.includes(previous, '/' + WorkspaceContextRepository.currentContextId + '/');
        },
        isFirstAndDefaultScreen: function () {
            if (!this._isFirstScreenForCurrentContext()) {
                return false;
            }
            var currentScreen = Backbone.history.fragment.split('/').pop(-1);
            var defaultScreen = WorkspaceContextRepository.currentContextDefaultScreen;
            return currentScreen === defaultScreen;
        }
    };
    /**
     * This is the part that WILL take the user to the login screen
     * @return {undefined}
     */
    Messaging.on('user:sessionEnd', function() {
        Navigation.navigate(WorkspaceContextRepository.appDefaultScreen);
    });

    $(window).on('beforeunload', function() {
        var failureString = Navigation.getMessagesOfAllChecks();
        if (_.isEmpty(failureString)) {
            return;
        }
        return failureString;
    });
    return Navigation;
});
