define([
    'handlebars',
    'app/contexts/workspace/admin/layout'
], function(
    Handlebars,
    Layout
) {
    'use strict';

    var context = {
        id: 'admin',
        routeName: 'admin',
        defaultScreen: 'ehmp-administration',
        workspacesRequiredBeforeAppLoad: [],
        userRequired: true,
        layout: function(workspaceModel) {
            return Layout;
        },
        enter: function () {
        },
        exit: function () {
        },
        navigateTo: function(workspaceId) {
            var changeContext = function() {
                return {
                    workspaceId: ADK.WorkspaceContextRepository.appDefaultScreen
                };
            };
            if (ADK.UserService.checkUserSession()) {
                var getContext = function() {
                    if (_.isEqual(ADK.WorkspaceContextRepository.userDefaultContext.get('id'), 'admin')) {
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
                    if (_.isEqual(workspaceId, 'ehmp-administration')) {
                        return getContext();
                    }
                    return {
                        workspaceId: 'ehmp-administration'
                    };
                }
            } else {
                return changeContext();
            }
        }
    };

    return context;
});