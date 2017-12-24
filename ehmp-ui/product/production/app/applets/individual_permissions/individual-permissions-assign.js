define([
    'underscore',
    'hbs!app/applets/individual_permissions/templates/assign-top-template',
    'hbs!app/applets/individual_permissions/templates/assign-details-template'
], function(_, topTemplate, detailsTemplate) {
    'use strict';


    /**
     * Individual Permission Assign Workflow.
     * Feature: 1285
     *
     * Original Specification: https://wiki.vistacore.us/x/o4igAQ
     */
    var Form = ADK.UI.Form.extend({
        behaviors: {
            KeySelect: {}
        },

        fields: [],

        ui: {
            save: '#assign-permissions-save',
            cancel: '#assign-permissions-cancel'
        },

        events: {
            'submit': 'submit',
            'click @ui.cancel': 'cancel'
        },

        permissionSetEvents: {
            change: 'toggleSave'
        },

        onInitialize: function onInitialize() {
            var items = [];
            var container = {
                control: 'container',
                extraClasses: ['modal-body', 'all-padding-md']
            };

            this.setupCollections();

            items.push(this.createLabelArea());
            items.push(this.createMultiSelect());

            container.items = items;

            this.fields.push(container);
            this.fields.push(this.createFooter());
        },

        /**
         * Clones the original collection and bind events to it, to prevent
         * change events firing before the save.
         */
        setupCollections: function setupCollections() {
            this.multiSelectCollection = this.permissionSets.toPicklist(this.model.get('uid'));
            this.bindEntityEvents(this.multiSelectCollection, this.permissionSetEvents);
        },

        /**
         * Extracts the changed collections from the clone and sends a request to
         * original collection to update the models.
         * @param event
         */
        submit: function submit(event) {
            event.preventDefault();

            var added = [];
            var removed = [];

            this.multiSelectCollection.each(function findPermissionChanges(model) {
                if (model.get('selected') !== model.get('preselected')) {
                    if (model.get('preselected')) {
                        removed.push(model.id);
                    } else {
                        added.push(model.id);
                    }
                }
            });

            this.listenToOnce(this.permissionSets, 'put:success:assign', this.notifyAndExitSuccess);
            this.listenToOnce(this.permissionSets, 'put:error:assign', this.notifyFailure);

            this.permissionSets.assignPermissions(this.model.id, added, removed);
        },

        /**
         * Called on a successful writeback event, notifies the user of the success
         * and exits the workflow.
         */
        notifyAndExitSuccess: function notifyAndExitSuccess() {
            this.stopListening(this.permissionSet, 'put:error:assign');
            var success = new ADK.UI.Notification({
                title: 'Success',
                message: 'Permission Successfully added to Sets',
                type: 'success'
            });
            success.show();
            ADK.UI.Workflow.hide();
        },

        /**
         * Called on a failed writeback event, notifies the user of the failure.
         */
        notifyFailure: function notifyFailure() {
            this.stopListening(this.permissionSet, 'put:success:assign');
            var error = new ADK.UI.Notification({
                title: 'Error',
                message: 'Failed to update permissions',
                type: 'danger',
                autoClose: false
            });
            error.show();
        },

        /**
         * Exits the form.
         * @param event
         */
        cancel: function cancel(event) {
            event.preventDefault();
            ADK.UI.Workflow.hide();
        },

        /**
         * Enables the save button if the collection has changed.
         */
        toggleSave: function toggleSave() {
            var isDisabled = true;
            this.multiSelectCollection.each(function(model) {
                if (model.get('selected') !== model.get('preSelected')) {
                    isDisabled = false;
                    return false;
                }
            });
            this.ui.save.trigger('control:disabled', isDisabled);
        },

        /**
         * The top region of the form, with the label and instructions
         * @return {{control: string, template: *}}
         */
        createLabelArea: function createLabelArea() {
            return {
                control: 'container',
                template: topTemplate
            };
        },

        /**
         * The multi-select region of the form, in the center.
         * @return {{control: string, name: string, label: string, required: boolean, attributeMapping: {id: string, label: string, value: string}, collection: *, detailsPopoverOptions: {options: {placement: string}, items: [*]}}}
         */
        createMultiSelect: function createMultiSelect() {
            return {
                control: 'multiselectSideBySide',
                name: 'multi-select-label',
                label: 'Permission Sets',
                required: true,
                attributeMapping: {
                    id: 'uid',
                    label: 'label',
                    value: 'selected'
                },
                collection: this.multiSelectCollection,
                detailsPopoverOptions: {
                    options: {
                        placement: 'auto left'
                    },
                    items: [{
                        control: 'container',
                        template: detailsTemplate
                    }]
                }
            };
        },

        /**
         * The Cancel and Save buttons on the bottom of the form.
         * @return {{control: string, extraClasses: string, items: [*,*]}}
         */
        createFooter: function createFooter() {
            return {
                control: 'container',
                extraClasses: 'modal-footer',
                items: [{
                    control: 'button',
                    id: 'assign-permissions-cancel',
                    type: 'button',
                    label: 'Cancel',
                    extraClasses: ['btn-default', 'right-margin-sm']
                }, {
                    control: 'button',
                    type: 'submit',
                    label: 'Save',
                    id: 'assign-permissions-save',
                    extraClasses: ['btn-default'],
                    disabled: true
                }]
            };
        },

        /**
         * Unbinds the events from the cloned collection to prevent leaks.
         */
        onBeforeDestroy: function onBeforeDestroy() {
            this.unbindEntityEvents(this.multiSelectCollection, this.permissionSetEvents);
        }
    });


    /**
     * @param {Backbone.Model} model The permissions model
     * @param {Backbone.Collection} The permission sets collection
     * @return {*} The Workflow options.
     */
    return function BuildWorkFlow(model, collection) {
        return {
            size: 'large',
            title: 'Assign Permission Sets',
            showProgress: false,
            backdrop: 'static',
            steps: [{
                view: Form.extend({
                    permissionSets: collection
                }),
                viewModel: model.clone()
            }]
        };
    };
});