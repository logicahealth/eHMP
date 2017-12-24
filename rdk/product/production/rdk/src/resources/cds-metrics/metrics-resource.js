'use strict';

var metrics = require('./metrics');

var interceptors = {
    audit: true,
    authentication: true,
    operationalDataCheck: false,
    synchronize: false
};

exports.getResourceConfig = function(app) {

    return [{
            name: 'cds-metrics-cds-metric-search',
            path: '/metrics',
            get: metrics.getMetricSearch,
            interceptors: interceptors,
            requiredPermissions: ['read-cds-metric'],
            isPatientCentric: false
        },
        {
            name: 'cds-metrics-cds-dashboard-get',
            path: '/dashboard/:dashboardId',
            get: metrics.getDashBoard,
            interceptors: interceptors,
            requiredPermissions: ['read-cds-metric-dashboard'],
            isPatientCentric: false
        }, {
            name: 'cds-metrics-cds-user-dashboards-get',
            path: '/dashboards/:userIdParam',
            get: metrics.getUserDashBoards,
            interceptors: interceptors,
            requiredPermissions: ['read-cds-metric-dashboard'],
            isPatientCentric: false
        },
        {
            name: 'cds-metrics-cds-metric-definitions-get',
            path: '/definitions',
            get: metrics.getMetricDefinitions,
            interceptors: interceptors,
            requiredPermissions: ['read-cds-metric-definition'],
            isPatientCentric: false
        }, {
            name: 'cds-metrics-cds-metric-definitions-post',
            path: '/definitions',
            post: metrics.createMetricDefinitions,
            interceptors: interceptors,
            requiredPermissions: ['manage-cds-metric-definition'],
            isPatientCentric: false
        }, {
            name: 'cds-metrics-cds-metric-definitions-delete',
            path: '/definitions/:definitionId',
            delete: metrics.deleteMetricDefinition,
            interceptors: interceptors,
            requiredPermissions: ['manage-cds-metric-definition'],
            isPatientCentric: false
        },
        {
            name: 'cds-metrics-cds-metric-groups-get',
            path: '/groups',
            get: metrics.getMetricGroups,
            interceptors: interceptors,
            requiredPermissions: ['read-cds-metric-group'],
            isPatientCentric: false
        }, {
            name: 'cds-metrics-cds-metric-groups-post',
            path: '/groups',
            post: metrics.createMetricGroup,
            interceptors: interceptors,
            requiredPermissions: ['manage-cds-metrics-group'],
            isPatientCentric: false
        }, {
            name: 'cds-metrics-cds-metric-groups-put',
            path: '/groups',
            put: metrics.updateMetricGroup,
            interceptors: interceptors,
            requiredPermissions: ['manage-cds-metric-group'],
            isPatientCentric: false
        }, {
            name: 'cds-metrics-cds-metric-groups-delete',
            path: '/groups/:metricGroupId',
            delete: metrics.deleteMetricGroup,
            interceptors: interceptors,
            requiredPermissions: ['manage-cds-metric-group'],
            isPatientCentric: false
        },
        // Per Darren Maglidt, commenting out roles' endpoint registration until they're fully implemented.
        //{
        //    name: 'cds-metrics-cds-roles-get',
        //    path: '/roles',
        //    get: metrics.getRoles,
        //    interceptors: interceptors,
        //    requiredPermissions: [],
        //    isPatientCentric: false
        //}, {
        //    name: 'cds-metrics-cds-roles-put',
        //    path: '/roles',
        //    put: metrics.updateRoles,
        //    interceptors: interceptors,
        //    requiredPermissions: [],
        //    isPatientCentric: false
        //},
        //{
        //    name: 'cds-metrics-cds-user-roles-get',
        //    path: '/userRoles',
        //    get: metrics.getUserRoles,
        //    interceptors: interceptors,
        //    requiredPermissions: [],
        //    isPatientCentric: false
        //}, {
        //    name: 'cds-metrics-cds-user-roles-put',
        //    path: '/userRoles',
        //    put: metrics.updateUserRoles,
        //    interceptors: interceptors,
        //    requiredPermissions: [],
        //    isPatientCentric: false
        //},
        {
            name: 'cds-metrics-cds-dashboard-post',
            path: '/dashboard',
            post: metrics.createDashboard,
            interceptors: interceptors,
            requiredPermissions: ['manage-cds-metric-dashboard'],
            isPatientCentric: false
        }, {
            name: 'cds-metrics-cds-dashboard-delete',
            path: '/dashboard/:dashboardId',
            delete: metrics.deleteDashboard,
            interceptors: interceptors,
            requiredPermissions: ['manage-cds-metric-dashboard'],
            isPatientCentric: false
        }, {
            name: 'cds-metrics-cds-dashboard-put',
            path: '/dashboard/:dashboardId',
            put: metrics.updateDashboard,
            interceptors: interceptors,
            requiredPermissions: ['manage-cds-metric-dashboard'],
            isPatientCentric: false
        }
    ];
};
