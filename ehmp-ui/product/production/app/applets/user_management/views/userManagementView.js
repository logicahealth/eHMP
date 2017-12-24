define([
    'backbone',
    'underscore',
    'handlebars',
    'backgrid',
    'app/applets/user_management/appletUtil',
    'app/applets/user_management/eventHandler',
    'app/applets/user_management/views/userManagementSearchView',
    'app/applets/user_management/views/userManagementFooterView'
], function(Backbone, _, Handlebars, Backgrid, appletUtil, eventHandler, UserManagementSearchView, UserManagementFooterView) {
    'use strict';
    var UMA_CHANNEL = ADK.Messaging.getChannel('user-management-applet');
    //All possible columns for userManagementView
    var columns = {
        lastname: {
            name: 'lname',
            label: 'Last Name',
            cell: 'string'
        },
        firstname: {
            name: 'fname',
            label: 'First Name',
            cell: 'string'
        },
        permissionSets: {
            name: 'permissionSetsListString',
            label: 'Permission Sets',
            cell: 'string'
        },
        additionalPermissions: {
            name: 'additionalPermissionsLabelsFormatted',
            label: 'Additional Individual Permissions',
            cell: 'string'
        },
        duz: {
            name: 'duz',
            label: 'DUZ',
            flexWidth: 'flex-width-0_5',
            cell: Backgrid.HandlebarsCell.extend({
                className: 'string-cell flex-width-0_5'
            }),
            template: Handlebars.compile('{{duz}}'),
            sortValue: function(model, string) {
                return model.get('duz');
            }
        },
        vistaStatus: {
            name: 'vistaStatus',
            label: 'VistA Status',
            cell: 'string'
        },
        ehmpStatus: {
            name: 'status',
            label: 'eHMP Status',
            cell: 'string'
        }
    };
    var userManagementColumns = {
        //userManagementView Summary Columns
        summary: [
            columns.vistaStatus,
            columns.ehmpStatus,
            columns.lastname,
            columns.firstname,
            columns.permissionSets,
            columns.duz
        ],
        //userManagementView Expanded Columns
        expanded: [
            columns.vistaStatus,
            columns.ehmpStatus,
            columns.lastname,
            columns.firstname,
            columns.permissionSets,
            columns.additionalPermissions,
            columns.duz
        ]
    };

    var GridApplet = ADK.AppletViews.GridView;
    var EmptyView = Backbone.Marionette.ItemView.extend({
        template: ''
    });
    var userManagementView = GridApplet.extend({
        _super: GridApplet.prototype,
        addFooterRegion: function() {
            $('<div class="applet-chrome-footer"></div>').insertAfter(this.$el.find('.grid-container'));
            this.addRegion('footerRegion', '.applet-chrome-footer');
            this.footerRegion.show(new UserManagementFooterView({
                model: this.formModel,
                toolbarView: this.appletOptions.toolbarView
            }));
        },
        getInitialFetchOptions: function() {
            var emptyCollectionQuery = appletUtil.emptyCollectionQuery;
            var query = appletUtil.getStorageModel('lastQueryParams');
            if (_.isUndefined(query)) {
                appletUtil.setStorageModel('lastQueryParams', emptyCollectionQuery);
                appletUtil.setStorageModel('previousLastQueryParams', emptyCollectionQuery);
                return eventHandler.getFetchOptions(true, emptyCollectionQuery, null, null, this);
            }
            return eventHandler.getFetchOptions(true, query, null, null, this);
        },
        collectionEvents: {
            'collectionInitialized': 'hideGrid',
            'dataFetchInitiated': function() {
                this.toolbarView.showLoadingView();
            },
            'noUsersReturned': function() {
                this.toolbarView.hideLoadingView();
                this.toolbarView.enableSearchForm();
                if (appletUtil.getStorageModel('inResultsView') === false) {
                    this.hideGrid();
                }
            },
            'dataFetchComplete': function() {
                this.appletContainer.$el.removeClass('hidden');
                this.$('.grid-toolbar').removeClass('percent-height-100').removeClass('auto-overflow-y').addClass('pixel-height-55');
                this.toolbarView.hideLoadingView();
                this.toolbarView.hideSearchView();
                this.toolbarView.enableSearchForm();
            }
        },
        messagingEvents: {
            'userPermissionsUpdated': function(uid, alertMessage) {
                this.listenToOnce(this.appletOptions.collection, 'fetch:success', function() {
                    var alertOptions = {
                        title: 'Modified Permissions',
                        message: alertMessage,
                        type: 'success',
                        icon: 'fa-check'
                    };
                    var updatedModel = this.appletOptions.collection.findWhere({
                        uid: uid
                    });
                    eventHandler.createUserManagementModalView(updatedModel, alertOptions, this.getTargetRowElement(uid));
                });
                this.refresh();
            },
            'users-applet:bulk-edit-successful': function(editedUserNames) {
                appletUtil.appletAlert.success(this.appletOptions.collection, 'Modified Permissions', 'Permissions for the following users were successfully updated: ' + editedUserNames);
                this.refresh();
            }
        },
        sharedModelEvents: {
            'child:collection:update child:collection:change': function() {
                if (this.sharedModel.isReady) {
                    return this.refresh();
                }
            }
        },
        onDestroy: function() {
            this.unbindEntityEvents(UMA_CHANNEL, this.messagingEvents);
            this.unbindEntityEvents(this.sharedModel, this.sharedModelEvents);
            if (_.isFunction(this._super.onDestroy)) {
                this._super.onDestroy.apply(this, arguments);
            }
        },
        getTargetRowElement: function(uid){
            uid = uid.replace(new RegExp(':', 'g'), '-');
            return this.$('tr[data-row-instanceid="' + uid + '"] .quickmenu-container button');
        },
        getDetailsView: function(params) {
            eventHandler.createUserManagementModalView(params.model, null, params.$el);
        },
        initialize: function(options) {
            this.sharedModel = ADK.UIResources.Fetch.Permission.SharedModel(this);
            this.bindEntityEvents(UMA_CHANNEL, this.messagingEvents);
            this.bindEntityEvents(this.sharedModel, this.sharedModelEvents);

            this.emptyView = new EmptyView();
            this.rootView = this;
            var formModelUpdate = appletUtil.getStorageModel('formModel');
            this.formModel = appletUtil.formModel.mainAppletSearch(formModelUpdate);
            var getDetailsView = this.getDetailsView;
            this.viewType = options.appletConfig.viewType || options.defaultViewType;
            this.appletOptions = {
                rootView: this,
                columns: userManagementColumns[this.viewType],
                collection: new Backbone.Collection(),
                filterFields: ['vistaStatus', 'ehmpStatus', 'additionalPermissionsLabelsFormatted', 'lname', 'fname', 'permissionSetsListString', 'duz'],
                tileOptions: {
                    quickMenu: {
                        enabled: true,
                        buttons: [{
                            type: 'detailsviewbutton',
                            onClick: getDetailsView
                        }]
                    },
                    primaryAction: {
                        enabled: true,
                        onClick: getDetailsView
                    }
                },
            };
            this.collection = this.appletOptions.collection;
            if (_.isUndefined(this.appletOptions.toolbarView)) {
                this.appletOptions.toolbarView = new UserManagementSearchView({
                    instanceId: options.appletConfig.instanceId,
                    parentCollection: this.appletOptions.collection,
                    parentView: this,
                    model: this.formModel
                });
            }
            this.toolbarView = this.appletOptions.toolbarView;

            if (this.sharedModel.isReady) {
                this.refreshPermissionData();
                ADK.ResourceService.fetchCollection(this.getInitialFetchOptions(), this.appletOptions.collection);
            } else {
                this.listenToOnce(this.sharedModel, 'fetch:success', function() {
                    if (this.sharedModel.isReady) {
                        this.refreshPermissionData();
                        return ADK.ResourceService.fetchCollection(this.getInitialFetchOptions(), this.appletOptions.collection);
                    }
                });
            }

            this._super.initialize.apply(this, arguments);
        },
        refresh: function() {
            this.refreshPermissionData();
            this.toolbarView.hideLoadingView();
            if (this.appletOptions.collection.originalModels) {
                this.appletOptions.collection.reset(this.appletOptions.collection.originalModels);
            }
            this.toolbarView.ui.permissionSetsPicklistControl.trigger('control:picklist:set', this.basePermissionSetsCollection.toPicklist());
            if (appletUtil.getStorageModel('inResultsView')) {
                this._super.refresh.apply(this, arguments);
            }
        },
        onError: function(collection, response) {
            var errorMessage = _.get(response, 'responseText.message', 'Unknown Error handled');
            appletUtil.appletAlert.warning(this.appletOptions.collection, 'Error Retrieving Users', errorMessage);
            var previousLastQueryParams = appletUtil.getStorageModel('previousLastQueryParams');
            appletUtil.setStorageModel('lastQueryParams', previousLastQueryParams);
            var inResultsView = appletUtil.getStorageModel('inResultsView');
            eventHandler.createUserList(true, previousLastQueryParams, null, this.appletOptions.collection, this);
            this.toolbarView.hideLoadingView();
            this.toolbarView.enableSearchForm();
            if (inResultsView) {
                this.toolbarView.resetResultsView();
            }
        },
        onAttach: function() {
            if (!appletUtil.getStorageModel('inResultsView')) {
                this.hideGrid();
            }
            this.addFooterRegion();
            var siteCode = ADK.UserService.getUserSession().get('site');
            var facility = ADK.UserService.getUserSession().get('facility');
            var titleText = this.$el.closest('[data-appletid="user_management"]').find('.panel-title-label');
            titleText.append(' FOR ' + facility + ' (' + siteCode + ')');
        },
        refreshPermissionData: function() {
            this.basePermissionSetsCollection = new ADK.UIResources.Fetch.Permission.UMAPermissionSetsCollection(this.sharedModel.get('permissionSets').originalModels, {
                parse: true
            });
            this.basePermissionsCollection = new ADK.UIResources.Fetch.Permission.UMAPermissionsCollection(this.sharedModel.get('permissions').originalModels, {
                parse: true
            });
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
            this.$el.find('.grid-toolbar').removeClass('pixel-height-55').addClass('percent-height-100 auto-overflow-y');
            this.appletContainer.$el.addClass('hidden');
        }
    });
    return userManagementView;
});
