 define([
     'app/applets/user_management/appletUtil',
     'app/applets/user_management/views/userManagementModalView'
 ], function(appletUtil, UserManagementModalView) {
     "use strict";

     var eventHandler = {};

     //Retrieve all the users that meet the criteria in the query.
     //Called from the Search Form
     eventHandler.createUserList = function(isInitializing, dataToSend, bulkEditFormModel, parentCollection, currentView) {
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
                     var labelForSideBySide = response.fname + ' ' + response.lname + ' - '+ response.duz;
                     response.labelForSideBySide = labelForSideBySide;
                     var value = '';
                     var formattedPermissionSetsString = [];
                     if (response && response.permissionSets && response.permissionSets.val) {
                         value = response.permissionSets.val.join();
                         _.each(response.permissionSets.val, function(permissionSet) {
                             formattedPermissionSetsString.push(appletUtil.permissionSetsMap[permissionSet]);
                         });
                         response.formattedPermissionSets = formattedPermissionSetsString || [];
                         response.permissionSetsListString = response.formattedPermissionSets.join(', ');
                     }
                     var additionalPermissionsLabels = [];
                     if (response && response.permissionSets && response.permissionSets.additionalPermissions) {
                         _.each(response.permissionSets.additionalPermissions, function(additionalPermission) {
                             additionalPermissionsLabels.push(appletUtil.discretePermissionsLabelMap[additionalPermission]);
                         });
                         response.additionalPermissions = response.permissionSets.additionalPermissions || [];
                     }
                     response.additionalPermissionsLabels = _.unique(additionalPermissionsLabels);
                     var additionalPermissionsLabelsFormattedStringToReplace = ",";
                     var additionalPermissionsLabelsFormattedStringToReplaceExpression = new RegExp(additionalPermissionsLabelsFormattedStringToReplace, "g");

                     response.additionalPermissionsLabelsFormatted = additionalPermissionsLabels.join().replace(additionalPermissionsLabelsFormattedStringToReplaceExpression, ', ');
                     response.formattedPermissionSetsString = formattedPermissionSetsString.join().replace(additionalPermissionsLabelsFormattedStringToReplaceExpression, ', ');

                     response.vistaStatusUpperCase = '';
                     response.ehmpStatusUpperCase = '';
                     if (response.vistaStatus) {
                         response.vistaStatusUpperCase = response.vistaStatus.toUpperCase();
                     }
                     if (response.ehmpStatus) {
                         response.ehmpStatusUpperCase = response.ehmpStatus.toUpperCase();
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
                     var errorMessage = 'No users met the selected search criteria. Search criteria may need to be updated. ';
                     var formModel = appletUtil.getStorageModel('formModel');
                     if (bulkEditFormModel !== null) {
                         formModel = bulkEditFormModel;
                     }
                     if (formModel.ehmpCheckboxValue === false && formModel.vistaCheckboxValue === false) {
                         errorMessage = errorMessage + 'Users may be inactive in VistA, eHMP, or both. ';
                     } else if (formModel.ehmpCheckboxValue === true && formModel.vistaCheckboxValue === true) {
                         errorMessage = errorMessage + 'Please double check that your search criteria spelling is correct. ';
                     } else if (!formModel.ehmpCheckboxValue) {
                         errorMessage = errorMessage + 'Users may be inactive in eHMP. ';
                     } else if (!formModel.vistaCheckboxValue) {
                         errorMessage = errorMessage + 'Users may be inactive in VistA. ';
                     }
                     var inWorkflow = false;
                     if (bulkEditFormModel !== null) {
                         inWorkflow = true;
                         parentCollection.trigger('hide-loading-view');
                     }
                     appletUtil.appletAlert.warning(usersCollection, 'Error Retrieving Users', errorMessage, inWorkflow);
                     if (inResultsView === true) {
                         usersCollection.trigger('dataFetchComplete');
                     } else {
                         usersCollection.trigger('noUsersReturned');
                     }
                 }
             },
             onError: function(error, response) {
                 if (bulkEditFormModel !== null) {
                     parentCollection.trigger('On Error', response);
                 } else {
                     appletUtil.setStorageModel('lastQueryParams', appletUtil.emptyCollectionQuery);
                 }
             }
         };
         if (!_.isUndefined(parentCollection) && parentCollection !== null) {
             parentCollection.trigger('dataFetchInitiated');
             return ADK.ResourceService.fetchCollection(allUsersFetchOptions, parentCollection);
         }
         return ADK.ResourceService.fetchCollection(allUsersFetchOptions);
     };

     //Create the modal view for the user model, when clicking on
     //a row of the userManagementSummaryView or userManagementExpandedView
     eventHandler.createUserManagementModalView = function(model, alertOptions) {
         var modalOptions = {
             model: model
         };
         if (!_.isUndefined(alertOptions)) {
             modalOptions.alertOptions = alertOptions;
         }
         var modalView = new UserManagementModalView(modalOptions);
         modalView.showModal();
     };
     return eventHandler;
 });