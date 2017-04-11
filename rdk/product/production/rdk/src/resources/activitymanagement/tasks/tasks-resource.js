'use strict';
var taskOperations = require('./task-operations-resource');
var consultTaskOperations = require('./consult-tasks-resource');

function getResourceConfig() {
    return [{
        name: 'tasks-tasks',
        path: '',
        post: taskOperations.queryTasks,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['read-task'],
        isPatientCentric: false,
        description: 'Get a list of tasks based on given context',
        subsystems: ['jbpm']
    }, {
        name: 'tasks-byid',
        path: 'byid',
        get: taskOperations.queryTasksbyId,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['read-task'],
        isPatientCentric: false,
        description: 'Get a single task by taskid',
        subsystems: ['jbpm']
    }, {
        name: 'tasks-update',
        path: 'update',
        post: taskOperations.changeTaskState,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['edit-task'],
        isPatientCentric: false,
        description: 'Update a given task state',
        subsystems: ['jbpm']
    }, {
        name: 'tasks-current',
        path: 'current',
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
        path: 'task',
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
        name: 'tasks-openconsults',
        path: 'openconsults',
        get: consultTaskOperations.getOpenConsultTasks,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['read-task'],
        isPatientCentric: false,
        description: 'Returns all the details of tasks of type open consult for a given user, including: taskID, taskType (Human or System), and task state etc.',
        subsystems: ['jbpm']
    }];
}

module.exports.getResourceConfig = getResourceConfig;
