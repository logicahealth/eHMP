define([
    'underscore',
    'backbone',
    'marionette',
    'jquery',
    'app/contexts/workspace/patient/layout'
], function(
    _,
    Backbone,
    Marionette,
    $,
    Layout
) {
    'use strict';

    var context = {
        id: 'patient',
        routeName: 'patient',
        defaultScreen: 'summary',
        requiredPermissions: ['read-patient-record'],
        userRequired: true,
        enter: function () {
        },
        exit: function () {
        },
        layout: function(workspaceModel) {
            return Layout;
        },
        navigateTo: function(workspaceId) {
            var changeContext = function() {
                return {
                    workspaceId: ADK.WorkspaceContextRepository.appDefaultScreen
                };
            };
            if (ADK.UserService.checkUserSession()) {
                var getContext = function() {
                    if (_.isEqual(ADK.WorkspaceContextRepository.userDefaultContext.get('id'), 'patient')) {
                        return changeContext();
                    }
                    return {
                        workspaceId: ADK.WorkspaceContextRepository.userDefaultScreen
                    };
                };
                if (ADK.UserService.hasPermissions(['read-patient-record'])) {
                    if (_.isEmpty(ADK.PatientRecordService.getCurrentPatient().attributes)) {
                        return changeContext();
                    } else {
                        if (ADK.UserService.hasPermissions(ADK.WorkspaceContextRepository.getWorkspacePermissions(workspaceId))) {
                            return {
                                workspaceId: workspaceId
                            };
                        } else {
                            if (_.isEqual(workspaceId, 'overview')) {
                                return getContext();
                            }
                            return {
                                workspaceId: 'overview'
                            };
                        }
                    }
                } else {
                    return getContext();
                }
            } else {
                return changeContext();
            }

        }
    };

    return context;
});