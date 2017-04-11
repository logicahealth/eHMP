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
    var id;
    var ScreensManifest = Messaging.request('ScreensManifest');
    var AppletsManifest = Messaging.request('AppletsManifest');
    var PreDefinedScreens = Messaging.request('PreDefinedScreens');
    var USER_SCREENS_CONFIG = 'UserScreensConfig';

    UserDefinedScreens.getAppletDefaultConfig = function(id) {
        var appletConfig = _.find(AppletsManifest.applets, function(applet) {
            return applet.id === id;
        });
        if (_.isUndefined(appletConfig)) {
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
                    var titleText = $('.panel-title-label', this).text() || applet.title;
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
                    var titleText = $('.applet-title', this).text() || applet.title;
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

        if (_.isUndefined(currentApplet.dataSizeX)) currentApplet.dataSizeX = 4;
        if (_.isUndefined(currentApplet.dataSizeY)) currentApplet.dataSizeY = 4;
        if (currentApplet.viewType === 'expanded') {
            if (_.isUndefined(currentApplet.dataSizeX))
                currentApplet.dataSizeX = 8;
            currentApplet.dataMinSizeX = 8;
            currentApplet.dataMaxSizeX = 12;
            currentApplet.dataMinSizeY = 4;
            currentApplet.dataMaxSizeY = 12;
        } else if (currentApplet.viewType === 'gist') {
            currentApplet.dataMinSizeX = 4;
            currentApplet.dataMaxSizeX = 8;
            currentApplet.dataMinSizeY = 3;
            currentApplet.dataMaxSizeY = 12;

        } else {
            //summary view or default
            currentApplet.dataMinSizeX = 4;
            currentApplet.dataMaxSizeX = 8;
            currentApplet.dataMinSizeY = 4;
            currentApplet.dataMaxSizeY = 12;
        }
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
            if (currentApplet.region.toLowerCase() != 'none') {
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
                if (userSession.get('status') === 'loggedin') {
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

    UserDefinedScreens.getScreensConfig = function() {
        var self = this;
        var promise = UserDefinedScreens.getConfig(USER_SCREENS_CONFIG);
        var deferred = new $.Deferred();
        var WORKSPACE_CONTEXT = 'patient';
        var filterScreensOnHasPermission = function(screens) {
            var provisionedScreens = [];
            var hasPermission = function(screen) {
                if (!_.isUndefined(screen) && !_.isUndefined(screen.requiredPermissions)) {
                    var hasPermission = true;
                    _.each(screen.requiredPermissions, function(permission) {
                        if (!UserService.hasPermission(permission)) {
                            hasPermission = false;
                        }
                    });
                    return hasPermission;
                }
                return true;
            };
            _.each(screens, function(screen) {
                if (_.isUndefined(screen.requiredPermissions) || hasPermission(screen)) {
                    provisionedScreens.push(screen);
                }
            });
            return provisionedScreens;
        };
        promise.done(function(screenConfig) {
            var provissionedScreens = filterScreensOnHasPermission(PreDefinedScreens.screens);
            var pdScreens = _.clone(provissionedScreens);
            var screensConfigOrig = screenConfig.toJSON();
            if (!screensConfigOrig.userScreensConfig) screensConfigOrig.userScreensConfig = {
                screens: []
            };
            screenConfig = screensConfigOrig.userScreensConfig ? screensConfigOrig.userScreensConfig : screensConfigOrig;
            var userDefaultScreen = WorkspaceContextRepository.getDefaultScreenOfContext(WORKSPACE_CONTEXT);
            if (_.isEmpty(screenConfig)) {
                screenConfig = {
                    screens: []
                };
            }
            var userDefined = false;
            _.each(screenConfig.screens, function(screen) {
                if (!screen) {
                    return;
                }
                userDefined = !screen.predefined;
                if (userDefined) {
                    if (screen.defaultScreen) {
                        userDefaultScreen = screen.id;
                    }
                }
                // remove existing predefined screen records from our screensConfig if they are not found in the predefined screens file
                else {
                    var result = $.grep(pdScreens, function(item) {
                        return item.id === screen.id;
                    });
                    if (result.length === 0) {
                        screenConfig.screens = _.without(screenConfig.screens, screen);
                    } else {
                        screen.title = result[0].title;
                    }
                    //remove duplicate screen
                    var duplicates = $.grep(screenConfig.screens, function(item) {
                        return item.id === screen.id;
                    });
                    if (duplicates.length > 1) {
                        for (var i = 1; i < duplicates.length; i++) {
                            screenConfig.screens = _.without(screenConfig.screens, duplicates[i]);
                        }
                    }
                }
            });
            _.each(pdScreens, function(screen) {
                var containScreen = _.filter(screenConfig.screens, function(s) {
                    if (!s || !screen) {
                        return;
                    }
                    if (s.title === screen.title) {
                        if (s.id === screen.id) { // NOT SURE THIS SHOULD BE AN IF-ELSE HERE
                            //both the id and title must match
                            return s.id === screen.id;
                        } else {
                            //if a predefined screen is somehow duplicated, but the id's dont match, remove the duplicate screen
                            console.warn('Removing duplicate predefined screen: ' + s.title);
                            //removing it from the pJDS screenCOnfig locally
                            screenConfig.screens = _.without(screenConfig.screens, s);
                            // saving it as an empty object
                            UserDefinedScreens.saveGridsterConfig({}, s.id);
                            if (s.defaultScreen === true) {
                                // going through all the screens and marking overview as the default screen again
                                var resetDefault = _.map(screenConfig.screens, function(screen) {
                                    screen.defaultScreen = false;
                                    return screen;
                                });
                                screenConfig.screens = resetDefault;
                            }
                            // Save the screens back to pJDS and locally in session storage
                            UserDefinedScreens.saveScreensConfig(screenConfig);
                            // now that the screen has been deleted if that is the screen we are on go to the default screen of your current context
                            // if we are trying to delete the screen that we came from, go back to the predefined default screen.
                            if (Backbone.history.fragment === s.id) {
                                Navigation.navigate(WorkspaceContextRepository.currentContextDefaultScreen, {
                                    route: {
                                        trigger: false
                                    }
                                });
                            }
                        }
                    }
                });
                // if the predefined screen was in the screen config from pJDS and it is marked as default
                // then change the userDefaultScreen locally
                if (containScreen.length > 0 && screen) {
                    if (containScreen[0].defaultScreen === true) {
                        userDefaultScreen = screen.id;
                    }
                } else if (containScreen.length < 1 && screen) {
                    // if the predefined screen was not in the screen config from pJDS
                    // then add it to the local screen config array
                    screenConfig.screens.push(screen);
                    // check to see if the screen is marked as default and if it is then change the userDefaultScreen locally
                    if (screen.defaultScreen === true) {
                        userDefaultScreen = screen.id;
                    }
                }
            });
            // Sets user customized screen as default screen
            WorkspaceContextRepository.setDefaultScreenOfContext(WORKSPACE_CONTEXT, userDefaultScreen);
            // if there is a user than save the updated screen config into session
            if (UserService.getUserSession().get('status') === 'loggedin') {
                self.saveUserConfigToSession(screensConfigOrig);
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