'use strict';
var rdk = require('../../core/rdk');
var notificationsOperations = require('./notifications-operations-resource');

function getResourceConfig() {
    return [{
        name: 'notifications-patient-list',
        path: 'patient/:patientId/list',
        get: notificationsOperations.getPatientNotificationsList,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        isPatientCentric: false,
        description: 'Get the list of notifications for the given patient id',
        subsystems: []
    }, {
        name: 'notifications-staff-growler-list',
        path: 'staff/:userId/growler',
        get: notificationsOperations.getNotificationsGrowlerList,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        isPatientCentric: false,
        description: 'Get the list of notifications for the growler',
        subsystems: []
    }, {
        name: 'notifications-staff-list',
        path: 'staff/:userId/list',
        get: notificationsOperations.getStaffNotificationsList,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        isPatientCentric: false,
        description: 'Get the list of notifications for the given user id',
        subsystems: []
    }, {
        name: 'notifications-staff-indicator-list',
        path: 'staff/:userId/indicator/list',
        get: notificationsOperations.getStaffNotificationsIndicatorList,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        isPatientCentric: false,
        description: 'Gets the list for global notification list based on the given user id',
        subsystems: []
    }, {
        name: 'notifications-staff-indicator-summary',
        path: 'staff/:userId/indicator/summary',
        get: notificationsOperations.getStaffNotificationsIndicatorSummary,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        isPatientCentric: false,
        description: 'Gets the count for global notification list based on the given user id',
        subsystems: []
    },{
        name: 'notifications-create',
        path: '',
        post: notificationsOperations.postNotification,
        interceptors: {
            jdsFilter: false,
            operationalDataCheck: false,
            synchronize: false,
            validateRequestParameters: true
        },
        requiredPermissions: [],
        isPatientCentric: false,
        description: 'Create a notification',
        subsystems: []
    }, {
        name: 'notifications-update-by-id',
        path: 'id/:notificationId/resolved',
        post: notificationsOperations.resolveNotificationById,
        interceptors: {
            jdsFilter: false,
            operationalDataCheck: false,
            synchronize: false,
            validateRequestParameters: true
        },
        requiredPermissions: [],
        isPatientCentric: false,
        description: 'Resolve a notification by id',
        subsystems: []
    }, {
        name: 'notifications-update-by-ref-id',
        path: 'reference-id/:referenceId/resolved',
        post: notificationsOperations.resolveNotificationsByRefId,
        interceptors: {
            jdsFilter: false,
            operationalDataCheck: false,
            synchronize: false,
            validateRequestParameters: true
        },
        requiredPermissions: [],
        isPatientCentric: false,
        description: 'Resolve notifications by reference id',
        subsystems: []
    }, {
        name: 'notifications-by-ref-id',
        path: 'reference-id/:referenceId/list',
        get: notificationsOperations.getNotificationsByRefId,
        interceptors: {
            jdsFilter: false,
            operationalDataCheck: false,
            synchronize: false,
            validateRequestParameters: true
        },
        requiredPermissions: [],
        isPatientCentric: false,
        description: 'Get the list of notifications for the given reference id',
        subsystems: []
    }];
}

module.exports.getResourceConfig = getResourceConfig;
