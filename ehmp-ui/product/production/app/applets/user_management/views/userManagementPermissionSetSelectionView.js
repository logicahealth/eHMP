define([
    'backbone',
    'marionette',
    'underscore',
    'app/applets/user_management/appletUtil',
    'app/applets/user_management/views/userManagementModalView'
], function(Backbone, Marionette, _, appletUtil, userManagementModalView) {
    "use strict";

    var SortedCollection = Backbone.Collection.extend({
        comparator: function(item) {
            return item.get('label');
        }
    });
    var userManagementPermissionSetSelectionView = {

        createForm: function(modalView, model) {
            var self = this;
            var markSelectedPermissionSets = function() {
                var allPermissionSets = new SortedCollection(appletUtil.getUnduplicatedPermissionSets());

                if (model) {
                    var session = ADK.UserService.getUserSession();
                    var currentUserDuz = session.get('duz')[session.get('site')];
                    var editingSelf = false;
                    if (model.get('duz').toString() === currentUserDuz) {
                        editingSelf = true;
                    }
                    var userPermissionSets = model.get('permissionSets');
                    allPermissionSets.each(function(permissionSet) {
                        var keepACC = (editingSelf && ADK.UserService.hasPermission('edit-own-permissions') && permissionSet.get('val') === 'acc');
                        if (keepACC) {
                            permissionSet.set('keepSelected', true);
                        }
                        permissionSet.set('permissionsCollection', appletUtil.createPermissionsCollectionFromList(permissionSet.get('permissions')));
                        if (_.indexOf(userPermissionSets.val, permissionSet.get('val')) > -1) {
                            permissionSet.set('selected', true);
                        } else {
                            permissionSet.set('selected', false);
                        }
                    });
                }
                return allPermissionSets;
            };
            var markSelectedPermissions = function() {
                var allPermissions = appletUtil.getPermissions();
                var permissionsModels = [];
                var userPermissions = [];
                if (model) {
                    userPermissions = userPermissions.concat(model.get('additionalPermissions'));
                }
                var editingSelf = false;
                var session = ADK.UserService.getUserSession();
                var currentUserDuz = session.get('duz')[session.get('site')];
                if (model.get('duz').toString() === currentUserDuz) {
                    editingSelf = true;
                }
                allPermissions.each(function(permission) {
                    var selected = false;
                    if (_.indexOf(userPermissions, permission.get('value')) > -1) {
                        selected = true;
                    }
                    var keepSelected = false;
                    var keepEditOwnPermissionsPermission = (editingSelf && ADK.UserService.hasPermission('edit-own-permissions') && permission.get('value') === 'edit-own-permissions');
                    if (keepEditOwnPermissionsPermission) {
                        keepSelected = true;
                    }
                    permissionsModels.push(new Backbone.Model({
                        label: permission.get('label'),
                        value: permission.get('value'),
                        description: permission.get('description') || null,
                        example: permission.get('example') || null,
                        selected: selected,
                        keepSelected: keepSelected
                    }));
                });

                return new SortedCollection(permissionsModels);
            };

            var fields = [{
                control: "container",
                extraClasses: ["modal-body"],
                items: [{
                    control: "alertBanner",
                    name: "permissionsSetAlertMessage",
                    dismissible: true,
                    extraClasses: ["permissionsSetAlert"]
                }, {
                    control: "container",
                    extraClasses: ["row", "container-fluid"],
                    items: [{
                        control: "container",
                        extraClasses: ["col-xs-12", "mainSelect"],
                        items: [{
                            control: "container",
                            extraClasses: ["col-xs-12"],
                            items: [{
                                control: "multiselectSideBySide",
                                name: "permissionSets",
                                label: "Permission Sets",
                                attributeMapping: {
                                    value: "selected"
                                },
                                detailsPopoverOptions: {
                                    items: [{
                                        control: 'container',
                                        template: appletUtil.getDetailsTemplate([{
                                            id: 'formattedPermissions',
                                            label: 'Permissions'
                                        }])
                                    }]
                                }
                            }]
                        }]
                    }, {
                        control: "fieldset",
                        extraClasses: ["col-xs-12", "permissionsSelect"],
                        legend: "Additional Individual Permissions",
                        items: [{
                            control: "alertBanner",
                            name: "permissionsAlertMessage",
                            dismissible: true,
                            extraClasses: ["permissionsAlert"]
                        }, {
                            control: "container",
                            items: [{
                                control: "container",
                                extraClasses: ["col-xs-12"],
                                items: [{
                                    control: "multiselectSideBySide",
                                    name: "permissions",
                                    label: "Additional Individual Permissions",
                                    attributeMapping: {
                                        value: "selected"
                                    },
                                    detailsPopoverOptions: {
                                        items: [{
                                            control: 'container',
                                            template: appletUtil.getDetailsTemplate([{
                                                id: "description",
                                                label: "Description"
                                            }, {
                                                id: "example",
                                                label: "Example"
                                            }])
                                        }]
                                    }
                                }, ]
                            }]
                        }]
                    }]
                }]
            }, {
                control: "container",
                extraClasses: ["modal-footer"],
                items: [{
                    control: "container",
                    extraClasses: ["row"],
                    items: [{
                        control: "container",
                        extraClasses: ["col-md-12", "text-right"],
                        items: [{
                            control: "button",
                            extraClasses: ["btn-default", "btn-sm"],
                            label: "Cancel",
                            name: "cancel",
                            type: "button"
                        }, {
                            control: "button",
                            extraClasses: ["btn-primary", "btn-sm"],
                            label: "Save",
                            name: "save",
                            type: "submit"
                        }]
                    }]
                }]
            }];

            var FormModel = Backbone.Model.extend({
                defaults: {
                    permissionSets: markSelectedPermissionSets(),
                    permissions: markSelectedPermissions(),
                    users: new Backbone.Collection(),
                    permissionsAlertMessage: '',
                    permissionsSetAlertMessage: '',
                    editMode: ''
                }
            });

            var FormView = ADK.UI.Form.extend({
                fields: fields,

                ui: {
                    'CancelButton': '.cancel',
                    'SaveButton': '.save',
                    'PermissionsSelectControler': '.permissionsSelect',
                    'editOwnPermissionWarningControler': '.editOwnPermissionWarning',
                    'PermissionsAlertControl': '.permissionsAlert',
                    'PermissionsSetAlertControl': '.permissionsSetAlert'
                },
                onRender: function() {
                    var self = this;
                    //self.updatePermissions();
                    var session = ADK.UserService.getUserSession();
                    var currentUserDuz = session.get('duz')[session.get('site')];
                    this.editingSelf = false;
                    if (model.get('duz').toString() === currentUserDuz) {
                        this.editingSelf = true;
                    }
                    this.model.get('permissions').on('change:selected', function(permissionModel) {
                        if (!_.isUndefined(permissionModel.get('keepSelected')) && permissionModel.get('keepSelected') === true) {
                            var changedModel = new Backbone.Model(permissionModel.attributes);
                            changedModel.set('selected', true);
                            self.ui.PermissionsAlertControl.trigger('control:icon', 'fa-exclamation-triangle').trigger('control:type', 'warning').trigger('control:title', 'Error Editing Additional Permissions');
                            self.model.set('permissionsAlertMessage', "You are not allowed to remove '" + permissionModel.get('label') + "' from your Permissions");
                            self.model.get('permissions').remove(permissionModel);
                            self.model.get('permissions').add(changedModel);

                        } else if (permissionModel.get('value') === 'edit-own-permissions') {
                            var accPermissionSet = self.model.get('permissionSets').where({
                                val: 'acc'
                            })[0];
                            var changedAccModel = new Backbone.Model(accPermissionSet.attributes);
                            if (accPermissionSet.get('selected') === false && permissionModel.get('selected') === true) {
                                changedAccModel.set('selected', true);
                                self.ui.PermissionsSetAlertControl.trigger('control:icon', 'fa-info-circle').trigger('control:type', 'info').trigger('control:title', 'Permission Set Auto Update');
                                self.model.set('permissionsSetAlertMessage', "'" + permissionModel.get('label') + "' automatically grants '" + accPermissionSet.get('label') + "' Permission Set");
                                self.model.get('permissionSets').remove(accPermissionSet);
                                self.model.get('permissionSets').add(changedAccModel);
                                _.each(changedAccModel.get('permissions'), function(permission) {
                                    var permissionToRemove = self.model.get('permissions').where({
                                        value: permission
                                    })[0];
                                    console.log(permissionToRemove);
                                    if(!_.isUndefined(permissionToRemove)){
                                        self.model.get('permissions').remove(permissionToRemove);
                                    }
                                });
                            }

                        }
                    });
                    this.model.get('permissionSets').on('change:selected', function(permissionSetModel) {
                        var checkEditOwnPermission = self.model.get('permissions').where({
                            value: 'edit-own-permissions'
                        })[0].get('selected');
                        var alertMessage = "You are not allowed to remove '" + permissionSetModel.get('label') + "' from your assigned Permission Sets";
                        if (checkEditOwnPermission && permissionSetModel.get('val') === 'acc') {
                            alertMessage = alertMessage + " until you remove 'Edit Own Permissions' from the additional permissions";
                        }
                        var autoselectACCPermissionSet = (checkEditOwnPermission && permissionSetModel.get('val') === 'acc' && permissionSetModel.get('selected') === false);
                        var keepPermissionSetSelected = (permissionSetModel.get('keepSelected') && permissionSetModel.get('keepSelected') === true);
                        if (keepPermissionSetSelected || autoselectACCPermissionSet) {
                            var changedModel = new Backbone.Model(permissionSetModel.attributes);
                            changedModel.set('selected', true);
                            self.ui.PermissionsSetAlertControl.trigger('control:icon', 'fa-exclamation-triangle').trigger('control:type', 'warning').trigger('control:title', 'Error Editing Permission Sets');
                            self.model.set('permissionsSetAlertMessage', alertMessage);
                            self.model.get('permissionSets').remove(permissionSetModel);
                            self.model.get('permissionSets').add(changedModel);
                        } else {
                            self.updatePermissions();
                        }
                    });
                },
                updatePermissions: function() {
                    var self = this;
                    var allPermissions = appletUtil.getPermissions();
                    var finalPermissionsModels = [];
                    var userPermissions = [];
                    var userPermissionSets = this.model.get('permissionSets');
                    var selectedPermissionSets = userPermissionSets.where({
                        selected: true
                    });
                    var currentPermissions = this.model.get('permissions');
                    var previouslySelectedPermissions = [];
                    var previouslySelectedPermissionsModles = currentPermissions.where({
                        selected: true
                    });
                    _.each(previouslySelectedPermissionsModles, function(previouslySelectedPermission) {
                        previouslySelectedPermissions.push(previouslySelectedPermission.get('value'));
                    });
                    _.each(selectedPermissionSets, function(permissionSet) {
                        userPermissions = userPermissions.concat(appletUtil.permissionsMap[permissionSet.get('val')]);
                    });
                    var editingSelf = false;
                    var session = ADK.UserService.getUserSession();
                    var currentUserDuz = session.get('duz')[session.get('site')];
                    if (model.get('duz').toString() === currentUserDuz) {
                        editingSelf = true;
                    }

                    if (userPermissions !== []) {
                        userPermissions = _.uniq(userPermissions);
                        this.model.get('permissions').reset([]);
                        allPermissions.each(function(permission) {
                            var selected = false;
                            if (_.contains(userPermissions, permission.get('value')) === false) {
                                if (_.contains(previouslySelectedPermissions, permission.get('value'))) {
                                    selected = true;
                                }
                                var keepSelected = false;
                                var keepEditOwnPermissionsPermission = (editingSelf && ADK.UserService.hasPermission('edit-own-permissions') && permission.get('value') === 'edit-own-permissions');
                                if (keepEditOwnPermissionsPermission) {
                                    keepSelected = true;
                                }
                                self.model.get('permissions').add(new Backbone.Model({
                                    label: permission.get('label'),
                                    value: permission.get('value'),
                                    description: permission.get('description') || 'none',
                                    example: permission.get('example') || 'none',
                                    selected: selected,
                                    keepSelected: keepSelected
                                }));
                            }
                        });
                    }

                },
                events: {
                    'click @ui.CancelButton': function(e) {
                        ADK.UI.Workflow.hide();
                    },
                    'submit': function(e) {
                        e.preventDefault();
                        e.stopPropagation();

                        if (!this.model.isValid())
                            this.model.set("formStatus", {
                                status: "error",
                                message: self.model.validationError
                            });
                        else {
                            this.model.unset("formStatus");

                            var permissionSetsCollection = this.model.get("permissionSets");
                            var permissionsCollection = this.model.get("permissions");
                            var selectedPermissionSets = permissionSetsCollection.where({
                                selected: true
                            });
                            var selectedPermissions = permissionsCollection.where({
                                selected: true
                            });
                            var getSelectedPermissionSetsValues = function(selectedPermissionSets) {
                                var values = [];
                                _.each(selectedPermissionSets, function(e) {
                                    var val = e.get('val');
                                    values.push(val);
                                });
                                return values;
                            };
                            var getSelectedPermissionsValues = function(selectedPermissions) {
                                var values = [];
                                _.each(selectedPermissions, function(e) {
                                    var val = e.get('value');
                                    values.push(val);
                                });

                                return values;
                            };

                            //update the user permissionSets based on the selection

                            this.editUserPermissionSets(model, getSelectedPermissionSetsValues(selectedPermissionSets), getSelectedPermissionsValues(selectedPermissions));

                        }
                    },
                },
                //Edit a single user with new selected permissionSets
                editUserPermissionSets: function(userModel, selectedPermissionSetsValues, selectedPermissionsValues) {
                    var editingSelf = false;
                    var session = ADK.UserService.getUserSession();
                    var currentUserDuz = session.get('duz')[session.get('site')];
                    if (model.get('duz').toString() === currentUserDuz) {
                        editingSelf = true;
                    }
                    var keepEditOwnPermissionsPermission = (editingSelf && ADK.UserService.hasPermission('edit-own-permissions'));
                    if (keepEditOwnPermissionsPermission) {
                        selectedPermissionsValues.push('edit-own-permissions');
                    }

                    var self = this;
                    var editUsersFetchOptions = {
                        resourceTitle: 'permission-sets-edit',
                        fetchType: 'PUT',
                        cache: false,
                        pageable: false,
                        criteria: {
                            user: JSON.stringify({
                                uid: userModel.get('uid'),
                                fname: userModel.get('fname'),
                                lname: userModel.get('lname'),
                                permissions: ADK.UserService.getUserSession().get('permissions')
                            }),
                            permissionSets: JSON.stringify(selectedPermissionSetsValues),
                            additionalPermissions: JSON.stringify(selectedPermissionsValues)

                        },

                        onSuccess: function(permissionSetsCollection, permissionSetsArray) {
                            var value = '';
                            var alertMessage = '';
                            if (permissionSetsArray && permissionSetsArray.data && permissionSetsArray.data.val) {
                                value = permissionSetsArray.data.val.join();
                                alertMessage = 'The Permission Sets have been successfully modified with no errors. ';
                                var ehmpStatus = 'active';

                                if (permissionSetsArray.data.val.length === 0) {
                                    ehmpStatus = 'inactive';
                                    alertMessage = alertMessage + 'All Permission Sets have been removed. User ' + userModel.get('fname') + ' ' + userModel.get('lname') + ' is now inactive in eHMP';
                                }
                                var additionalPermissionsLabels = [];

                                _.each(permissionSetsArray.data.additionalPermissions, function(additionalPermission) {
                                    additionalPermissionsLabels.push(appletUtil.formatPermissionName(additionalPermission));
                                });

                                model.set({
                                    'permissionSetsListString': value,
                                    'ehmpStatus': ehmpStatus,
                                    'ehmpStatusUpperCase': ehmpStatus.toUpperCase(),
                                    'permissionSets': permissionSetsArray.data,
                                    'additionalPermissions': permissionSetsArray.data.additionalPermissions,
                                    'additionalPermissionsLabels': additionalPermissionsLabels,
                                    'additionalPermissionsLabelsFormatted': appletUtil.getFormattedAdditionalPermissionsString(additionalPermissionsLabels),
                                    'modalAlertMessage': alertMessage

                                });
                                ADK.Messaging.trigger('userPermissionSetsUpdated', model);

                            } else {
                                alertMessage = 'An error occurred while updating user permissions. ' +
                                    'Please try again. If problem persists, please contact the Help Desk for assistance.';
                                appletUtil.appletAlert.warning(model.collection, 'Error Editing Permission Sets', alertMessage);
                            }
                            ADK.UI.Workflow.hide();
                        },
                        onError: function(error, response) {
                            var alertMessage = 'An error occurred while updating user permissions. ' +
                                'Please try again. If problem persists, please contact the Help Desk for assistance.';
                            appletUtil.appletAlert.warning(model.collection, 'Error Editing Permission Sets', alertMessage);
                        }
                    };
                    ADK.ResourceService.fetchCollection(editUsersFetchOptions);
                }
            });

            var workflowOptions = {
                size: "large",
                title: "Select Permission Sets for " + ADK.UserService.getUserSession().get('facility').toUpperCase() + " User: " + model.get("lname") + ", " + model.get("fname"),
                showProgress: false,
                backdrop: true,
                keyboard: true,
                steps: [{
                    view: FormView,
                    viewModel: new FormModel()
                }]
            };
            var workflow = new ADK.UI.Workflow(workflowOptions);
            workflow.show();
        }
    };

    return userManagementPermissionSetSelectionView;
});