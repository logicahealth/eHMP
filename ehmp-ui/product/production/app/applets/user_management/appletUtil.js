define([
    'underscore'
], function(_) {
    "use strict";

    var appletUtil = {};
    //decide if the user collection is pageable or not
    appletUtil.isUserListPageable = false;

    //saves target element of triggering element
    appletUtil.elementTarget = null;
    appletUtil.emptyCollectionQuery = {
        'fetchEmptyCollection': true,
        'duz': '',
        'user.filter': {}
    };

    appletUtil.permissionSets = [];
    appletUtil.permissionSetsForPickList = [];
    appletUtil.permissions = [];
    appletUtil.permissionSetsMap = {};
    appletUtil.permissionsMap = {};
    appletUtil.formattedPermissionsMap = {};
    appletUtil.formattedPermissionsSetsLabelMap = {};
    appletUtil.discretePermissionsLabelMap = {};
    appletUtil.permissionsSetsFetched = false;

    //create the list of permissionSets that will be displayed on the initial view of the applet
    //Retrieve all the possible permissionSets.
    //Called when the initial view is created
    //Within the same function, the permissionSetsMap is populated
    appletUtil.getPermissionSets = function(callback) {
        if ((!appletUtil.permissionSets || appletUtil.permissionSets.length === 0) && ADK.UserService.hasPermission('read-user-permission-set')) {
            var permissionSetsFetchOptions = {
                resourceTitle: 'permission-sets-list',
                cache: false,
                pageable: false,
                viewModel: {
                    parse: function(response) {
                        response.value = response.val;
                        response.checklistValue = false;
                        var formattedPermissions = [];
                        _.each(response.permissions, function(permission) {
                            formattedPermissions.push(appletUtil.discretePermissionsLabelMap[permission]);
                        });
                        response.formattedPermissions = formattedPermissions; //appletUtil.getFormattedAdditionalPermissionsString(formattedPermissions);
                        if (appletUtil.permissionSetsMap[response.val] !== response.label) {
                            appletUtil.permissionSets.push(response);
                            appletUtil.permissionSetsForPickList.push({
                                value: response.val,
                                label: response.label
                            });
                            appletUtil.permissionSetsMap[response.val] = response.label;
                            appletUtil.permissionsMap[response.val] = response.permissions;
                            appletUtil.formattedPermissionsMap[response.label] = formattedPermissions;
                        }
                        return response;
                    }
                },
                onSuccess: function(collection) {
                    appletUtil.setStorageModel('allPermissionSets', appletUtil.getUnduplicatedPermissionSets());
                    appletUtil.setStorageModel('permissionSetsMap', appletUtil.permissionSetsMap);
                    appletUtil.setStorageModel('permissionsMap', appletUtil.permissionsMap);
                    if (callback) {
                        callback(collection);
                    }
                },
                onError: function(error, response) {
                    if (callback) {
                        var message = JSON.parse(response.responseText).message;
                        callback(null, errorMessage);
                    }
                }
            };
            return ADK.ResourceService.fetchCollection(permissionSetsFetchOptions);
        }
        return appletUtil.permissionSets;
    };
    //create the list of permissions that will be displayed on the initial view of the applet
    //Retrieve all the possible permissions.
    //Called when the initial view is created
    appletUtil.formatPermissionName = function(permission) {
        var stringToReplace = "-";
        var stringToReplaceExpression = new RegExp(stringToReplace, "g");
        return permission.replace(stringToReplaceExpression, ' ').replace(/\b./g, function(firstLetterOfWord) {
            return firstLetterOfWord.toUpperCase();
        });
    };
    appletUtil.formatPermissionList = function(permissionList) {
        var formattedPermissions = [];
        _.each(permissionList, function(permission) {
            formattedPermissions.push(appletUtil.formatPermissionName(permission));
        });
        return formattedPermissions;
    };
    appletUtil.formatPermissionSetList = function(permissionSetList) {
        var formattedPermissionSets = [];
        _.each(permissionSetList, function(permissionSet) {
            formattedPermissionSets.push(appletUtil.permissionSetsMap[permissionSet]);
        });
        return formattedPermissionSets;
    };
    appletUtil.getPermissions = function(callback) {
        if ((!appletUtil.permissions || appletUtil.permissions.length === 0) && ADK.UserService.hasPermission('read-user-permission-set')) {
            var permissionsFetchOptions = {
                resourceTitle: 'permissions-list',
                cache: false,
                pageable: false,
                onSuccess: function(collection) {
                    var activePermissions = collection.where({
                        'status': 'active'
                    });
                    _.each(collection.models, function(model) {
                        appletUtil.discretePermissionsLabelMap[model.get('value')] = model.get('label');
                    });
                    var activePermissionsCollection = new Backbone.Collection(activePermissions);
                    appletUtil.permissions = activePermissionsCollection;
                    appletUtil.permissionsForPickList = appletUtil.getPickListFromCollection(activePermissionsCollection);
                    appletUtil.setStorageModel('allPermissions', appletUtil.permissions);
                    if (callback) {
                        callback(appletUtil.permissions);
                    }
                    return appletUtil.permissions;
                },
                onError: function(error, response) {
                    if (callback) {
                        var message = JSON.parse(response.responseText).message;
                        callback(null, message);
                    }
                }
            };
            return ADK.ResourceService.fetchCollection(permissionsFetchOptions);
        }
        return appletUtil.permissions;
    };
    appletUtil.getPermissionSetsMap = function() {
        if ((!appletUtil.permissionSetsMap || appletUtil.permissionSetsMap.length === 0) && ADK.UserService.hasPermission('read-user-permission-set')) {
            appletUtil.getPermissionSets();

        } else if (!_.isUndefined(appletUtil.getStorageModel('permissionSetsMap'))) {
            return appletUtil.getStorageModel('permissionSetsMap');
        }
        return appletUtil.permissionSetsMap;
    };
    appletUtil.getPermissionsMap = function() {
        if ((!appletUtil.permissionsMap || appletUtil.permissionsMap.length === 0) && ADK.UserService.hasPermission('read-user-permission-set')) {
            appletUtil.getPermissionSets();

        } else if (!_.isUndefined(appletUtil.getStorageModel('permissionsMap'))) {
            return appletUtil.getStorageModel('permissionsMap');
        }
        return appletUtil.permissionsMap;
    };
    appletUtil.createPermissionsCollectionFromList = function(permissionsArray) {
        var models = [];
        _.each(permissionsArray, function(permission) {
            models.push(new Backbone.Model({
                permission: appletUtil.formatPermissionName(permission)
            }));
        });
        return new Backbone.Collection(models);
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
        var isGood = false;
        if (usersList) {
            if (pageable) {
                if (_.has(usersList, 'fullCollection') &&
                    _.has(usersList.fullCollection, 'models') &&
                    _.isArray(usersList.fullCollection.models)) {
                    isGood = true;
                    if (!isInitializing && usersList.fullCollection.models.length <= 0) {
                        isGood = false;
                    }

                }
            } else {
                if (_.has(usersList, 'models') &&
                    _.isArray(usersList.models)) {
                    isGood = true;
                    if (!isInitializing && usersList.models.length <= 0) {
                        isGood = false;
                    }

                }
            }
        }
        return isGood;
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
    appletUtil.getFormattedAdditionalPermissionsString = function(additionalPermissionsArray) {
        var additionalPermissionsLabelsFormattedStringToReplace = ",";
        var additionalPermissionsLabelsFormattedStringToReplaceExpression = new RegExp(additionalPermissionsLabelsFormattedStringToReplace, "g");
        return additionalPermissionsArray.join().replace(additionalPermissionsLabelsFormattedStringToReplaceExpression, ', ');
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
    appletUtil.getPickListFromCollection = function(collection) {
        var pickList = [];
        _.each(collection.models, function(model) {
            pickList.push(model.attributes);
        });
        return pickList;
    };
    appletUtil.appendBulkEditDataToUserModel = function(model) {
        var formattedPermissionSets = [];
        var formattedPermissionSetsString = '';
        if (!_.isUndefined(model.get('permissionSets'))) {
            _.each(model.get('permissionSets').val, function(permissionSet) {
                formattedPermissionSets.push(appletUtil.permissionSetsMap[permissionSet]);
                formattedPermissionSetsString = formattedPermissionSetsString + appletUtil.permissionSetsMap[permissionSet] + ', ';
            });
            formattedPermissionSetsString = formattedPermissionSetsString.substring(0, formattedPermissionSetsString.lastIndexOf(', ')) + '';
        }
        model.set('formattedPermissionSets', formattedPermissionSets);
        model.set('formattedPermissionSetsString', formattedPermissionSetsString);
    };
    appletUtil.getUnduplicatedPermissionSets = function() {
        var removeDuplicateObjectsFromPermissionSets = [];
        _.each(appletUtil.permissionSets, function(permissionSet) {
            var hasDuplicate = false;
            _.each(removeDuplicateObjectsFromPermissionSets, function(set) {
                if (permissionSet.val === set.val) {
                    hasDuplicate = true;
                }
            });
            if (hasDuplicate === false) {
                removeDuplicateObjectsFromPermissionSets.push(permissionSet);
            }
        });
        return removeDuplicateObjectsFromPermissionSets;
    };
    appletUtil.formModel = {
        mainAppletSearch: function(options) {
            var FormModel = Backbone.Model.extend({
                defaults: {
                    firstNameValue: "",
                    lastNameValue: "",
                    permissionSetValue: "",
                    emailValue: "",
                    duzValue: "",
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
                    firstNameValueBulkEdit: "",
                    lastNameValueBulkEdit: "",
                    permissionSetValueBulkEdit: "",
                    permissionSetsForPicklist: [],
                    editUsersPermissionSets: [],
                    editUsersAdditionalPermissions: [],
                    editUsersSelectedUsersTextArea: "",
                    selectedUserTemplatePermissionSets: "",
                    selectedUserTemplateAdditionalPermissions: "",
                    emailValue: "",
                    duzValueBulkEdit: "",
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
                    permissionsCollection: appletUtil.permissionsForPickList,
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
    appletUtil.getDetailsTemplate = function(detailColumns) {
        if (!_.isUndefined(detailColumns)) {
            var columnCount = detailColumns.length;
            var headers = '';
            var rows = '';
            var cells = '';
            _.each(detailColumns, function(detailsData) {
                headers = headers + '<th scope="col">' + detailsData.label + '</th>';
                if (detailColumns.length === 1) {
                    rows = '{{#compare ' + detailsData.id + ' null operator="==="}}' +
                        '<tr><td>none</td></tr>' +
                        ' {{/compare}}' +
                        '{{#compare ' + detailsData.id + ' "array" operator="typeof"}}' +
                        '{{#each ' + detailsData.id + '}}' +
                        '<tr><td>{{this}}</td></tr>' +
                        '{{/each}}' + '{{/compare}}' +
                        '{{#compare ' + detailsData.id + ' "string" operator="typeof"}}' +
                        '<tr><td>{{' + detailsData.id + '}}</td></tr>' +
                        ' {{/compare}}';
                } else {
                    cells = cells + '{{#compare ' + detailsData.id + ' null operator="==="}}' +
                        '<td>none</td>' +
                        ' {{/compare}}' +
                        '{{#compare ' + detailsData.id + ' "array" operator="typeof"}}' +
                        '<td>' + '{{#each ' + detailsData.id + '}}' +
                        '{{this}}' + ',' +
                        '{{/each}}' + '</td>{{/compare}}' +
                        '{{#compare ' + detailsData.id + ' "string" operator="typeof"}}' +
                        '<td>{{' + detailsData.id + '}}</td>' +
                        ' {{/compare}}' +
                        '{{#compare ' + detailsData.id + ' "number" operator="typeof"}}' +
                        '<td>{{' + detailsData.id + '}}</td>' +
                        ' {{/compare}}';
                }
            });
            if (cells !== '' && rows === '') {
                rows = '<tr>' + cells + '</tr>';
            }
            var detailsTable = '<div class="body scrolling-content auto-overflow pixel-height-100">' +
                '<table class="table ehmp-table-default table-bordered">' +
                '<caption class="sr-only">This table represents data details for {{label}}</caption>' +
                '<thead>' +
                '<tr>' +
                headers +
                '</tr>' +
                '</thead>' +
                '<tbody>' +
                rows +
                '</tbody>' +
                '</table>' +
                '</div>';
            return detailsTable;
        }
        return '';
    };
    appletUtil.focusPreviousTarget = function() {
        if (appletUtil.elementTarget !== null && !_.isUndefined(appletUtil.elementTarget)) {
            $(appletUtil.elementTarget).focus();
            this.elementTarget = null;
        }
    };
    return appletUtil;
});