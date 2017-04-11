'use strict';
var rdk = require('../../core/rdk');
var taskOperations = require('./task-operations-resource');
var process = require('./process-resource');
var activityEventProcess = require('./activity-event-process-resource');

function getResourceConfig() {
    return [{
        name: 'tasks-tasks',
        path: '',
        get: taskOperations.getTasks,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['read-task'],
        isPatientCentric: false,
        description: 'Get a list of tasks for the current provider',
        subsystems: ['jbpm']
    }, {
        name: 'tasks-tasks',
        path: '',
        post: taskOperations.queryTasks,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        isPatientCentric: false,
        description: 'Get a list of tasks based on given context',
        subsystems: ['jbpm']
    }, {
        name: 'tasks-taskstatuslist',
        path: 'taskstatuslist',
        get: taskOperations.getTaskStatusList,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        isPatientCentric: false,
        description: 'Get list of task statuses',
        subsystems: ['jbpm']
    }, {
        name: 'tasks-processstatuslist',
        path: 'processstatuslist',
        get: process.getProcessStatusList,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        isPatientCentric: false,
        description: 'Get list of process statuses',
        subsystems: ['jbpm']
    }, {
        name: 'tasks-tasksbypatient', //todo this should change to tasksbyparameter
        path: 'tasksbypatient',
        get: taskOperations.getTasksByParameter,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        isPatientCentric: false,
        description: 'Get a list of tasks based on a set of parameters',
        subsystems: ['jbpm']
    }, {
        name: 'tasks-changestate',
        path: 'changestate',
        post: taskOperations.changeTaskState,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        isPatientCentric: false,
        description: 'Change given task state',
        subsystems: ['jbpm']
    }, {
        name: 'tasks-startprocess',
        path: 'startprocess',
        post: process.startProcess,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        isPatientCentric: false,
        description: 'Start a process instance',
        subsystems: ['jbpm']
    }, {
        name: 'tasks-abortprocess',
        path: 'abortprocess',
        post: process.abortProcess,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        isPatientCentric: false,
        description: 'Aborts a process instance',
        subsystems: ['jbpm']
    }, {
        name: 'tasks-getprocessdefinitions',
        path: 'getprocessdefinitions',
        get: process.getProcessDefinitions,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        isPatientCentric: false,
        description: 'get available process definitions',
        subsystems: ['jbpm']
    }, {
        name: 'tasks-getcurrenttask',
        path: 'getcurrenttask',
        post: taskOperations.getCurrentTask,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['read-task'],
        isPatientCentric: false,
        description: 'Returns the current task for that activity, including: taskID, taskType (Human or System), and task state.',
        subsystems: ['jbpm']
    }, {
        name: 'tasks-gettask',
        path: 'gettask',
        get: taskOperations.getTask,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['read-task'],
        isPatientCentric: false,
        description: 'Returns all the details of task with given id, including: taskID, taskType (Human or System), and task state etc.',
        subsystems: ['jbpm']
    }, {
        name: 'tasks-getactivitydefinitionsbyquery',
        path: 'getactivitydefinitionsbyquery',
        get: process.getActivityDefinitionsByQuery,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        isPatientCentric: false,
        description: 'get a list of activities that could be paired with a given action in ehmp',
        subsystems: ['jbpm']
    }, {
        name: 'tasks-startActivityEvent',
        path: 'startactivityevent',
        post: activityEventProcess.startActivityEvent,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        isPatientCentric: false,
        description: 'created the activity instance',
        subsystems: ['jbpm']
    }];
}

module.exports.getResourceConfig = getResourceConfig;
