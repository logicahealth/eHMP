define([
    "app/applets/task_forms/common/utils/eventHandler"
], function(EventHandler) {
    "use strict";

    var fetchHelper = function(e, taskModel, state, parameterObj,  onSuccess, formModel) {
        var fetchOptions = {
            resourceTitle: 'tasks-changestate',
            fetchType: 'POST',
            criteria: {
                deploymentid: taskModel.get('DEPLOYMENTID'),
                processDefId: taskModel.get('PROCESSID'),
                taskid: taskModel.get('TASKID'),
                state: state,
                icn: taskModel.get('PATIENTICN'),
                pid: taskModel.get('PATIENTICN'),
                parameter: parameterObj
            },
            onSuccess: onSuccess
        };

        ADK.ResourceService.fetchCollection(fetchOptions);
    };

    // Builds and return the parameter object
    var paramHelper = function(taskModel, formModel, outFormAction) {
        var taskVar = taskModel.get('taskVariables');
        outFormAction = outFormAction || '';

        return {
            out_formAction: outFormAction,
            out_order : {
                objectType:    "consultOrder",
                specialty:     taskVar.specialty,
                condition:     outOrderValueHelper(formModel, taskVar, 'condition'),
                urgency:       outOrderValueHelper(formModel, taskVar, 'urgency'),
                earliestDate:  outOrderValueHelper(formModel, taskVar, 'earliestDate'),
                latestDate:    outOrderValueHelper(formModel, taskVar, 'latestDate'),
                location:      outOrderValueHelper(formModel, taskVar, 'location'),
                requestReason: outOrderValueHelper(formModel, taskVar, 'requestReason'),
                attention:     outOrderValueHelper(formModel, taskVar, 'attention'),
                clinic:        outOrderValueHelper(formModel, taskVar, 'clinic'),
                formComment:   outOrderValueHelper(formModel, taskVar, 'comment'),
                requestComment: outOrderValueHelper(formModel, taskVar, 'requestComment'),
                requestQuestion: outOrderValueHelper(formModel, taskVar, 'requestQuestion'),
                noteCondition: outOrderValueHelper(formModel, taskVar, 'noteCondition'),
                noteAnnotation: outOrderValueHelper(formModel, taskVar, 'noteAnnotation'),
                // TODO: Remove hardcoded values when discussion on implementing histry is completed
                history: {
                    userId: "9E7A;PW    ",
                    action_date: moment().format('MM-DD-YYYY hh:mm a'),
                    action_note: "Consult order signed"
                },
                orderingProviderId: taskVar.orderingProviderId
            }
        };
    };

    // Close the modal and refresh the todo list applet to fetch new tasks
    var modalCloseAndRefresh = function(e, taskListView) {
        EventHandler.fireCloseEvent(e);

        // Refresh the todo list applet if in provider-centric-view
        if (ADK.Messaging.request('get:current:screen').config.id === 'provider-centric-view') {
            setTimeout(function() {
                taskListView.refresh();
            }, 500);
        }
    };

    // Given the key, get and return the proper value
    var outOrderValueHelper = function(formModel, taskVar, key) {
        var value = taskVar[key];
        if(formModel && formModel.get(key) !== undefined && formModel.get(key) !== null) {
            value = formModel.get(key);
        }
        return value;
    };

    var eventHandler = {
        closeModal: function(e) {
            EventHandler.fireCloseEvent(e);
        },
        claimTask: function(taskModel) {
            fetchHelper(null, taskModel, 'start');
        },
        releaseTask: function(e, taskModel) {
            fetchHelper(e, taskModel, 'release');
            EventHandler.fireCloseEvent(e);
        },
        saveTask: function(e, taskModel, formModel, taskListView) {
            fetchHelper(e, taskModel, 'complete',
                paramHelper(taskModel, formModel, 'saved', 'UNRELEASED'),
                function(){},
                formModel
            );
            modalCloseAndRefresh(e, taskListView);
        },
        signTask: function(e, taskModel, formModel, taskListView) {
            fetchHelper(e, taskModel, 'complete',
                paramHelper(taskModel, formModel, 'accepted', 'PENDING'),
                function(){},
                formModel
            );
            modalCloseAndRefresh(e, taskListView);
        },
        completeTask: function(e, taskModel, formModel, taskListView, orderAction) {
            // Set the formAction based on the form action selected
            var action = formModel && formModel.get('action');

            // If it contains an action 
            if(action) {
                switch(action) {
                    case 'contacted':
                        var contactAttempt = formModel.get('attempt');
                        fetchHelper(e, taskModel, 'complete',
                            paramHelper(taskModel, formModel, contactAttempt, orderAction)
                        );
                        break;
                    default:
                        fetchHelper(e, taskModel, 'complete',
                            paramHelper(taskModel, formModel, action, orderAction)
                        );
                }
            } else {
                fetchHelper(e, taskModel, 'complete',
                    paramHelper(taskModel, null, '', orderAction)
                );
            }
            modalCloseAndRefresh(e, taskListView);
        },
        deleteTask: function(e, taskModel, taskListView) {
            var fetchOptions = {
                resourceTitle: 'tasks-abortprocess',
                fetchType: 'POST',
                criteria: {
                    deploymentId: taskModel.get('DEPLOYMENTID'),
                    processInstanceId: parseInt(taskModel.get('PROCESSINSTANCEID')),
                },
                onSuccess: function(response) {
                    modalCloseAndRefresh(e, taskListView);
                }
            };
            ADK.ResourceService.fetchCollection(fetchOptions);
        },
        fetchHelper: fetchHelper,
        // Flexible call that exposes all options
        tempTaskProcessing: function(e, taskModel, taskListView, outFormStatus, onSuccess) {
            fetchHelper(e, taskModel, 'complete', 
                paramHelper(taskModel, null, outFormStatus), onSuccess
            );
            modalCloseAndRefresh(e, taskListView);
        }
    };

    return eventHandler;
});
