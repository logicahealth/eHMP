 define([
     'underscore',
     'app/applets/user_management/appletUtil',
     'app/applets/user_management/views/userManagementModalView'
 ], function(_, appletUtil, UserManagementModalView) {
     'use strict';

     var eventHandler = {};
     var BASE_NO_USERS_ERROR_MESSAGE = 'No users met the selected search criteria. Search criteria may need to be updated. ';
     var getNoUsersErrorMessage = function(formModel) {
         if (formModel.ehmpCheckboxValue === false && formModel.vistaCheckboxValue === false) {
             return BASE_NO_USERS_ERROR_MESSAGE + 'Users may be inactive in VistA, eHMP, or both. ';
         } else if (formModel.ehmpCheckboxValue === true && formModel.vistaCheckboxValue === true) {
             return BASE_NO_USERS_ERROR_MESSAGE + 'Double check that your search criteria spelling is correct. ';
         } else if (!formModel.ehmpCheckboxValue) {
             return BASE_NO_USERS_ERROR_MESSAGE + 'Users may be inactive in eHMP. ';
         } else if (!formModel.vistaCheckboxValue) {
             return BASE_NO_USERS_ERROR_MESSAGE + 'Users may be inactive in VistA. ';
         }
         return BASE_NO_USERS_ERROR_MESSAGE + 'Unknown error. ';
     };
     eventHandler.getFetchOptions = function(isInitializing, dataToSend, bulkEditFormModel, parentCollection, currentView, elementTarget) {
         var allUsersFetchOptions = {
             resourceTitle: 'user-service-userlist',
             cache: false,
             pageable: appletUtil.isUserListPageable,
             criteria: dataToSend,
             viewModel: {
                 parse: function(response) {
                     //set the permissionSets list, the ehmp status and 
                     //the vista status for the user model
                     response.label = response.lname + ', ' + response.fname;
                     response.formattedName = response.fname + ' ' + response.lname;
                     response.labelForSideBySide = response.fname + ' ' + response.lname + ' - ' + response.duz;

                     var basePermissionSetsCollection = new ADK.UIResources.Fetch.Permission.UMAPermissionSetsCollection(currentView.sharedModel.get('permissionSets').toJSON());
                     var basePermissionsCollection = new ADK.UIResources.Fetch.Permission.UMAPermissionsCollection(currentView.sharedModel.get('permissions').toJSON());
                     response.formattedPermissionSets = basePermissionSetsCollection.getLabels(_.get(response, 'permissionSet.val', []));
                     response.permissionSetsListString = response.formattedPermissionSets.join(', ');
                     response.formattedPermissionSetsString = response.permissionSetsListString;

                     response.additionalPermissions = _.get(response, 'permissionSet.additionalPermissions', []);
                     response.additionalPermissionsLabels = basePermissionsCollection.getLabels(response.additionalPermissions);
                     response.additionalPermissionsLabelsFormatted = response.additionalPermissionsLabels.join(', ');

                     response.vistaStatusUpperCase = '';
                     response.ehmpStatusUpperCase = '';
                     if (_.isString(response.vistaStatus)) {
                         response.vistaStatusUpperCase = response.vistaStatus.toUpperCase();
                     }
                     if (_.isString(response.status)) {
                         response.ehmpStatusUpperCase = response.status.toUpperCase();
                     }
                     return response;
                 }
             },
             onSuccess: function(usersCollection) {
                 var inResultsView = appletUtil.getStorageModel('inResultsView');
                 var inSearchView = ((_.isUndefined(inResultsView) || !inResultsView));
                 if (appletUtil.isValidUsersList(usersCollection, appletUtil.isUserListPageable, isInitializing)) {
                     var users = [];
                     if (appletUtil.isUserListPageable) {
                         users = usersCollection.fullCollection.models;
                     } else {
                         users = usersCollection.models;
                     }
                     if (bulkEditFormModel !== null) {
                         parentCollection.trigger('bulk-edit-reset', parentCollection.models);
                     } else if (isInitializing && inSearchView) {
                         usersCollection.trigger('collectionInitialized');
                     } else if (!isInitializing && bulkEditFormModel === null) {
                         usersCollection.trigger('dataFetchComplete');
                     } else if (!_.isUndefined(parentCollection) && parentCollection !== null) {
                         parentCollection.reset(parentCollection.models);
                     } else {
                         if (!inSearchView) {
                             usersCollection.trigger('checkResultsCount');
                         }
                     }
                 } else if (!isInitializing) {
                     var formModel = appletUtil.getStorageModel('formModel');
                     var inWorkflow = false;
                     if (bulkEditFormModel !== null) {
                         formModel = bulkEditFormModel;
                         inWorkflow = true;
                         parentCollection.trigger('hide-loading-view');
                         parentCollection.trigger('enable-form');
                     }
                     appletUtil.appletAlert.warning(usersCollection, 'Error Retrieving Users', getNoUsersErrorMessage(formModel), inWorkflow);
                     if (inResultsView === true) {
                         usersCollection.trigger('dataFetchComplete');
                     } else {
                         usersCollection.trigger('noUsersReturned');
                     }

                     var userModels = _.get(formModel, 'usersListResults.models', []);
                     var size = userModels.length;
                     for (var i = 0; i < size; i++) {
                         var model = userModels[i];
                         if (model.get('selected') !== true) {
                             model.destroy();
                             i--;
                             size--;
                         }
                     }
                 }
                 if (elementTarget !== null && !_.isUndefined(elementTarget)) {
                     var findTarget = currentView.$el.find(elementTarget);
                     if (findTarget.length > 0) {
                         findTarget.focus();
                     } else {
                         $(elementTarget).focus();
                     }
                     elementTarget = null;
                 }
             },
             onError: function(error, response) {
                 if (bulkEditFormModel !== null) {
                     parentCollection.trigger('bulk-edit-error', response);
                 } else {
                     appletUtil.setStorageModel('lastQueryParams', appletUtil.emptyCollectionQuery);
                 }
             }
         };
         return allUsersFetchOptions;
     };
     //Retrieve all the users that meet the criteria in the query.
     //Called from the Search Form
     eventHandler.createUserList = function(isInitializing, dataToSend, bulkEditFormModel, parentCollection, currentView, elementTarget) {
         var allUsersFetchOptions = eventHandler.getFetchOptions(isInitializing, dataToSend, bulkEditFormModel, parentCollection, currentView, elementTarget);
         if (!_.isUndefined(parentCollection) && parentCollection !== null) {
             parentCollection.trigger('dataFetchInitiated');
             return ADK.ResourceService.fetchCollection(allUsersFetchOptions, parentCollection);
         }
         return ADK.ResourceService.fetchCollection(allUsersFetchOptions);
     };


     //Create the modal view for the user model, when clicking on
     //a row of the userManagementSummaryView or userManagementExpandedView
     eventHandler.createUserManagementModalView = function(model, alertOptions, triggerElement) {
         var modalOptions = {
             model: model
         };
         if (!_.isUndefined(alertOptions)) {
             modalOptions.alertOptions = alertOptions;
         }
         var modalView = new UserManagementModalView(modalOptions);
         modalView.showModal(triggerElement);
     };
     return eventHandler;
 });