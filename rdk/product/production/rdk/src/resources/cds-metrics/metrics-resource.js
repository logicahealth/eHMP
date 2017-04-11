'use strict';

var cdsMetrics = require('./metrics');

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
            get: require('./metrics').getMetricSearch,
            interceptors: interceptors,
            requiredPermissions: ['read-cds-metric'],
            isPatientCentric: false
        },
        {
            name: 'cds-metrics-cds-dashboard-get',
            path: '/dashboard/:dashboardId',
            get: require('./metrics').getDashBoard,
            interceptors: interceptors,
            requiredPermissions: ['read-cds-metric-dashboard'],
            isPatientCentric: false
        }, {
            name: 'cds-metrics-cds-user-dashboards-get',
            path: '/dashboards/:userIdParam',
            get: require('./metrics').getUserDashBoards,
            interceptors: interceptors,
            requiredPermissions: ['read-cds-metric-dashboard'],
            isPatientCentric: false
        },
        {
            name: 'cds-metrics-cds-metric-definitions-get',
            path: '/definitions',
            get: require('./metrics').getMetricDefinitions,
            interceptors: interceptors,
            requiredPermissions: ['read-cds-metric-definition'],
            isPatientCentric: false
        }, {
            name: 'cds-metrics-cds-metric-definitions-post',
            path: '/definitions',
            post: require('./metrics').createMetricDefinitions,
            interceptors: interceptors,
            requiredPermissions: ['manage-cds-metric-definition'],
            isPatientCentric: false
        }, {
            name: 'cds-metrics-cds-metric-definitions-delete',
            path: '/definitions/:definitionId',
            delete: require('./metrics').deleteMetricDefinition,
            interceptors: interceptors,
            requiredPermissions: ['manage-cds-metric-definition'],
            isPatientCentric: false
        },
        {
            name: 'cds-metrics-cds-metric-groups-get',
            path: '/groups',
            get: require('./metrics').getMetricGroups,
            interceptors: interceptors,
            requiredPermissions: ['read-cds-metric-group'],
            isPatientCentric: false
        }, {
            name: 'cds-metrics-cds-metric-groups-post',
            path: '/groups',
            post: require('./metrics').createMetricGroup,
            interceptors: interceptors,
            requiredPermissions: ['manage-cds-metrics-group'],
            isPatientCentric: false
        }, {
            name: 'cds-metrics-cds-metric-groups-put',
            path: '/groups',
            put: require('./metrics').updateMetricGroup,
            interceptors: interceptors,
            requiredPermissions: ['manage-cds-metric-group'],
            isPatientCentric: false
        }, {
            name: 'cds-metrics-cds-metric-groups-delete',
            path: '/groups/:metricGroupId',
            delete: require('./metrics').deleteMetricGroup,
            interceptors: interceptors,
            requiredPermissions: ['manage-cds-metric-group'],
            isPatientCentric: false
        },
        // Per Darren Maglidt, commenting out roles' endpoint registration until they're fully implemented.
        //{
        //    name: 'cds-metrics-cds-roles-get',
        //    path: '/roles',
        //    get: require('./metrics').getRoles,
        //    interceptors: interceptors,
        //    requiredPermissions: [],
        //    isPatientCentric: false
        //}, {
        //    name: 'cds-metrics-cds-roles-put',
        //    path: '/roles',
        //    put: require('./metrics').updateRoles,
        //    interceptors: interceptors,
        //    requiredPermissions: [],
        //    isPatientCentric: false
        //},
        //{
        //    name: 'cds-metrics-cds-user-roles-get',
        //    path: '/userRoles',
        //    get: require('./metrics').getUserRoles,
        //    interceptors: interceptors,
        //    requiredPermissions: [],
        //    isPatientCentric: false
        //}, {
        //    name: 'cds-metrics-cds-user-roles-put',
        //    path: '/userRoles',
        //    put: require('./metrics').updateUserRoles,
        //    interceptors: interceptors,
        //    requiredPermissions: [],
        //    isPatientCentric: false
        //},
        {
            name: 'cds-metrics-cds-dashboard-post',
            path: '/dashboard',
            post: require('./metrics').createDashboard,
            interceptors: interceptors,
            requiredPermissions: ['manage-cds-metric-dashboard'],
            isPatientCentric: false
        }, {
            name: 'cds-metrics-cds-dashboard-delete',
            path: '/dashboard/:dashboardId',
            delete: require('./metrics').deleteDashboard,
            interceptors: interceptors,
            requiredPermissions: ['manage-cds-metric-dashboard'],
            isPatientCentric: false
        }, {
            name: 'cds-metrics-cds-dashboard-put',
            path: '/dashboard/:dashboardId',
            put: require('./metrics').updateDashboard,
            interceptors: interceptors,
            requiredPermissions: ['manage-cds-metric-dashboard'],
            isPatientCentric: false
        }
    ];
};
