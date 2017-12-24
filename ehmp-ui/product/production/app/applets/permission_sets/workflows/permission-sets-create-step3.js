define([
    'underscore',
    'app/applets/permission_sets/workflows/permission-sets-abstract-form',
    'hbs!app/applets/permission_sets/templates/create-details-permissions',
    'app/applets/permission_sets/workflows/permission-sets-create-back-warning'
], function(_, AbstractForm, permissionsDetailsTemplate, warningOptions) {
    'use strict';

    var STEP_INDEX = 3;


    /**
     * Permission Sets Create Form Step Three - Individual Permissions
     * Feature: 1285
     *
     * Original Specification: https://wiki.vistacore.us/x/o4igAQ
     */
    return AbstractForm.extend({

        onInitialize: function onInitialize() {
            this.addMultiSelect('Individual Permissions', this.permissions, permissionsDetailsTemplate);
            AbstractForm.prototype.onInitialize.apply(this, arguments);
        },

        onRender: function onRender() {
            this.ui.submit.trigger('control:disabled', false);
        },

        /**
         * Not a standard function, built/called form AbstractForm
         * @param event
         */
        submit: function submit(event) {
            event.preventDefault();

            this.listenToOnce(this.model, 'save:success', this.onSuccess);
            this.listenToOnce(this.model, 'save:error', this.onError);

            this.prepareModel();
            this.model.save();
        },

        /**
         * Called on a successful write back
         */
        onSuccess: function() {
            this.stopListening(this.model, 'save:error');
            this.sharedSets.add(this.model);

            var success = new ADK.UI.Notification({
                title: 'Success',
                message: 'Permission set successfully created',
                type: 'success'
            });
            success.show();
            ADK.UI.Workflow.hide();
        },

        /**
         * Called on a failed writeback
         */
        onError: function() {
            this.stopListening(this.model, 'save:success');
            var error = new ADK.UI.Notification({
                title: 'Error',
                message: 'Failed to create Permission Sets',
                type: 'danger',
                autoClose: false
            });
            error.show();
        },

        /**
         * Cleans up the model for writeback
         */
        prepareModel: function prepareModel() {
            var permissions = [];
            var nationalAccess = false;
            this.permissions.each(function getSelectedUIDs(model) {
                if (model.get('selected')) {
                    permissions.push(model.get('uid'));
                    nationalAccess = nationalAccess || Boolean(model.get('nationalAccess'));
                }
            });

            this.model.set({
                'permissions': permissions,
                'label': this.model.get('setName'),
                'version': this.model.get('introduced'),
                'nationalAccess': nationalAccess
            });
        },


        /**
         * Not a standard function, built/called form AbstractForm
         * @param event
         */
        back: function back(event) {
            event.preventDefault();
            var warning = new ADK.UI.Alert(warningOptions);
            warning.show();

            var footer = _.get(warning, 'FooterRegion.currentView');

            this.listenToOnce(footer, 'alert:selected:yes', function goBack() {
                this.stopListening(footer, 'alert:selected:no');
                this.workflow.goToPrevious();
            });

            this.listenToOnce(footer, 'alert:selected:no', function doNotGoBack() {
                this.stopListening(footer, 'alert:selected:yes');
            });
        },

        /**
         * Not a standard function, built/called form AbstractForm
         * @param event
         */
        cancel: function cancel(event) {
            event.preventDefault();
            ADK.UI.Workflow.hide();
        },

        /**
         * Not a standard function, built/called form AbstractForm,
         * Fires when the workFlow changes steps.
         */
        onStep: function onStep() {
            if (this.getIndex() === STEP_INDEX) {
                var preselected = {};

                this.getPreselected(this.features, preselected);
                this.getPreselected(this.permissionSets, preselected);

                this.permissions.each(function fillPreSelectedPermissions(model) {
                    var uid = model.get('uid');
                    var isSelected = _.get(preselected, uid, false);
                    model.set('selected', isSelected);
                    model.set('preselected', isSelected);
                });
            }
        },

        /**
         * Finds preselected values from collection
         * @param {Collection} collection
         * @param {*} preselected Modified by reference.
         */
        getPreselected: function getPreselected(collection, preselected) {
            collection.each(function checkSelected(model) {
                if (model.get('selected')) {
                    _.each(model.get('permissions'), function getPermissionUID(uid) {
                        preselected[uid] = true;
                    });
                }
            });
        }
    });
});