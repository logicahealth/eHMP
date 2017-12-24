define([
    'app/applets/permission_sets/workflows/permission-sets-abstract-form',
    'app/applets/permission_sets/workflows/permission-sets-create-step1',
    'hbs!app/applets/permission_sets/templates/create-details-permissions'
], function(AbstractForm, DataForm, permissionsDetailsTemplate) {
    'use strict';


    /**
     * Permission Sets Edit Form.
     * Feature: 1285
     *
     * This is essentially Create Step 1 and Create Step 3 merged into a single Form,
     * filling out any existing data for the user.
     *
     * Original Specification: https://wiki.vistacore.us/x/o4igAQ
     */
    return DataForm.extend({

        onInitialize: function onInitialize() {
            this.addComponents();
            this.addMultiSelect('Individual Permissions', this.permissions, permissionsDetailsTemplate, false);

            // Intentionally by passing DataForm.onInitialize and going to AbstractForm
            AbstractForm.prototype.onInitialize.apply(this, arguments);
        },

        onBeforeShow: function onBeforeShow() {
            this.unlock();
            this.onStep();
        },

        /**
         * Removing next so the AbstractForm won't build it.
         */
        next: null,

        /**
         * Not a standard function, built/called form AbstractForm
         * @param event
         */
        submit: function submit(event) {
            event.preventDefault();

            var changes = this.getPermissionChanges();

            this.listenToOnce(this.model, 'save:success', this.onSuccess);
            this.listenToOnce(this.model, 'save:error', this.onError);
            this.prepareModel();

            this.model.save(changes);
        },

        /**
         * Fired after a successful edit writeback
         */
        onSuccess: function() {
            this.stopListening(this.model, 'save:error');
            this.originalModel.set(this.model.attributes);
            this.sharedSets.trigger('edit:success', this.model);
            var success = new ADK.UI.Notification({
                title: 'Success',
                message: 'Permission set successfully updated',
                type: 'success'
            });
            success.show();
            ADK.UI.Workflow.hide();
        },

        onError: function() {
            this.stopListening(this.permissionSet, 'save:success');
            var error = new ADK.UI.Notification({
                title: 'Error',
                message: 'Failed to update Permission Sets',
                type: 'danger',
                autoClose: false
            });
            error.show();
        },

        getPermissionChanges: function() {
            var changes = {
                addPermissions: [],
                removePermissions: []
            };
            var permissions = [];
            var nationalAccess = false;
            this.permissions.each(function(model) {
                if (model.get('selected') && model.get('preselected')) {
                    nationalAccess = nationalAccess || Boolean(model.get('nationalAccess'));
                    permissions.push(model.id);
                } else if (model.get('selected')) {
                    nationalAccess = nationalAccess || Boolean(model.get('nationalAccess'));
                    permissions.push(model.id);
                    changes.addPermissions.push(model.id);
                } else if (model.get('preselected')) {
                    changes.removePermissions.push(model.id);
                }
            });
            this.model.set({
                permissions: permissions,
                nationalAccess: nationalAccess
            });
            return changes;
        },

        prepareModel: function() {
            this.model.set({
                label: this.model.get('setName'),
                version: this.model.get('introduced')
            });
        }
    });
});