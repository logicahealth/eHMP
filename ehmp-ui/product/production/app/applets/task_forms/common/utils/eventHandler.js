define([], function() {
    "use strict";

    var taskListView;

    var eventHandler = {
        unclaimTask: function(e, parentView) {
            // TODO: keep or remove function?
            //
            // NOTE: This code is needed if it is decided that a task is 'claimed'
            //  when it is clicked in the todo's applet, and 'released' when the 
            //  close button is clicked
            // var taskModel = parentView.model;

            // fetchOptions = {
            //     resourceTitle: 'tasks-changestate',
            //     fetchType: 'POST',
            //     criteria: {
            //         deploymentid: taskModel.get('deploymentId'),
            //         taskid: taskModel.get('taskId'),
            //         state: 'release'
            //     }
            // }
            // ADK.ResourceService.fetchCollection(fetchOptions);
        },
        completeTask: function(e, parentView, listView) {
            taskListView = listView;
            var self = this;
            var taskModel = parentView.model;

            var fetchOptions = {
                resourceTitle: 'tasks-changestate',
                fetchType: 'POST',
                criteria: {
                    deploymentid: taskModel.get('DEPLOYMENTID'),
                    taskid: taskModel.get('TASKID')
                }
            };
            var buttonClicked = null;

            switch (e.currentTarget.getAttribute('id')) {
                case 'modal-save-button':
                    fetchOptions.criteria.state = 'complete';
                    fetchOptions.criteria.parameter = {};

                    var formModel = this.parentView.formModel;
                    // Notifications will not have a formModel
                    if (formModel) {
                        // Populate the fetchOptions parameters from the user form
                        _.each(this.parentView.formModel.attributes, function(attribute, key) {
                            if (key.indexOf('out_') === 0) {
                                fetchOptions.criteria.parameter[key] = attribute;
                            }
                        });
                    }

                    buttonClicked = 'complete';
                    break;
                case 'modal-cancel-button':
                    buttonClicked = 'cancel';
                    break;
                default:
                    fetchOptions.criteria.state = 'start';
            }

            fetchOptions.onSuccess = function(collection, response) {
                switch (buttonClicked) {
                    case 'cancel':
                        ADK.UI.Modal.hide();
                        break;
                    case 'complete':
                        self.parentView.model.set('status', 'Complete');
                        ADK.UI.Modal.hide();
                        taskListView.refresh();
                        break;
                }

            };

            ADK.ResourceService.fetchCollection(fetchOptions);
        },
        claimAndCompleteTask: function(e, modalFooterView) {
            var parentView = modalFooterView.parentView;
            var model = parentView.model;
            var self = this;

            var fetchOptions = {
                resourceTitle: 'tasks-changestate',
                fetchType: 'POST',
                criteria: {
                    deploymentid: model.get('DEPLOYMENTID'),
                    taskid: model.get('TASKID')
                }
            };

            // Set the state of the task to InProgress
            fetchOptions.criteria.state = 'start';

            // On successfuly starting the task, complete it
            fetchOptions.onSuccess = function(collection, response) {
                self.completeTask.call(modalFooterView, e, parentView, modalFooterView.taskListView);
            };

            ADK.ResourceService.fetchCollection(fetchOptions);
        },
        fireCloseEvent: function(e) {
            ADK.Messaging.getChannel('task_forms').trigger('modal:close');
            ADK.Messaging.trigger('tray.close');
        }
    };

    return eventHandler;
});