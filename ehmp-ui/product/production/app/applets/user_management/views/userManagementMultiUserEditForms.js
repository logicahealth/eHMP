define([
    'underscore',
    'handlebars',
    'app/applets/user_management/appletUtil'
], function(_, Handlebars, appletUtil) {
    "use strict";
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
    var loadingViewTemplate = '<p><i class="fa fa-spinner fa-spin"></i> Loading...</p>';
    var searchForm = [{
        name: "searchForm",
        control: "container",
        extraClasses: ["search-form", "modal-body"],
        items: [{
            control: "container",
            extraClasses: ["container-fluid"],
            items: [{
                control: "alertBanner",
                name: "alertMessage",
                dismissible: true
            }, {
                control: "container",
                extraClasses: ["edit-action-alert-message-container"],
                items: []
            }, {
                control: "container",
                extraClasses: ["row", "main-search-form"],
                items: [{
                    control: "container",
                    extraClasses: ["col-xs-12"],
                    template: '<p>Fill in at least one field to search for users. Default search results will return only users that are active in both eHMP and VistA.</p>'
                }]
            }, {
                control: "container",
                extraClasses: ["row", "main-search-form"],
                items: [{
                    control: "input",
                    name: "lastNameValueBulkEdit",
                    label: "Last Name",
                    extraClasses: ["col-xs-3"],
                    srOnlyLabel: false,
                    title: "Enter the Last Name of the user"
                }, {
                    control: "input",
                    name: "firstNameValueBulkEdit",
                    label: "First Name",
                    extraClasses: ["col-xs-3"],
                    srOnlyLabel: false,
                    title: "Enter the First Name of the user"
                }, {
                    control: "container",
                    extraClasses: ["col-xs-3", "permission-sets-for-search-picklist"],
                    items: []
                }, {
                    control: "input",
                    name: "duzValueBulkEdit",
                    label: "DUZ",
                    extraClasses: ["col-xs-3"],
                    srOnlyLabel: false,
                    title: "Enter the D U Z of the user"
                }]
            }, {
                name: "checkboxForm",
                control: "container",
                extraClasses: ["row", "checkbox-form", "main-search-form"],
                items: [{
                    control: "container",
                    extraClasses: ["col-xs-3"],
                    items: [{
                        control: "checkbox",
                        label: "Include Inactive VistA Users",
                        name: "vistaCheckboxValueBulkEdit",
                        title: "Press spacebar to toggle checkbox.",
                    }]
                }, {
                    control: "container",
                    extraClasses: ["col-xs-3"],
                    items: [{
                        control: "checkbox",
                        label: "Include Inactive eHMP Users",
                        name: "ehmpCheckboxValueBulkEdit",
                        title: "Press spacebar to toggle checkbox.",
                    }]
                }, {
                    control: "container",
                    extraClasses: ['main-search-form', 'col-xs-3', 'top-padding-xs'],
                    items: [{
                        control: "button",
                        extraClasses: ["btn-primary"],
                        name: "Search",
                        label: "Search",
                        size: "sm",
                        disabled: true,
                        title: "Press enter to search",
                        id: "search-button",
                        type: "button"
                    }]
                }]
            }, {
                control: "container",
                extraClasses: ["row"],
                items: [{
                    control: "container",
                    extraClasses: ["col-xs-12", "loading-view"],
                    template: loadingViewTemplate,
                    hidden: true
                }]
            }, {
                control: "container",
                extraClasses: ["row", 'main-search-form'],
                items: [{
                    control: "container",
                    extraClasses: ["col-xs-12", "results-count-container", "bold-font"],
                    template: '<span id="resultCountLabelBulkEdit" aria-label="Table is now {{resultCountLabel}}">{{resultCount}}</span>'
                }]
            }, {
                control: "container",
                extraClasses: ['right-margin-sm', 'main-search-form'],
                items: [{
                    control: "multiselectSideBySide",
                    name: "usersListResults",
                    label: "Users",
                    extraClasses: ['bottom-margin-no', 'main-search-form'],
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
                control: "container",
                extraClasses: ["row", "main-search-form", "bottom-margin-xs"],
                items: [{
                    control: "container",
                    extraClasses: ["col-xs-6", "text-right", "pixel-height-23", "background-color-primary-lightest", "paginator-user-management-bulk-edit"],
                    items: [{
                        control: "button",
                        extraClasses: ["btn-icon"],
                        name: "previous-page-button",
                        label: "Previous Page",
                        srOnlyLabel: true,
                        icon: "fa-chevron-left fa-lg",
                        disabled: false,
                        title: "Press enter to access previous data.",
                        id: "previous-page-button-bulk-edit",
                        type: "button"
                    }, {
                        control: "button",
                        extraClasses: ["btn-icon"],
                        name: "next-page-button",
                        label: "Next Page",
                        srOnlyLabel: true,
                        icon: "fa-chevron-right fa-lg",
                        disabled: false,
                        title: "Press enter to access next data.",
                        id: "next-page-button-bulk-edit",
                        type: "button"
                    }]
                }]
            }, {
                control: "container",
                extraClasses: ["row"],
                items: [{
                    control: "radio",
                    name: "editMode",
                    label: "Select an Action to apply to the selected users above",
                    value: 'add-permission',
                    extraClasses: ['col-xs-12', 'main-search-form'],
                    options: [{
                        label: "Add Permissions",
                        value: "add-permissions",
                        title: "Press enter to select add permissions."
                    }, {
                        label: "Remove Permissions",
                        value: "remove-permissions",
                        title: "Press enter to select remove permissions."
                    }, {
                        label: "Clone Permissions",
                        value: "clone-permissions",
                        title: "Press enter to select clone permissions."
                    }]
                }]
            }, {
                control: "container",
                extraClasses: ['edit-users-form'],
                items: [{
                    control: "container",
                    extraClasses: ['row'],
                    items: [{
                        control: "container",
                        extraClasses: ["col-xs-12"],
                        items: [{
                            control: "select",
                            name: "editUsersCloneUsersSelect",
                            extraClasses: ["col-xs-6", "left-padding-no", "disable-on-warning"],
                            pickList: 'selectedUsersListResults',
                            srOnlyLabel: false,
                            label: "Select user to clone from",
                            title: "Use up and down arrows to view options and then press enter to select",
                            attributeMapping: {
                                label: 'labelForSideBySide',
                                value: 'duz'
                            }
                        }]
                    }]
                }, {
                    control: "container",
                    extraClasses: ["row"],
                    items: [{
                        control: "textarea",
                        name: "selectedUserTemplatePermissionSets",
                        label: "Permission Sets",
                        extraClasses: ['col-xs-6', 'top-margin-sm', 'bottom-margin-sm'],
                        placeholder: "None",
                        disabled: true,
                        rows: 5
                    }, {
                        control: "textarea",
                        name: "selectedUserTemplateAdditionalPermissions",
                        label: "Additional Individual Permissions",
                        extraClasses: ['col-xs-6', 'top-margin-sm', 'bottom-margin-sm'],
                        placeholder: "None",
                        disabled: true,
                        rows: 5
                    }]
                }, {
                    control: "container",
                    extraClasses: ["row", "edit-user-clone-alert", "edit-user-clone", "top-margin-xl"],
                    items: [{
                        control: "alertBanner",
                        name: "cloneUsersAlertMessage",
                        dismissible: false
                    }]
                }, {
                    control: "container",
                    extraClasses: ['user-clone-template', 'row'],
                    items: []
                }, {
                    control: "container",
                    extraClasses: ["row"],
                    items: [{
                        control: "container",
                        extraClasses: ["col-xs-6"],
                        items: [{
                            control: "select",
                            name: "editUsersPermissionSets",
                            extraClasses: ["permission-sets-picklist", "remove-from-clone", "disable-on-warning"],
                            pickList: 'permissionSetsForPicklist',
                            srOnlyLabel: false,
                            multiple: true,
                            showFilter: true,
                            options: {
                                minimumInputLength: 0
                            },
                            label: "Select Permission Set",
                            title: "Use up and down arrows to view options and then press enter to select",
                        }, {
                            control: "button",
                            type: "button",
                            label: "Clear All",
                            id: 'clear-permission-sets-button',
                            extraClasses: ['btn-default', 'btn-sm', "bottom-margin-sm", "remove-from-clone", "disable-on-warning"],
                            title: 'Press enter to clear all filters.',
                            disabled: true
                        }]
                    }, {
                        control: "container",
                        extraClasses: ['edit-users-additional-permissions-container', "col-xs-6"],
                        items: []
                    }]
                }, {
                    control: "container",
                    extraClasses: ["row"],
                    items: [{
                        control: "container",
                        extraClasses: ['selectable-users-table-container', 'col-xs-12', 'right-padding-lg', 'bottom-padding-lg'],
                        items: []
                    }]
                }]
            }]
        }]
    }, {
        name: "footerForm",
        control: "container",
        extraClasses: ["left-padding-sm", "modal-footer"],
        items: [{
            control: "button",
            type: "button",
            label: "Back",
            id: 'back-button',
            extraClasses: ['btn-default', 'btn-sm'],
            title: 'Press enter to return to user bulk edit search.',
            hidden: true
        }, {
            control: "button",
            type: "button",
            label: "Cancel",
            id: 'cancel-button',
            extraClasses: ['btn-default', 'btn-sm'],
            title: 'Press enter to cancel.'
        }, {
            control: "button",
            type: "button",
            label: "Edit Selected Users",
            id: 'edit-users-button',
            extraClasses: ['btn-default', 'btn-sm'],
            title: 'Press enter to edit selected users.',
            disabled: true
        }, {
            control: "button",
            type: "button",
            label: "Add User Permissions",
            id: 'add-permissions-button',
            extraClasses: ['btn-default', 'btn-sm', 'bulk-edit-btn'],
            title: 'Press enter to add user permissions.',
            hidden: true
        }, {
            control: "button",
            type: "button",
            label: "Remove User Permissions",
            id: 'remove-permissions-button',
            extraClasses: ['btn-default', 'btn-sm', 'bulk-edit-btn'],
            title: 'Press enter to remove user permissions.',
            hidden: true
        }, {
            control: "button",
            type: "button",
            label: "Clone User Permissions",
            id: 'clone-permissions-button',
            extraClasses: ['btn-default', 'btn-sm', 'bulk-edit-btn'],
            title: 'Press enter to clone user permissions.',
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
        var headers = '';
        _.each(columns, function(column) {
            headers = headers + '<th scope="col">' + column.title + '</th>';
        });
        var dataRows = '';
        _.each(collection.models, function(model) {
            var row = '';
            _.each(columns, function(column) {
                row = row + '<td>' + model.get(column.id) + '</td>';
            });
            dataRows = dataRows + '<tr>' + row + '</tr>';
        });
        var legendMap = {
            'add-permissions': 'Adding permissions to the following users.',
            'remove-permissions': 'Removing permissions from the following users.',
            'clone-permissions': 'Cloning permissions to the following users.'
        };
        var legend = legendMap[editMode];
        if (customLegend) {
            legend = customLegend;
        }
        var template = Handlebars.compile([
            '<table class="table">',
            '<caption><h5>' + legend + '</h5></caption>',
            '<thead>',
            '<tr>',
            headers,
            '</tr>',
            '</thead>',
            '<tbody>',
            dataRows,
            '</tbody>',
            '<table>'
        ].join('\n'));
        return {
            control: "container",
            name: "selectableUsersTableSelectedUser",
            id: "selectableUsersTable",
            template: template,
            extraClasses: ['table-responsive']
        };
    };
    var getPermissionsSelect = function(pickList) {
        return {
            control: "select",
            name: "editUsersAdditionalPermissions",
            extraClasses: ["additional-permissions-pickList", "remove-from-clone", "disable-on-warning"],
            pickList: pickList,
            srOnlyLabel: false,
            multiple: true,
            showFilter: true,
            options: {
                minimumInputLength: 0
            },
            label: "Select Additional Individual Permissions",
            title: "Use up and down arrows to view options and then press enter to select"
        };
    };
    var getPermissionSetsSearchSelect = function(pickList) {
        return {
            control: "select",
            name: "permissionSetValueBulkEdit",
            pickList: pickList,
            srOnlyLabel: false,
            label: "Select Permission Set",
            title: "Use up and down arrows to view options and then press enter to select",
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
                '<p><strong>The following users will retain the listed permissions based on the combination of Permission Sets and Additional Individual Permissions that were chosen to be removed.</strong></p>' +
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
