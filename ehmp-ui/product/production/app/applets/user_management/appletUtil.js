define([
    'backbone',
    'underscore'
], function(Backbone, _) {
    'use strict';

    var appletUtil = {};
    //decide if the user collection is pageable or not
    appletUtil.isUserListPageable = false;

    appletUtil.emptyCollectionQuery = {
        'fetchEmptyCollection': true,
        'duz': '',
        'user.filter': {}
    };

    //Compare two arrays
    //It returns true if the two arrays have the same elements, not necessary in the same order
    appletUtil.compareArrays = function(arr1, arr2) {
        return (_.size(_.difference(arr1, arr2)) === 0) && (_.size(_.difference(arr2, arr1)) === 0);
    };

    var triggerAlert = function(collection, title, message, type, icon, inWorkflow) {
        var alertModel = new Backbone.Model({
            type: type,
            title: title,
            message: message,
            icon: icon
        });
        collection.trigger('showAlert', alertModel);
        if (_.isUndefined(inWorkflow) || (!_.isUndefined(inWorkflow) && inWorkflow === false)) {
            ADK.UI.Workflow.hide();
        }
    };

    appletUtil.appletAlert = {
        warning: function(collection, title, message, inWorkflow) {
            triggerAlert(collection, title, message, 'warning', 'fa-exclamation-triangle', inWorkflow || false);
        },
        success: function(collection, title, message, inWorkflow) {
            triggerAlert(collection, title, message, 'success', 'fa-check', inWorkflow || false);
        },
        info: function(collection, title, message, inWorkflow) {
            triggerAlert(collection, title, message, 'info', 'fa-info-circle', inWorkflow || false);
        }
    };

    //Verify if the user list is properly formatted and if it has users
    appletUtil.isValidUsersList = function(usersList, pageable, isInitializing) {
        var selector = pageable ? 'fullCollection.models' : 'models';
        var users = _.get(usersList, selector);
        return (_.isArray(users) && _.size(users) > 0 && !isInitializing);
    };

    appletUtil.createUserSearchFilter = function(filterParameters, page) {
        var searchFilter = {
            'user.filter': {}
        };
        if (!_.isUndefined(page)) {
            searchFilter.page = page;
            searchFilter.limit = 50;
        }
        var userFilter = {};
        if (filterParameters.showVistaInactive) {
            searchFilter['show.vista.inactive'] = filterParameters.showVistaInactive.toString().trim();
        }
        if (filterParameters.showEhmpInactive) {
            searchFilter['show.ehmp.inactive'] = filterParameters.showEhmpInactive.toString().trim();
        }
        if (filterParameters.firstName) {
            userFilter.firstName = filterParameters.firstName.trim();
        }
        if (filterParameters.lastName) {
            userFilter.lastName = filterParameters.lastName.trim();
        }
        if (filterParameters.permissionSet) {
            userFilter.permissionSet = filterParameters.permissionSet.trim();
        }
        if (filterParameters.duz) {
            userFilter.duz = filterParameters.duz.trim();
        }
        searchFilter['user.filter'] = JSON.stringify(userFilter);
        return searchFilter;
    };

    appletUtil.getStorageModel = function(key) {
        return ADK.SessionStorage.getAppletStorageModel('user_management_applet', key, false);
    };

    appletUtil.setStorageModel = function(key, value) {
        ADK.SessionStorage.setAppletStorageModel('user_management_applet', key, value, false);
    };

    appletUtil.removeDuplicatesFromCollection = function(sourceCollection, targetCollection, modelAttributeName) {
        if (_.isArray(sourceCollection)) {
            sourceCollection = new Backbone.Collection(sourceCollection);
        }
        sourceCollection.each(function(model) {
            var duplicateKey = {};
            duplicateKey[modelAttributeName] = model.get(modelAttributeName);
            var duplicate = targetCollection.where(duplicateKey);
            if (!_.isUndefined(duplicate)) {
                targetCollection.remove(duplicate);
            }
        });
        return targetCollection;
    };

    appletUtil.formModel = {
        mainAppletSearch: function(options) {
            var FormModel = Backbone.Model.extend({
                defaults: {
                    firstNameValue: '',
                    lastNameValue: '',
                    permissionSetValue: '',
                    emailValue: '',
                    duzValue: '',
                    vistaCheckboxValue: false,
                    ehmpCheckboxValue: false,
                    resultCount: 'Showing 0 results',
                    inResultsView: false
                },
                validate: function(attributes, options) {
                    return appletUtil.validateFormModel(this, attributes, options, false);
                }
            });
            return new FormModel(options);
        },
        bulkEditSearch: function(options) {
            var FormModel = Backbone.Model.extend({
                defaults: {
                    firstNameValueBulkEdit: '',
                    lastNameValueBulkEdit: '',
                    permissionSetValueBulkEdit: '',
                    permissionSetsForPicklist: [],
                    editUsersPermissionSets: [],
                    editUsersAdditionalPermissions: [],
                    editUsersSelectedUsersTextArea: '',
                    selectedUserTemplatePermissionSets: '',
                    selectedUserTemplateAdditionalPermissions: '',
                    emailValue: '',
                    duzValueBulkEdit: '',
                    vistaCheckboxValueBulkEdit: false,
                    ehmpCheckboxValueBulkEdit: false,
                    resultCount: 'Showing 0 results',
                    inResultsView: false,
                    usersListResults: new Backbone.Collection(),
                    selectedUsersListResults: new Backbone.Collection(),
                    initialAlert: null,
                    editMode: 'add-permissions',
                    cloneUsersAlertMessage: '',
                    selectableUsersTableSelectedUser: null,
                    permissionsCollection: [],
                    editActionAlertMessage: '',
                    workflowTitle: ADK.UserService.getUserSession().get('facility').toUpperCase() + ' USERS BULK EDIT: SEARCH AND SELECT USERS'
                },
                validate: function(attributes, options) {
                    return appletUtil.validateFormModel(this, attributes, options, true);
                }
            });
            return new FormModel(options);
        }
    };

    appletUtil.validateFormModel = function(model, attributes, options, fromBulkEdit) {
        model.errorModel.clear();
        var MIN_REQ_TOP_FIELDS = 1;
        var count = 0;
        var firstName = model.get('firstNameValue').trim();
        var lastName = model.get('lastNameValue').trim();
        var permissionSet = model.get('permissionSetValue').trim();
        var duz = model.get('duzValue').trim();

        if (!_.isUndefined(fromBulkEdit) && fromBulkEdit === true) {
            firstName = model.get('firstNameValueBulkEdit').trim();
            lastName = model.get('lastNameValueBulkEdit').trim();
            permissionSet = model.get('permissionSetValueBulkEdit').trim();
            duz = model.get('duzValueBulkEdit').trim();
        }

        if (duz.length > 0) {
            count++;
        }
        if (firstName && firstName !== '' && firstName.length >= 3) {
            count++;
        }
        if (lastName && lastName !== '' && lastName.length >= 3) {
            count++;
        }
        if (permissionSet && permissionSet !== '') {
            count++;
        }
        if (count >= MIN_REQ_TOP_FIELDS) {
            return false;
        } else {
            return true;
        }
    };

    appletUtil.getFormFieldsValues = function(model, fromBulkEdit) {
        var formSearchValues = {
            showVistaInactive: model.get('vistaCheckboxValue'),
            showEhmpInactive: model.get('ehmpCheckboxValue'),
            firstName: model.get('firstNameValue'),
            lastName: model.get('lastNameValue'),
            permissionSet: model.get('permissionSetValue'),
            duz: model.get('duzValue')
        };
        if (!_.isUndefined(fromBulkEdit) && fromBulkEdit === true) {
            formSearchValues = {
                showVistaInactive: model.get('vistaCheckboxValueBulkEdit'),
                showEhmpInactive: model.get('ehmpCheckboxValueBulkEdit'),
                firstName: model.get('firstNameValueBulkEdit'),
                lastName: model.get('lastNameValueBulkEdit'),
                permissionSet: model.get('permissionSetValueBulkEdit'),
                duz: model.get('duzValueBulkEdit')
            };
        }
        return formSearchValues;
    };
    return appletUtil;
});