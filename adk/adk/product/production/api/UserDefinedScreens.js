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
    'main/api/WorkspaceFilters'
], function(_, Backbone, Marionette, $, ResourceService, PatientRecordService, Navigation, Session, UserService, Messaging, WorkspaceContextRepository, WorkspaceFilters) {
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
        divs.each(function() {
            var titleText;
            var $appletEl = $(this).find('[data-appletid]');
            var applet = {};
            var id;
            if ($appletEl.length > 0) {
                id = $appletEl.attr('data-appletid');
                if (!_.isUndefined(id)) {
                    applet = UserDefinedScreens.getAppletDefaultConfig(id);
                    applet.instanceId = $appletEl.attr('data-instanceid');
                    applet.region = $appletEl.attr('data-instanceid');
                    applet.dataRow = $(this).attr('data-row');
                    applet.dataCol = $(this).attr('data-col');
                    applet.dataSizeX = $(this).attr('data-sizex');
                    applet.dataSizeY = $(this).attr('data-sizey');

                    applet.dataMinSizeX = $(this).attr('data-min-sizex');
                    applet.dataMinSizeY = $(this).attr('data-min-sizey');
                    applet.dataMaxSizeX = $(this).attr('data-max-sizex');
                    applet.dataMaxSizeY = $(this).attr('data-max-sizey');
                    applet.viewType = $(this).attr('data-view-type');
                    titleText = $('.panel-title-label', this).text() || applet.title;
                    applet.title = titleText.trim();
                    applet.filterName = $(this).attr('data-filter-name');
                    applets.push(applet);
                }
            } else {
                id = $(this).attr('data-appletid');
                if (!_.isUndefined(id)) {
                    applet = UserDefinedScreens.getAppletDefaultConfig(id);
                    applet.instanceId = $(this).attr('data-instanceid');
                    applet.region = $(this).attr('data-instanceid');
                    applet.dataRow = $(this).attr('data-row');
                    applet.dataCol = $(this).attr('data-col');
                    applet.dataSizeX = $(this).attr('data-sizex');
                    applet.dataSizeY = $(this).attr('data-sizey');

                    applet.dataMinSizeX = $(this).attr('data-min-sizex');
                    applet.dataMinSizeY = $(this).attr('data-min-sizey');
                    applet.dataMaxSizeX = $(this).attr('data-max-sizex');
                    applet.dataMaxSizeY = $(this).attr('data-max-sizey');
                    applet.viewType = $(this).attr('data-view-type');

                    var viewType = '';
                    // set default view type to first available option if user did not pick any view type
                    if ($(this).attr('data-view-type') === 'default') {
                        viewType = $('.options-box').attr('data-viewtype');
                    } else {
                        viewType = $(this).attr('data-view-type') || $('.options-box').attr('data-viewtype');
                    }
                    applet.viewType = viewType;
                    titleText = $('.applet-title', this).text() || applet.title;
                    applet.title = titleText.trim();
                    applet.filterName = $(this).attr('data-filter-name');
                    applets.push(applet);
                }
            }
        });
        screen.applets = applets;
        return screen;
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
        size = ADK.utils.getViewTypeSize(currentApplet.viewType);
        minSize = ADK.utils.getViewTypeMinSize(currentApplet.viewType);
        maxSize = ADK.utils.getViewTypeMaxSize(currentApplet.viewType);
        currentApplet.dataSizeX = currentApplet.dataSizeX || size.x;
        currentApplet.dataSizeY = currentApplet.dataSizeY || size.y;
        currentApplet.dataMinSizeX = currentApplet.dataMinSizeX || minSize.x;
        currentApplet.dataMinSizeY = currentApplet.dataMinSizeY || minSize.y;
        currentApplet.dataMaxSizeX = currentApplet.dataMaxSizeX || maxSize.x;
        currentApplet.dataMaxSizeY = currentApplet.dataMaxSizeY || maxSize.y;
    };

    UserDefinedScreens.getGridsterTemplate = function(screenModule) {
        var template = '<div class="gridster" id="' + screenModule.id + '">';
        _.each(screenModule.applets, function(currentApplet) {
            if (currentApplet.region.toLowerCase() != 'none') {
                UserDefinedScreens.setAppletDataAttribute(currentApplet);
                template += '<div id="' + currentApplet.region +
                    '" data-row="' + currentApplet.dataRow +
                    '" data-col="' + currentApplet.dataCol +
                    '" data-sizex="' + currentApplet.dataSizeX +
                    '" data-sizey="' + currentApplet.dataSizeY +
                    '" data-min-sizex="' + currentApplet.dataMinSizeX +
                    '" data-max-sizex="' + currentApplet.dataMaxSizeX +
                    '" data-min-sizey="' + currentApplet.dataMinSizeY +
                    '" data-max-sizey="' + currentApplet.dataMaxSizeY +
                    '" data-filter-name="' + getFilterNameOrDefault(currentApplet) +
                    '" data-view-type="' + currentApplet.viewType +
                    '" ></div>';
            }
        });
        template += '</div>{{{paginationHtml}}}';
        return template;
    };

    UserDefinedScreens.getGridsterMaxColumn = function(screenModule) {
        var maxCol = 0;
        _.each(screenModule.applets, function(currentApplet) {
            if (currentApplet.region.toLowerCase() != 'none') {
                UserDefinedScreens.setAppletDataAttribute(currentApplet);
                var sizeX = parseInt(currentApplet.dataSizeX);
                var col = parseInt(currentApplet.dataCol);
                if (sizeX + col > maxCol) maxCol = sizeX + col;
            }
        });
        return maxCol - 1;
    };

    function getFilterNameOrDefault(applet) {
        return applet.filterName || '';
    }

    function getViewTypeDisplay(type) {
        if (type === "gist") {
            return "trend";
        } else {
            return type;
        }
    }

    UserDefinedScreens.getGridsterTemplateForEditor = function(screenModule) {
        var deferred = new $.Deferred();
        UserDefinedScreens.updateScreenModuleFromStorage(screenModule).done(function() {
            var template = '<div id="gridster2" class="gridster"><ul>';
            _.each(screenModule.applets, function(currentApplet) {
                if (currentApplet.region.toLowerCase() != 'none') {
                    UserDefinedScreens.setAppletDataAttribute(currentApplet);
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
                        '" data-filter-name="' + getFilterNameOrDefault(currentApplet) +
                        '" data-view-type="' + currentApplet.viewType +
                        '" ><button type="button" aria-label="Press enter to open view options." class="btn btn-icon ' +
                        (currentApplet.notFound ? 'applet-not-found' : currentApplet.noPermission ? 'permission-denied-applet' : 'edit-applet applet-options-button') +
                        '"><i class="fa fa-cog"></i></button><br><h5 class="applet-title all-margin-no all-padding-no">' + currentApplet.title + '</h5>' +
                        (currentApplet.notFound ? '<span class="text-warning">Applet Not Found</span>' : currentApplet.noPermission ? '<span class="text-danger">Permission Denied</span>' : '<span class="right-padding-lg">' + _.capitalize(getViewTypeDisplay(currentApplet.viewType)) + '</span>');
                }
            });

            template += '</ul></div>';
            deferred.resolve(template);
        });

        return deferred;
    };

    UserDefinedScreens.getGridsterTemplateForPreview = function(screenModule) {
        var template = '<div id="gridsterPreview" class="gridster"><ul>';
        _.each(screenModule.applets, function(currentApplet) {
            if (currentApplet.region.toLowerCase() !== 'none') {
                UserDefinedScreens.setAppletDataAttribute(currentApplet);
                template += '<li' +
                    ' data-row="' + currentApplet.dataRow +
                    '" data-col="' + currentApplet.dataCol +
                    '" data-sizex="' + currentApplet.dataSizeX +
                    '" data-sizey="' + currentApplet.dataSizeY +
                    '" ><h4 class="applet-title">' + currentApplet.title + '</h4><p class="applet-type">' + getViewTypeDisplay(currentApplet.viewType) + '</p></li>';
            }

        });
        template += '</ul></div>';
        return template;
    };

    UserDefinedScreens.updateScreenModuleFromStorage = function(screenModule) {
        var deferred = new $.Deferred();
        if (screenModule.config && screenModule.config.predefined) {
            deferred.resolve();
            return deferred;
        }
        var gridsterScreenConfig = UserDefinedScreens.getGridsterConfigFromSession(screenModule.id);
        if (gridsterScreenConfig && !_.isUndefined(gridsterScreenConfig.applets) && !_.isNull(gridsterScreenConfig.applets)) {
            screenModule.applets = gridsterScreenConfig.applets;
        }
        deferred.resolve();
        return deferred;
    };

    UserDefinedScreens.saveConfigToJDS = function(json, key, callback) {
        var saveFilterModel = new Backbone.Model();
        saveFilterModel.url = ResourceService.buildUrl('write-user-defined-screens');
        saveFilterModel.save({}, {
            url: ResourceService.buildUrl('write-user-defined-screens', {}),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({
                screenType: key,
                param: json
            }),
            success: function(response) {
                if (callback) callback(response);
            }
        });
    };

    UserDefinedScreens.saveGridsterConfig = function(gridsterAppletJson, key, callback) {
        UserDefinedScreens.saveConfigToJDS(gridsterAppletJson, key, callback);
        UserDefinedScreens.saveGridsterConfigToSession(gridsterAppletJson, key);
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
        Session.set.sessionObject(USER_SCREENS_CONFIG, json);
    };

    UserDefinedScreens.getScreensConfigFromSession = function() {
        var json = Session.get.sessionObject(USER_SCREENS_CONFIG);
        return json.userScreensConfig ? json.userScreensConfig : json;
    };

    UserDefinedScreens.getGridsterConfigFromSession = function(screenId) {
        var json = Session.get.sessionObject(USER_SCREENS_CONFIG) || {};
        var screenConfig = _.find(json.userDefinedScreens || [], function(screen) {
            return screen && screen.id === screenId;
        });
        return screenConfig || Session.get.sessionObject(screenId);
    };

    UserDefinedScreens.getConfig = function(key) {
        var self = this;
        var deferred = new $.Deferred();
        var userSession = UserService.getUserSession();
        if (_.isUndefined(key) || _.isUndefined(userSession) || _.isUndefined(userSession.get('status')) || userSession.get('status') === 'loggedout') {
            deferred.resolve(new Backbone.Model({}));
            return deferred;
        }

        var res = Session.get.sessionObject(key);
        if (!_.isUndefined(res) && !_.isEmpty(res)) {
            deferred.resolve(new Backbone.Model(res));
            return deferred;
        }

        var fetchOptions = {
            resourceTitle: 'user-defined-screens',
            criteria: {
                screenType: key,
                predefinedScreens: _.pluck(PreDefinedScreens.screens, 'id')
            }
        };
        fetchOptions.onSuccess = function(response) {
            if (response.length > 0) {
                deferred.resolve(response.at(0));
                if (userSession.get('status') === UserService.STATUS.LOGGEDIN) {
                    self.saveUserConfigToSession(response.at(0));
                }
            } else {
                deferred.resolve(new Backbone.Model({}));
            }
        };

        fetchOptions.onError = function() {
            deferred.resolve(new Backbone.Model({}));
        };
        ResourceService.fetchCollection(fetchOptions);
        return deferred;
    };

    UserDefinedScreens.cloneScreenFilters = function(origId, cloneId) {
        WorkspaceFilters.cloneScreenFilters(origId, cloneId);
    };

    UserDefinedScreens.cloneScreenFiltersToSession = function(origId, cloneId) {
        WorkspaceFilters.cloneScreenFiltersToSession(origId, cloneId);
    };

    UserDefinedScreens.cloneScreen = function(origId, cloneId, predefined) {
        var url = ResourceService.buildUrl('write-user-defined-screens-copy', {
            fromId: origId,
            toId: cloneId,
            predefined: predefined
        });
        $.post(url).done(function() {
            //console.log('Success in saving clone of workspace ' + origId);
        }).fail(function() {
            //console.log('Error in saving clone of workspace ' + origId);
        });
    };

    UserDefinedScreens.cloneUDScreenToSession = function(origId, cloneId) {
        var gridsterConfig = _.clone(UserDefinedScreens.getGridsterConfigFromSession(origId));
        gridsterConfig.id = cloneId;
        UserDefinedScreens.saveGridsterConfigToSession(gridsterConfig, cloneId);
    };

    UserDefinedScreens.saveScreensConfig = function(screenConfigJson, callback) {
        // literally checking to see if there is a "null" value
        // NOT SURE IF THIS IS NEEDED
        var nullScreenExists = _.some(screenConfigJson.screens, function(screen) {
            return !screen;
        });
        if (nullScreenExists) {
            var definedScreensOnly = _.filter(screenConfigJson.screens, function(screen) {
                if (!_.isUndefined(screen) && screen !== null) {
                    return screen;
                }
            });
            screenConfigJson.screens = definedScreensOnly;
        }
        // getting the current patient's identifier
        var pid = getId();
        if (pid) {
            UserDefinedScreens.saveScreensConfigToSession(screenConfigJson);
            UserDefinedScreens.saveConfigToJDS(screenConfigJson, USER_SCREENS_CONFIG, callback);
        }
    };

    UserDefinedScreens.saveScreensConfigToSession = function(screenConfigJson) {
        var json = Session.get.sessionObject(USER_SCREENS_CONFIG);
        if (json.userScreensConfig) {
            json.userScreensConfig.screens = screenConfigJson.screens;
            if (!json.userDefinedScreens) json.userDefinedScreens = [];
        } else {
            json = {
                userScreensConfig: {
                    screens: screenConfigJson.screens
                },
                userDefinedScreens: []
            };
        }
        Session.set.sessionObject(USER_SCREENS_CONFIG, json);
    };

    UserDefinedScreens.cloneGridsterConfig = function(origScreenId, newScreenId) {
        var configClone = Session.get.sessionObject(origScreenId);
        if (!_.isUndefined(configClone) && !_.isEmpty(configClone)) {
            configClone.id = newScreenId;
            UserDefinedScreens.saveGridsterConfig(configClone, newScreenId);
        }
    };

    UserDefinedScreens.addNewScreen = function(newScreenConfig, screenIndex, callback) {
        var screensConfig = UserDefinedScreens.getScreensConfigFromSession();
        var screens = screensConfig.screens;
        if (screenIndex) {
            screens.splice(screenIndex, 0, newScreenConfig);
        } else {
            screens.push(newScreenConfig);
        }
        UserDefinedScreens.saveScreensConfig(screensConfig, callback);
    };

    UserDefinedScreens.screensConfigNullCheck = function() {
        var promise = UserDefinedScreens.getScreensConfig(USER_SCREENS_CONFIG);
        promise.done(function(screenConfig) {
            var definedScreensOnly = _.filter(screenConfig.screens, function(screen) {
                if (!_.isUndefined(screen) && screen !== null) {
                    return screen;
                } else {
                    //console.log("Deleted null screen");
                }
            });
            screenConfig.screens = definedScreensOnly;
            UserDefinedScreens.saveScreensConfig(screenConfig);
        });
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

        UserDefinedScreens.getConfig(USER_SCREENS_CONFIG).done(function(screenConfig) {
            var provisionedPreDefinedScreens = filterScreensOnHasPermission(PreDefinedScreens.screens);
            var screensConfigOrig = screenConfig.toJSON();
            if (!screensConfigOrig.userScreensConfig) {
                screensConfigOrig.userScreensConfig = {
                    screens: []
                };
            }
            screenConfig = screensConfigOrig.userScreensConfig ? screensConfigOrig.userScreensConfig : screensConfigOrig;
            if (_.isEmpty(screenConfig)) {
                screenConfig = {
                    screens: []
                };
            } else {
                var filteredUserScreens = filterScreensOnHasPermission(screenConfig.screens);
                if (filteredUserScreens.length < screenConfig.screens.length) {
                    screenConfig.screens = filteredUserScreens;
                }
            }

            var isLoggedIn = UserService.getUserSession().get('status') === UserService.STATUS.LOGGEDIN;
            var currentContextId = WorkspaceContextRepository.currentContextId;
            var contextDefaultScreen = WorkspaceContextRepository.currentContextDefaultScreen;
            var hasScreenConfigChanged = false;
            var user, preferences, defaultScreen, initialDefaultScreen;
            if (isLoggedIn) {
                user = ADK.UserService.getUserSession();
                if (!user.get('preferences')) {
                    user.set('preferences', {defaultScreen: {}});
                }
                preferences = user.get('preferences');
                if (!preferences.defaultScreen) {
                    _.set(preferences, 'defaultScreen', {});
                }
                defaultScreen = preferences.defaultScreen;
                initialDefaultScreen = defaultScreen[currentContextId];
            }

            // Sanitize current screens
            screenConfig.screens = _.filter(screenConfig.screens, function(userScreen) {
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

                // NOTE: DO NOT DELETE THE CURRENT DEFAULTSCREEN PROPERTY ON SCREEN
                // if (userScreen.defaultScreen) {
                //     delete userScreen.defaultScreen;
                //     hasScreenConfigChanged = true;
                // }

                return true;
            });

            var navigateToDefaultScreen = false;
            // Add missing predefined screens
            _.each(provisionedPreDefinedScreens, function(predefinedScreen) {
                var matchingTitleScreens = _.filter(screenConfig.screens, function(userScreen) {
                    return predefinedScreen.title === userScreen.title;
                });

                if (_.isEmpty(matchingTitleScreens)) {
                    screenConfig.screens.push(predefinedScreen);
                    hasScreenConfigChanged = true;
                } else {
                    _.each(matchingTitleScreens, function(matchingScreen) {
                        if (matchingScreen.id !== predefinedScreen.id) {
                            // Replace screen
                            hasScreenConfigChanged = true;

                            if (isLoggedIn && defaultScreen[currentContextId] === matchingScreen.id) {
                                defaultScreen[currentContextId] = predefinedScreen.id;
                            }

                            screenConfig.screens = _.without(screenConfig.screens, matchingScreen);
                            screenConfig.screens.push(predefinedScreen);
                            UserDefinedScreens.saveGridsterConfig({}, matchingScreen.id);

                            if (!navigateToDefaultScreen && Backbone.history.fragment === matchingScreen.id) {
                                navigateToDefaultScreen = true;
                            }
                        }
                    });
                }
            });

            if (isLoggedIn) {
                if (initialDefaultScreen !== defaultScreen[currentContextId]) {
                    UserService.savePreferences();
                    user.trigger('change:preferences:defaultScreen');
                }
            }

            if (hasScreenConfigChanged) {
                // UserService.setUserSession(user);
                // Save the screens back to pJDS and locally in session storage
                UserDefinedScreens.saveScreensConfig(screenConfig);
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
                WorkspaceContextRepository.currentContextDefaultScreen = defaultScreen[currentContextId] || contextDefaultScreen;
                UserDefinedScreens.saveUserConfigToSession(screensConfigOrig);
            }

            deferred.resolve(screenConfig);
        });

        return deferred;
    };

    UserDefinedScreens.sortScreensByIds = function(ids) {
        var idHashMap = _.zipObject(ids, _.range(ids.length));

        var screens = UserDefinedScreens.getScreensConfigFromSession().screens;
        var sortedScreens = _.sortBy(screens, function(screen) {
            var index = idHashMap[screen.id];
            return !_.isUndefined(index) ? index : screens.length;
        });

        UserDefinedScreens.saveScreensConfig({
            screens: sortedScreens
        });
    };

    UserDefinedScreens.getScreenBySnomedCt = function(snomedCt) {
        var promise = UserDefinedScreens.getScreensConfig();
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
        var id;

        // Get the pid param in the same way as PatientRecordService.fetchCollection does
        if (patient.get("icn")) {
            id = patient.get("icn");
        } else if (patient.get("pid")) {
            id = patient.get("pid");
        } else {
            id = patient.get("id");
        }

        return id;
    }

    UserDefinedScreens.saveScrollPositionToSession = function(value) {
        var scrollPositionJSON = {
            scrollPosition: value
        };
        Session.set.sessionObject('WorkspaceScrollPosition', scrollPositionJSON);
    };

    UserDefinedScreens.getScrollPositionFromSession = function() {
        var scrollPosition = null;
        var scrollPositionObject = Session.get.sessionObject('WorkspaceScrollPosition') || {};
        scrollPosition = scrollPositionObject.scrollPosition;
        return scrollPosition ? scrollPosition : 0;
    };

    UserDefinedScreens.setHasCustomize = function(screenId) {
        var screensConfig = UserDefinedScreens.getScreensConfigFromSession();
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
        UserDefinedScreens.saveScreensConfig(newConfig);
    };

    var findIndex = function(array, callback, thisArg) {
        var index = -1,
            length = array ? array.length : 0;

        while (++index < length) {
            if (callback(array[index], index, array)) {
                return index;
            }
        }
        return -1;
    };

    var findScreenIndexFromUserDefinedGraphs = function(json, screenId) {
        var screenIndex = findIndex(json.userDefinedGraphs, function(screen) {
            return screen.id === screenId;
        });
        return screenIndex;
    };

    var findAppletIndexFromUserDefinedGraphs = function(screenConfig, instanceId) {
        if (!screenConfig) return -1;
        var appletIndex = findIndex(screenConfig.applets, function(applet) {
            return applet.instanceId === instanceId;
        });
        return appletIndex;
    };

    //get stacked graph for one applet from session
    UserDefinedScreens.getStackedGraphForOneAppletFromSession = function(screenId, appletInstanceId) {
        var json = UserDefinedScreens.getUserConfigFromSession();
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
        var json = ADK.UserDefinedScreens.getUserConfigFromSession();
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

        UserDefinedScreens.saveUserConfigToSession(json);
    };

    //remove all stacked graphs for one applet from session
    UserDefinedScreens.hasStackedGraphForApplet = function(screenId, appletInstanceId) {
        var json = ADK.UserDefinedScreens.getUserConfigFromSession();
        var screenIndex = findScreenIndexFromUserDefinedGraphs(json, screenId);
        if (screenIndex === -1) return false;
        var screenConfig = json.userDefinedGraphs[screenIndex];
        var appletIndex = findAppletIndexFromUserDefinedGraphs(screenConfig, appletInstanceId);
        if (appletIndex === -1) return false;
        return true;
    };

    //remove all stacked graphs for one applet from session
    UserDefinedScreens.removeAllStackedGraphFromSession = function(screenId, appletInstanceId) {
        var json = ADK.UserDefinedScreens.getUserConfigFromSession();
        var screenIndex = findScreenIndexFromUserDefinedGraphs(json, screenId);
        if (screenIndex === -1) return;
        var screenConfig = json.userDefinedGraphs[screenIndex];
        var appletIndex = findAppletIndexFromUserDefinedGraphs(screenConfig, appletInstanceId);
        if (appletIndex === -1) return;
        json.userDefinedGraphs[screenIndex].applets.splice(appletIndex, 1);
        UserDefinedScreens.saveUserConfigToSession(json);
    };

    //add one stacked graph to session
    UserDefinedScreens.addOneStackedGraphToSession = function(screenId, appletInstanceId, graphType, typeName) {
        var json = ADK.UserDefinedScreens.getUserConfigFromSession();
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
            UserDefinedScreens.saveUserConfigToSession(json);
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

        UserDefinedScreens.saveUserConfigToSession(json);
    };

    UserDefinedScreens.reorderStackedGraphsInSession = function(screenId, appletInstanceId, newGraphsArray) {
        var json = ADK.UserDefinedScreens.getUserConfigFromSession();

        if (UserDefinedScreens.hasStackedGraphForApplet(screenId, appletInstanceId)) {
            var screenIndex = findScreenIndexFromUserDefinedGraphs(json, screenId);
            var screenConfig = json.userDefinedGraphs[screenIndex];
            var appletIndex = findAppletIndexFromUserDefinedGraphs(screenConfig, appletInstanceId);

            json.userDefinedGraphs[screenIndex].applets[appletIndex].graphs = newGraphsArray;
            UserDefinedScreens.saveUserConfigToSession(json);
        }
    };

    //clone filters from one screen to another in Session
    UserDefinedScreens.cloneScreenGraphsToSession = function(fromScreenId, toScreenId) {
        var json = ADK.UserDefinedScreens.getUserConfigFromSession();
        var screenIndex = findScreenIndexFromUserDefinedGraphs(json, fromScreenId);
        if (screenIndex === -1) return;
        var screenConfig = _.clone(json.userDefinedGraphs[screenIndex]);
        screenConfig.id = toScreenId;
        var toScreenIndex = findScreenIndexFromUserDefinedGraphs(json, toScreenId);
        if (toScreenIndex > -1) json.userDefinedGraphs[toScreenIndex] = screenConfig;
        else json.userDefinedGraphs.push(screenConfig);
        ADK.UserDefinedScreens.saveUserConfigToSession(json);
    };


    //update screenId
    UserDefinedScreens.updateScreenId = function(oldId, newId) {
        UserDefinedScreens.updateScreenIdInSession(oldId, newId);

        //Update screenId in JDS
        UserDefinedScreens.updateScreenIdInJDS(oldId, newId);
    };

    UserDefinedScreens.updateScreenIdInSession = function(oldId, newId) {
        var json = ADK.UserDefinedScreens.getUserConfigFromSession();
        //update id for screen config
        var screenIndex = findIndex(json.userDefinedScreens, function(screen) {
            return screen.id === oldId;
        });
        if (screenIndex > -1) {
            json.userDefinedScreens[screenIndex].id = newId;
        }
        //update id for filters
        var screenIndex2 = findIndex(json.userDefinedFilters, function(screen) {
            return screen.id === oldId;
        });
        if (screenIndex2 > -1) {
            json.userDefinedFilters[screenIndex2].id = newId;
        }
        //update id for stacked graph
        var screenIndex3 = findIndex(json.userDefinedGraphs, function(screen) {
            return screen.id === oldId;
        });
        if (screenIndex3 > -1) {
            json.userDefinedGraphs[screenIndex3].id = newId;
        }
        //update id for user sort
        var screenIndex4 = findIndex(json.userDefinedSorts, function(screen) {
            return screen.id === oldId;
        });
        if (screenIndex4 > -1) {
            json.userDefinedSorts[screenIndex4].id = newId;
        }
        ADK.UserDefinedScreens.saveUserConfigToSession(json);
    };

    UserDefinedScreens.updateScreenIdInJDS = function(oldId, newId, callback) {
        var fetchOptions = {
            resourceTitle: 'write-user-defined-screens',
            fetchType: 'PUT',
            criteria: {
                oldId: oldId,
                newId: newId
            }
        };
        if (callback) fetchOptions.onSuccess = callback;
        ResourceService.fetchCollection(fetchOptions);
    };

    //remove the screen filters and stacked graph from session
    UserDefinedScreens.removeOneScreenFromSession = function(screenId) {
        WorkspaceFilters.removeAllFiltersForOneScreenFromSession(screenId);
        UserDefinedScreens.removeAllStackedGraphForOneScreenFromSession(screenId);
        ADK.TileSortManager.removeAllSortsForOneScreenFromSession(screenId);
    };

    //remove all stacked graphs for screen from session
    UserDefinedScreens.removeAllStackedGraphForOneScreenFromSession = function(screenId) {
        var json = ADK.UserDefinedScreens.getUserConfigFromSession();
        var screenIndex = findScreenIndexFromUserDefinedGraphs(json, screenId);
        if (screenIndex === -1) return;
        json.userDefinedGraphs.splice(screenIndex, 1);
        UserDefinedScreens.saveUserConfigToSession(json);
    };

    var findScreenIndexFromUserDefinedSorts = function(json, screenId) {
        var screenIndex = findIndex(json.userDefinedSorts, function(screen) {
            return screen.id === screenId;
        });
        return screenIndex;
    };

    //clone user defined sorts from one screen to another in Session
    UserDefinedScreens.cloneScreenSortsToSession = function(fromScreenId, toScreenId) {
        var json = ADK.UserDefinedScreens.getUserConfigFromSession();
        var screenIndex = findScreenIndexFromUserDefinedSorts(json, fromScreenId);
        if (screenIndex === -1) return;
        var screenConfig = _.clone(json.userDefinedSorts[screenIndex]);
        screenConfig.id = toScreenId;
        var toScreenIndex = findScreenIndexFromUserDefinedSorts(json, toScreenId);
        if (toScreenIndex > -1) json.userDefinedSorts[toScreenIndex] = screenConfig;
        else json.userDefinedSorts.push(screenConfig);
        ADK.UserDefinedScreens.saveUserConfigToSession(json);
    };

    return UserDefinedScreens;
});