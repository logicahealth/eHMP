// The purpose of this module is to handle all create/read/update/delete operations for
//      the userdefinedscreens/userdefinedfilterResource resource. It would essentially be a
//      service in a traditional n-tier app.
define([
    'backbone',
    'marionette',
    'underscore',
    'jquery',
    'api/Messaging',
    'api/ResourceService',
    'api/PatientRecordService',
], function(Backbone, Marionette, _, $, Messaging, ResourceService, PatientRecordService) {
    'use strict';

    var WorkspaceFilters = {};
    var filtersCollection = null;

    var getAppletFromUdafJson = function(config, appletInstanceId) {
        if (_.isNull(config) || _.isUndefined(config)) return null;
        var myApplet = _.find(config.applets, function(applet) {
            return applet.instanceId === appletInstanceId;
        });
        return myApplet;
    };

    var callOnDone = function(collection, appletInstanceId, onDone, context) {
        var applet = getAppletFromUdafJson(collection, appletInstanceId);
        var args = {
            applet: applet,
            anyFilters: applet ? applet.filters.length > 0 : false
        };
        onDone.call(context || this, args);
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

    var findScreenIndex = function(json, workspaceId) {
        var screenIndex = findIndex(json.userDefinedFilters, function(screen) {
            return screen.id === workspaceId;
        });
        return screenIndex;
    };

    var findAppletIndex = function(screenConfig, instanceId) {
        var appletIndex = findIndex(screenConfig.applets, function(applet) {
            return applet.instanceId === instanceId;
        });
        return appletIndex;
    };

    // Deletes a filter from an applet in JDS
    WorkspaceFilters.deleteFilterFromJDS = function(workspaceId, instanceId, filter) {
        var deleteFilterModel = new Backbone.Model();
        deleteFilterModel.url = ResourceService.buildUrl('user-defined-filter', {
            id: workspaceId, //workspace name
            instanceId: instanceId, //Applet instance ID for which the filter applies
            filter: filter
        });
        deleteFilterModel.save({}, {
            url: ResourceService.buildUrl('user-defined-filter', {
                id: workspaceId, //workspace name
                instanceId: instanceId, //Applet instance ID for which the filter applies
                filter: filter
            }),
            type: 'DELETE',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({
                id: workspaceId,
                'instance-id': instanceId,
                filter: filter
            }),
            success: function(response) {
                //
            }
        });
        WorkspaceFilters.deleteFilterFromSession(workspaceId, instanceId, filter);
    };

    WorkspaceFilters.deleteFilterFromSession = function(workspaceId, instanceId, filter) {
        var json = ADK.UserDefinedScreens.getUserConfigFromSession();
        var screenIndex = findScreenIndex(json, workspaceId);
        var screenConfig = json.userDefinedFilters[screenIndex];
        var appletIndex = findAppletIndex(screenConfig, instanceId);
        if (appletIndex == -1) {
            console.error('Applet with instanceId: "'+instanceId+'", not found in session for workspaceId: "'+workspaceId+'"');
            return;
        }
        var appletConfig = screenConfig.applets[appletIndex];
        var filterIndex = appletConfig.filters.indexOf(filter);
        if (filterIndex > -1) {
            json.userDefinedFilters[screenIndex].applets[appletIndex].filters.splice(filterIndex, 1);
        }

        //delete entire applet definition if no filters remain
        if (json.userDefinedFilters[screenIndex].applets[appletIndex].filters.length === 0) {
            json.userDefinedFilters[screenIndex].applets.splice(appletIndex, 1);
        }
        ADK.UserDefinedScreens.saveUserConfigToSession(json);

    };

    // Adds a filter to an applet in JDS
    WorkspaceFilters.lastCallSaveFilterToJDSFinished = true;
    WorkspaceFilters.saveFilterToJDS = function(workspaceId, instanceId, filter) {
        var save = function() {
            WorkspaceFilters.lastCallSaveFilterToJDSFinished = false;
            var saveFilterModel = new Backbone.Model();
            saveFilterModel.url = ResourceService.buildUrl('user-defined-filter', {
                id: workspaceId, //workspace name
                instanceId: instanceId, //Applet instance ID for which the filter applies
                filter: filter
            });
            // saveFilterModel.url = ResourceService.buildUrl('user-defined-filter');
            saveFilterModel.save({}, {
                url: ResourceService.buildUrl('user-defined-filter', {
                    id: workspaceId, //workspace name
                    instanceId: instanceId, //Applet instance ID for which the filter applies
                    filter: filter
                }),
                type: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({
                    id: workspaceId,
                    'instance-id': instanceId,
                    filter: filter
                }),
                success: function(response) {
                    WorkspaceFilters.lastCallSaveFilterToJDSFinished = true;
                }
            });
        };
        //fix race condition by synchronizing calls to jds
        var interval = setInterval(function() {
            if (WorkspaceFilters.lastCallSaveFilterToJDSFinished) {
                save();
                clearInterval(interval);
            }
        }, 50);

        WorkspaceFilters.saveFilterToSession(workspaceId, instanceId, filter);
    };

    WorkspaceFilters.saveFilterToSession = function(workspaceId, instanceId, filter) {
        var json = ADK.UserDefinedScreens.getUserConfigFromSession();
        if (!json.userDefinedFilters) json.userDefinedFilters = [];
        var screenIndex = findScreenIndex(json, workspaceId);
        if (screenIndex === -1) {
            json.userDefinedFilters.push({
                id: workspaceId,
                applets: [{
                    filters: [filter],
                    instanceId: instanceId
                }]
            });
        } else {
            var appletIndex = findAppletIndex(json.userDefinedFilters[screenIndex], instanceId);
            if (appletIndex === -1) {
                if (!json.userDefinedFilters[screenIndex].applets) json.userDefinedFilters[screenIndex].applets = [];
                json.userDefinedFilters[screenIndex].applets.push({
                    filters: [filter],
                    instanceId: instanceId
                });
            } else {
                json.userDefinedFilters[screenIndex].applets[appletIndex].filters.push(filter);
            }
        }
        ADK.UserDefinedScreens.saveUserConfigToSession(json);
    };

    // Initiates the ajax request that will make workspace filter data available to applets (filter.js, chromeView.js
    //      and filterButtonView.js). It is called once while building a workspace in ScreenDisplay.js
    WorkspaceFilters.retrieveWorkspaceFilters = function(screenName) {
        var maximizedApplet = ADK.Messaging.request('applet:maximized');
        var toWorkspaceId, toAppletId;
        if (!_.isUndefined(maximizedApplet)) {
            var fromWorkspaceId = maximizedApplet.get('workspaceId');
            var fromAppletId = maximizedApplet.get('instanceId');
            toWorkspaceId = screenName;
            var screenModule = ADK.Messaging.request('get:current:screen');
            toAppletId = '';
            if (!_.isUndefined(screenModule.applets) && !_.isUndefined(screenModule.applets[0])) {
                toAppletId = screenModule.applets[0].instanceId || screenModule.applets[0].id;
            }

            WorkspaceFilters.removeAllFiltersFromAppletFromSession(toWorkspaceId, toAppletId);
            WorkspaceFilters.cloneAppletFiltersToSession(fromWorkspaceId, fromAppletId, toWorkspaceId, toAppletId);
        }

        var userConfigFromSession = ADK.UserDefinedScreens.getUserConfigFromSession() || {};
        var config = _.find(userConfigFromSession.userDefinedFilters, function(screen) {
            return screen.id === screenName;
        });
        // Remove filter from session if the applet maximized
        if (!_.isUndefined(maximizedApplet)) WorkspaceFilters.removeAllFiltersFromAppletFromSession(toWorkspaceId, toAppletId);
        Messaging.trigger('workspaceFilters:retrieve', config);
        filtersCollection = config;
        return config;
    };

    // Retrieves filter data for an applet instance and returns it via the onDone callback.  Because the ajax call
    //      initiated in retrieveWorkspaceFilters may return before or after a caller calls onRetrieveWorkspaceFilters,
    //      there is some work performed to ensure that onDone will always be called regardless of when the ajax call returns.
    WorkspaceFilters.onRetrieveWorkspaceFilters = function(appletInstanceId, onDone, context) {
        var currentScreen = ADK.Messaging.request('get:current:screen');
        var currentScreenApplets = currentScreen.applets;
        if (!_.isUndefined(currentScreenApplets) && !_.isUndefined(currentScreenApplets[0]) && !currentScreenApplets[0].fullScreen) {
            filtersCollection = null;
            WorkspaceFilters.retrieveWorkspaceFilters(currentScreen.config.id);
        }

        var theFiltersAjaxCallAlreadyReturned = filtersCollection !== null;
        if (theFiltersAjaxCallAlreadyReturned) {
            callOnDone(filtersCollection, appletInstanceId, onDone, context);
        } else {
            Messaging.once('workspaceFilters:retrieve', function(collection) {
                callOnDone(collection, appletInstanceId, onDone, context);
            }, context);
            context.listenTo(context, "destroy", function() {
                Messaging.off("workspaceFilters:retrieve");
            });
        }
    };

    // Subscribes the caller to changes in the filter collection via the onDone callback.  Is guarangeed to call
    //      onDone at least once, either immediately if the ajax call has already returned, or as soon as the ajax
    //      call returns.
    WorkspaceFilters.onAppletFilterCollectionChanged = function(appletInstanceId, onDone, context) {
        this.onRetrieveWorkspaceFilters(appletInstanceId, onDone, context);
        context = context || this;
        Messaging.on('filters:collectionChanged:' + appletInstanceId, function(args) {
            onDone.call(context || this, args);
        }, this);
        context.listenTo(context, "destroy", function() {
            Messaging.off("filters:collectionChanged:" + appletInstanceId);
        });
    };
    // Sends a request to JDS to remove all filters from an appletxw
    WorkspaceFilters.removeAllFiltersFromApplet = function(workspaceId, appletId) {
        var deleteFilterModel = new Backbone.Model();
        deleteFilterModel.url = ResourceService.buildUrl('user-defined-filter-all', {
            id: workspaceId, //workspace name
            instanceId: appletId //Applet instance ID for which the filter applies
        });
        deleteFilterModel.save(null, {
            url: ResourceService.buildUrl('user-defined-filter-all', {
                id: workspaceId, //workspace name
                instanceId: appletId //Applet instance ID for which the filter applies
            }),
            type: 'DELETE',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({
                id: workspaceId,
                instanceId: appletId
            }),
            success: function(response) {
                //
            }
        });
        WorkspaceFilters.removeAllFiltersFromAppletFromSession(workspaceId, appletId);
    };

    //check if there's any filters in applet
    WorkspaceFilters.hasFiltersForApplet = function(workspaceId, appletId) {
        var json = ADK.UserDefinedScreens.getUserConfigFromSession();
        var screenIndex = findScreenIndex(json, workspaceId);
        if (screenIndex === -1) return false;
        var screenConfig = json.userDefinedFilters[screenIndex];
        var appletIndex = findAppletIndex(screenConfig, appletId);
        if (appletIndex === -1) return false;
        return true;
    };

    WorkspaceFilters.removeAllFiltersFromAppletFromSession = function(workspaceId, appletId) {
        var json = ADK.UserDefinedScreens.getUserConfigFromSession();
        var screenIndex = findScreenIndex(json, workspaceId);
        if (screenIndex === -1) return;
        var screenConfig = json.userDefinedFilters[screenIndex];
        var appletIndex = findAppletIndex(screenConfig, appletId);
        if (appletIndex === -1) return;

        //delete entire applet definition 
        json.userDefinedFilters[screenIndex].applets.splice(appletIndex, 1);

        ADK.UserDefinedScreens.saveUserConfigToSession(json);
    };

    WorkspaceFilters.removeAllFiltersForOneScreenFromSession = function(workspaceId) {
        var json = ADK.UserDefinedScreens.getUserConfigFromSession();
        var screenIndex = findScreenIndex(json, workspaceId);
        if (screenIndex === -1) return;
        json.userDefinedFilters.splice(screenIndex, 1);
        ADK.UserDefinedScreens.saveUserConfigToSession(json);
    };

    // Several places within the app (e.g. the applet title bar) are interested in the existance of filters, this alerts them
    WorkspaceFilters.triggerGlobalFiltersChangedAlert = function(appletInstanceId, anyFilters) {
        Messaging.trigger('filters:collectionChanged:' + appletInstanceId, {
            anyFilters: anyFilters
        });
    };

    WorkspaceFilters.cloneScreenFilters = function(origId, cloneId) {
        var fetchOptions = {
            resourceTitle: 'user-defined-filter',
            fetchType: 'PUT',
            criteria: {
                fromId: origId,
                toId: cloneId
            }
        };
        ResourceService.fetchCollection(fetchOptions);
    };

    //clone filters from one screen to another in Session
    WorkspaceFilters.cloneScreenFiltersToSession = function(fromScreenId, toScreenId) {
        var json = ADK.UserDefinedScreens.getUserConfigFromSession();
        var screenIndex = findScreenIndex(json, fromScreenId);
        if (screenIndex === -1) return;
        var screenConfig = _.clone(json.userDefinedFilters[screenIndex]);
        screenConfig.id = toScreenId;
        var toScreenIndex = findScreenIndex(json, toScreenId);
        if (toScreenIndex > -1) json.userDefinedFilters[toScreenIndex] = screenConfig;
        else json.userDefinedFilters.push(screenConfig);
        ADK.UserDefinedScreens.saveUserConfigToSession(json);
    };


    WorkspaceFilters.cloneAppletFiltersToSession = function(fromScreenId, fromAppletId, toScreenId, toAppletId) {
        var json = ADK.UserDefinedScreens.getUserConfigFromSession();
        var fromScreenIndex = findScreenIndex(json, fromScreenId);
        if (fromScreenIndex === -1) return;
        var fromScreenConfig = _.clone(json.userDefinedFilters[fromScreenIndex]);
        var fromAppletIndex = findAppletIndex(fromScreenConfig, fromAppletId);
        if (fromAppletIndex === -1) return;
        var appletConfig = _.clone(fromScreenConfig.applets[fromAppletIndex]);
        appletConfig.instanceId = toAppletId;
        var newAppletConfig = {
            applets: [appletConfig],
            id: toScreenId
        };
        var toScreenIndex = findScreenIndex(json, toScreenId);
        if (toScreenIndex > -1) json.userDefinedFilters[toScreenIndex] = newAppletConfig;
        else json.userDefinedFilters.push(newAppletConfig);
        ADK.UserDefinedScreens.saveUserConfigToSession(json);
    };

    return WorkspaceFilters;
});