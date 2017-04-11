define([
    'underscore',
    'handlebars',
    'app/applets/user_management/appletUtil'
], function(_, Handlebars, appletUtil) {
    "use strict";
    var loadingViewTemplate = '<p><i class="fa fa-spinner fa-spin"></i> Loading...</p>';
    var searchForm = [{
        name: "searchForm",
        control: "container",
        extraClasses: ["searchForm", "row", "background-color-pure-white", "left-padding-sm", "left-margin-no", "right-margin-no", "modal-body"],
        items: [{
            control: "alertBanner",
            name: "alertMessage",
            dismissible: true
        }, {
            control: "container",
            extraClasses: ["col-md-12", "editActionAlertMessageContainer"],
            items: []
        }, {
            control: "container",
            extraClasses: ["col-md-12", "mainSearchForm"],
            template: '<p><strong>Fill in at least one field to search for users</strong></p>'
        }, {
            control: "container",
            extraClasses: ["col-md-12", "mainSearchForm"],
            items: [{
                control: "input",
                name: "lastNameValue",
                label: "Last Name",
                extraClasses: ["col-md-3"],
                srOnlyLabel: false,
                title: "Please enter the Last Name of the user"
            }, {
                control: "input",
                name: "firstNameValue",
                label: "First Name",
                extraClasses: ["col-md-3"],
                srOnlyLabel: false,
                title: "Please enter the First Name of the user"
            }, {
                control: "container",
                extraClasses: ["col-md-3", "permissionSetsForSearchPicklist"],
                items: []
            }, {
                control: "input",
                name: "duzValue",
                label: "DUZ",
                extraClasses: ["col-md-3"],
                srOnlyLabel: false,
                title: "Please enter the DUZ of the user"
            }]
        }, {
            name: "checkboxForm",
            control: "container",
            extraClasses: ["checkboxForm"],
            items: [{
                control: "container",
                items: [{
                    control: "container",
                    extraClasses: ["col-md-12", "mainSearchForm", "right-padding-lg"],
                    template: '<p class="bottom-margin-no">Default search results will return only users that are active in both eHMP and VistA.</p>'
                }, {
                    control: "container",
                    extraClasses: ["col-md-9", "mainSearchForm"],
                    items: [{
                        control: "container",
                        extraClasses: ["col-md-6", "bottom-margin-no"],
                        items: [{
                            control: "checkbox",
                            label: "Include Inactive VistA Users",
                            name: "vistaCheckboxValueBulkEdit",
                            title: "To select this checkbox, press the spacebar",
                        }]
                    }, {
                        control: "container",
                        extraClasses: ["col-md-6", "bottom-margin-no"],
                        items: [{
                            control: "checkbox",
                            label: "Include Inactive eHMP Users",
                            name: "ehmpCheckboxValueBulkEdit",
                            title: "To select this checkbox, press the spacebar",
                        }]
                    }]
                }]
            }]
        }, {
            control: "container",
            extraClasses: ['mainSearchForm', 'col-md-12'],
            items: [{
                control: "button",
                extraClasses: ["btn-primary"],
                name: "Search",
                label: "Search",
                size: "md",
                disabled: true,
                title: "Press enter to search",
                id: "search-button",
                type: "button"
            }]
        }, {
            control: "container",
            extraClasses: ["col-md-12", "loadingView"],
            template: loadingViewTemplate,
            hidden: true
        }, {
            control: "container",
            extraClasses: ["col-md-6", 'mainSearchForm', 'right-padding-no', 'left-padding-no', 'top-padding-xs'],
            items: [{
                control: "container",
                extraClasses: ["col-md-9", "results-count-container", "bold-font", "bottom-padding-sm", "left-padding-no"],
                template: '<span id="resultcountlabel" aria-label="Table is now {{resultCountLabel}}">{{resultCount}}</span>'
            }, {
                control: "container",
                extraClasses: ["col-md-3", "text-right"],
                items: [{
                    control: "button",
                    extraClasses: ["btn-primary", "btn-sm", "pixel-width-25"],
                    name: "previous-page-button",
                    label: "Previous Page",
                    srOnlyLabel: true,
                    icon: "fa-caret-left",
                    disabled: false,
                    title: "Previous Page",
                    id: "previous-page-button",
                    type: "button"
                }, {
                    control: "button",
                    extraClasses: ["btn-primary", "btn-sm", "pixel-width-25"],
                    name: "next-page-button",
                    label: "Next Page",
                    srOnlyLabel: true,
                    icon: "fa-caret-right",
                    disabled: false,
                    title: "Next Page",
                    id: "next-page-button",
                    type: "button"
                }]
            }]
        }, {
            control: "container",
            extraClasses: ['right-margin-sm', 'mainSearchForm'],
            items: [{
                control: "multiselectSideBySide",
                name: "usersListResults",
                label: "Users",
                extraClasses: ['bottom-margin-no', 'mainSearchForm'],
                attributeMapping: {
                    value: "selected",
                    id: "labelForSideBySide",
                    label: "labelForSideBySide"
                },
                detailsPopoverOptions: {
                    items: [{
                        control: 'container',
                        template: appletUtil.getDetailsTemplate([{
                            id: 'vistaStatus',
                            label: 'VistA Status'
                        }, {
                            id: 'ehmpStatus',
                            label: 'eHMP Status',
                        }, {
                            id: 'formattedPermissionSetsString',
                            label: 'Permission Sets',
                        }, {
                            id: 'additionalPermissionsLabelsFormatted',
                            label: 'Additional Individual Permissions',
                        }, {
                            id: 'duz',
                            label: 'DUZ'
                        }])
                    }]
                }
            }]
        }, {
            control: "radio",
            name: "editMode",
            label: "Select an Action to apply to the selected users above",
            value: 'add-permission',
            extraClasses: ['col-md-12', 'left-padding-no', 'mainSearchForm'],
            options: [{
                label: "Add Permissions",
                value: "add-permissions",
                title: "Add Permissions"
            }, {
                label: "Remove Permissions",
                value: "remove-permissions",
                title: "Remove Permissions"
            }, {
                label: "Clone Permissions",
                value: "clone-permissions",
                title: "Clone Permissions"
            }]
        }, {
            control: "container",
            extraClasses: ['editUsersForm'],
            items: [{
                control: "container",
                extraClasses: ["col-md-12"],
                items: [{
                    control: "select",
                    name: "editUsersCloneUsersSelect",
                    extraClasses: ["col-md-6", "left-padding-no", "disableOnWarning"],
                    pickList: 'selectedUsersListResults',
                    srOnlyLabel: false,
                    label: "Select user to clone from",
                    title: "To select an option, use the up and down arrow keys then press enter to select",
                    attributeMapping: {
                        label: 'labelForSideBySide',
                        value: 'duz'
                    }
                }]
            }, {
                control: "textarea",
                name: "selectedUserTemplatePermissionSets",
                label: "Permission Sets",
                extraClasses: ['col-md-6', 'top-margin-sm', 'bottom-margin-sm'],
                placeholder: "None",
                disabled: true,
                rows: 5
            }, {
                control: "textarea",
                name: "selectedUserTemplateAdditionalPermissions",
                label: "Additional Individual Permissions",
                extraClasses: ['col-md-6', 'top-margin-sm', 'bottom-margin-sm'],
                placeholder: "None",
                disabled: true,
                rows: 5
            }, {
                control: "container",
                extraClasses: ["col-md-6", ".editUserCloneAlert", ".editUserClone", "top-margin-xl"],
                items: [{
                    control: "alertBanner",
                    name: "cloneUsersAlertMessage",
                    dismissible: false
                }]
            }, {
                control: "container",
                extraClasses: ['userCloneTemplate', 'col-md-12'],
                items: []
            }, {
                control: "container",
                extraClasses: ["col-md-6", "top-margin-sm"],
                items: [{
                    control: "select",
                    name: "editUsersPermissionSets",
                    extraClasses: ["permissionSetsPicklist", "removeFromClone", "disableOnWarning"],
                    pickList: 'permissionSetsForPicklist',
                    srOnlyLabel: false,
                    multiple: true,
                    showFilter: true,
                    options: {
                        minimumInputLength: 0
                    },
                    label: "Select Permission Set",
                    title: "To select an option, use the up and down arrow keys then press enter to select",
                }, {
                    control: "button",
                    type: "button",
                    label: "Clear All",
                    id: 'clear-permission-sets-button',
                    extraClasses: ['btn-default', "bottom-margin-sm", "removeFromClone", "disableOnWarning"]
                }]
            }, {
                control: "container",
                extraClasses: ['editUsersAdditionalPermissionsContainer', "col-md-6"],
                items: []
            }, {
                control: "container",
                extraClasses: ['selectableUsersTableContainer', 'col-md-12'],
                items: []
            }]
        }]
    }, {
        name: "footerForm",
        control: "container",
        extraClasses: ["row", "background-color-pure-white", "left-padding-sm", "left-margin-no", "right-margin-no", "modal-footer"],
        items: [{
            control: "button",
            type: "button",
            label: "Back",
            id: 'back-button',
            extraClasses: ['btn-default'],
            hidden: true
        }, {
            control: "button",
            type: "button",
            label: "Cancel",
            id: 'cancel-button',
            extraClasses: ['btn-default']
        }, {
            control: "button",
            type: "button",
            label: "Edit Selected Users",
            id: 'edit-users-button',
            extraClasses: ['btn-default'],
            disabled: true
        }, {
            control: "button",
            type: "button",
            label: "Add User Permissions",
            id: 'add-permissions-button',
            extraClasses: ['btn-default', 'bulk-edit-btn'],
            hidden: true
        }, {
            control: "button",
            type: "button",
            label: "Remove User Permissions",
            id: 'remove-permissions-button',
            extraClasses: ['btn-default', 'bulk-edit-btn'],
            hidden: true
        }, {
            control: "button",
            type: "button",
            label: "Clone User Permissions",
            id: 'clone-permissions-button',
            extraClasses: ['btn-default', 'bulk-edit-btn'],
            hidden: true,
            disabled: true
        }]
    }];
    var getSelectableTable = function(collection, editMode, customLegend) {
        var columns = [{
            id: 'formattedName',
            title: 'Name'
        }, {
            id: 'formattedPermissionSetsString',
            title: 'Current Permission Sets',
        }, {
            id: 'additionalPermissionsLabelsFormatted',
            title: 'Current Additional Individual Permissions',
        }, {
            id: 'duz',
            title: 'DUZ'
        }];
        var legendMap = {
            'add-permissions': 'Adding permissions to the following users.',
            'remove-permissions': 'Removing permissions from the following users.',
            'clone-permissions': 'Cloning permissions to the following users.'
        };
        var legend = legendMap[editMode];
        if (customLegend) {
            legend = customLegend;
        }
        return {
            control: "fieldset",
            legend: legend,
            items: [{
                control: "selectableTable",
                name: "selectableUsersTableSelectedUser",
                id: "selectableUsersTable",
                collection: collection,
                columns: columns,
                extraClasses: ['modal-body']
            }]
        };
    };
    var getPermissionsSelect = function(pickList) {
        return {
            control: "select",
            name: "editUsersAdditionalPermissions",
            extraClasses: ["additionalPermissionsPickList", "top-margin-sm", "removeFromClone", "disableOnWarning"],
            pickList: pickList,
            srOnlyLabel: false,
            multiple: true,
            showFilter: true,
            options: {
                minimumInputLength: 0
            },
            label: "Select Additional Individual Permissions",
            title: "To select an option, use the up and down arrow keys then press enter to select"
        };
    };
    var getPermissionSetsSearchSelect = function(pickList) {
        return {
            control: "select",
            name: "permissionSetValue",
            pickList: pickList,
            srOnlyLabel: false,
            label: "Select Permission Set",
            title: "To select an option, use the up and down arrow keys then press enter to select",
        };
    };
    var getBeforeCloneAlert = function(users) {
        if (users === null) {
            return {
                control: "container",
                name: "editActionAlertMessage"
            };
        }
        var usersString = '';
        _.each(users, function(user) {
            var lostPermissionsString = '';
            _.each(user.get('lostPermissions'), function(lostPermission) {
                lostPermissionsString = lostPermissionsString + lostPermission + ', ';
            });
            lostPermissionsString = lostPermissionsString.substring(0, lostPermissionsString.lastIndexOf(', ')) + '';
            usersString = usersString + '<p><strong>' + user.get('formattedName') + ' ' + user.get('lostPermissionsCountText') + ':</strong>  ' + lostPermissionsString + '</p>';
        });
        return {
            control: "container",
            name: "editActionAlertMessage",
            template: '<div class="control form-group editActionAlertMessage-control alertMessage" aria-live="assertive">' +
                '<div class="alert alert-warning alert-user">' +
                '<div class="alert-content">' +
                '<p><strong><i class="fa fa-exclamation-triangle"></i> Cloning User Warning</strong></p>' +
                '<p><strong>The following users currently have more permissions than what wll be assigned by taking this action.</strong></p>' +
                usersString +
                '<p><strong>Do you want to proceed?</strong></p>' +
                '<button type="button" id="cancelActionReturnButton" class="btn btn-default" title="Press enter to cancel action and return to user search.">' +
                '<span aria-hidden="true">No</span>' +
                '</button>' +
                '<button type="button" id="confirmActionButton" class="btn btn-default left-margin-xs" title="Press enter to continue.">' +
                '<span aria-hidden="true">Yes</span>' +
                '</button>' +
                '</div>' +
                '</div>' +
                '</div>'
        };
    };
    var getBeforeRemoveAlert = function(users) {
        if (users === null) {
            return {
                control: "container",
                name: "editActionAlertMessage"
            };
        }
        var usersString = '';
        _.each(users, function(user) {
            var retainedPermissionsString = '';
            _.each(user.get('retainedPermissions'), function(retainedPermission) {
                retainedPermissionsString = retainedPermissionsString + retainedPermission + ', ';
            });
            retainedPermissionsString = retainedPermissionsString.substring(0, retainedPermissionsString.lastIndexOf(', ')) + '';
            usersString = usersString + '<p><strong>' + user.get('formattedName') + ' ' + user.get('retainedPermissionsCountText') + ':</strong>  ' + retainedPermissionsString + '</p>';
        });
        return {
            control: "container",
            name: "editActionAlertMessage",
            template: '<div class="control form-group editActionAlertMessage-control alertMessage" aria-live="assertive">' +
                '<div class="alert alert-warning alert-user">' +
                '<div class="alert-content">' +
                '<p><strong><i class="fa fa-exclamation-triangle"></i> Retained User Permissions Info</strong></p>' +
                '<p><strong> The following users will retain the listed permissions based on the combination of Permission Sets and Additional Individual Permissions chosen to remove.</strong></p>' +
                usersString +
                '<p><strong>Do you want to proceed?</strong></p>' +
                '<button type="button" id="cancelActionReturnButton" class="btn btn-default" title="To cancel action and return to user search, press enter">' +
                '<span aria-hidden="true">No</span>' +
                '</button>' +
                '<button type="button" id="confirmActionButton" class="btn btn-default left-margin-xs" title="To continue with action, press enter">' +
                '<span aria-hidden="true">Yes</span>' +
                '</button>' +
                '</div>' +
                '</div>' +
                '</div>'
        };
    };
    return {
        searchForm: searchForm,
        getSelectableTable: getSelectableTable,
        getPermissionsSelect: getPermissionsSelect,
        getPermissionSetsSearchSelect: getPermissionSetsSearchSelect,
        getBeforeCloneAlert: getBeforeCloneAlert,
        getBeforeRemoveAlert: getBeforeRemoveAlert
    };
});