define([
    'underscore',
    'backbone',
    'marionette',
    'jquery',
    'api/ResourceService',
    'api/PatientRecordService',
    'api/Navigation',
    'api/SessionStorage',
    'api/UserService',
    'api/Messaging',
    'api/WorkspaceContextRepository',
    'main/api/WorkspaceFilters',
    'main/Utils'
], function(_, Backbone, Marionette, $, ResourceService, PatientRecordService, Navigation, Session, UserService, Messaging, WorkspaceContextRepository, WorkspaceFilters, Utils) {
    'use strict';

    var UserDefinedScreens = {};
    var ScreensManifest = Messaging.request('ScreensManifest');
    var AppletsManifest = Messaging.request('AppletsManifest');
    var PreDefinedScreens = Messaging.request('PreDefinedScreens');
    var USER_SCREENS_CONFIG = 'UserScreensConfig';

    UserDefinedScreens.getAppletDefaultConfig = function(id) {
        var appletConfig = _.find(AppletsManifest.applets, function(applet) {
            return applet.id === id;
        });

        if (_.isEmpty(appletConfig)) {
            appletConfig = {
                id: id,
                title: 'Title undefined'
            };
        }

        return _.clone(appletConfig);
    };

    UserDefinedScreens.serializeGridsterScreen = function($gridster, screenName) {
        var divs = $gridster.find('[data-row]');
        var screen = {
            id: screenName,
            contentRegionLayout: 'gridster',
            appletHeader: 'navigation',
            appLeft: 'patientInfo',
            userDefinedScreen: true
        };
        var applets = [];
        divs.each(_.bind(function(index, el) {
            var titleText;
            var $el = $(el);
            var $appletEl = $el.find('[data-appletid]');
            var applet = {};
            var id;
            if ($appletEl.length > 0) {
                id = $appletEl.attr('data-appletid');
                if (!_.isUndefined(id)) {
                    applet = this.getAppletDefaultConfig(id);
                    applet.instanceId = $appletEl.attr('data-instanceid');
                    applet.region = $appletEl.attr('data-instanceid');
                    applet.dataRow = $el.attr('data-row');
                    applet.dataCol = $el.attr('data-col');
                    applet.dataSizeX = $el.attr('data-sizex');
                    applet.dataSizeY = $el.attr('data-sizey');

                    applet.dataMinSizeX = $el.attr('data-min-sizex');
                    applet.dataMinSizeY = $el.attr('data-min-sizey');
                    applet.dataMaxSizeX = $el.attr('data-max-sizex');
                    applet.dataMaxSizeY = $el.attr('data-max-sizey');
                    applet.viewType = $el.attr('data-view-type');
                    titleText = $('.panel-title-label', this).text() || applet.title;
                    applet.title = titleText.trim();
                    applet.filterName = $el.attr('data-filter-name');
                    applets.push(applet);
                }
            } else {
                id = $el.attr('data-appletid');
                if (!_.isUndefined(id)) {
                    applet = this.getAppletDefaultConfig(id);
                    applet.instanceId = $el.attr('data-instanceid');
                    applet.region = $el.attr('data-instanceid');
                    applet.dataRow = $el.attr('data-row');
                    applet.dataCol = $el.attr('data-col');
                    applet.dataSizeX = $el.attr('data-sizex');
                    applet.dataSizeY = $el.attr('data-sizey');

                    applet.dataMinSizeX = $el.attr('data-min-sizex');
                    applet.dataMinSizeY = $el.attr('data-min-sizey');
                    applet.dataMaxSizeX = $el.attr('data-max-sizex');
                    applet.dataMaxSizeY = $el.attr('data-max-sizey');
                    applet.viewType = $el.attr('data-view-type');

                    var viewType = '';
                    // set default view type to first available option if user did not pick any view type
                    if ($el.attr('data-view-type') === 'default') {
                        viewType = $('.options-box').attr('data-viewtype');
                    } else {
                        viewType = $el.attr('data-view-type') || $('.options-box').attr('data-viewtype');
                    }
                    applet.viewType = viewType;
                    titleText = $('.applet-title', this).text() || applet.title;
                    applet.title = titleText.trim();
                    applet.filterName = $el.attr('data-filter-name');
                    applets.push(applet);
                }
            }
        }, this));
        screen.applets = applets;
        return screen;
    };

    UserDefinedScreens.getScreenModuleApplets = function(screenModule) {
        return _.map(screenModule.applets, function(currentApplet) {
            if (currentApplet.region.toLowerCase() !== 'none') {
                this.setAppletDataAttribute(currentApplet);
                return currentApplet;
            }
        }, this);
    };

    UserDefinedScreens.setAppletDataAttribute = function(currentApplet) {
        var size, minSize, maxSize;
        var appletManifestObject = _.find(AppletsManifest.applets, function(item) {
            return item.id === currentApplet.id;
        });

        var isAppletInManifest = !_.isEmpty(appletManifestObject);
        if (isAppletInManifest) {
            var permissions = appletManifestObject.permissions || [];
            _.each(permissions, function(permission) {
                if (!UserService.hasPermission(permission)) {
                    currentApplet.noPermission = true;
                    return false;
                }
            });
        } else {
            currentApplet.notFound = true;
        }

        // Infer size by viewType iff its sizes are not already set in the applet's configuration
        if (!currentApplet.viewType) {
            currentApplet.viewType = 'summary';
        }
        size = Utils.getViewTypeSize(currentApplet.viewType);
        minSize = Utils.getViewTypeMinSize(currentApplet.viewType);
        maxSize = Utils.getViewTypeMaxSize(currentApplet.viewType);
        currentApplet.dataSizeX = currentApplet.dataSizeX || size.x;
        currentApplet.dataSizeY = currentApplet.dataSizeY || size.y;
        currentApplet.dataMinSizeX = currentApplet.dataMinSizeX || minSize.x;
        currentApplet.dataMinSizeY = currentApplet.dataMinSizeY || minSize.y;
        currentApplet.dataMaxSizeX = currentApplet.dataMaxSizeX || maxSize.x;
        currentApplet.dataMaxSizeY = currentApplet.dataMaxSizeY || maxSize.y;
    };

    UserDefinedScreens.getGridsterTemplate = function(screenModule) {
        console.warn('UserDefinedScreens.getGridsterTemplate is deprecated.  Use ADK.Views.Gridster instead');
        var template = '<div class="gridster" id="' + screenModule.id + '">';
        _.each(screenModule.applets, function(currentApplet) {
            if (currentApplet.region.toLowerCase() != 'none') {
                this.setAppletDataAttribute(currentApplet);
                template += '<div id="' + currentApplet.region +
                    '" data-row="' + currentApplet.dataRow +
                    '" data-col="' + currentApplet.dataCol +
                    '" data-sizex="' + currentApplet.dataSizeX +
                    '" data-sizey="' + currentApplet.dataSizeY +
                    '" data-min-sizex="' + currentApplet.dataMinSizeX +
                    '" data-max-sizex="' + currentApplet.dataMaxSizeX +
                    '" data-min-sizey="' + currentApplet.dataMinSizeY +
                    '" data-max-sizey="' + currentApplet.dataMaxSizeY +
                    '" data-filter-name="' + _.get(currentApplet, 'filterName', '') +
                    '" data-view-type="' + currentApplet.viewType +
                    '" ></div>';
            }
        }, this);
        template += '</div>{{{paginationHtml}}}';
        return template;
    };

    UserDefinedScreens.getGridsterMaxColumn = function(screenModule) {
        var maxCol = 0;
        _.each(screenModule.applets, function(currentApplet) {
            if (currentApplet.region.toLowerCase() != 'none') {
                this.setAppletDataAttribute(currentApplet);
                var sizeX = parseInt(currentApplet.dataSizeX);
                var col = parseInt(currentApplet.dataCol);
                if (sizeX + col > maxCol) maxCol = sizeX + col;
            }
        }, this);
        return maxCol - 1;
    };

    UserDefinedScreens.getViewTypeDisplay = function(applet) {
        var type = _.get(applet, 'viewType');
        return type === 'gist' ? 'trend' : type;
    };

    UserDefinedScreens.getGridsterTemplateForEditor = function(screenModule) {
        var deferred = new $.Deferred();
        this.updateScreenModuleFromStorage(screenModule).done(_.bind(function() {
            var template = '<div id="gridster2" class="gridster"><ul>';
            _.each(screenModule.applets, function(currentApplet) {
                if (currentApplet.region.toLowerCase() != 'none') {
                    this.setAppletDataAttribute(currentApplet);
                    template += '<li data-appletid="' + currentApplet.id +
                        '" data-instanceid="' + currentApplet.instanceId +
                        '" data-row="' + currentApplet.dataRow +
                        '" data-col="' + currentApplet.dataCol +
                        '" data-sizex="' + currentApplet.dataSizeX +
                        '" data-sizey="' + currentApplet.dataSizeY +
                        '" data-min-sizex="' + currentApplet.dataMinSizeX +
                        '" data-max-sizex="' + currentApplet.dataMaxSizeX +
                        '" data-min-sizey="' + currentApplet.dataMinSizeY +
                        '" data-max-sizey="' + currentApplet.dataMaxSizeY +
                        '" data-filter-name="' + _.get(currentApplet, 'filterName', '') +
                        '" data-view-type="' + currentApplet.viewType +
                        '" ><button type="button" aria-label="Press enter to open view options." class="btn btn-icon ' +
                        (currentApplet.notFound ? 'applet-not-found' : currentApplet.noPermission ? 'permission-denied-applet' : 'edit-applet applet-options-button') +
                        '"><i class="fa fa-cog"></i></button><br><h5 class="applet-title all-margin-no all-padding-no">' + currentApplet.title + '</h5>' +
                        (currentApplet.notFound ? '<span class="text-warning">Applet Not Found</span>' : currentApplet.noPermission ? '<span class="text-danger">Permission Denied</span>' : '<span class="right-padding-lg">' + _.capitalize(this.getViewTypeDisplay(currentApplet)) + '</span>');
                }
            }, this);

            template += '</ul></div>';
            deferred.resolve(template);
        }, this));

        return deferred;
    };

    UserDefinedScreens.getGridsterTemplateForPreview = function(screenModule) {
        var template = '<div id="gridsterPreview" class="gridster"><ul>';
        _.each(screenModule.applets, function(currentApplet) {
            if (currentApplet.region.toLowerCase() !== 'none') {
                this.setAppletDataAttribute(currentApplet);
                template += '<li' +
                    ' data-row="' + currentApplet.dataRow +
                    '" data-col="' + currentApplet.dataCol +
                    '" data-sizex="' + currentApplet.dataSizeX +
                    '" data-sizey="' + currentApplet.dataSizeY +
                    '" ><h4 class="applet-title">' + currentApplet.title + '</h4><p class="applet-type">' + this.getViewTypeDisplay(currentApplet) + '</p></li>';
            }

        }, this);
        template += '</ul></div>';
        return template;
    };

    UserDefinedScreens.updateScreenModuleFromStorage = function(screenModule) {
        var deferred = new $.Deferred();
        if (_.get(screenModule, 'config.predefined')) {
            return deferred.resolve();
        }

        var gridsterScreenConfig = this.getGridsterConfigFromSession(screenModule.id);
        var applets = _.get(gridsterScreenConfig, 'applets');
        if (applets) {
            screenModule.applets = applets;
        }

        deferred.resolve();
        return deferred;
    };

    UserDefinedScreens.saveConfigToJDS = function(json, key, id, callback, silent) {
        if(_.has(json, 'userScreensConfig.userScreensConfig')) {
            delete json.userScreensConfig.userScreensConfig;
        }
        this.model.save({
            screenType: key,
            param: json
        }, {
            id: id,
            callback: callback,
            silent: silent
        });
    };

    UserDefinedScreens.saveGridsterConfig = function(gridsterAppletJson, key, callback, silent) {
        this.saveConfigToJDS(gridsterAppletJson, key, key, _.bind(function() {
            if (_.isFunction(callback)) {
                callback();
            }
            this.saveGridsterConfigToSession(gridsterAppletJson, key);
        },this), silent);
    };

    UserDefinedScreens.saveGridsterConfigToSession = function(gridsterAppletJson, screenId) {
        var json = Session.get.sessionObject(USER_SCREENS_CONFIG);
        if (_.isNull(json)) return;
        var index = -1;
        if (_.isNull(gridsterAppletJson.id) || _.isUndefined(gridsterAppletJson.id)) {
            gridsterAppletJson.id = screenId;
        }
        _.each(json.userDefinedScreens, function(screen, idx) {
            if (screen && screen.id === screenId)
                index = idx;
        });
        if (index === -1) {
            if (json && json.userDefinedScreens)
                json.userDefinedScreens.push(gridsterAppletJson);
        } else {
            json.userDefinedScreens[index] = gridsterAppletJson;
        }

        Session.set.sessionObject(USER_SCREENS_CONFIG, json);
    };

    //this is to return the combined json from session: userScreensConfig, userDefinedScreens, userDefinedFilters, etc.
    UserDefinedScreens.getUserConfigFromSession = function() {
        return Session.get.sessionObject(USER_SCREENS_CONFIG);
    };

    UserDefinedScreens.saveUserConfigToSession = function(json) {
        this.model.set(json);
        Session.set.sessionObject(USER_SCREENS_CONFIG, json);
    };

    UserDefinedScreens.getScreensConfigFromSession = function() {
        var json = Session.get.sessionObject(USER_SCREENS_CONFIG);
        return _.get(json, 'userScreensConfig', json);
    };

    UserDefinedScreens.getGridsterConfigFromSession = function(screenId) {
        var json = Session.get.sessionObject(USER_SCREENS_CONFIG) || {};
        var screenConfig = _.find(json.userDefinedScreens || [], function(screen) {
            return screen && screen.id === screenId;
        });
        if (screenConfig || Session.get.sessionObject(screenId)) {
            return screenConfig || Session.get.sessionObject(screenId);
        }
        return _.find(_.get(json, 'userScreensConfig.screens'), function(screen) {
            return _.get(screen, 'id') === screenId;
        });
    };

    UserDefinedScreens.fetchScreens = function(key, deferred) {
        var userSession = UserService.getUserSession();
        if (_.isUndefined(key) || _.isUndefined(userSession) || _.isUndefined(userSession.get('status')) || userSession.get('status') === 'loggedout') {
            return deferred.resolve(this.model.toJSON());
        }
        this.model.fetch({
            key: key,
            deferred: deferred
        });
    };

    UserDefinedScreens.cloneScreenFilters = WorkspaceFilters.cloneScreenFilters;

    UserDefinedScreens.cloneScreenFiltersToSession = WorkspaceFilters.cloneScreenFiltersToSession;

    UserDefinedScreens.cloneScreen = function(origId, cloneId, predefined, clonedScreenOptions) {
        this.model.cloneScreen({
            fromId: origId,
            toId: cloneId,
            predefined: predefined,
            clonedScreenOptions: clonedScreenOptions
        });
    };

    UserDefinedScreens.cloneUDScreenToSession = function(origId, cloneId) {
        var gridsterConfig = _.extend({}, this.getGridsterConfigFromSession(origId), {
            id: cloneId
        });
        this.saveGridsterConfigToSession(gridsterConfig, cloneId);
    };

    UserDefinedScreens.saveScreensConfig = function(screenConfigJson, id, callback, silent) {
        this.saveConfigToJDS(screenConfigJson, USER_SCREENS_CONFIG, id, callback, silent);
    };

    UserDefinedScreens.saveScreensConfigToSession = function(screenConfigJson, model) {
        var json;
        try {
            json = Session.get.sessionObject(USER_SCREENS_CONFIG) || {};
        } catch (e) {
            json = {};
        }
        screenConfigJson = screenConfigJson || {};

        _.set(json, 'screens', _.get(screenConfigJson, 'screens', []));
        _.set(json, 'userScreensConfig.screens', _.get(screenConfigJson, 'screens', []));
        _.set(json, 'userDefinedScreens', _.get(screenConfigJson, 'userDefinedScreens', []));
        _.set(json, 'userDefinedGraphs', _.get(screenConfigJson, 'userDefinedGraphs', []));
        _.set(json, 'userDefinedSorts', _.get(screenConfigJson, 'userDefinedSorts', []));
        _.set(json, 'userDefinedFilters', _.get(screenConfigJson, 'userDefinedFilters', []));

        Session.set.sessionObject(USER_SCREENS_CONFIG, json);
        Backbone.Model.prototype.set.call(model || this.model, json, {
            silent: true
        });
    };

    UserDefinedScreens.cloneGridsterConfig = function(origScreenId, newScreenId) {
        var configClone = Session.get.sessionObject(origScreenId);
        if (!_.isUndefined(configClone) && !_.isEmpty(configClone)) {
            configClone.id = newScreenId;
            this.saveGridsterConfig(configClone, newScreenId);
        }
    };

    UserDefinedScreens.addNewScreen = function(newScreenConfig, screenIndex, callback) {
        var screensConfig = this.getScreensConfigFromSession();
        var screens = screensConfig.screens;
        if (screenIndex) {
            screens.splice(screenIndex, 0, newScreenConfig);
        } else {
            screens.push(newScreenConfig);
        }
        this.saveScreensConfig(screensConfig, newScreenConfig.id, callback);
    };

    UserDefinedScreens.screensConfigNullCheck = function() {
        var promise = this.getScreensConfig(USER_SCREENS_CONFIG);
        promise.done(_.bind(function(screenConfig) {
            var definedScreensOnly = _.filter(screenConfig.screens, function(screen) {
                if (!_.isUndefined(screen) && screen !== null) {
                    return screen;
                } else {
                    //console.log("Deleted null screen");
                }
            });
            screenConfig.screens = definedScreensOnly;
            this.saveScreensConfig(screenConfig);
        }, this));
    };

    var filterScreensOnHasPermission = function(screens) {
        var provisionedScreens = [];
        var hasPermission = function(screen) {
            var hasPermission = true;
            _.each(screen.requiredPermissions, function(permission) {
                if (!UserService.hasPermission(permission)) {
                    hasPermission = false;
                    return false;
                }
            });
            return hasPermission;
        };

        _.each(screens, function(screen) {
            if (_.isEmpty(screen.requiredPermissions) || hasPermission(screen)) {
                provisionedScreens.push(screen);
            }
        });
        return provisionedScreens;
    };

    UserDefinedScreens.getScreensConfig = function() {
        var deferred = new $.Deferred();
        this.fetchScreens(USER_SCREENS_CONFIG, deferred);
        return deferred;
    };

    UserDefinedScreens._postProcess = function(response, model) {
        var provisionedPreDefinedScreens = filterScreensOnHasPermission(PreDefinedScreens.screens);

        var screens = _.get(response, 'screens', model.get('screens'));
        if (!_.isEmpty(screens)) {
            var filteredUserScreens = filterScreensOnHasPermission(screens);
            if (filteredUserScreens.length < screens.length) {
                _.set(response, 'screens', filteredUserScreens);
            }
        }

        var isLoggedIn = UserService.getUserSession().get('status') === UserService.STATUS.LOGGEDIN;
        var currentContextId = WorkspaceContextRepository.currentContextId;
        var contextDefaultScreen = WorkspaceContextRepository.currentContextDefaultScreen;
        var hasScreenConfigChanged = false;
        var user, preferences, defaultScreen, initialDefaultScreen;

        if (isLoggedIn) {
            user = UserService.getUserSession();
            preferences = user.get('preferences');
            if (!preferences) {
                user.set('preferences', {
                    defaultScreen: {}
                });
            } else if (!preferences.defaultScreen) {
                preferences.defaultScreen = {};
            }

            initialDefaultScreen = _.get(preferences, ['defaultScreen', currentContextId]);
        }

        // Sanitize current screens
        screens = _.filter(screens, function(userScreen) {
            if (_.isEmpty(userScreen)) {
                hasScreenConfigChanged = true;
                return false;
            }

            if (userScreen.predefined) {
                var matchingIdScreen = _.find(provisionedPreDefinedScreens, function(predefinedScreen) {
                    return predefinedScreen.id === userScreen.id;
                });

                if (!_.isEmpty(matchingIdScreen) && userScreen.title !== matchingIdScreen.title) {
                    userScreen.title = matchingIdScreen.title;
                    hasScreenConfigChanged = true;
                }
            }

            return true;
        });

        var navigateToDefaultScreen = false;
        // Add missing predefined screens
        _.each(provisionedPreDefinedScreens, function(predefinedScreen) {
            var matchingTitleScreens = _.filter(screens, function(userScreen) {
                return predefinedScreen.title === userScreen.title;
            });

            if (_.isEmpty(matchingTitleScreens)) {
                screens.push(predefinedScreen);
                hasScreenConfigChanged = true;
            } else {
                _.each(matchingTitleScreens, function(matchingScreen) {
                    if (matchingScreen.id !== predefinedScreen.id) {
                        // Replace screen
                        hasScreenConfigChanged = true;

                        if (isLoggedIn && _.get(preferences, ['defaultScreen', currentContextId]) === matchingScreen.id) {
                            _.set(preferences, ['defaultScreen', currentContextId], predefinedScreen.id);
                        }

                        _.set(response, 'screens', _.without(screens, matchingScreen));
                        screens.push(predefinedScreen);
                        this.saveGridsterConfig({}, matchingScreen.id);

                        if (!navigateToDefaultScreen && Backbone.history.fragment === matchingScreen.id) {
                            navigateToDefaultScreen = true;
                        }
                    }
                }, this);
            }
        }, this);

        if (isLoggedIn) {
            if (initialDefaultScreen !== _.get(preferences, ['defaultScreen', currentContextId])) {
                UserService.savePreferences();
                user.trigger('change:preferences:defaultScreen');
            }
        }

        if (navigateToDefaultScreen) {
            Navigation.navigate(WorkspaceContextRepository.currentContextDefaultScreen, {
                route: {
                    trigger: false
                }
            });
        }

        // if there is a user than save the updated screen config into session
        if (isLoggedIn) {
            WorkspaceContextRepository.currentContextDefaultScreen = _.get(preferences, ['defaultScreen', currentContextId]) || contextDefaultScreen;
        }

        response.screens = screens;
        return response;
    };

    UserDefinedScreens.sortScreensByIds = function(ids) {
        var idHashMap = _.zipObject(ids, _.range(ids.length));

        var screens = this.getScreensConfigFromSession().screens;
        var sortedScreens = _.sortBy(screens, function(screen) {
            var index = idHashMap[screen.id];
            return !_.isUndefined(index) ? index : screens.length;
        });

        this.saveScreensConfig({
            screens: sortedScreens
        });
    };

    UserDefinedScreens.getScreenBySnomedCt = function(snomedCt) {
        var promise;
        var screensConfig = this.getScreensConfigFromSession();
        if(_.isEmpty(screensConfig)) {
            promise = this.getScreensConfig();
        } else {
            promise = new $.Deferred();
            promise.resolve(screensConfig);
        }
        var deferred = new $.Deferred();
        var filteredScreenList = [];
        promise.done(function(screensConfig) {
            // look for a screen with the given snomed code in it's list of associated problems
            var screens = screensConfig.screens;
            for (var i = 0, screenLen = screens.length; i < screenLen; i++) {
                var associatedProblems = screens[i].problems;
                if (associatedProblems) {
                    for (var k = 0, probLen = associatedProblems.length; k < probLen; k++) {
                        if (associatedProblems[k].snomed === snomedCt) {
                            filteredScreenList.push(screens[i]);
                        }
                    }
                }
            }
            deferred.resolve(filteredScreenList);

        });
        return deferred.promise();
    };

    function getId() {
        var patient = PatientRecordService.getCurrentPatient();
        return patient.get('icn') || patient.get('pid') || patient.get('id');
    }

    UserDefinedScreens.saveScrollPositionToSession = function(value) {
        Session.set.sessionObject('WorkspaceScrollPosition', {
            scrollPosition: value
        });
    };

    UserDefinedScreens.getScrollPositionFromSession = function() {
        return _.get(Session.get.sessionObject('WorkspaceScrollPosition'), 'scrollPosition', 0);
    };

    UserDefinedScreens.setHasCustomize = function(screenId) {
        var screensConfig = this.getScreensConfigFromSession();
        var screens = screensConfig.screens;
        var newConfig = {
            screens: []
        };

        var s = _.find(screens, function(screen) {
            return screen.id === screenId && screen.hasCustomize;
        });
        if (!s) return;

        _.each(screens, function(screen) {
            if (screen.id === screenId) {
                screen.hasCustomize = false;
            }
            newConfig.screens.push(screen);
        });
        this.saveScreensConfig(newConfig);
    };

    var findScreenIndexFromUserDefinedGraphs = function(json, screenId) {
        return _.findIndex(json.userDefinedGraphs, {
            id: screenId
        });
    };

    var findAppletIndexFromUserDefinedGraphs = function(screenConfig, instanceId) {
        return _.findIndex(screenConfig.applets, {
            instanceId: instanceId
        });
    };

    //get stacked graph for one applet from session
    UserDefinedScreens.getStackedGraphForOneAppletFromSession = function(screenId, appletInstanceId) {
        var json = this.getUserConfigFromSession();
        var screenIndex = findScreenIndexFromUserDefinedGraphs(json, screenId);
        if (screenIndex === -1) return;
        var screenConfig = json.userDefinedGraphs[screenIndex];
        var appletIndex = findAppletIndexFromUserDefinedGraphs(screenConfig, appletInstanceId);
        if (appletIndex === -1) return;
        var graphs = _.clone(screenConfig.applets[appletIndex].graphs);

        return graphs;
    };

    //remove one stacked graph for one applet from session
    UserDefinedScreens.removeOneStackedGraphFromSession = function(screenId, appletInstanceId, graphType, typeName) {
        var json = this.getUserConfigFromSession();
        var screenIndex = findScreenIndexFromUserDefinedGraphs(json, screenId);
        if (screenIndex === -1) return;
        var screenConfig = json.userDefinedGraphs[screenIndex];
        var appletIndex = findAppletIndexFromUserDefinedGraphs(screenConfig, appletInstanceId);
        if (appletIndex === -1) return;
        var appletConfig = screenConfig.applets[appletIndex];

        var graphIndex = -1;
        appletConfig.graphs.forEach(function(graph, index) {
            if (graph.graphType === graphType && graph.typeName === typeName) {
                graphIndex = index;
            }
        });
        if (graphIndex > -1) {
            json.userDefinedGraphs[screenIndex].applets[appletIndex].graphs.splice(graphIndex, 1);
        }

        //delete entire applet definition if no graph remain
        if (json.userDefinedGraphs[screenIndex].applets[appletIndex].graphs.length === 0) {
            json.userDefinedGraphs[screenIndex].applets.splice(appletIndex, 1);
        }

        this.saveUserConfigToSession(json);
    };

    //remove all stacked graphs for one applet from session
    UserDefinedScreens.hasStackedGraphForApplet = function(screenId, appletInstanceId) {
        var json = this.getUserConfigFromSession();
        var screenIndex = findScreenIndexFromUserDefinedGraphs(json, screenId);
        if (screenIndex === -1) return false;
        var screenConfig = json.userDefinedGraphs[screenIndex];
        var appletIndex = findAppletIndexFromUserDefinedGraphs(screenConfig, appletInstanceId);
        if (appletIndex === -1) return false;
        return true;
    };

    //remove all stacked graphs for one applet from session
    UserDefinedScreens.removeAllStackedGraphFromSession = function(screenId, appletInstanceId) {
        var json = this.getUserConfigFromSession();
        var screenIndex = findScreenIndexFromUserDefinedGraphs(json, screenId);
        if (screenIndex === -1) return;
        var screenConfig = json.userDefinedGraphs[screenIndex];
        var appletIndex = findAppletIndexFromUserDefinedGraphs(screenConfig, appletInstanceId);
        if (appletIndex === -1) return;
        json.userDefinedGraphs[screenIndex].applets.splice(appletIndex, 1);
        this.saveUserConfigToSession(json);
    };

    //add one stacked graph to session
    UserDefinedScreens.addOneStackedGraphToSession = function(screenId, appletInstanceId, graphType, typeName) {
        var json = this.getUserConfigFromSession();
        if (!json.userDefinedGraphs) json.userDefinedGraphs = [];
        var screenIndex = findScreenIndexFromUserDefinedGraphs(json, screenId);
        if (screenIndex === -1) {
            if (!json.userDefinedGraphs) json.userDefinedGraphs = [];
            json.userDefinedGraphs.push({
                applets: [],
                id: screenId
            });
            screenIndex = json.userDefinedGraphs.length - 1;
        }
        var screenConfig = json.userDefinedGraphs[screenIndex];
        var appletIndex = findAppletIndexFromUserDefinedGraphs(screenConfig, appletInstanceId);
        if (appletIndex === -1) {

            json.userDefinedGraphs[screenIndex].applets.push({
                graphs: [{
                    graphType: graphType,
                    typeName: typeName
                }],
                instanceId: appletInstanceId
            });
            this.saveUserConfigToSession(json);
            return;
        }
        var appletConfig = screenConfig.applets[appletIndex];
        if (!appletConfig.graphs) appletConfig.graphs = [];
        var graphIndex = -1;
        appletConfig.graphs.forEach(function(graph, index) {
            if (graph.graphType === graphType && graph.typeName === typeName) {
                graphIndex = index;
            }
        });
        if (graphIndex > -1) {
            json.userDefinedGraphs[screenIndex].applets[appletIndex].graphs.splice(graphIndex, 1);
        }

        json.userDefinedGraphs[screenIndex].applets[appletIndex].graphs.push({
            graphType: graphType,
            typeName: typeName
        });

        this.saveUserConfigToSession(json);
    };

    UserDefinedScreens.reorderStackedGraphsInSession = function(screenId, appletInstanceId, newGraphsArray) {
        var json = this.getUserConfigFromSession();

        if (this.hasStackedGraphForApplet(screenId, appletInstanceId)) {
            var screenIndex = findScreenIndexFromUserDefinedGraphs(json, screenId);
            var screenConfig = json.userDefinedGraphs[screenIndex];
            var appletIndex = findAppletIndexFromUserDefinedGraphs(screenConfig, appletInstanceId);

            json.userDefinedGraphs[screenIndex].applets[appletIndex].graphs = newGraphsArray;
            this.saveUserConfigToSession(json);
        }
    };

    //clone filters from one screen to another in Session
    UserDefinedScreens.cloneScreenGraphsToSession = function(fromScreenId, toScreenId) {
        var json = this.getUserConfigFromSession();
        var screenIndex = findScreenIndexFromUserDefinedGraphs(json, fromScreenId);
        if (screenIndex === -1) return;
        var screenConfig = _.clone(json.userDefinedGraphs[screenIndex]);
        screenConfig.id = toScreenId;
        var toScreenIndex = findScreenIndexFromUserDefinedGraphs(json, toScreenId);
        if (toScreenIndex > -1) json.userDefinedGraphs[toScreenIndex] = screenConfig;
        else json.userDefinedGraphs.push(screenConfig);
        this.saveUserConfigToSession(json);
    };


    //update screenId
    UserDefinedScreens.updateScreenId = function(oldId, newId) {
        var callback = _.bind(function() {
            this.updateScreenIdInSession(oldId, newId);
        }, this);

        //Update screenId in JDS
        this.updateScreenIdInJDS(oldId, newId, callback, true);
    };

    UserDefinedScreens.updateScreenIdInSession = function(oldId, newId) {
        var json = this.getUserConfigFromSession();
        //update id for screen config
        var screenIndex = _.findIndex(json.userDefinedScreens, {
            id: oldId
        });
        if (screenIndex > -1) {
            json.userDefinedScreens[screenIndex].id = newId;
        }
        //update id for filters
        var screenIndex2 = _.findIndex(json.userDefinedFilters, {
            id: oldId
        });
        if (screenIndex2 > -1) {
            json.userDefinedFilters[screenIndex2].id = newId;
        }
        //update id for stacked graph
        var screenIndex3 = _.findIndex(json.userDefinedGraphs, {
            id: oldId
        });
        if (screenIndex3 > -1) {
            json.userDefinedGraphs[screenIndex3].id = newId;
        }
        //update id for user sort
        var screenIndex4 = _.findIndex(json.userDefinedSorts, {
            id: oldId
        });
        if (screenIndex4 > -1) {
            json.userDefinedSorts[screenIndex4].id = newId;
        }
        this.saveUserConfigToSession(json);
        this.saveScreensConfigToSession(json);
    };

    UserDefinedScreens.updateScreenIdInJDS = function(oldId, newId, callback, silent) {
        this.model.save({
            oldId: oldId,
            newId: newId
        }, {
            fetchType: 'PUT',
            callback: callback,
            silent: silent
        });
    };

    //remove the screen filters and stacked graph from session
    UserDefinedScreens.removeOneScreenFromJSON = function(screenId, json) {
        WorkspaceFilters.removeAllFiltersForOneScreenFromJSON(screenId, json);
        this.removeAllStackedGraphForOneScreenFromJSON(screenId, json);
        ADK.TileSortManager.removeAllSortsForOneScreenFromJSON(screenId, json);
        return json;
    };

    //remove all stacked graphs for screen from session
    UserDefinedScreens.removeAllStackedGraphForOneScreenFromJSON = function(screenId, json) {
        var screenIndex = findScreenIndexFromUserDefinedGraphs(json, screenId);
        if (screenIndex === -1) return;
        json.userDefinedGraphs.splice(screenIndex, 1);
        return json;
    };

    //clone user defined sorts from one screen to another in Session
    UserDefinedScreens.cloneScreenSortsToSession = function(fromScreenId, toScreenId) {
        var json = this.getUserConfigFromSession();
        var userDefinedSorts = json.userDefinedSorts;
        var screenIndex = _.findIndex(userDefinedSorts, {
            id: fromScreenId
        });
        if (screenIndex === -1) return;
        var screenConfig = _.clone(userDefinedSorts[screenIndex]);
        screenConfig.id = toScreenId;
        var toScreenIndex = _.findIndex(userDefinedSorts, {
            id: toScreenId
        });
        if (toScreenIndex > -1) userDefinedSorts[toScreenIndex] = screenConfig;
        else userDefinedSorts.push(screenConfig);
        this.saveUserConfigToSession(json);
    };


    var UserDefinedScreenModel = Backbone.Model.extend({
        defaults: {
            screens: [],
            userScreensConfig: []
        },
        initialize: function() {
            this._requestCount = 0;
        },
        incrementRequest: function() {
            if (this._requestCount === 0) {
                Messaging.trigger('obscure:content');
            }
            this._requestCount += 1;
        },
        decrementRequest: function() {
            this._requestCount -= 1;
            if (this._requestCount === 0) {
                Messaging.trigger('reveal:content');
            }
        },
        parse: function(response) {
            var userScreens = _.get(response, 'data.userScreensConfig.screens');
            var screens = userScreens ? _.defaults({
                screens: userScreens
            }, response.data): response.data;
            return UserDefinedScreens._postProcess(screens, this);
        },
        fetch: function(options) {
            this.incrementRequest();
            var params = {
                screenType: options.key,
                predefinedScreens: _.pluck(PreDefinedScreens.screens, 'id')
            };
            options.cache = false;
            this.url = ResourceService.buildUrl('user-defined-screens', params);
            this.trigger('fetch', this, params);
            return Backbone.Model.prototype.fetch.call(this, _.extend({
                success: function(model, resp, options) {
                    var args = Array.prototype.slice.call(arguments);
                    args.unshift('fetch:success');
                    Backbone.Model.prototype.trigger.apply(model, args);
                    model.decrementRequest();
                },
                error: function(model, resp, options) {
                    var args = Array.prototype.slice.call(arguments);
                    args.unshift('fetch:error');
                    Backbone.Model.prototype.trigger.apply(model, args);
                    model.decrementRequest();
                }
            }, options));
        },
        save: function(params, options) {
            this.incrementRequest();
            var isPost = _.has(params, 'screenType');
            var requestType;
            if (isPost) {
                requestType = 'POST';
                this.url = ResourceService.buildUrl('write-user-defined-screens');
            } else {
                requestType = 'PUT';
                this.url = ResourceService.buildUrl('write-user-defined-screens', params);
            }
            this.trigger('save', this, params, options);
            return Backbone.Model.prototype.save.call(this, params, _.extend({
                type: requestType,
                contentType: 'application/json',
                dataType: 'json',
                parse: false,
                success: function(model, resp, options) {
                    model.unset('param');
                    try {
                        var screens = _.get(JSON.parse(resp.message), 'userScreensConfig.screens');
                        model.set('screens', screens);
                        var json = model.toJSON();
                        UserDefinedScreens.saveScreensConfigToSession(json, model);
                    } catch (e) {
                        console.error('Could not parse screen config from response');
                    }
                    var args = Array.prototype.slice.call(arguments);
                    _.extend(args[2], _.result(options, 'callback'));
                    args.unshift('save:success');
                    Backbone.Model.prototype.trigger.apply(model, args);
                    model.decrementRequest();
                },
                error: function(model, resp, options) {
                    model.unset('param');
                    var args = Array.prototype.slice.call(arguments);
                    args.unshift('save:error');
                    Backbone.Model.prototype.trigger.apply(model, args);
                    model.decrementRequest();
                }
            }, params, options));
        },
        cloneScreen: function(params) {
            this.incrementRequest();
            this.url = ResourceService.buildUrl('write-user-defined-screens-copy', params);
            this.trigger('clone', this, params);
            return Backbone.Model.prototype.save.call(this, {}, _.extend({
                type: 'POST',
                success: function(model, resp, options) {
                    var args = Array.prototype.slice.call(arguments);
                    args.unshift('clone:success');
                    Backbone.Model.prototype.trigger.apply(model, args);
                    model.decrementRequest();
                },
                error: function(model, resp, options) {
                    var args = Array.prototype.slice.call(arguments);
                    args.unshift('clone:error');
                    Backbone.Model.prototype.trigger.apply(model, args);
                    model.decrementRequest();
                },
                id: params.toId,
                parse: false
            }, params));
        }
    });

    var ScreenManager = Backbone.Marionette.Object.extend(_.extend({
        modelEvents: {
            'request': _.partial(Backbone.Marionette.triggerMethod, 'request'),
            'save': _.partial(Backbone.Marionette.triggerMethod, 'save'),
            'save:success': _.partial(Backbone.Marionette.triggerMethod, 'save:success'),
            'save:error': _.partial(Backbone.Marionette.triggerMethod, 'save:error'),
            'fetch': _.partial(Backbone.Marionette.triggerMethod, 'fetch'),
            'fetch:success': _.partial(Backbone.Marionette.triggerMethod, 'fetch:success'),
            'fetch:error': _.partial(Backbone.Marionette.triggerMethod, 'fetch:error'),
            'clone': _.partial(Backbone.Marionette.triggerMethod, 'clone'),
            'clone:success': _.partial(Backbone.Marionette.triggerMethod, 'clone:success'),
            'clone:error': _.partial(Backbone.Marionette.triggerMethod, 'clone:error')
        },
        initialize: function() {
            this.cid = _.uniqueId('UserDefinedScreen');
            this.model = new UserDefinedScreenModel();
            this.bindEntityEvents(this.model, this.modelEvents);
        },
        onCloneSuccess: function(model, resp, options) {
            var fromId = options.fromId;
            var toId = options.toId;

            var _applets = _.get(ADK.ADKApp.Screens, [fromId, 'applets'], []);

            var clonedScreenOptions = _.get(options, 'clonedScreenOptions', {});

            var predefinedAppletConfig = {
                applets: _applets,
                id: toId,
                contentRegionLayout: 'gridster',
                userDefinedScreen: true
            };

            if(options.predefined !== true) {
                this.cloneUDScreenToSession(fromId, toId);
            }

            this.cloneScreenFiltersToSession(fromId, toId);

            //clone stacked graphs to session
            this.cloneScreenGraphsToSession(fromId, toId);

            //clone user defined sorts to session
            this.cloneScreenSortsToSession(fromId, toId);

            this.saveGridsterConfig(predefinedAppletConfig, toId);
            ADK.ADKApp.ScreenPassthrough.addNewScreen(_.extend(predefinedAppletConfig, clonedScreenOptions), ADK.ADKApp, _.get(clonedScreenOptions, 'screenIndex', 0) + 1);
        },
        onFetchSuccess: function(model, resp, options) {
            var screenJSON = model.toJSON();
            this.saveScreensConfigToSession(screenJSON, model);
            if(options.deferred) options.deferred.resolve(screenJSON);
        },
        onDestroy: function() {
            this.unbindEntityEvents(this.model, this.modelEvents);
        }
    }, UserDefinedScreens));

    return new ScreenManager();
});