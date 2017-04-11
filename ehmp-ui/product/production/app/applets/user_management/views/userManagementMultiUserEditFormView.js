define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'app/applets/user_management/appletUtil',
    'app/applets/user_management/eventHandler',
    'app/applets/user_management/views/userManagementMultiUserEditForms'
], function(Backbone, Marionette, $, Handlebars, appletUtil, eventHandler, userManagementMultiUserEditForms) {
    "use strict";
    var formView = ADK.UI.Form.extend({

        onInitialize: function() {
            this.workflowParent = this.options.workflow.parentViewInstance;
            this.model.set('alertMessage', '');
            this.searchedUsersCollection = new Backbone.Collection(this.model.get('usersListResults').models);
            var self = this;
            this.listenTo(this.searchedUsersCollection, 'bulk-edit-reset',
                function(models) {
                    self.setPaging();
                    var cleanedModels = self.cleanSearchResults(new Backbone.Collection(models));

                    var resetParrentCollectionWithoutDuplicates = appletUtil.removeDuplicatesFromCollection(self.currentSelectedUsers, new Backbone.Collection(cleanedModels), 'duz');
                    var resetParrentCollectionWithoutDuplicatesModels = resetParrentCollectionWithoutDuplicates.models;
                    self.model.get('usersListResults').reset(resetParrentCollectionWithoutDuplicatesModels.concat(self.currentSelectedUsers));
                    self.model.get('usersListResults').trigger('add remove');
                    self.hideLoadingView();
                    if (cleanedModels.length !== models.length) {
                        self.setPaging(' with myself removed from the list of available users to select');
                    } else {
                        self.setPaging();
                    }

                });
            this.listenTo(this.searchedUsersCollection, 'showAlert', function(model) {
                self.showAlert(model.get('icon'), model.get('type'), model.get('title'), model.get('message'));
            });
            this.listenTo(this.searchedUsersCollection, 'hide-loading-view', function() {
                self.hideLoadingView();
            });
            this.listenTo(this.searchedUsersCollection, 'On Error', function(response) {
                self.onError(response);
            });
        },
        cleanSearchResults: function(collection) {
            var session = ADK.UserService.getUserSession();
            var currentUserDuz = session.get('duz')[session.get('site')];
            var currentUserInUsersCollection = collection.where({
                duz: parseInt(currentUserDuz)
            });
            if (currentUserInUsersCollection.length > 0 && !ADK.UserService.hasPermission('edit-own-permissions')) {
                var filteredModels = _.without(collection.models, currentUserInUsersCollection[0]);
                appletUtil.appletAlert.warning(this.searchedUsersCollection, 'Removed User Warning', 'You are not allowed to edit your own permissions. User removed from selection list.', true);
                return filteredModels;
            }
            _.each(collection.models, function(model) {
                appletUtil.appendBulkEditDataToUserModel(model);
            });
            return collection.models;
        },
        setPaging: function(messageToAppend) {
            if (this.searchedUsersCollection.models.length > 0) {
                var paging_data = this.searchedUsersCollection.where({
                    has_paging_data: true
                })[0].get('paging_data');
                var message = paging_data.message;
                if (messageToAppend) {
                    message = message + messageToAppend;
                }
                if (!_.isUndefined(paging_data)) {
                    this.model.set('resultCount', message);
                    this.model.set('resultCountLabel', message.replace('-', 'through'));
                    this.currentStartIndex = paging_data.currentStart;
                    this.nextPageStartIndex = paging_data.nextStart;
                    this.previousPageStartIndex = paging_data.previousStart;
                    if (paging_data.nextStart === 0 && paging_data.previousStart === 0 && this.currentStartIndex === 0) {
                        this.disablePagingButtons();
                    } else {
                        this.enablePagingButtons();
                    }
                }
            } else {
                this.disablePagingButtons();
                this.model.set('resultCount', 'Showing 0 results');
            }
        },
        disablePagingButtons: function() {
            this.ui.nextPageButton = this.$el.find('.next-page-button');
            this.ui.previousPageButton = this.$el.find('.previous-page-button');
            this.ui.nextPageButton.trigger('control:disabled', true);
            this.ui.previousPageButton.trigger('control:disabled', true);
        },
        enablePagingButtons: function() {
            this.ui.nextPageButton = this.$el.find('.next-page-button');
            this.ui.previousPageButton = this.$el.find('.previous-page-button');
            this.ui.nextPageButton.trigger('control:disabled', false);
            this.ui.previousPageButton.trigger('control:disabled', false);
        },
        resetAdditionalPermissionsSelect: function() {
            var clearPermissionButton = {
                control: "button",
                type: "button",
                label: "Clear All",
                id: 'clear-permissions-button',
                extraClasses: ['btn-default', "removeFromClone", "disableOnWarning"]
            };
            this.ui.editUsersAdditionalPermissionsContainer.trigger('control:items:update',
                userManagementMultiUserEditForms.getPermissionsSelect(appletUtil.getPermissions()));
            this.ui.editUsersAdditionalPermissionsContainer.trigger('control:items:add', clearPermissionButton);
        },
        onRender: function() {
            this['editUsersPermissionSets-add-permissions'] = [];
            this['editUsersPermissionSets-remove-permissions'] = [];
            this['editUsersPermissionSets-clone-permissions'] = [];
            this.currentFilterParameters = appletUtil.getFormFieldsValues(this.model);
            this.enableSearchForm();
            this.enableDisableEditUsersButton();
            var self = this;
            this.listenTo(this.model.get('usersListResults'), 'change', function() {
                self.enableDisableEditUsersButton();
            });
            this.hideEditUsersView();
            this.resetAdditionalPermissionsSelect();
            this.ui.disableOnWarningControls = this.$el.find('.disableOnWarning');
            this.ui.removeFromClone = this.$el.find(".removeFromClone");
            this.updateEditUsersSelectedUsersTextArea();
            if (this.model.get('initialAlert') !== '' && this.model.get('initialAlert') !== null) {
                appletUtil.appletAlert.warning(this.searchedUsersCollection, 'Removed User Warning', this.model.get('initialAlert'), true);
                self.setPaging(' with myself removed from the list of available users to select');
            } else {
                this.setPaging();
            }

        },
        onError: function(response) {
            var errorMessage = JSON.parse(response.responseText).message;
            appletUtil.appletAlert.warning(this.searchedUsersCollection, 'Error Retrieving Users', errorMessage, true);
            this.hideLoadingView();

        },
        fields: [{
            name: "searchFormContainer",
            control: "container",
            items: userManagementMultiUserEditForms.searchForm
        }],
        ui: {
            "searchButtonControl": ".mainSearchForm .Search",
            "allControls": ".searchForm.control",
            "mainSearchFormControls": ".mainSearchForm",
            "loadingViewControl": ".loadingView",
            "editUsersPermissionSets": ".editUsersPermissionSets",
            "editUsersAdditionalPermissions": ".editUsersAdditionalPermissions",
            "editUsersAdditionalPermissionsContainer": ".editUsersAdditionalPermissionsContainer",
            "alertBannerControl": "div.control.alertBanner-control",
            "editUsersFormControl": ".editUsersForm",
            "allEditUsersSelectedUsersTextAreas": ".editUsersSelectedUsersTextArea",
            "editUserCloneControls": ".editUserClone",
            "editUserCloneAlertControl": ".editUsersForm div.control.alertBanner-control",
            "editUsersCloneUsersSelect": ".editUsersCloneUsersSelect",
            "selectableUsersTableContainer": ".selectableUsersTableContainer",
            "editActionAlertMessageContainer": ".editActionAlertMessageContainer",
            "selectedUserTemplatePermissionSets": ".selectedUserTemplatePermissionSets",
            "selectedUserTemplateAdditionalPermissions": ".selectedUserTemplateAdditionalPermissions",
            "nextPageButton": "#next-page-button",
            "previousPageButton": "#previous-page-button",
            "removeFromClone": ".removeFromClone",
            "permissionSetsPicklist": ".permissionSetsPicklist",
            "permissionSetsForSearchPicklist": ".permissionSetsForSearchPicklist",
            "additionalPermissionsPickList": ".additionalPermissionsPickList",
            "disableOnWarningControls": ".disableOnWarning",
            /*footer view controls*/
            'backButtonControl': '#back-button',
            'editUsersButton': '#edit-users-button',
            'add-permissions-button': '#add-permissions-button',
            'remove-permissions-button': '#remove-permissions-button',
            'clone-permissions-button': '#clone-permissions-button',
            'bulkEditButtonsControl': '.bulk-edit-btn'
        },
        enableForm: function(e) {
            this.ui.allControls.trigger('control:disabled', false);
            this.setPaging();
        },
        disableForm: function(e) {
            this.ui.allControls.trigger('control:disabled', true);
        },
        enableBulkEditButtons: function(e) {
            this.ui.bulkEditButtonsControl = this.$el.find('.bulk-edit-btn');
            this.ui.bulkEditButtonsControl.trigger('control:disabled', false);
        },
        disableBulkEditButtons: function(e) {
            this.ui.bulkEditButtonsControl = this.$el.find('.bulk-edit-btn');
            this.ui.bulkEditButtonsControl.trigger('control:disabled', true);
        },
        showSearchView: function() {
            this.ui.mainSearchFormControls.trigger('control:hidden', false);
        },
        hideSearchView: function() {
            this.ui.mainSearchFormControls.trigger('control:hidden', true);
        },
        showEditUsersView: function() {
            this.ui.editUsersFormControl.trigger('control:hidden', false);
        },
        hideEditUsersView: function() {
            this.ui.editUsersFormControl.trigger('control:hidden', true);
        },
        showLoadingView: function() {
            this.ui.loadingViewControl.trigger('control:hidden', false);
        },
        hideLoadingView: function() {
            this.ui.loadingViewControl.trigger('control:hidden', true);
        },
        enableDisableEditUsersButton: function() {
            this.ui.editUsersButton = '#edit-users-button';
            var selectedUsers = this.getSelectedUsers();
            this.$el.find(this.ui.editUsersButton).trigger('control:disabled', true);
            if (selectedUsers.length > 0) {
                this.$el.find(this.ui.editUsersButton).trigger('control:disabled', false);
            }
            if (this.model.get('editMode') === 'clone-permissions' && selectedUsers.length <= 1) {
                this.$el.find(this.ui.editUsersButton).trigger('control:disabled', true);
            }
        },
        updateEditUsersSelectedUsersTextArea: function() {
            this.resetAdditionalPermissionsSelect();
            this.ui.permissionSetsPicklist.trigger('control:picklist:set', [
                appletUtil.getUnduplicatedPermissionSets()
            ]);
            this.ui.permissionSetsForSearchPicklist.trigger('control:items:update',
                userManagementMultiUserEditForms.getPermissionSetsSearchSelect(appletUtil.getUnduplicatedPermissionSets()));
            this.ui.removeFromClone = this.$el.find(".removeFromClone");
            var selectedUsers = this.getSelectedUsers();
            this.ui.editUsersAdditionalPermissions = this.$el.find('.editUsersAdditionalPermissions');
            this.ui.editUsersFormControl = this.$el.find('.editUsersForm');
            _.each(selectedUsers, function(selectedUser) {
                selectedUser.set('newFormattedPermissionSetsString', selectedUser.get('formattedPermissionSets'));
                selectedUser.set('newAdditionalPermissionsLabelsFormatted', selectedUser.get('additionalPermissionsLabels'));
                selectedUser.set('originalFormattedPermissionSets', selectedUser.get('formattedPermissionSets'));
            });

            this.ui.selectableUsersTableContainer.trigger('control:hidden', false);

            this.ui.allEditUsersSelectedUsersTextAreas.trigger('control:hidden', true);
            this.ui.editUserCloneControls.trigger('control:hidden', true);
            this.ui.editUsersCloneUsersSelect.trigger('control:hidden', true);
            this.ui.editUserCloneAlertControl.trigger('control:hidden', true);
            this.ui.removeFromClone.trigger('control:hidden', false);
            this.ui.selectedUserTemplatePermissionSets.trigger('control:hidden', true);
            this.ui.selectedUserTemplateAdditionalPermissions.trigger('control:hidden', true);
            this.model.set('editUsersPermissionSets', this['editUsersPermissionSets-' + this.model.get('editMode')] || []);
            this.model.set('editUsersAdditionalPermissions', this['editUsersAdditionalPermissions-' + this.model.get('editMode')] || []);

            this.ui.editUsersAdditionalPermissions.trigger('control:hidden', false);
            if (this.model.get('editMode') === 'clone-permissions') {
                appletUtil.appletAlert.warning(this.searchedUsersCollection, 'Cloning User Warning', 'All existing permission sets and permissions will be replaced for all selected users.', true);
                this.ui.editUsersCloneUsersSelect.trigger('control:hidden', false);
                this.ui.removeFromClone.trigger('control:hidden', true);
                this.ui.selectedUserTemplatePermissionSets.trigger('control:hidden', false);
                this.ui.selectedUserTemplateAdditionalPermissions.trigger('control:hidden', false);
                if (!_.isUndefined(this.model.get('editUsersCloneUsersSelect'))) {
                    this.onSelectUserTemplate();
                }
                this.$el.find('#editUsersCloneUsersSelect').focus();
            } else {
                this.$el.find('.permissionSetsPicklist').find('.select2-selection').focus();
                this.updateSelectedUsersTable(selectedUsers);
            }
        },
        events: {
            'click #search-button': function(e) {
                e.preventDefault();
                this.clearAlert();
                this.disableForm(e);
                this.showLoadingView();
                this.searchUsers(e, null);
            },
            'click #back-button': function(e) {
                e.preventDefault();
                this.saveSelectforms();
                this.clearAlert();
                this.clearBeforeCloneAlert();
                this.ui.editUsersButton = '#edit-users-button';
                this.ui.bulkEditButtonsControl = this.$el.find('.bulk-edit-btn');
                this.ui.bulkEditButtonsControl.trigger('control:hidden', true);
                this.ui.backButtonControl.trigger('control:hidden', true);
                this.$el.find(this.ui.editUsersButton).trigger('control:hidden', false);
                if (this.model.get('editMode') === 'clone-permissions' && !_.isUndefined(this.usersWithLostPermissions) && this.usersWithLostPermissions.length > 0) {
                    appletUtil.appletAlert.warning(this.searchedUsersCollection, 'Cloning User Warning', 'You may want to remove the following users: ' + this.usersWithLostPermissionsString, true);
                } else if (this.model.get('editMode') === 'remove-permissions' && !_.isUndefined(this.usersWithRetainedPermissions) && this.usersWithRetainedPermissions.length > 0) {
                    appletUtil.appletAlert.warning(this.searchedUsersCollection, 'Remove User Permissions Warning', 'You may want to remove the following users: ' + this.usersWithRetainedPermissionsString, true);
                }
                this.model.set('workflowTitle', 'BULK EDIT: SEARCH AND SELECT USERS');
                this.$el.find('.disableOnWarning').trigger('control:disabled', false);
                this.showSearchView();
                this.hideEditUsersView();
                this.$el.find('#lastNameValue').focus();
            },
            'click #cancelActionReturnButton': function(e) {
                e.preventDefault();
                this.saveSelectforms();
                this.clearBeforeCloneAlert();
                this.ui.editUsersButton = '#edit-users-button';
                this.ui.bulkEditButtonsControl = this.$el.find('.bulk-edit-btn');
                this.ui.bulkEditButtonsControl.trigger('control:hidden', true);
                this.ui.backButtonControl.trigger('control:hidden', true);
                this.$el.find(this.ui.editUsersButton).trigger('control:hidden', false);
                if (this.model.get('editMode') === 'clone-permissions') {
                    appletUtil.appletAlert.warning(this.searchedUsersCollection, 'Cloning User Warning', 'You may want to remove the following users: ' + this.usersWithLostPermissionsString, true);
                } else if (this.model.get('editMode') === 'remove-permissions') {
                    appletUtil.appletAlert.warning(this.searchedUsersCollection, 'Remove User Permissions Warning', 'You may want to remove the following users: ' + this.usersWithRetainedPermissionsString, true);
                }
                this.model.set('workflowTitle', 'BULK EDIT: SEARCH AND SELECT USERS');
                this.$el.find('.disableOnWarning').trigger('control:disabled', false);
                this.showSearchView();
                this.hideEditUsersView();
                this.$el.find('#lastNameValue').focus();
            },
            'click #confirmActionButton': function(e) {
                e.preventDefault();
                this.callEditUsersEndpoint();
            },
            'click #cancel-button': function(e) {
                e.preventDefault();
                ADK.UI.Workflow.hide();
            },
            'click #edit-users-button': function(e) {
                e.preventDefault();
                var workflowTitleMap = {
                    'add-permissions': 'BULK EDIT: ADDING USER PERMISSIONS',
                    'remove-permissions': 'BULK EDIT: REMOVING USER PERMISSIONS',
                    'clone-permissions': 'BULK EDIT: CLONING USER PERMISSIONS'
                };
                this.model.set('workflowTitle', workflowTitleMap[this.model.get('editMode')]);
                this.clearAlert();
                this.ui.editUsersButton = '#edit-users-button';
                this.ui[this.getEditMode() + '-button'] = this.$el.find('#' + this.getEditMode() + '-button');
                this.ui[this.getEditMode() + '-button'].trigger('control:hidden', false);
                this.enableBulkEditButtons();

                this.previousEditMode = this.getEditMode();
                this.ui.backButtonControl.trigger('control:hidden', false);
                this.$el.find(this.ui.editUsersButton).trigger('control:hidden', true);
                this.hideSearchView();
                this.showEditUsersView();
                this.onSelectUserTemplate();
                this.ui.editUsersCloneUsersSelect.trigger('control:picklist:set', new Backbone.Collection(this.getSelectedUsers()));
                this.updateEditUsersSelectedUsersTextArea();
            },
            'click .next-page-button button': function(e) {
                e.preventDefault();
                this.clearAlert();
                this.disableForm(e);
                this.showLoadingView();
                this.searchUsers(e, this.nextPageStartIndex);
            },
            'click .previous-page-button button': function(e) {
                e.preventDefault();
                this.clearAlert();
                this.disableForm(e);
                this.showLoadingView();
                this.searchUsers(e, this.previousPageStartIndex);
            },
            'click #clone-permissions-button': function(e) {
                e.preventDefault();
                this.clearAlert();
                if (this.usersWithLostPermissions.length > 0) {
                    this.saveSelectforms();
                    this.disableBulkEditButtons();
                    this.$el.find('.disableOnWarning').trigger('control:disabled', true);
                    this.ui.editActionAlertMessageContainer.trigger('control:items:update',
                        userManagementMultiUserEditForms.getBeforeCloneAlert(this.usersWithLostPermissions));
                    this.$el.find('#cancelActionReturnButton').focus();

                } else {
                    this.callEditUsersEndpoint();
                }
            },
            'click #remove-permissions-button': function(e) {
                e.preventDefault();
                this.clearAlert();
                var self = this;
                var usersWithRetainedPermissions = [];
                var permissionsForSelectedUser = this.getAllFormattedPermissions(this.model.get('editUsersPermissionSets'),
                    this.model.get('editUsersAdditionalPermissions'), true);
                var formattedSelectedPermissionsSets = appletUtil.formatPermissionSetList(this.model.get('editUsersPermissionSets'));
                var formattedSelectedAdditionalPermissions = appletUtil.formatPermissionList(this.model.get('editUsersAdditionalPermissions'));

                _.each(this.getSelectedUsers(), function(nextUser) {
                    var newPermissionSets = nextUser.get('formattedPermissionSets');
                    _.each(formattedSelectedPermissionsSets, function(formattedSelectedPermissionsSet) {
                        newPermissionSets = _.without(newPermissionSets, formattedSelectedPermissionsSet);
                    });

                    var newAdditionalPermissions = nextUser.get('additionalPermissionsLabels');
                    _.each(formattedSelectedAdditionalPermissions, function(formattedSelectedAdditionalPermission) {
                        newAdditionalPermissions = _.without(newAdditionalPermissions, formattedSelectedAdditionalPermission);
                    });
                    var oldPermissions = self.getAllFormattedPermissions(nextUser.get('formattedPermissionSets'),
                        nextUser.get('additionalPermissionsLabels'));
                    var permissionsForNextUser = self.getAllFormattedPermissions(newPermissionSets, newAdditionalPermissions);
                    if (_.indexOf(nextUser.get('formattedPermissionSets'), 'Access Control Coordinator') !== -1) {
                        permissionsForNextUser = permissionsForNextUser.concat(appletUtil.formattedPermissionsMap['Access Control Coordinator']);
                    }
                    if (_.indexOf(nextUser.get('additionalPermissionsLabels'), 'Edit Own Permissions') !== -1) {
                        permissionsForNextUser.push('Edit Own Permissions');
                    }
                    oldPermissions = _.uniq(oldPermissions);
                    permissionsForNextUser = _.uniq(permissionsForNextUser);
                    var retainedPermissions = _.intersection(permissionsForNextUser, oldPermissions);
                    nextUser.set('retainedPermissions', retainedPermissions);
                    nextUser.set('retainedPermissionsCountText', '(' + retainedPermissions.length + ')');
                    if (retainedPermissions.length > 0) {
                        usersWithRetainedPermissions.push(nextUser);
                    }
                });
                var usersString = '';
                _.each(usersWithRetainedPermissions, function(user) {
                    usersString = usersString + user.get('formattedName') + ', ';
                });
                this.usersWithRetainedPermissions = usersWithRetainedPermissions;
                this.usersWithRetainedPermissionsString = usersString;

                if (this.usersWithRetainedPermissions.length > 0) {
                    this.saveSelectforms();
                    this.ui.additionalPermissionsPickList = this.$el.find('.additionalPermissionsPickList');
                    this.ui.additionalPermissionsPickList.trigger('control:picklist:set', [
                        []
                    ]);
                    this.ui.permissionSetsPicklist.trigger('control:picklist:set', [
                        []
                    ]);
                    this.disableBulkEditButtons();
                    this.$el.find('.disableOnWarning').trigger('control:disabled', true);
                    this.ui.editActionAlertMessageContainer.trigger('control:items:update',
                        userManagementMultiUserEditForms.getBeforeRemoveAlert(this.usersWithRetainedPermissions));
                    this.$el.find('#cancelActionReturnButton').focus();
                } else {
                    this.saveSelectforms();
                    this.callEditUsersEndpoint();
                }
            },
            'click #add-permissions-button': function(e) {
                e.preventDefault();
                this.saveSelectforms();
                this.clearAlert();
                this.callEditUsersEndpoint();
            },
            'click #clear-permission-sets-button': function(e) {
                e.preventDefault();
                this.clearAlert();
                this.model.set('editUsersPermissionSets', []);
            },
            'click #clear-permissions-button': function(e) {
                e.preventDefault();
                this.clearAlert();
                this.model.set('editUsersAdditionalPermissions', []);
            }
        },
        clearAlert: function() {
            appletUtil.appletAlert.warning(this.searchedUsersCollection, '', '', true);
        },
        clearBeforeCloneAlert: function() {
            this.ui.editActionAlertMessageContainer.trigger('control:items:update',
                userManagementMultiUserEditForms.getBeforeCloneAlert(null));
        },
        enableSearchForm: function() {
            this.enableForm();
            this.enableSearchButton();
        },
        modelEvents: {
            'change:resultCount': 'updateResultCount',
            'change:firstNameValue': 'enableSearchButton',
            'change:lastNameValue': 'enableSearchButton',
            'change:permissionSetValue': 'enableSearchButton',
            'change:duzValue': 'enableSearchButton',
            'change:editUsersCloneUsersSelect': 'onSelectUserTemplate',
            'change:editMode': 'onChangeEditMode',
            'change:workflowTitle': 'onChangeWorkflowTitle'
        },
        onChangeWorkflowTitle: function() {
            this.workflowParent.changeHeaderTitle(ADK.UserService.getUserSession().get('facility').toUpperCase() + ' USERS ' + this.model.get('workflowTitle'));
        },
        saveSelectforms: function() {
            if (this.model.get('editUsersPermissionSets') !== null) {
                this['editUsersPermissionSets-' + this.previousEditMode] = this.model.get('editUsersPermissionSets');
                this['editUsersAdditionalPermissions-' + this.previousEditMode] = this.model.get('editUsersAdditionalPermissions');
                this.model.set('editUsersPermissionSets', []);
                this.model.set('editUsersAdditionalPermissions', []);
            }
        },
        onChangeEditMode: function() {
            this.enableDisableEditUsersButton();
            if (this.model.get('editMode') === 'clone-permissions') {
                appletUtil.appletAlert.warning(this.searchedUsersCollection, 'Cloning User Warning', 'All existing permission sets and permissions will be replaced for all selected users. Please include the user you would like to clone from in the list of selected users.', true);
            }
            this.saveSelectforms();
        },
        getAllFormattedPermissions: function(formattedPermissionSets, formattedAdditionalPermissions, valueMap) {
            var formattedPermissionsMap = appletUtil.formattedPermissionsMap;
            var formattedAdditionalPermissionsToAppend = formattedAdditionalPermissions;
            if (valueMap === true) {
                formattedAdditionalPermissionsToAppend = appletUtil.formatPermissionList(formattedAdditionalPermissions);
                formattedPermissionsMap = appletUtil.permissionsMap;
            }
            var formattedPermissionsSetsLabelMap = appletUtil.formattedPermissionsSetsLabelMap;
            var formattedPermissions = [];
            _.each(formattedPermissionSets, function(permissionSet) {
                if (valueMap === true) {
                    formattedPermissions = formattedPermissions.concat(appletUtil.formatPermissionList(formattedPermissionsMap[permissionSet]));
                } else {
                    formattedPermissions = formattedPermissions.concat(formattedPermissionsMap[permissionSet]);

                }
            });
            formattedPermissions = formattedPermissions.concat(formattedAdditionalPermissionsToAppend);
            return _.uniq(formattedPermissions);
        },
        updateResultCount: function() {
            var newCount = this.model.get('resultCount');
            appletUtil.setStorageModel('resultCount', newCount);
            this.$el.find('#resultcountlabel').text(newCount);
            this.$el.find('#resultcountlabel').attr('title', 'Table is now ' + newCount + '');
            //appletUtil.setStorageModel('bulkEditFormModel', this.model.attributes);
        },
        onSelectUserTemplate: function() {
            var self = this;
            this.ui['clone-permissions-button'] = this.$el.find('#clone-permissions-button');
            var selectedUserDuz = this.model.get('editUsersCloneUsersSelect');
            var selectedUser = new Backbone.Collection(this.getSelectedUsers()).where({
                duz: parseInt(selectedUserDuz)
            })[0];
            var nextUsersForTable = this.getSelectedUsers();
            if (!_.isUndefined(selectedUser)) {
                this.ui['clone-permissions-button'].trigger('control:disabled', false);
                this.model.set('selectedUserTemplatePermissionSets', selectedUser.get('formattedPermissionSetsString'));
                this.model.set('selectedUserTemplateAdditionalPermissions', selectedUser.get('additionalPermissionsLabelsFormatted'));
                nextUsersForTable = _.without(this.getSelectedUsers(), selectedUser);
                this.usersToClone = this.getCondensedUsers(nextUsersForTable);
                this.cloneTemplateUser = selectedUser;
                var permissionsForSelectedUser = this.getAllFormattedPermissions(selectedUser.get('formattedPermissionSets'),
                    selectedUser.get('additionalPermissionsLabels'));
                var usersWithLostPermissions = [];
                _.each(nextUsersForTable, function(nextUser) {
                    var newPermissions = permissionsForSelectedUser;
                    var permissionsForNextUser = self.getAllFormattedPermissions(nextUser.get('formattedPermissionSets'),
                        nextUser.get('additionalPermissionsLabels'));
                    if (_.indexOf(nextUser.get('formattedPermissionSets'), 'Access Control Coordinator') !== -1) {
                        newPermissions = newPermissions.concat(appletUtil.formattedPermissionsMap['Access Control Coordinator']);
                    }
                    if (_.indexOf(nextUser.get('additionalPermissionsLabels'), 'Edit Own Permissions') !== -1) {
                        newPermissions.push('Edit Own Permissions');
                    }
                    newPermissions = _.uniq(newPermissions);
                    var lostPermissions = _.difference(permissionsForNextUser, newPermissions);
                    nextUser.set('lostPermissions', lostPermissions);
                    nextUser.set('lostPermissionsCountText', '(' + lostPermissions.length + ')');
                    if (lostPermissions.length > 0) {
                        usersWithLostPermissions.push(nextUser);
                    }
                });
                var usersString = '';
                _.each(usersWithLostPermissions, function(user) {
                    usersString = usersString + user.get('formattedName') + ', ';
                });
                this.usersWithLostPermissions = usersWithLostPermissions;
                this.usersWithLostPermissionsString = usersString;
                this.updateSelectedUsersTable(nextUsersForTable);
            } else {
                this.clearBeforeCloneAlert();
                this.ui['clone-permissions-button'].trigger('control:disabled', true);
                this.model.set('selectedUserTemplatePermissionSets', '');
                this.model.set('selectedUserTemplateAdditionalPermissions', '');
                this.updateSelectedUsersTable(nextUsersForTable);
            }
            this.ui['clone-permissions-button'] = this.$el.find('#clone-permissions-button');
        },
        updateSelectedUsersTable: function(users, permissionSets, additionalPermissions) {
            this.ui.selectableUsersTableContainer.trigger('control:items:update',
                userManagementMultiUserEditForms.getSelectableTable(new Backbone.Collection(users), this.model.get('editMode')));
        },
        showAlert: function(icon, type, title, message) {
            this.ui.alertBannerControl.trigger('control:icon', icon).trigger('control:type', type).trigger('control:title', title);
            this.model.set('alertMessage', message);
        },
        enableSearchButton: function(e) {
            this.clearAlert();
            if (this.model.isValid() === true) {
                this.ui.searchButtonControl.trigger('control:disabled', false);
            } else {
                this.ui.searchButtonControl.trigger('control:disabled', true);
            }
        },
        getSelectedUsers: function(e) {
            var selectedUsers = this.model.get('usersListResults').where({
                selected: true
            });
            return selectedUsers;
        },
        getEditMode: function(e) {
            return this.model.get('editMode');
        },
        searchUsers: function(e, startIndex) {
            var start = startIndex || 0;
            this.currentSelectedUsers = this.getSelectedUsers();

            var filterParameters;
            if (startIndex !== null && !_.isUndefined(this.currentFilterParameters)) {
                filterParameters = this.currentFilterParameters;
            } else {
                filterParameters = appletUtil.getFormFieldsValues(this.model, true);
                this.currentFilterParameters = filterParameters;
            }
            var query = appletUtil.createUserSearchFilter(filterParameters, start);

            eventHandler.createUserList(false, query, this.model.attributes, this.searchedUsersCollection, this);
        },
        getCondensedUsers: function(users) {
            var condensedUsers = [];
            _.each(users, function(user) {
                condensedUsers.push({
                    fname: user.get('fname'),
                    lname: user.get('lname'),
                    uid: user.get('uid')
                });
            });
            return condensedUsers;
        },
        callEditUsersEndpoint: function() {
            var editModeMap = {
                'add-permissions': 'ADD',
                'remove-permissions': 'REMOVE',
                'clone-permissions': 'CLONE'
            };
            var usersToEdit = this.getCondensedUsers(this.getSelectedUsers());
            var selectedPermissionSetsValues = this['editUsersPermissionSets-' + this.model.get('editMode')];
            var selectedPermissionsValues = this['editUsersAdditionalPermissions-' + this.model.get('editMode')];
            if (this.model.get('editMode') === 'clone-permissions') {
                usersToEdit = this.usersToClone;
                selectedPermissionSetsValues = this.cloneTemplateUser.get('permissionSets').val;
                selectedPermissionsValues = this.cloneTemplateUser.get('permissionSets').additionalPermissions;
            }
            if (_.isUndefined(selectedPermissionSetsValues)) {
                selectedPermissionSetsValues = [];
            }
            if (_.isUndefined(selectedPermissionsValues)) {
                selectedPermissionsValues = [];
            }
            var self = this;
            var editUsersFetchOptions = {
                resourceTitle: 'permission-sets-bulk-edit',
                fetchType: 'PUT',
                cache: false,
                pageable: false,
                criteria: {
                    users: JSON.stringify(usersToEdit),
                    permissionSets: JSON.stringify(selectedPermissionSetsValues),
                    additionalPermissions: JSON.stringify(selectedPermissionsValues),
                    mode: editModeMap[this.model.get('editMode')]

                },
                onSuccess: function(permissionSetsCollection, permissionSetsArray) {
                    var editedUserNames = '';
                    _.each(usersToEdit, function(user) {
                        editedUserNames = editedUserNames + user.fname + ' ' + user.lname + ', ';
                    });
                    editedUserNames = editedUserNames.substring(0, editedUserNames.lastIndexOf(', ')) + '';
                    ADK.Messaging.trigger('users-applet:bulk-edit-successful', editedUserNames);
                    ADK.UI.Workflow.hide();
                },
                onError: function(error, response) {
                    var alertMessage = 'An error occurred while updating user permissions. ' +
                        'Please try again. If problem persists, please contact the Help Desk for assistance.';
                    appletUtil.appletAlert.warning(self.searchedUsersCollection, 'Error Editing Permission Sets', alertMessage);
                }
            };
            ADK.ResourceService.fetchCollection(editUsersFetchOptions);
        }
    });

    return formView;
});