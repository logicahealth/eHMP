define([
    "api/ResourceService",
    'api/PatientRecordService',
    "api/Messaging",
    'api/UserDefinedScreens'
], function(ResourceService, PatientRecordService, Messaging, UserDefinedScreens) {
    'use strict';

    var TileSortManager = {};

    var sortCollection = function(originalCollection, sortAttribute, tileSortOrder) {
        if (originalCollection.fullCollection) {
            return sortCollection(originalCollection.fullCollection, sortAttribute, tileSortOrder);
        }

        var wasSorted = false;

        if (_.isUndefined(sortAttribute)) {
            sortAttribute = 'uid';
        }

        for (var i = 0; i < tileSortOrder.length; i++) {

            wasSorted = true;

            var currentModel = _.find(originalCollection.models, customSort);
            originalCollection.remove(currentModel, {silent: true});
            originalCollection.add(currentModel, {
                at: i,
                silent: true
            });
        }

        function customSort(currentItem) {
            return currentItem.attributes[sortAttribute] == tileSortOrder[i];
        }

        originalCollection.trigger('sort', originalCollection);
        return wasSorted;
    };

    TileSortManager.getSortOptions = function(originalCollection, appletId, sortAttribute, cb) {
        var wasSorted = false;
        var currentScreen = Messaging.request('get:current:screen');

        if (currentScreen.config.predefined && typeof cb === 'function') {
            cb(wasSorted, originalCollection);
            return;
        }
        var workspaceId = currentScreen.id;
        var userConfig = UserDefinedScreens.getUserConfigFromSession();

        if (userConfig && userConfig.userDefinedSorts) {
            var tileSortConfig = _.findWhere(userConfig.userDefinedSorts, {id: workspaceId});

            if (tileSortConfig) {
                var obj = _.find(tileSortConfig.applets, function(obj) {
                    return obj.instanceId == appletId;
                });

                if (obj === undefined) {
                    if (typeof cb === "function") {
                        cb(wasSorted, originalCollection);
                    }
                    return;
                }

                var tileSortOrder = obj.orderSequence[0].split(",");

                wasSorted = sortCollection(originalCollection, sortAttribute, tileSortOrder);

            }
        }

        if (typeof cb === "function") {
            cb(wasSorted, originalCollection);
        }

    };

    TileSortManager.reorderRows = function(reorderObj, collection, sortId, sortKey, successCallback) {
        if (_.isUndefined(sortKey)) {
            sortKey = 'uid';
        }

        //Use jquery to move the list item instead of backbone so we don't have to re-render the item
        var temp = collection.at(reorderObj.oldIndex);
        var listElement = reorderObj.listElement;
        var removedElement = $(listElement).find('div.gist-item:eq(' + reorderObj.oldIndex + ')').detach();
        collection.remove(temp, {
            silent: true
        });
        if (reorderObj.newIndex === collection.models.length) {
            $(listElement).append(removedElement);
        } else {
            $(listElement).find('div.gist-item:eq(' + reorderObj.newIndex + ')').before(removedElement);
        }
        collection.add(temp, {
            at: reorderObj.newIndex,
            silent: true
        });
        var newSorted = [];

        collection.models.forEach(function(item) {
            var value = _.get(item, ['attributes', sortKey]);
            if (!_.isUndefined(value)) {
                newSorted.push(value);
            }
        });

        var workspaceId = Messaging.request('get:current:screen').id;
        var SaveSortModel = Backbone.Model.extend({
            url: function() {
                return ResourceService.buildUrl('user-defined-sort', {
                    'id': workspaceId,
                    'instanceId': sortId
                });
            }
        });

        var obj = {};
        obj.instanceId = sortId;
        obj.keyField = sortKey;
        obj.orderAfter = "";
        obj.fieldValue = newSorted.join(",");

        var saveInstance = new SaveSortModel(obj);

        var params = {
            type: 'POST',
            url: saveInstance.url(),
            contentType: "application/json",
            data: JSON.stringify(obj),
            dataType: "json"
        };

        saveInstance.save(params, {
            success: function(model, response) {
                var currentConfig = UserDefinedScreens.getUserConfigFromSession();
                currentConfig.userDefinedSorts = response.data.userDefinedSorts;
                UserDefinedScreens.saveUserConfigToSession(currentConfig);

                if (successCallback) {
                    successCallback();
                }
            },
            error: function(model) {
            }
        });
    };

    var findIndex = function(array, callback) {
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
        return findIndex(json.userDefinedSorts, function(screen) {
            return screen.id === workspaceId;
        });
    };

    var findAppletIndex = function(screenConfig, instanceId) {
        var appletIndex = findIndex(screenConfig.applets, function(applet) {
            return applet.instanceId === instanceId;
        });
        return appletIndex;
    };


    //check if there's any sorts in applet
    TileSortManager.hasSort = function(workspaceId, appletId) {
        var json = ADK.UserDefinedScreens.getUserConfigFromSession();
        var screenIndex = findScreenIndex(json, workspaceId);
        if (screenIndex === -1) {
            return false;
        }
        var screenConfig = json.userDefinedSorts[screenIndex];
        var appletIndex = findAppletIndex(screenConfig, appletId);
        return appletIndex !== -1;
    };

    TileSortManager.removeSort = function(instanceId, onSuccessCallback) {

        var workspaceId = Messaging.request('get:current:screen').id;
        if (!TileSortManager.hasSort(workspaceId, instanceId)) {
            //if there's no sort exists, just call the callback and return
            if (onSuccessCallback) {
                onSuccessCallback();
            }
            return;
        }
        var fetchOptions = {
            resourceTitle: 'user-defined-sort',
            fetchType: 'DELETE',
            criteria: {
                id: workspaceId,
                instanceId: instanceId
            },
            onSuccess: function(model, response) {
                var currentConfig = UserDefinedScreens.getUserConfigFromSession();
                currentConfig.userDefinedSorts = response.data.userDefinedSorts;
                UserDefinedScreens.saveUserConfigToSession(currentConfig);

                if (onSuccessCallback) {
                    onSuccessCallback();
                }
            }
        };

        PatientRecordService.fetchCollection(fetchOptions);

    };

    TileSortManager.removeAllSortsForOneScreenFromJSON = function(workspaceId, json) {
        var screenIndex = findScreenIndex(json, workspaceId);
        if (screenIndex !== -1) {
            json.userDefinedSorts.splice(screenIndex, 1);
        }
        return JSON;
    };

    return TileSortManager;
});