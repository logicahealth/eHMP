define([
    'async',
    'app/applets/task_forms/common/utils/eventHandler',
    'app/applets/task_forms/common/utils/taskFetchHelper',
    'app/applets/orders/writeback/common/assignmentType/assignmentTypeUtils',
    'app/applets/task_forms/common/utils/requestCommonUtils'
], function(Async, EventHandler, TaskFetchHelper, AssignmentTypeUtils, Utils) {
    "use strict";

    var REQUEST_CLARIFICATION = 'Return for Clarification';
    var REQUEST_DECLINE = 'Decline';
    var REQUEST_COMPLETE = 'Mark as Complete';
    var REQUEST_REASSIGN = 'Reassign';

    var buildResponse = function(formModel, formAction, action, request, userSession) {
        var visitInfo = ADK.PatientRecordService.getCurrentPatient().get('visit');
        var response = {
            objectType: "request",
            taskInstanceId: formModel.get('data').activity.processInstanceId,
            action: action,
            request: formModel.get('request') ? formModel.get('request') : formModel.get('comment'),
            assignTo: '', // TODO: this will change for the reassign scenario
            submittedByUid: 'urn:va:user:' + userSession.site + ":" + userSession.duz[userSession.site],
            submittedByName: userSession.lastname + ',' + userSession.firstname,
            submittedTimeStamp: moment(),
            route: {},
            visit: {
                location: visitInfo.locationUid,
                serviceCategory: visitInfo.serviceCategory,
                dateTime: visitInfo.dateTime
            },
            earliestDate: moment.utc(formModel.get('earliestDateText')).startOf('day').format('YYYYMMDDHHmmss'),
            latestDate: moment.utc(formModel.get('latestDateText')).startOf('day').format('YYYYMMDDHHmmss')
        };

        if(action === REQUEST_CLARIFICATION || action === REQUEST_DECLINE ) {
            response.assignTo = 'Person';
            response.route.person = routingCode(formModel, formAction);
            response.route.facility = formModel.get('data').activity.sourceFacilityId;
        }
        return response;
    };

    var buildActivity = function(formModel, activity, action) {
        if (activity === null) {
            activity = {};

        }
        if(action === REQUEST_CLARIFICATION || action === REQUEST_DECLINE ) {
            activity.assignedTo = routingCode(formModel);
        }
        return activity;
    };

    var routingCode = function(formModel) {
        var authorUid = formModel.get('authorUid');
        return authorUid.substring(authorUid.indexOf("user") + 5, authorUid.length).replace(':', ';');
    };

    function startResponsePost(collection, formModel, formAction, action, data) {
        formModel = Utils.escapeAll(formModel);

        var newestActivity = Utils.findLatestRequest(collection);
        var userSession = ADK.UserService.getUserSession().attributes;
        var patientContext = ADK.PatientRecordService.getCurrentPatient();

        data.activity.objectType = "activity";
        Async.waterfall([
            function(next) {
                if (formModel.get('taskStatus').toLowerCase() === 'inprogress') {
                    next(null);
                } else {
                    var startResponseTaskPostOptions = {
                        resourceTitle: 'tasks-update',
                        fetchType: 'POST',
                        criteria: {
                            deploymentid: data.activity.deploymentId,
                            processDefId: data.activity.processDefinitionId,
                            parameter: {
                                out_activity: buildActivity(formModel, data.activity, action),
                                out_response: buildResponse(formModel, formAction, action, data.request, userSession),
                                out_formAction: 'start',
                                out_action: action
                            },
                            icn: patientContext.get('pid'),
                            pid: patientContext.get('pid'),
                            state: 'start',
                            taskid: String(formModel.get('taskId'))
                        },
                        onSuccess: function(req, res) {
                            next(null);
                        },
                        onError: function(req, res) {
                            next('Failed to start response task.', res);
                        }
                    };
                    ADK.ResourceService.fetchCollection(startResponseTaskPostOptions);
                }
            },
            function(next) {
                var updateResponseTaskPostOptions = {
                    resourceTitle: 'tasks-update',
                    fetchType: 'POST',
                    criteria: {
                        deploymentid: data.activity.deploymentId,
                        processDefId: data.activity.processDefinitionId,
                        parameter: {
                            out_activity: buildActivity(formModel, data.activity, action),
                            out_response: buildResponse(formModel, formAction, action, data.request, userSession),
                            out_formAction: formAction,
                            out_action: action
                        },
                        icn: patientContext.get('pid'),
                        pid: patientContext.get('pid'),
                        state: 'complete',
                        taskid: String(formModel.get('taskId'))
                    },
                    onSuccess: function(req, res) {
                        next(null, res);
                    },
                    onError: function(req, res) {
                        next('Failed to update response task.', res);
                    }
                };
                ADK.ResourceService.fetchCollection(updateResponseTaskPostOptions);
            }
        ], function(err, result) {
            if (err) {
                var errorBanner = new ADK.UI.Notification({
                    type: 'error',
                    title: 'Error while saving Response.',
                    message: err
                });
                errorBanner.show();
            } else {
                var alertMessageMap = {
                    'Mark as Complete': 'Successfully completed.',
                    'Return for Clarification': 'Successfully returned for clarification',
                    'Decline': 'Successfully declined',
                    'Reassign': 'Successfully reassigned'
                };
                var successBanner = new ADK.UI.Notification({
                    type: 'success',
                    title: 'Response Activity',
                    message: alertMessageMap[action] ||  + 'Successfully completed.'
                });
                successBanner.show();
            }

            modalCloseAndRefresh(result);
        });
    }

    // Close the modal and refresh the todo list applet to fetch new tasks
    var modalCloseAndRefresh = function(e) {
        EventHandler.fireCloseEvent(e);
    };

    var eventHandler = {
        handleResponseAction: function(e, formModel, formAction, action, data) {
            // handle the action selected from response form
            var fetchOptions = {
                resourceTitle: 'activities-available',
                fetchType: 'GET',
                viewModel: {
                    idAttribute: 'deploymentId'
                },
                onSuccess: function(collection) {

                    startResponsePost(collection, formModel, formAction, action, data);
                }
            };
            ADK.ResourceService.fetchCollection(fetchOptions);
        },

        closeModal: function(e) {
            EventHandler.fireCloseEvent(e);
        },
        fetchHelper: TaskFetchHelper,
    };

    return eventHandler;
});