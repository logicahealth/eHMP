define([
    'handlebars',
    'app/applets/user_management/appletUtil',
    'app/applets/user_management/eventHandler',
    'app/applets/user_management/views/userManagementSearchView',
    'app/applets/user_management/views/userManagementFooterView'
], function(Handlebars, appletUtil, eventHandler, UserManagementSearchView, UserManagementFooterView) {
    "use strict";
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
            name: 'permissionSets',
            label: 'Permission Sets',
            flexWidth: 'flex-width-1_5',
            cell: Backgrid.HandlebarsCell.extend({
                className: 'string-cell flex-width-1_5'
            }),
            template: Handlebars.compile('{{#each permissionSets.val}}{{#mapping}}{{this}}{{/mapping}}{{#unless @last}}, {{/unless}}{{/each}}'),
            sortValue: function(model, string) {
                return model.get('permissionSetsListString');
            }
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
            name: 'ehmpStatus',
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
    var GridApplet = ADK.Applets.BaseGridApplet;
    var EmptyView = Backbone.Marionette.ItemView.extend({
        template: ''
    });
    var updatedModel = null;
    var userManagementView = GridApplet.extend({
        _super: GridApplet.prototype,
        addFooterRegion: function() {
            $('<div class="applet-chrome-footer"></div>').insertAfter(this.$el.find('.grid-container'));
            this.addRegion("footerRegion", ".applet-chrome-footer");
            this.footerRegion.show(new UserManagementFooterView({
                model: this.formModel,
                toolbarView: this.dataGridOptions.toolbarView
            }));
        },
        initialize: function(options) {
            var self = this;
            this.emptyView = new EmptyView();
            this.rootView = this;
            var emptyCollectionQuery = appletUtil.emptyCollectionQuery;
            var formModelUpdate = appletUtil.getStorageModel('formModel');
            this.formModel = appletUtil.formModel.mainAppletSearch(formModelUpdate);
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
                columns: userManagementColumns[this.viewType],
                collection: getInitialCollection(),
                filterFields: ['vistaStatus', 'ehmpStatus', 'additionalPermissionsLabelsFormatted', 'lname', 'fname', 'permissionSetsListString', 'duz'],
                onClickRow: this.onClickRow
            };
            if (_.isUndefined(this.dataGridOptions.toolbarView)) {
                this.dataGridOptions.toolbarView = new UserManagementSearchView({
                    instanceId: options.appletConfig.instanceId,
                    parentCollection: this.dataGridOptions.collection,
                    parentView: this,
                    model: this.formModel
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
            this.listenTo(ADK.Messaging, 'userPermissionsUpdated', function(model) {
                var alertOptions = {
                    title: 'Modified Permissions',
                    message: model.get('modalAlertMessage'),
                    type: 'success',
                    icon: 'fa-check'
                };
                eventHandler.createUserManagementModalView(model, alertOptions);
                self.refresh();
            });
            this.listenTo(ADK.Messaging, 'users-applet:bulk-edit-successful', function(editedUserNames) {
                appletUtil.appletAlert.success(self.dataGridOptions.collection, 'Modified Permissions', 'Permissions for the following users were successfully updated: ' + editedUserNames);
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
            this.addFooterRegion();
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
        onClickRow: function(model, event) {
            appletUtil.elementTarget = 'tr[data-row-instanceid="' + String(event.currentTarget.getAttribute('data-row-instanceid')) + '"]';
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
