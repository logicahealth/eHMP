define(function() {
    'use strict';

    var context = {
        id: 'logon',
        routeName: 'logon',
        userRequired: false,
        getRoute: function(workspaceId, contextId){
            return contextId;
        },
        defaultScreen: 'logon-screen',
        enter: function () {
        },
        exit: function () {
        },
        navigateTo: function(workspaceId) {
            if (ADK.UserService.checkUserSession()) {
                return {
                    workspaceId: ADK.WorkspaceContextRepository.userDefaultScreen
                };
            }
            ADK.UserService.clearUserSession(false);
            return {
                workspaceId: workspaceId
            };
        }
    };

    return context;
});