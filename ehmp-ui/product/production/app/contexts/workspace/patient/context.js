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
        searchScreen: 'patient-search-screen',
        userRequired: true,
        enter: function () {
        },
        exit: function () {
        },
        layout: function(workspaceModel) {
            if(workspaceModel.get('id') === 'patient-search-screen'){
                return null;
            }
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
                    if (!_.isEqual(workspaceId, 'patient-search-screen') && _.isEmpty(ADK.PatientRecordService.getCurrentPatient().attributes)) {
                        return {
                            workspaceId: 'patient-search-screen'
                        };
                    } else {
                        if (_.isEqual(workspaceId, 'patient-search-screen') || ADK.UserService.hasPermissions(ADK.WorkspaceContextRepository.getWorkspacePermissions(workspaceId))) {
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