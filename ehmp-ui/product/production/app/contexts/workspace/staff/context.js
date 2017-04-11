define([
    'underscore',
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'app/contexts/workspace/staff/layout'
], function(
    _,
    Backbone,
    Marionette,
    $,
    Handlebars,
    Layout
) {
    'use strict';

    var context = {
        id: 'staff',
        routeName: 'staff',
        defaultScreen: 'provider-centric-view',
        userRequired: true,
        layout: function(workspaceModel) {
            return Layout;
        },
        enter: function() {},
        exit: function() {},
        navigateTo: function(workspaceId) {
            var changeContext = function() {
                return {
                    workspaceId: ADK.WorkspaceContextRepository.appDefaultScreen
                };
            };
            if (ADK.UserService.checkUserSession()) {
                var getContext = function() {
                    if (_.isEqual(ADK.WorkspaceContextRepository.userDefaultContext.get('id'), 'staff')) {
                        return changeContext();
                    }
                    return {
                        workspaceId: ADK.WorkspaceContextRepository.userDefaultScreen
                    };
                };
                if (ADK.UserService.hasPermissions(ADK.WorkspaceContextRepository.getWorkspacePermissions(workspaceId))) {
                    return {
                        workspaceId: workspaceId
                    };
                } else {
                    if (_.isEqual(workspaceId, 'provider-centric-view')) {
                        return getContext();
                    }
                    return {
                        workspaceId: 'provider-centric-view'
                    };
                }
            } else {
                return changeContext();
            }
        }
    };

    return context;
});