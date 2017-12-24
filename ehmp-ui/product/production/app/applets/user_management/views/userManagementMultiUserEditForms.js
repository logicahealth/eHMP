define([
    'underscore',
    'handlebars',
    'app/applets/user_management/appletUtil',
    'hbs!app/applets/user_management/templates/beforeRemoveTemplate',
    'hbs!app/applets/user_management/templates/beforeCloneTemplate',
    'hbs!app/applets/user_management/templates/detailsTableTemplate',
    'hbs!app/applets/user_management/templates/multiSelectDetailTemplates/users'
], function(_, Handlebars, appletUtil, beforeRemoveTemplate, beforeCloneTemplate, detailsTableTemplate, usersDetailsTemplate) {
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
        extraClasses: ["modal-body", "search-form"],
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
                extraClasses: ["col-xs-12", "loading-view"],
                template: loadingViewTemplate,
                hidden: true
            }, {
                control: "container",
                extraClasses: ["search-users"],
                items: [{
                    control: "container",
                    extraClasses: ["main-search-form"],
                    items: [{
                        control: "container",
                        tagName: ["p"],
                        template: 'Fill in at least one field to search for users. Default search results will return only users that are active in both eHMP and VistA.'
                    }, {
                        control: "container",
                        items: [{
                            control: "input",
                            name: "lastNameValueBulkEdit",
                            label: "Last name",
                            extraClasses: ["col-xs-3", "left-padding-no"],
                            srOnlyLabel: false,
                            title: "Enter at least three letters of the user's Last Name"
                        }, {
                            control: "input",
                            name: "firstNameValueBulkEdit",
                            label: "First name",
                            extraClasses: ["col-xs-3"],
                            srOnlyLabel: false,
                            title: "Enter at least three letters of the user's First Name"
                        }, {
                            control: "container",
                            extraClasses: ["col-xs-3", "permission-sets-for-search-picklist"],
                            items: []
                        }, {
                            control: "input",
                            name: "duzValueBulkEdit",
                            label: "DUZ",
                            extraClasses: ["col-xs-3", "right-padding-no"],
                            srOnlyLabel: false,
                            title: "Enter the D U Z of the user"
                        }]
                    }, {
                        name: "checkboxForm",
                        control: "container",
                        extraClasses: ["checkbox-form"],
                        items: [{
                            control: "container",
                            extraClasses: ["col-xs-3"],
                            items: [{
                                control: "checkbox",
                                label: "Include inactive VistA users",
                                name: "vistaCheckboxValueBulkEdit",
                                title: "Press spacebar to toggle checkbox.",
                            }]
                        }, {
                            control: "container",
                            extraClasses: ["col-xs-3"],
                            items: [{
                                control: "checkbox",
                                label: "Include inactive eHMP users",
                                name: "ehmpCheckboxValueBulkEdit",
                                title: "Press spacebar to toggle checkbox.",
                            }]
                        }, {
                            control: "container",
                            extraClasses: ['col-xs-3', 'top-padding-xs'],
                            items: [{
                                control: "button",
                                extraClasses: ["btn-primary"],
                                name: "Search",
                                label: "Search",
                                size: "sm",
                                disabled: true,
                                id: "search-button",
                                type: "button"
                            }]
                        }]
                    }]
                }, {
                    control: "container",
                    extraClasses: ["main-search-results"],
                    items: [{
                        control: "container",
                        extraClasses: ["col-xs-12", "results-count-container", "bold-font"],
                        template: '<span id="resultCountLabelBulkEdit" aria-label="Table is now {{resultCountLabel}}">{{resultCount}}</span>'
                    }, {
                        control: "container",
                        extraClasses: ['right-margin-sm'],
                        items: [{
                            control: "multiselectSideBySide",
                            name: "usersListResults",
                            label: "Users",
                            extraClasses: ['bottom-margin-no'],
                            attributeMapping: {
                                value: "selected",
                                id: "labelForSideBySide",
                                label: "labelForSideBySide"
                            },
                            detailsPopoverOptions: {
                                options: {
                                    placement: 'auto left'
                                },
                                items: [{
                                    control: 'container',
                                    template: usersDetailsTemplate
                                }]
                            }
                        }]
                    }, {
                        control: "container",
                        extraClasses: ["bottom-margin-xs"],
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
                                id: "next-page-button-bulk-edit",
                                type: "button"
                            }]
                        }]
                    }, {
                        control: "container",
                        items: [{
                            control: "radio",
                            name: "editMode",
                            label: "Select an action to apply to the selected users above",
                            value: 'add-permission',
                            extraClasses: ['col-xs-12'],
                            options: [{
                                label: "Add permissions",
                                value: "add-permissions"
                            }, {
                                label: "Remove permissions",
                                value: "remove-permissions"
                            }, {
                                label: "Clone permissions",
                                value: "clone-permissions"
                            }]
                        }]
                    }]
                }]
            }, {
                control: "container",
                extraClasses: ["edit-users"],
                items: [{
                    control: "container",
                    extraClasses: ['edit-users-form'],
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
                            attributeMapping: {
                                label: 'labelForSideBySide',
                                value: 'duz'
                            }
                        }]
                    }]
                }, {
                    control: "container",
                    extraClasses: ['edit-user-permissions-form'],
                    items: [{
                        control: "container",
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
                        extraClasses: ["edit-user-clone-alert", "edit-user-clone", "top-margin-xl"],
                        items: [{
                            control: "alertBanner",
                            name: "cloneUsersAlertMessage",
                            dismissible: false
                        }]
                    }, {
                        control: "container",
                        extraClasses: ['user-clone-template'],
                        items: []
                    }, {
                        control: "container",
                        items: [{
                            control: "container",
                            extraClasses: ["col-xs-6"],
                            items: [{
                                control: "select",
                                name: "editUsersPermissionSets",
                                extraClasses: ["permission-sets-picklist", "remove-from-clone", "disable-on-warning"],
                                pickList: [],
                                srOnlyLabel: false,
                                multiple: true,
                                showFilter: true,
                                options: {
                                    minimumInputLength: 0
                                },
                                label: "Select permission set"
                            }, {
                                control: "button",
                                type: "button",
                                label: "Clear All",
                                id: 'clear-permission-sets-button',
                                extraClasses: ['btn-default', 'btn-sm', "bottom-margin-sm", "remove-from-clone", "disable-on-warning"],
                                disabled: true
                            }]
                        }, {
                            control: "container",
                            extraClasses: ['edit-users-additional-permissions-container', "col-xs-6"],
                            items: []
                        }]
                    }, {
                        control: "container",
                        items: [{
                            control: "container",
                            extraClasses: ['selectable-users-table-container', 'col-xs-12', 'right-padding-lg', 'bottom-padding-lg'],
                            items: []
                        }]
                    }]
                }]
            }]
        }]
    }, {
        name: "footerForm",
        control: "container",
        extraClasses: ["modal-footer", "left-padding-sm"],
        items: [{
            control: "button",
            type: "button",
            label: "Back",
            id: 'back-button',
            extraClasses: ['btn-default', 'btn-sm'],
            title: 'Return to user bulk edit search.',
            hidden: true
        }, {
            control: "button",
            type: "button",
            label: "Cancel",
            id: 'cancel-button',
            extraClasses: ['btn-default', 'btn-sm'],
        }, {
            control: "button",
            type: "button",
            label: "Edit Selected Users",
            id: 'edit-users-button',
            extraClasses: ['btn-default', 'btn-sm'],
            disabled: true
        }, {
            control: "button",
            type: "button",
            label: "Add User Permissions",
            id: 'add-permissions-button',
            extraClasses: ['btn-default', 'btn-sm', 'bulk-edit-btn'],
            hidden: true
        }, {
            control: "button",
            type: "button",
            label: "Remove User Permissions",
            id: 'remove-permissions-button',
            extraClasses: ['btn-default', 'btn-sm', 'bulk-edit-btn'],
            hidden: true
        }, {
            control: "button",
            type: "button",
            label: "Clone User Permissions",
            id: 'clone-permissions-button',
            extraClasses: ['btn-default', 'btn-sm', 'bulk-edit-btn'],
            hidden: true,
            disabled: true
        }]
    }];

    var getSelectableTable = function(collection, editMode, customLegend) {
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
            control: "container",
            name: "selectableUsersTableSelectedUser",
            id: "selectableUsersTable",
            template: detailsTableTemplate({
                legend: legend,
                data: collection.toJSON(),
                headers: ['Name', 'Current Permission Sets', 'Current Additional Individual Permissions', 'DUZ']
            }),
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
            label: "Select Additional Individual Permissions"
        };
    };
    var getPermissionSetsSearchSelect = function(pickList) {
        return {
            control: "select",
            name: "permissionSetValueBulkEdit",
            pickList: pickList,
            srOnlyLabel: false,
            label: "Select permission set"
        };
    };
    var getBeforeCloneAlert = function(users) {
        if (users === null) {
            return {
                control: "container",
                name: "editActionAlertMessage"
            };
        }
        var usersForTemplate = [];
        _.each(users, function(user) {
            usersForTemplate.push({
                formattedName: user.get('formattedName'),
                lostPermissionsCountText: user.get('lostPermissionsCountText'),
                lostPermissions: user.get('lostPermissions').sort().join(', ')
            });
        });
        return {
            control: "container",
            name: "editActionAlertMessage",
            template: beforeCloneTemplate({
                users: usersForTemplate
            })
        };
    };
    var getBeforeRemoveAlert = function(users) {
        if (users === null) {
            return {
                control: "container",
                name: "editActionAlertMessage"
            };
        }
        var usersForTemplate = [];
        _.each(users, function(user) {
            usersForTemplate.push({
                formattedName: user.get('formattedName'),
                retainedPermissionsCountText: user.get('retainedPermissionsCountText'),
                retainedPermissions: user.get('retainedPermissions').sort().join(', ')
            });
        });
        return {
            control: "container",
            name: "editActionAlertMessage",
            template: beforeRemoveTemplate({
                users: usersForTemplate
            })
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
