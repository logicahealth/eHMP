define([
    'backbone',
    'app/applets/permission_sets/workflows/permission-sets-create-loading',
    'app/applets/permission_sets/workflows/permission-sets-create-step1',
    'app/applets/permission_sets/workflows/permission-sets-create-step2',
    'app/applets/permission_sets/workflows/permission-sets-create-step3'
], function(Backbone, LoadingView, DataForm, QuickFillForm, FinalizeForm) {
    'use strict';

    /**
     * Factory method for creating the workflow options of a the create form
     * @param {Model} sharedModel
     * @return {*}
     */
    return function createWorkFlow(sharedModel) {
        var Permission = ADK.UIResources.Fetch.Permission;
        var model = new Permission.PermissionSetModel();
        var versions = new Permission.Versions();
        var categories = new Permission.Categories();
        var features = new Permission.FeaturesCollection();
        var permissionSets = sharedModel.get('permissionSets');
        var permissions = sharedModel.get('permissions');
        var sets = new Permission.SetsCollection();
        var individual = new Permission.IndividualCollection();


        return {
            size: 'large',
            title: 'Create Permission Set',
            showProgress: false,
            backdrop: 'static',
            steps: [{
                view: LoadingView.extend({
                    versions: versions,
                    categories: categories,
                    features: features,
                    permissions: individual,
                    permissionSets: sets,
                    _permissions: permissions,
                    _permissionSets: permissionSets
                }),
                viewModel: model
            }, {
                view: DataForm.extend({
                    versions: versions,
                    categories: categories,
                    permissionSets: sets,
                    _permissionSets: permissionSets
                }),
                viewModel: model
            }, {
                view: QuickFillForm.extend({
                    permissionSets: sets,
                    features: features
                }),
                viewModel: model
            }, {
                view: FinalizeForm.extend({
                    permissionSets: sets,
                    features: features,
                    permissions: individual,
                    sharedSets: permissionSets
                }),
                viewModel: model
            }]
        };
    };
});