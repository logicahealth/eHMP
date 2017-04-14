define([
    'backbone',
    'marionette',
    'jquery',
    'underscore',
    'main/Session',
    'api/Messaging'
], function(Backbone, Marionette, $, _, session, Messaging) {
    'use strict';

    var APPLET_STORAGE_KEY = 'appletStorage';

    function buildAppletStorageName(context) {
        context = context || ADK.WorkspaceContextRepository.currentContextId;
        return context + '-' + APPLET_STORAGE_KEY;
    }

    var Storage = {

        check: {
            supportsSessionStorage: function() {
                if (typeof(window.sessionStorage) === 'undefined') {
                    return false;
                }
                return true;
            },
            existsInSessionStorage: function(key) {
                if (window.sessionStorage.hasOwnProperty(key)) {
                    return true;
                }
                return false;
            },
            existsInMemory: function(key) {
                if ((typeof(session) === 'undefined') || typeof(session[key]) === 'undefined') {
                    return false;
                }
                return true;
            },
            appletHasSessionStorage: function(appletModelName, model, context) {
                if (!model) {
                    model = Storage.get.sessionModel(buildAppletStorageName(context));
                }
                if (!(model.has(appletModelName))) {
                    return false;
                }
                return true;
            }
        },
        set: {
            sessionModel: function(key, value, preference) {
                if (Storage.check.supportsSessionStorage()) {
                    window.sessionStorage.setItem(key, JSON.stringify(value));
                }
                if ((!preference || preference === 'session') && Storage.check.existsInMemory(key)) {
                    session[key].set(value.toJSON());
                }
            },
            appletStorageModel: function(workspaceId, appletId, appletAttribute, value, context) {
                var model = Storage.get.appletStorageModel(workspaceId, appletId, context);
                var appletModelName = Storage.getAppletStorageModelName(workspaceId, appletId);
                model.get(appletModelName)[appletAttribute] = value;
                Storage.set.sessionModel(buildAppletStorageName(context), model);
            }
        },
        get: {
            sessionCollection: function(key, preference) {
                if ((!preference || preference === 'session') && Storage.check.existsInMemory(key)) {
                    return session[key];
                } else if (Storage.check.supportsSessionStorage()) {
                    return new Backbone.Collection(window.sessionStorage.getItem(key));
                }
                return null;
            },
            sessionModel: function(key, preference) {
                if ((!preference || preference === 'session') && Storage.check.existsInMemory(key)) {
                    return session[key];
                } else if (Storage.check.supportsSessionStorage()) {
                    return new Backbone.Model(JSON.parse(window.sessionStorage.getItem(key)));
                }
                return null;
            },
            sessionObject: function(key, preference) {
                if ((!preference || preference === 'session') && Storage.check.existsInMemory(key)) {
                    return session[key];
                } else if (Storage.check.supportsSessionStorage()) {
                    return JSON.parse(window.sessionStorage.getItem(key));
                }
                return null;
            },
            appletStorageModel: function(workspaceId, appletId, context) {
                var model = Storage.get.sessionModel(buildAppletStorageName(context));
                var appletModelName = Storage.getAppletStorageModelName(workspaceId, appletId);
                if (!Storage.check.appletHasSessionStorage(appletModelName, model, context)) {
                    model.set(appletModelName, {});
                }
                return model;
            }
        },
        delete: {
            sessionModel: function(key, setDefault, options) {
                if (Storage.check.existsInMemory(key)) {
                    session.clearSessionModel(key, setDefault, options);
                } else if (Storage.check.supportsSessionStorage()) {
                    window.sessionStorage.removeItem(key);
                }
            },
            appletStorageModel: function(workspaceId, appletId, context) {
                var appletModelName = Storage.getAppletStorageModelName(workspaceId, appletId);
                var appletStorageName = buildAppletStorageName(context);
                var model = Storage.get.sessionModel(appletStorageName);

                if (Storage.check.appletHasSessionStorage(appletModelName, model)) {
                    model.unset(appletModelName);
                    Storage.set.sessionModel(appletStorageName, model);
                }
            },
            all: function() {
                session.clearAllSessionModels();
                window.sessionStorage.clear();
            }
        },

        //---------OLD METHODS------------------//
        addModel: function(key, value) {
            this.set.sessionModel(key, value);
        },
        getModel: function(key) {
            return this.get.sessionModel(key);
        },
        clear: function(key) {
            this.delete.sessionModel(key);
        },
        getModel_SessionStoragePreference: function(key) {
            return this.get.sessionModel(key);
        },
        getAppletStorageModelName: function(workspaceId, appletId) {
            return workspaceId + '$' + appletId;
        },
        setAppletStorageModel: function(appletId, appletAttribute, value, bindToWorkspace, customWorkspace, context) {
            var workspaceId;
            if (!_.isUndefined(customWorkspace)) {
                workspaceId = customWorkspace;
            } else {
                workspaceId = Messaging.request('get:current:screen').id;
            }
            if (!_.isUndefined(bindToWorkspace) && !bindToWorkspace) {
                workspaceId = 'unbound-' + appletId;
            }
            this.set.appletStorageModel(workspaceId, appletId, appletAttribute, value, context);
        },
        getAppletStorageModel: function(appletId, appletAttribute, boundToWorkspace, customWorkspace, context) {
            var workspaceId;
            if (!_.isUndefined(customWorkspace)) {
                workspaceId = customWorkspace;
            } else {
                workspaceId = Messaging.request('get:current:screen').id;
            }
            if (!_.isUndefined(boundToWorkspace) && !boundToWorkspace) {
                workspaceId = 'unbound-' + appletId;
            }
            var appletModelName = this.getAppletStorageModelName(workspaceId, appletId);
            return this.get.appletStorageModel(workspaceId, appletId, context).get(appletModelName)[appletAttribute];
        },
        clearAppletStorageModel: function(appletId, customWorkspace, context) {
            var workspaceId;
            if (!_.isUndefined(customWorkspace)) {
                workspaceId = customWorkspace;
            } else {
                workspaceId = Messaging.request('get:current:screen').id;
            }
            this.delete.appletStorageModel(workspaceId, appletId, context);
        }
    };

    Storage.set.sessionObject = Storage.set.sessionModel;

    session.user.on('change', function() {
        Storage.set.sessionModel('user', session.user, 'sessionStorage');
    });
    session.patient.on('change', function() {
        Storage.set.sessionModel('patient', session.patient, 'sessionStorage');
    });
    session.globalDate.on('change', function() {
        Storage.set.sessionModel('globalDate', session.globalDate, 'sessionStorage');
    });

    return Storage;
});
