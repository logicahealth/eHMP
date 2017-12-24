define([
    'backbone',
    'underscore',
    'moment',
    'app/applets/action/tray/tasks/resource'
], function(Backbone, _, moment, TaskResource) {
    'use strict';

    // ============================== Constants ===============================
    var TASK_ATTRIBUTES = ['taskId', 'taskName', 'taskDefinitionId', 'description', 'pastDueDate', 'isDue', 'isPastDue', 'priority', 'priorityText', 'navigation', 'instanceName', 'permission', 'hasPermissions', 'beforeEarliestDate'];
    var COMPARATOR_ATTRIBUTES = ['priority', 'pastDueDate'];

    // ============================== Utilities ===============================
    var taskComparator = function(modelA, modelB) {
        var taskA = modelA.pick(COMPARATOR_ATTRIBUTES);
        var taskB = modelB.pick(COMPARATOR_ATTRIBUTES);

        if (taskA.priority !== taskB.priority) {
            return (taskA.priority < taskB.priority ? -1 : 1);
        }
        if (moment(taskA.pastDueDate).isSame(taskB.pastDueDate, 'day')) {
            return 0;
        }
        return (moment(taskA.pastDueDate).isBefore(taskB.pastDueDate, 'day') ? -1 : 1);
    };

    var getTaskStatus = function(item) {
        return (item.isPastDue ? 'Past Due' : (item.isDue ? 'Due' : ''));
    };

    var getTaskItemLabel = function(item) {
        var taskName = item.taskName || '';
        var instanceName = item.instanceName || '';
        var itemLabel = _.trim((taskName + ' - ' + instanceName), ' -');
        return (!_.isEmpty(itemLabel) ? itemLabel : 'Unknown Task');
    };

    var isTaskDue = function(task) {
        return (task.isDue || task.isPastDue || task.beforeEarliestDate);
    };

    var addToTasksGroupCollection = function(collection) {
        var taskGroupCollection = collection.map(function(model) {
            var item = model.pick(TASK_ATTRIBUTES);
            return _.extend(item, {
                itemUid: item.taskId,
                itemLabel: getTaskItemLabel(item),
                itemStatus: getTaskStatus(item),
                isTask: true
            });
        });
        taskGroupCollection = _.filter(taskGroupCollection, function(task) {
            return (isTaskDue(task) && task.hasPermissions);
        });

        this.collection.add({
            id: 'task_items',
            groupId: 'task_items',
            groupLabel: 'My Tasks (' + taskGroupCollection.length + ')',
            items: new Backbone.Collection(taskGroupCollection, {
                comparator: taskComparator
            })
        });
    };

    var handleTasksRequestError = function() {
        throw new Error('An error occurred while retrieving your current tasks.');
    };

    // ======================== Action Tray Task Utils ========================
    return {
        initialize: function() {
            this.tasksResource = new TaskResource();
            this.listenTo(this.tasksResource, 'fetch:success', addToTasksGroupCollection);
            this.listenTo(this.tasksResource, 'fetch:error', handleTasksRequestError);
            this.tasksResource.fetch();

            this.listenTo(ADK.Messaging.getChannel('tray-tasks'), 'action:refresh', function() {
                this.collection.remove('task_items', {
                    silent: true
                });
                this.tasksResource.fetch();
            });
        }
    };
});
