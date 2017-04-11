define([
    'app/applets/user_management/appletUtil',
    'app/applets/user_management/eventHandler',
    'app/applets/user_management/views/userManagementSearchView'
], function(appletUtil, eventHandler, UserManagementSearchView) {
    "use strict";
    var GridApplet = ADK.Applets.BaseGridApplet;
    var EmptyView = Backbone.Marionette.ItemView.extend({
        template: ''
    });
    var updatedModel = null;
    var userManagementView = GridApplet.extend({
        _super: GridApplet.prototype,
        initialize: function(options) {
            var self = this;
            this.emptyView = new EmptyView();
            this.rootView = this;
            var emptyCollectionQuery = appletUtil.emptyCollectionQuery;
            var formModelUpdate = appletUtil.getStorageModel('formModel');
            var formModel = appletUtil.formModel.mainAppletSearch(formModelUpdate);
            appletUtil.getPermissions(function() {});
            var getInitialCollection = function() {
                var query = appletUtil.getStorageModel('lastQueryParams');
                if (_.isUndefined(query)) {
                    appletUtil.setStorageModel('lastQueryParams', emptyCollectionQuery);
                    appletUtil.setStorageModel('previousLastQueryParams', emptyCollectionQuery);
                    return eventHandler.createUserList(true, emptyCollectionQuery, null, null, self);
                }
                return eventHandler.createUserList(true, query, null, null, self);
            };
            this.viewType = options.appletConfig.viewType || options.defaultViewType;
            this.dataGridOptions = {
                rootView: this,
                columns: appletUtil.userManagementColumns[this.viewType],
                collection: getInitialCollection(),
                filterFields: ['vistaStatus', 'ehmpStatus', 'additionalPermissionsLabelsFormatted', 'lname', 'fname', 'permissionSetsListString', 'duz'],
                onClickRow: this.onClickRow
            };
            if (_.isUndefined(this.dataGridOptions.toolbarView)) {
                this.dataGridOptions.toolbarView = new UserManagementSearchView({
                    instanceId: options.appletConfig.instanceId,
                    parentCollection: this.dataGridOptions.collection,
                    parentView: this,
                    model: formModel
                });
            }
            this.toolbarView = this.dataGridOptions.toolbarView;
            this.dataGridOptions.collection.on('collectionInitialized', function() {
                self.hideGrid();
            });
            this.dataGridOptions.collection.on('dataFetchInitiated', function() {
                self.toolbarView.showLoadingView();
            });
            this.dataGridOptions.collection.on('noUsersReturned', function() {
                self.toolbarView.hideLoadingView();
                self.toolbarView.enableSearchForm();
                if (appletUtil.getStorageModel('inResultsView') === false) {
                    self.hideGrid();
                }
            });
            this.dataGridOptions.collection.on('dataFetchComplete', function() {
                self.gridContainer.$el.removeClass('hidden');
                self.toolbarView.hideLoadingView();
                self.toolbarView.hideSearchView();
                self.toolbarView.enableSearchForm();
            });
            this.listenTo(ADK.Messaging, 'userPermissionSetsUpdated', function(model) {
                var alertOptions = {
                    title: 'Modified Permission Sets',
                    message: model.get('modalAlertMessage'),
                    type: 'success',
                    icon: 'fa-check'
                };
                eventHandler.createUserManagementModalView(model, alertOptions);
                self.refresh();
            });
            this.listenTo(ADK.Messaging, 'users-applet:bulk-edit-successful', function(editedUserNames) {
                appletUtil.appletAlert.success(self.dataGridOptions.collection, 'Modified Permission Sets', 'Permissions for the following users were successfully updated: ' + editedUserNames);
                self.refresh();
            });
            this._super.initialize.apply(this, arguments);
        },
        refresh: function(event) {
            this.toolbarView.hideLoadingView();
            if (this.dataGridOptions.collection.originalModels) {
                this.dataGridOptions.collection.reset(this.dataGridOptions.collection.originalModels);
            }
            if (appletUtil.getStorageModel('inResultsView') === true) {
                this._super.refresh.apply(this, arguments);
            }
        },
        onError: function(collection, response) {
            var errorMessage = JSON.parse(response.responseText).message;
            appletUtil.appletAlert.warning(this.dataGridOptions.collection, 'Error Retrieving Users', errorMessage);
            var previousLastQueryParams = appletUtil.getStorageModel('previousLastQueryParams');
            appletUtil.setStorageModel('lastQueryParams', previousLastQueryParams);
            var inResultsView = appletUtil.getStorageModel('inResultsView');
            eventHandler.createUserList(true, previousLastQueryParams, null, this.dataGridOptions.collection, this);
            this.toolbarView.hideLoadingView();
            this.toolbarView.enableSearchForm();
            if (inResultsView) {
                this.toolbarView.resetResultsView();
            }
        },
        onAttach: function() {
            var siteCode = ADK.UserService.getUserSession().get('site');
            var facility = ADK.UserService.getUserSession().get('facility');
            var titleText = this.$el.closest('[data-appletid="user_management"]').find('[title="Users"] .panel-title-label');
            titleText.append(' FOR ' + facility + ' (' + siteCode + ')');
        },
        onBeforeRender: function() {
            var self = this;
            appletUtil.getPermissionSets(function() {
                _.each(self.dataGridOptions.collection.models, function(model) {
                    var formattedPermissionSets = [];
                    if (!_.isUndefined(model.get('permissionSets').val)) {
                        _.each(model.get('permissionSets').val, function(permissionSet) {
                            formattedPermissionSets.push(appletUtil.permissionSetsMap[permissionSet]);
                        });
                        model.set('permissionSetsListString', formattedPermissionSets.join(', '));
                    }
                });
            });
        },
        onRender: function() {
            this._super.onRender.apply(this, arguments);
        },
        triggerViewEvent: function(key) {
            if (!_.isUndefined(this.viewEvents[key])) {
                var functionName = this.viewEvents[key];
                this[functionName]();
            }
        },
        events: {
            'click .search-return-link': 'hideGrid'
        },
        hideGrid: function() {
            this.gridContainer.$el.addClass('hidden');
        },
        onClickRow: function(model) {
            eventHandler.createUserManagementModalView(model);
        },
        onBeforeDestroy: function() {
            this.dataGridOptions.collection.off('collectionInitialized');
            this.dataGridOptions.collection.off('dataFetchInitiated');
            this.dataGridOptions.collection.off('noUsersReturned');
            this.dataGridOptions.collection.off('dataFetchComplete');
            this.dataGridOptions.collection.off('change');
        }
    });
    return userManagementView;
});