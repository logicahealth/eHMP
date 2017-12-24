/* globals ADK */
define([
    'backbone',
    'marionette',
    'app/applets/permission_sets/workflows/permission-sets-deprecate-loading',
    'hbs!app/applets/permission_sets/templates/deprecate'
], function(Backbone, Marionette, LoadingView, template) {
    'use strict';


    var CANCEL_BUTTON = 'permission-sets-deprecate-cancel';
    var DEPRECATE_BUTTON = 'permissions-sets-deprecate-accept';


    /**
     * Permission Sets Deprecate
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
            versions: '.control.deprecateVersion',
            deprecate: '#' + DEPRECATE_BUTTON,
            cancel: '#' + CANCEL_BUTTON
        },
        events: {
            'click @ui.cancel': 'onCancel',
            'submit': 'onSubmit'
        },

        onInitialize: function onInitialize() {
            this.fields.push(this.createBodyField(this.versions));
            this.fields.push(this.createFooterField());
            this.listenToOnce(this.workflow.model, 'change:currentIndex', this.onStep);
        },

        /**
         * Not a standard function, called when workflow step changes
         * Fills in version select field
         */
        onStep: function onStep() {
            this.ui.versions.trigger('control:picklist:set', [this.versions.toJSON()]);
        },

        /**
         * Called when the cancel button is pressed
         */
        onCancel: function onCancel() {
            ADK.UI.Workflow.hide();
        },

        /**
         * Called when the submit button is pressed
         * @param event
         */
        onSubmit: function onSubmit(event) {
            event.preventDefault();
            event.stopImmediatePropagation();

            var version = this.model.get('deprecateVersion');

            this.listenToOnce(this.model, 'deprecate:success', this.onSuccess);
            this.listenToOnce(this.model, 'deprecate:error', this.onError);
            this.model.deprecate(version);
        },

        /**
         * Called on a successful write back
         */
        onSuccess: function onSuccess() {
            this.stopListening(this.model, 'deprecate:error');
            this.originalModel.set(this.model.attributes);
            this.sharedSets.trigger('deprecate:success', this.model);
            var success = new ADK.UI.Notification({
                title: 'Success',
                message: 'Permission set successfully deprecated',
                type: 'success'
            });
            success.show();
            ADK.UI.Workflow.hide();
        },

        /**
         * Called on a failed writeback
         */
        onError: function onError() {
            this.stopListening(this.model, 'deprecate:success');
            var error = new ADK.UI.Notification({
                title: 'Error',
                message: 'Failed to Deprecate Permission Set',
                type: 'danger',
                autoClose: false
            });
            error.show();
        },

        createBodyField: function createBodyField() {
            return {
                control: 'container',
                extraClasses: ['modal-body', 'all-padding-md'],
                template: template,
                items: [{
                    control: 'select',
                    required: true,
                    extraClasses: ['row', 'col-xs-6', 'permission-sets-picklist'],
                    name: 'deprecateVersion',
                    label: 'eHMP Version',
                    emptyDefault: false
                }]
            };
        },

        createFooterField: function createFooterField() {
            return {
                control: 'container',
                extraClasses: 'modal-footer',
                items: [{
                    control: 'button',
                    id: CANCEL_BUTTON,
                    type: 'button',
                    label: 'Cancel',
                    extraClasses: ['btn-default', 'right-margin-sm']
                }, {
                    control: 'button',
                    type: 'submit',
                    label: 'Deprecate',
                    id: DEPRECATE_BUTTON,
                    extraClasses: ['btn-default']
                }]
            };
        }
    });


    /**
     * Factory method to create to workflow options of the deprecate form
     * @param {Model} model
     * @param {Collection} versions
     * @return {*}
     */
    return function BuildWorkFlow(model, originalModel, sharedSets) {
        var versions = new ADK.UIResources.Fetch.Permission.Versions();
        return {
            size: 'medium',
            title: 'Deprecate Permission Set',
            showProgress: false,
            backdrop: 'static',
            steps: [{
                view: LoadingView.extend({
                    versions: versions
                }),
                viewModel: model
            }, {
                view: Form.extend({
                    versions: versions,
                    originalModel: originalModel,
                    sharedSets: sharedSets
                }),
                viewModel: model
            }]
        };
    };
});