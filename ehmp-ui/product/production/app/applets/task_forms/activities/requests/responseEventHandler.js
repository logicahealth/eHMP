define([
    'async',
    'moment',
    'app/applets/task_forms/common/utils/eventHandler',
    'app/applets/task_forms/common/utils/taskFetchHelper',
    'app/applets/task_forms/common/utils/requestCommonUtils',
    'app/applets/task_forms/common/utils/utils'
], function(Async, moment, EventHandler, TaskFetchHelper, RequestUtils, Utils) {
    'use strict';

    var REQUEST_CLARIFICATION = 'clarification';
    var REQUEST_DECLINE = 'decline';
    var REQUEST_COMPLETE = 'complete';
    var REQUEST_REASSIGN = 'reassign';

    var buildResponse = function(formModel, formAction, action, request, userSession) {
        var visitInfo = ADK.PatientRecordService.getCurrentPatient().get('visit');
        var response = {
            objectType: 'request',
            taskInstanceId: formModel.get('data').activity.processInstanceId,
            action: action,
            request: RequestUtils.removeWhiteSpace(formModel.get('request') ? formModel.get('request') : formModel.get('comment')),
            submittedByUid: 'urn:va:user:' + userSession.site + ":" + userSession.duz[userSession.site],
            submittedByName: userSession.lastname + ',' + userSession.firstname,
            submittedTimeStamp: moment().utc(),
            route: {},
            visit: {
                location: visitInfo.locationUid,
                serviceCategory: visitInfo.serviceCategory,
                dateTime: visitInfo.dateTime
            },
            earliestDate: moment(formModel.get('earliestDateText')).startOf('day').utc().format('YYYYMMDDHHmmss'),
            latestDate: moment(formModel.get('latestDateText')).endOf('day').utc().format('YYYYMMDDHHmmss')
        };

        if (action === REQUEST_CLARIFICATION || action === REQUEST_DECLINE ) {
            response.assignTo = 'Person';
            response.route.person = routingCode(formModel, formAction);
            response.route.facility = formModel.get('data').activity.sourceFacilityId;
        } else if (action === REQUEST_REASSIGN) {
            response.assignTo = parseAssignment(formModel.get('assignment'));
            setRouteToResponse(formModel, response);
        }
        return response;
    };

    var buildActivity = function(formModel, activity, action) {
        if (activity === null) {
            activity = {};
        }
        if (action === REQUEST_CLARIFICATION || action === REQUEST_DECLINE ) {
            activity.assignedTo = routingCode(formModel);
        } else if (action === REQUEST_REASSIGN) {
            activity.assignedTo = routingCodeAll(formModel);
        }
        return activity;
    };

    var routingCode = function(formModel) {
        var authorUid = formModel.get('authorUid');
        return authorUid.substring(authorUid.indexOf('user') + 5, authorUid.length).replace(':', ';');
    };

    function startResponsePost(collection, formModel, formAction, action, data) {

        var newestActivity = Utils.findLatest(collection, 'Order.Request');
        var userSession = ADK.UserService.getUserSession().attributes;
        var patientContext = ADK.PatientRecordService.getCurrentPatient();

        data.activity.objectType = 'activity';
        Async.waterfall([
            function(next) {
                if (formModel.get('taskStatus').toLowerCase() === 'inprogress') {
                    next(null);
                } else {
                    var startResponseTaskPostOptions = {
                        resourceTitle: 'tasks-update',
                        fetchType: 'POST',
                        criteria: {
                            deploymentId: data.activity.deploymentId,
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
                        deploymentId: data.activity.deploymentId,
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
                    complete: 'Successfully completed.',
                    clarification: 'Successfully returned for clarification',
                    decline: 'Successfully declined',
                    reassign: 'Successfully reassigned'
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

    /*
     * The following functions are to support reassign
     */
    var parseAssignment = function(assignment) {
        return _.get(assignment, '_labelsForSelectedValues.type', null);
    };
    var routingCodeAll = function(formModel) {
        var assignment = formModel.get('assignment');
        var assignTo = parseAssignment(assignment);
        var userSession = ADK.UserService.getUserSession().attributes;
        if (assignTo === 'Me') {
            return userSession.site + ";" + userSession.duz[userSession.site];
        } else if (assignTo === 'Person') {
            return _.get(assignment, 'person');
        } else {
            var roles = _.get(assignment, 'roles');
            var team = _.get(assignment, 'team');
            var codes = [];
            _.each(roles, function(role) {
                codes.push('[TM:(' + team + ')/TR:(' + role + ')]');
            });
            return codes.join();
        }
    };
    var setRouteToResponse = function(formModel, response) {
        var assignment = formModel.get('assignment');
        var assignTo = parseAssignment(assignment);
        if (!_.isEqual(assignTo, 'Me')) {
            response.route = {};
            if (_.isEqual(assignTo, 'Person')) {
                _.extend(response.route, _.pick(assignment, ['facility', 'person']));
            } else {
                response.route.routingCode = routingCodeAll(formModel);
                var team = _.get(assignment, 'team');
                if (!_.isEmpty(team)) {
                    response.route.team = {
                        code: team,
                        name: _.get(assignment, '_labelsForSelectedValues.team')
                    };
                }

                var roles = _.get(assignment, 'roles');
                if (_.isArray(roles)) {
                    var processedRoles = [];
                    var roleNames = _.get(assignment, '_labelsForSelectedValues.roles', '').split(', ');
                    _.each(roles, function(role, index) {
                        if (!_.isEmpty(role) && !!roleNames[index]) {
                            processedRoles.push({
                                code: role,
                                name: roleNames[index]
                            });
                        }
                    });
                    response.route.assignedRoles = processedRoles;
                }

                if (_.isEqual(assignTo, 'Any Team')) {
                    response.route.facility = _.get(assignment, 'facility');
                }
            }
        }
        return response;
    };

    // Close the modal and refresh the todo list applet to fetch new tasks
    var modalCloseAndRefresh = function(e) {
        EventHandler.fireCloseEvent(e);
        RequestUtils.triggerRefresh();
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
        REQUEST_CLARIFICATION: REQUEST_CLARIFICATION,
        REQUEST_DECLINE: REQUEST_DECLINE,
        REQUEST_COMPLETE: REQUEST_COMPLETE,
        REQUEST_REASSIGN: REQUEST_REASSIGN
    };

    return eventHandler;
});
