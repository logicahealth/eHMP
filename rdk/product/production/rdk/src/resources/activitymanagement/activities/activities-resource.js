'use strict';
var activities = require('./activities-operations-resource');
var allInstances = require('./all-instances-resource');
var singleInstance = require('./single-instance');
var activityEventProcess = require('./eventprocessor/activity-event-process-resource');

function getResourceConfig() {
    return [{
        name: 'activities-available',
        path: '',
        get: activities.getActivities,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ["read-task"],
        isPatientCentric: false,
        description: 'get available activity definitions',
        subsystems: ['jbpm']
    }, {
        name: 'activities-instances-available',
        path: 'instances',
        get: allInstances.getActivityInstances,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ["read-task"],
        isPatientCentric: false,
        description: 'get available activity instances',
        subsystems: ['jbpm']
    }, {
        name: 'activities-single-instance',
        path: 'singleInstance',
        get: singleInstance.get,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ["read-task"],
        isPatientCentric: false,
        description: 'get single activity instances',
        subsystems: ['jbpm']
    }, {
        name: 'activities-start',
        path: 'start',
        post: activities.startProcess,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ["add-task"],
        isPatientCentric: false,
        description: 'Start a process instance',
        subsystems: ['jbpm']
    }, {
        name: 'activities-abort',
        path: 'abort',
        post: activities.abortProcess,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ["edit-task"],
        isPatientCentric: false,
        description: 'Aborts a process instance',
        subsystems: ['jbpm']
    }, {
        name: 'activities-startevent',
        path: 'startactivityevent',
        post: activityEventProcess.startActivityEvent,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ["read-task"],
        isPatientCentric: false,
        description: 'created the activity instance',
        subsystems: ['jbpm']
    }, {
        name: 'activities-signal',
        path: 'signal',
        post: activities.sendSignal,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ["edit-task"],
        isPatientCentric: false,
        description: 'Sends signal to activity instance/deployment',
        subsystems: ['jbpm']
    }, {
        name: 'activities-cds-intent-service',
        path: 'cds-intent-service',
        post: activities.getCdsIntentResults,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ["read-task"],
        isPatientCentric: false,
        description: 'Get results from CDS Results Service',
        subsystems: []
    }, {
        name: 'activity-instance-byid',
        path: 'activity-instance',
        post: activities.getJbpmInstanceByInstanceId,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ["read-task"],
        isPatientCentric: false,
        description: 'Get jbpm instance by instance Id',
        subsystems: []
    }];
}

module.exports.getResourceConfig = getResourceConfig;
