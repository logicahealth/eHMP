define([
    'backbone',
    'marionette',
    'underscore',
    'app/applets/user_management/appletUtil',
    'app/applets/user_management/views/userManagementModalView',
    'hbs!app/applets/user_management/templates/multiSelectDetailTemplates/permissionSets',
    'hbs!app/applets/user_management/templates/multiSelectDetailTemplates/permissions'
], function(
    Backbone,
    Marionette,
    _,
    appletUtil,
    userManagementModalView,
    permissionSetsDetailsTemplate,
    permissionsDetailsTemplate) {
    'use strict';
    var UMA_CHANNEL = ADK.Messaging.getChannel('user-management-applet');
    var userManagementPermissionSetSelectionView = {
        createForm: function(modalView, model, triggerElement) {
            var self = this;
            var sharedModel = ADK.UIResources.Fetch.Permission.SharedModel(modalView);
            var basePermissionSetsCollection = new ADK.UIResources.Fetch.Permission.UMAPermissionSetsCollection(sharedModel.get('permissionSets').originalModels, {
                parse: true
            });
            var basePermissionsCollection = new ADK.UIResources.Fetch.Permission.UMAPermissionsCollection(sharedModel.get('permissions').originalModels, {
                parse: true
            });

            var userPermissionSets = [];
            var userPermissions = [];
            var keepACC = false;
            var keepACCAndEditOwnPermissionsPermission = false;

            if (model) {
                userPermissionSets = _.get(model.get('permissionSet'), 'val', []);
                userPermissions = _.get(model.get('permissionSet'), 'additionalPermissions', []);
                keepACCAndEditOwnPermissionsPermission = this.editingSelf && ADK.UserService.hasPermission('edit-own-permissions');
            }
            var permissionSetsCollection = basePermissionSetsCollection.toPicklist(userPermissionSets, basePermissionsCollection);
            if (keepACCAndEditOwnPermissionsPermission) {
                permissionSetsCollection.get('acc').set({
                    selected: true,
                    keepSelected: true
                });
            }
            var preselectedPermissionsByPermissionSets = permissionSetsCollection.getSelectedPermissions();
            var permissionsCollection = basePermissionsCollection.toPicklist(userPermissions, preselectedPermissionsByPermissionSets);
            if (keepACCAndEditOwnPermissionsPermission) {
                permissionsCollection.get('edit-own-permissions').set({
                    selected: true,
                    keepSelected: true
                });
            }

            var fields = [{
                control: 'container',
                extraClasses: ['container-fluid'],
                items: [{
                    control: 'container',
                    extraClasses: ['modal-body'],
                    items: [{
                        control: 'fieldset',
                        items: [{
                            control: 'alertBanner',
                            name: 'permissionsSetAlertMessage',
                            dismissible: true,
                            extraClasses: ['permissionsSetAlert']
                        }, {
                            control: 'container',
                            extraClasses: ['mainSelect'],
                            items: [{
                                control: 'multiselectSideBySide',
                                name: 'permissionSets',
                                label: 'Permission Sets',
                                attributeMapping: {
                                    value: 'selected'
                                },
                                detailsPopoverOptions: {
                                    options: {
                                        placement: 'auto left'
                                    },
                                    items: [{
                                        control: 'container',
                                        template: permissionSetsDetailsTemplate
                                    }]
                                }
                            }]
                        }]
                    }, {
                        control: 'fieldset',
                        items: [{
                            control: 'container',
                            tagName: 'h4',
                            template: 'Additional Individual Permissions'
                        }, {
                            control: 'alertBanner',
                            name: 'permissionsAlertMessage',
                            dismissible: true,
                            extraClasses: ['permissionsAlert']
                        }, {
                            control: 'container',
                            extraClasses: ['permissionsSelect'],
                            items: [{
                                control: 'multiselectSideBySide',
                                name: 'permissions',
                                label: 'Additional Individual Permissions',
                                attributeMapping: {
                                    value: 'selected'
                                },
                                detailsPopoverOptions: {
                                    options: {
                                        placement: 'auto left'
                                    },
                                    items: [{
                                        control: 'container',
                                        template: permissionsDetailsTemplate
                                    }]
                                }
                            }]
                        }]
                    }]
                }, {
                    control: 'container',
                    extraClasses: ['modal-footer', 'right-padding-no', 'left-padding-no'],
                    items: [{
                        control: 'container',
                        extraClasses: ['text-right'],
                        items: [{
                            control: 'button',
                            extraClasses: ['btn-default', 'btn-sm'],
                            label: 'Cancel',
                            name: 'cancel',
                            type: 'button'
                        }, {
                            control: 'button',
                            extraClasses: ['btn-primary', 'btn-sm'],
                            label: 'Save',
                            name: 'save',
                            type: 'submit'
                        }]
                    }]
                }]
            }];

            var FormModel = Backbone.Model.extend({
                defaults: {
                    permissionSets: permissionSetsCollection,
                    permissions: permissionsCollection,
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
                onInitialize: function() {
                    var session = ADK.UserService.getUserSession();
                    var currentUserDuz = session.get('duz')[session.get('site')];
                    this.editingSelf = false;
                    if (model.get('duz').toString() === currentUserDuz) {
                        this.editingSelf = true;
                    }
                },
                onRender: function() {
                    this.listenTo(this.model.get('permissions'), 'change:selected', function(permissionModel) {
                        if (!_.isUndefined(permissionModel.get('keepSelected')) && permissionModel.get('keepSelected') === true) {
                            this.ui.PermissionsAlertControl.trigger('control:update:config', {
                                icon: 'fa-exclamation-triangle',
                                type: 'warning',
                                title: 'Error Editing Additional Permissions'
                            });
                            this.model.set('permissionsAlertMessage', "You are not allowed to remove '" + permissionModel.get('label') + "' from your Permissions. See another Access Control Coordinator to remove them.");
                            this.keepModelSelected(permissionModel, 'permissions');

                        } else if (permissionModel.get('value') === 'edit-own-permissions') {
                            var accPermissionSet = this.model.get('permissionSets').get('acc');
                            if (accPermissionSet.get('selected') === false && permissionModel.get('selected') === true) {
                                this.ui.PermissionsSetAlertControl.trigger('control:update:config', {
                                    icon: 'fa-info-circle',
                                    type: 'info',
                                    title: 'Permission Set Auto Update'
                                });
                                this.model.set('permissionsSetAlertMessage', "'" + permissionModel.get('label') + "' automatically grants '" + accPermissionSet.get('label') + "' Permission Set");
                                this.keepModelSelected(accPermissionSet, 'permissionSets');
                                this.updatePermissions(true);
                            }
                        }
                    });
                    this.listenTo(this.model.get('permissionSets'), 'change:selected', function(permissionSetModel) {
                        var checkEditOwnPermission = this.model.get('permissions').get('edit-own-permissions').get('selected');
                        var alertMessage = "You are not allowed to remove '" + permissionSetModel.get('label') + "' from the assigned Permission Sets";
                        if (checkEditOwnPermission && permissionSetModel.get('value') === 'acc') {
                            alertMessage = alertMessage + " until 'Edit Own Permissions' is removed from Additional Permissions.";
                        }
                        var autoselectACCPermissionSet = (checkEditOwnPermission && permissionSetModel.get('value') === 'acc' && permissionSetModel.get('selected') === false);
                        var keepPermissionSetSelected = (permissionSetModel.get('keepSelected') === true && permissionSetModel.get('selected') === false);
                        if (keepPermissionSetSelected || autoselectACCPermissionSet) {
                            this.ui.PermissionsSetAlertControl.trigger('control:update:config', {
                                icon: 'fa-exclamation-triangle',
                                type: 'warning',
                                title: 'Error Editing Permission Sets'
                            });
                            this.model.set('permissionsSetAlertMessage', alertMessage);
                            this.keepModelSelected(permissionSetModel, 'permissionSets');
                        }
                        return this.updatePermissions();

                    });
                },
                keepModelSelected: function(model, targetCollectionName) {
                    /** Downside of the current sideBySide component implementation
                     * The only listeners it has for rerendering both available & selected views
                     * after manually setting the selected value is through the add/remove triggers 
                     **/
                    var changedModel = model.toJSON();
                    changedModel.selected = true;
                    var collection = this.model.get(targetCollectionName);
                    collection.remove(model);
                    collection.add(changedModel);
                },
                updatePermissions: function(isAutoAddAccEvent) {
                    var currentPermissions = this.model.get('permissions');
                    var previouslySelectedPermissions = currentPermissions.getSelected();
                    if (isAutoAddAccEvent) {
                        /** Fixes issue where when adding 'edit-own-permissions'
                         * auto adds 'acc' and a duplicate 'edit-own-permissions'
                         * renders on the selected side 
                         **/
                        this.model.get('permissions').get('edit-own-permissions').set('selected', false, {
                            silent: true
                        });
                        previouslySelectedPermissions.push('edit-own-permissions');
                        previouslySelectedPermissions = _.uniq(previouslySelectedPermissions);
                    }
                    var permissionsCollection = basePermissionsCollection.toPicklist(previouslySelectedPermissions, this.model.get('permissionSets').getSelectedPermissions());
                    if (keepACCAndEditOwnPermissionsPermission) {
                        permissionsCollection.get('edit-own-permissions').set({
                            selected: true,
                            keepSelected: true
                        });
                    }
                    this.model.get('permissions').set(permissionsCollection.models);
                },
                events: {
                    'click @ui.CancelButton': function(e) {
                        ADK.UI.Workflow.hide();
                    },
                    'submit': function(e) {
                        e.preventDefault();
                        e.stopPropagation();

                        if (!this.model.isValid()) {
                            this.model.set('formStatus', {
                                status: 'error',
                                message: self.model.validationError
                            });
                        } else {
                            this.model.unset('formStatus');
                            /* Update the user Permission Sets & Additional Permissions based on the selection */
                            this.editUserPermissions();
                        }
                    }
                },
                /* Edit a single user with new selected Permission Sets & Additional Permissions */
                editUserPermissions: function() {
                    var editUsersFetchOptions = {
                        resourceTitle: 'permission-sets-edit',
                        fetchType: 'PUT',
                        cache: false,
                        pageable: false,
                        criteria: {
                            user: JSON.stringify({
                                uid: model.get('uid'),
                                fname: model.get('fname'),
                                lname: model.get('lname'),
                                permissions: ADK.UserService.getUserSession().get('permissions')
                            }),
                            permissionSets: JSON.stringify(this.model.get('permissionSets').getSelected()),
                            additionalPermissions: JSON.stringify(this.model.get('permissions').getSelected())
                        },
                        onSuccess: function(permissionSetsCollection, permissionSetsArray) {
                            ADK.UI.Workflow.hide();
                            var alertMessage = '';
                            if (_.get(permissionSetsArray, 'data.val', false)) {
                                var permissionSetsReturned = _.get(permissionSetsArray, 'data.val', []);
                                var additionalPermissionsReturned = _.get(permissionSetsArray, 'data.additionalPermissions', []);

                                alertMessage = 'The permissions have been successfully modified with no errors. ';

                                if (_.isEmpty(permissionSetsReturned) &&
                                    _.isEmpty(additionalPermissionsReturned)) {
                                    alertMessage = alertMessage + 'All Permission Sets and Additional Individual Permissions have been removed. User ' + model.get('fname') + ' ' + model.get('lname') + ' is now inactive in eHMP';
                                }
                                UMA_CHANNEL.trigger('userPermissionsUpdated', model.get('uid'), alertMessage);

                            } else {
                                alertMessage = 'An error occurred while updating user permissions. ' +
                                    'Try again. If problem persists, contact the Help Desk for assistance.';
                                appletUtil.appletAlert.warning(model.collection, 'Error Editing Permissions', alertMessage);
                            }
                        },
                        onError: function(error, response) {
                            var alertMessage = 'An error occurred while updating user permissions. ' +
                                'Try again. If problem persists, contact the Help Desk for assistance.';
                            appletUtil.appletAlert.warning(model.collection, 'Error Editing Permissions', alertMessage);
                        }
                    };
                    ADK.ResourceService.fetchCollection(editUsersFetchOptions);
                }
            });

            var workflowOptions = {
                size: "large",
                title: "Select Permissions for " + ADK.UserService.getUserSession().get('facility').toUpperCase() + " User: " + model.get("lname") + ", " + model.get("fname"),
                showProgress: false,
                backdrop: true,
                keyboard: true,
                steps: [{
                    view: FormView,
                    viewModel: new FormModel(),
                    onBeforeShow: function() {
                        workflow.changeHeaderCloseButtonOptions({
                            onClick: function(e) {
                                ADK.UI.Workflow.hide();
                            }
                        });
                    }
                }]
            };
            if (!_.isUndefined(triggerElement)) {
                workflowOptions.triggerElement = triggerElement;
            }
            var workflow = new ADK.UI.Workflow(workflowOptions);
            workflow.show();
        }
    };

    return userManagementPermissionSetSelectionView;
});