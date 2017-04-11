define([
    'underscore',
    'backbone',
    'app/contexts/workspace/logon/context',
    'app/contexts/workspace/admin/context',
    'app/contexts/workspace/patient/context',
    'app/contexts/workspace/staff/context'
], function(
    _,
    Backbone,
    logonContext,
    adminContext,
    patientContext,
    providerContext) {
    'use strict';

    var ContextModel = Backbone.Model.extend({
        initialize: function(options) {
            this.set('originalDefaultScreen', options.defaultScreen);
        }
    });

    var ContextCollection = Backbone.Collection.extend({
        model: ContextModel
    });

    var workspaceContext = {
        id: 'workspace',
        appDefaultContext: 'logon',
        contexts: new ContextCollection()
    };

    _.each([logonContext, adminContext, patientContext, providerContext], function(context) {
        workspaceContext.contexts.add(context);
    });

    // Load the demo context dynamically to aviod require errors causing application load issues
    // when the demo context is exculded from the build.
    require(['app/contexts/workspace/demo/context'], function(DemoContext) {
        workspaceContext.contexts.add(DemoContext);
    }, function(error) {
        console.warn("The demo environment is not supported in this build!");
    });

    function hasPermissions(requiredPermissions) {
        var missingPermission = _.find(requiredPermissions, function(permission) {
            var isThisPermissionMissing = !ADK.UserService.hasPermission(permission);
            return isThisPermissionMissing;
        });

        return _.isEmpty(missingPermission);
    }

    Object.defineProperty(workspaceContext, 'userDefaultContext', {
        get: function() {
            return providerContext.id;
        }
    });

    return workspaceContext;
});