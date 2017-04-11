define([
    'backbone',
    'marionette',
    'app/applets/user_management/appletUtil',
    'app/applets/user_management/views/userManagementMultiUserEditFormView'
], function(Backbone, Marionette, appletUtil, UserManagementMultiUserEditFormView) {
    "use strict";
    var showModal = function(options) {
        var formModelUpdate = appletUtil.getStorageModel('formModel');
        formModelUpdate.vistaCheckboxValueBulkEdit = formModelUpdate.vistaCheckboxValue;
        formModelUpdate.ehmpCheckboxValueBulkEdit = formModelUpdate.ehmpCheckboxValue;
        formModelUpdate.permissionSetsForPicklist = appletUtil.getUnduplicatedPermissionSets();
        formModelUpdate.lastNameValueBulkEdit = formModelUpdate.lastNameValue;
        formModelUpdate.firstNameValueBulkEdit = formModelUpdate.firstNameValue;
        formModelUpdate.duzValueBulkEdit = formModelUpdate.duzValue;
        formModelUpdate.permissionSetValueBulkEdit = formModelUpdate.permissionSetValue;
        var session = ADK.UserService.getUserSession();
        var currentUserDuz = session.get('duz')[session.get('site')];
        var currentUserInUsersCollection = options.initialUsersCollection.where({
            duz: parseInt(currentUserDuz)
        });
        var setSelectedToFalse = function(models) {
            _.each(models, function(model) {
                model.set('selected', false);
                appletUtil.appendBulkEditDataToUserModel(model);
            });
        };
        setSelectedToFalse(options.initialUsersCollection.models);
        if (currentUserInUsersCollection.length > 0 && !ADK.UserService.hasPermission('edit-own-permissions')) {
            var filteredModels = _.without(options.initialUsersCollection.models, currentUserInUsersCollection[0]);
            formModelUpdate.usersListResults = new Backbone.Collection(filteredModels);
            formModelUpdate.initialAlert = 'You are not allowed to edit your own permissions. User removed from selection list.';
        } else {
            formModelUpdate.usersListResults = new Backbone.Collection(options.initialUsersCollection.models);
        }
        var workflowOptions = {
            title: ADK.UserService.getUserSession().get('facility').toUpperCase() + ' USERS BULK EDIT: SEARCH AND SELECT USERS',
            size: 'large',
            backdrop: true,
            keyboard: true,
            showProgress: false,
            steps: [{
                view: UserManagementMultiUserEditFormView,
                viewModel: appletUtil.formModel.bulkEditSearch(formModelUpdate),
                onBeforeShow: function() {
                    workflowController.changeHeaderCloseButtonOptions({
                        onClick: function(e) {
                            ADK.UI.Workflow.hide();
                            appletUtil.focusPreviousTarget();
                        }
                    });
                }
            }]
        };
        var workflowController = new ADK.UI.Workflow(workflowOptions);
        workflowController.show();
    };
    return {
        showModal: showModal
    };
});