define([], function() {
    "use strict";

    var taskListView;

    var eventHandler = {
        completeTask: function(e, parentView, listView) {
            taskListView = listView;
            var self = this;
            var taskModel = this.taskModel;

            var fetchOptions = {
                resourceTitle: 'tasks-update',
                fetchType: 'POST',
                criteria: {
                    deploymentId: taskModel.get('DEPLOYMENTID'),
                    taskid: taskModel.get('TASKID')
                }
            };
            var buttonClicked = null;

            switch (e.currentTarget.getAttribute('id')) {
                case 'modal-save-button':
                    fetchOptions.criteria.state = 'complete';
                    fetchOptions.criteria.parameter = {};

                    var formModel = this.model;
                    // Notifications will not have a formModel
                    if (formModel) {
                        // Populate the fetchOptions parameters from the user form
                        _.each(formModel.attributes, function(attribute, key) {
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
                        ADK.UI.Workflow.hide();
                        break;
                    case 'complete':
                        self.taskModel.set('status', 'Complete');
                        ADK.UI.Workflow.hide();
                        taskListView.refresh();
                        break;
                }

            };

            ADK.ResourceService.fetchCollection(fetchOptions);
        },
        claimAndCompleteTask: function(e, modalFooterView) {
            var parentView = null;
            var model = this.model;
            var self = this;

            var fetchOptions = {
                resourceTitle: 'tasks-update',
                fetchType: 'POST',
                criteria: {
                    deploymentId: model.get('DEPLOYMENTID'),
                    taskid: model.get('TASKID')
                }
            };

            // Set the state of the task to InProgress
            fetchOptions.criteria.state = 'start';

            // On successfuly starting the task, complete it
            fetchOptions.onSuccess = function(collection, response) {
                self.completeTask.call(modalFooterView, e, parentView, self.taskListView);
            };

            ADK.ResourceService.fetchCollection(fetchOptions);
        },
        fireCloseEvent: function(e) {
            var TrayView = ADK.Messaging.request("tray:writeback:actions:trayView");
            if (TrayView) {
                TrayView.$el.trigger('tray.reset');
                TrayView.$el.trigger('tray.loaderHide');
            }
            ADK.UI.Workflow.hide() ;
        }
    };

    return eventHandler;
});
