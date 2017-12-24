define([
    'backbone',
    'marionette',
    'app/applets/permission_sets/workflows/permission-sets-deprecate',
    'app/applets/permission_sets/workflows/permission-sets-edit',
    'app/applets/permission_sets/workflows/permission-sets-edit-loading',
    'hbs!app/applets/permission_sets/templates/details-footer'
], function(Backbone, Marionette, deprecate, EditForm, LoadingView, template) {
    'use strict';


    /**
     * Permission Sets Modal Details View.
     * Feature: 1285
     *
     * Original Specification: https://wiki.vistacore.us/x/o4igAQ
     */
    return Backbone.Marionette.ItemView.extend({
        template: template,

        behaviors: {
            KeySelect: {}
        },

        ui: {
            deprecate: '.permission-set--deprecate',
            edit: '.permission-set--edit'
        },

        events: {
            'click @ui.deprecate': 'launchDeprecate',
            'click @ui.edit': 'launchEdit'
        },

        modelEvents: {
            'change': 'render'
        },

        /**
         * Checks to see if any of the button need to be disabled
         * @return {*}
         */
        serializeModel: function() {
            var isDeprecated = this.model.isDeprecated();
            var deprecateDisabled = isDeprecated || !ADK.UserService.hasPermission('deprecate-permission-sets');
            var editDisabled = isDeprecated || !ADK.UserService.hasPermission('edit-permission-sets');

            return {
                deprecateDisabled: deprecateDisabled,
                editDisabled: editDisabled
            };
        },

        /**
         * Starts the deprecated workflow
         */
        launchDeprecate: function launchDeprecate() {
            var data = this.model.toJSON();
            var Permission = ADK.UIResources.Fetch.Permission;
            var permissionSets = this.sharedModel.get('permissionSets');
            var originalModel = permissionSets.get(this.model.id);
            var model = new Permission.PermissionSetModel(data);

            var workflowController = new ADK.UI.Workflow(deprecate(model, originalModel, permissionSets));

            workflowController.show();
        },

        /**
         * Starts the edit workflow
         */
        launchEdit: function launchEdit() {
            var Permission = ADK.UIResources.Fetch.Permission;
            var permissions = this.sharedModel.get('permissions');
            var permissionSets = this.sharedModel.get('permissionSets');
            var originalModel = permissionSets.get(this.model.id);

            var individual = new Permission.IndividualCollection();
            var versions = new Permission.Versions();
            var categories = new Permission.Categories();
            var data = this.model.toJSON();
            var model = new Permission.PermissionSetModel(data);

            model.set('setName', model.get('label'));

            var workflowOptions = {
                size: 'large',
                title: 'Edit Permission Sets',
                showProgress: false,
                backdrop: 'static',
                steps: [{
                    view: LoadingView.extend({
                        versions: versions,
                        categories: categories,
                        permissions: individual,
                        _permissions: permissions
                    }),
                    viewModel: model
                }, {
                    view: EditForm.extend({
                        permissions: individual,
                        sharedSets: permissionSets,
                        versions: versions,
                        categories: categories,
                        originalModel: originalModel
                    }),
                    viewModel: model
                }]
            };
            var workflowController = new ADK.UI.Workflow(workflowOptions);
            workflowController.show();
        }
    });
});