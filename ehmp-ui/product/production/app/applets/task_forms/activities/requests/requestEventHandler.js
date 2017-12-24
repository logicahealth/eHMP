define([
    'async',
    'moment',
    'app/applets/task_forms/common/utils/eventHandler',
    'app/applets/task_forms/common/utils/taskFetchHelper',
    'app/applets/task_forms/common/utils/requestCommonUtils',
    'app/applets/task_forms/common/utils/utils'
], function(Async, moment, EventHandler, TaskFetchHelper, RequestUtils, Utils) {
    'use strict';

    var sanitizedRouteString = function(value) {
        return _.trim(value.replace(/\(|\)|\:|\[|\]|\,/g, '-'));
    };

    var getFormattedAssignmentValue = function(formModel, attribute) {
        var path = '_labelsForSelectedValues.' + attribute;
        return _.get(formModel.get('assignment'), path, '');
    };

    var parseUrgencyId = function(urgency) {
        var urgencyId;
        if (urgency === 'routine') {
            urgencyId = 9;
        } else if (urgency === 'urgent') {
            urgencyId = 4;
        }
        return urgencyId;
    };

    var getUrgencyIdString = function(urgency) {
        var urgencyId = parseUrgencyId(urgency);
        if (urgencyId) {
            return urgencyId.toString();
        } else {
            return '';
        }
    };

    var routingCode = function(formModel, formAction) {
        var assignTo = getFormattedAssignmentValue(formModel, 'type');
        var userSession = ADK.UserService.getUserSession().attributes;
        if (_.isEqual(assignTo, 'Me')) {
            return userSession.site + ';' + userSession.duz[userSession.site];
        } else if (_.isEqual(assignTo, 'Person')) {
            return _.get(formModel.get('assignment'), 'person');
        } else {
            var team = _.get(formModel.get('assignment'), 'team');
            var friendlyTeamName = sanitizedRouteString(getFormattedAssignmentValue(formModel, 'team'));

            var roles = _.get(formModel.get('assignment'), 'roles');
            var formattedRoleNames = getFormattedAssignmentValue(formModel, 'roles') || [];

            var codes = _.transform(roles, function(result, role, index) {
                if (!_.isEmpty(role)) {
                    result.push('[TM:' + friendlyTeamName + '(' + team + ')/TR:' + formattedRoleNames[index] + '(' + role + ')]');
                }
            }, []);
            return codes.join();
        }
    };

    // Builds and return the parameter object from the UI form
    var buildClinicalObject = function(formModel, formAction, userSession, visitInfo) {
        formAction = formAction || '';
        var requestClinicalObject = {
            objectType: 'requestActivity',
            uid: formModel.get('patientIcn'),
            patientUid: ADK.PatientRecordService.getCurrentPatient().toJSON().uid,
            authorUid: 'urn:va:user:' + userSession.site + ':' + userSession.duz[userSession.site],
            creationDateTime: formModel.get('creationDateTime') || moment().format('YYYYMMDDHHmmss'),
            domain: 'ehmp-activity',
            subDomain: 'request',
            visit: {
                location: visitInfo.locationUid,
                serviceCategory: visitInfo.serviceCategory,
                dateTime: visitInfo.dateTime,
                locationDesc: visitInfo.locationDisplayName
            },
            ehmpState: formAction,
            displayName: RequestUtils.removeWhiteSpace(formModel.get('title')),
            referenceId: '', // For Request Activity this will be empty string since there is not a corresponding Vista/JDS record.
            instanceName: RequestUtils.removeWhiteSpace(formModel.get('title')),
            data: {
                activity: buildActivity(formModel, formAction, userSession),
                signals: [], // nothing to put here yet
                requests: [buildRequest(formModel, userSession, visitInfo)],
                responses: [] // only exists in completed state

            }
        };

        if (!_.isEmpty(formModel.get('activity')) && !_.isEmpty(formModel.get('activity').processInstanceId)) {
            requestClinicalObject.data.signals.push(buildSignalData(formModel, userSession));
        }
        return requestClinicalObject;
    };

    var buildSignalData = function(formModel, userSession) {
        var signalBody = new Backbone.Model({
            objectType: 'requestSignal',
            name: 'EDT',
            actionText: 'Edit',
            actionId: '1',
            data: {
                comment: formModel.get('requestDetails')
            },
            executionUserId: userSession.site + ';' + userSession.duz[userSession.site],
            executionUserName: userSession.lastname + ',' + userSession.firstname,
            executionDateTime: moment.utc().format('YYYYMMDDHHmmss+0000')
        });
        return signalBody;

    };

    var setRouteToRequest = function(formModel, request) {
        var assignmentType = _.get(formModel.get('assignment'), 'type');
        if (_.isEqual(assignmentType, 'opt_me')) {
            return request;
        } else if (_.isEqual(assignmentType, 'opt_person')) {
            _.set(request, 'route', _.extend({}, {
                facilityName: getFormattedAssignmentValue(formModel, 'facility'),
                personName: getFormattedAssignmentValue(formModel, 'person')
            }, _.pick(formModel.get('assignment'), ['facility', 'person'])));
        } else {
            if (_.isEqual(assignmentType, 'opt_anyteam')) {
                _.set(request, 'route', _.extend({}, {
                    facilityName: getFormattedAssignmentValue(formModel, 'facility')
                }, _.pick(formModel.get('assignment'), ['facility'])));
            }

            _.set(request, 'route.routingCode', routingCode(formModel));
            var team = _.get(formModel.get('assignment'), 'team');
            if (!_.isEmpty(team)) {
                _.set(request, 'route.team', {
                    code: team,
                    name: getFormattedAssignmentValue(formModel, 'team')
                });
            }

            var roles = _.get(formModel.get('assignment'), 'roles');
            if (_.isArray(roles)) {
                var formattedNames = getFormattedAssignmentValue(formModel, 'roles') || [];
                _.set(request, 'route.assignedRoles', _.transform(roles, function(result, role, index) {
                    if (!_.isEmpty(role)) {
                        result.push({
                            code: role,
                            name: formattedNames[index]
                        });
                    }
                }), []);
            }
        }
        return request;
    };

    var buildActivity = function(formModel, formAction, userSession) {
        return {
            objectType: 'activity',
            deploymentId: formModel.get('activity') ? formModel.get('activity').deploymentId : formModel.get('deploymentId'),
            processDefinitionId: formModel.get('activity') ? formModel.get('activity').processDefinitionId : 'Order.Request',
            processInstanceId: formModel.get('activity') ? formModel.get('activity').processInstanceId : '', // Populated when the activity instance is created
            state: formAction,
            initiator: userSession.duz[userSession.site],
            assignTo: getFormattedAssignmentValue(formModel, 'type'),
            timeStamp: '',
            urgency: parseUrgencyId(formModel.get('urgency')),
            assignedTo: routingCode(formModel, formAction),
            instanceName: RequestUtils.removeWhiteSpace(formModel.get('title')),
            domain: 'Request',
            sourceFacilityId: ADK.UserService.getUserSession().get('division'),
            destinationFacilityId: _.get(formModel.get('assignment'), 'facility', ADK.UserService.getUserSession().get('division')),
            type: 'Order'
        };
    };

    var buildRequest = function(formModel, userSession, visitInfo) {
        var request = {
            objectType: 'request',
            taskinstanceId: '',
            urgency: formModel.get('urgency'),
            earliestDate: moment(formModel.get('earliest')).startOf('day').utc().format('YYYYMMDDHHmmss'),
            latestDate: moment(formModel.get('latest')).endOf('day').utc().format('YYYYMMDDHHmmss'),
            title: RequestUtils.removeWhiteSpace(formModel.get('title')),
            assignTo: getFormattedAssignmentValue(formModel, 'type'),
            request: RequestUtils.removeWhiteSpace(formModel.get('requestDetails') || ' '),
            submittedByUid: 'urn:va:user:' + userSession.site + ':' + userSession.duz[userSession.site],
            submittedByName: userSession.lastname + ',' + userSession.firstname,
            submittedTimeStamp: moment().utc(),
            visit: {
                location: visitInfo.locationUid,
                serviceCategory: visitInfo.serviceCategory,
                dateTime: visitInfo.dateTime,
                locationDesc: visitInfo.locationDisplayName
            }
        };
        request = setRouteToRequest(formModel, request);
        return request;
    };

    // Close the modal and refresh the todo list applet to fetch new tasks
    var modalCloseAndRefresh = function(e, taskListView) {
        EventHandler.fireCloseEvent(e);
        RequestUtils.triggerRefresh();
    };

    // handles all the click events on the form, what is clicked is passed
    // through in formAction
    var startRequestPost = function(collection, formModel, formAction, userSession, patientContext, visitInfo, form) {
        var newestActivity = Utils.findLatest(collection, 'Order.Request');

        // Add to form model to be stored into pJDS
        formModel.set({
            deploymentId: newestActivity.get('deploymentId'),
            processDefId: newestActivity.get('id'),
            objectType: 'requestActivity',
            icn: patientContext.get('pid'),
            pid: patientContext.get('pid')
        });

        var formModelJSON = formModel.toJSON();
        var clinicalObject = buildClinicalObject(formModel, formAction, userSession, visitInfo);

        var fetchOptions = {
            resourceTitle: 'activities-start',
            fetchType: 'POST',
            cache: false,
            criteria: {
                deploymentId: formModelJSON.deploymentId,
                processDefId: formModelJSON.processDefId,
                parameter: {
                    requestActivity: clinicalObject,
                    icn: patientContext.get('pid'),
                    pid: patientContext.get('pid'),
                    instanceName: formModel.get('title'),
                    formAction: formAction,
                    urgency: getUrgencyIdString(formModel.get('urgency')),
                    subDomain: 'Request',
                    assignedTo: routingCode(formModel, formAction),
                    type: 'Order',
                    facility: userSession.division,
                    destinationFacility: clinicalObject.data.activity.destinationFacilityId,
                    description: 'Use this activity to request other providers or yourself to complete a patient specific task at any time now or in the future.'
                }

            },
            onSuccess: function(req, res) {
                modalCloseAndRefresh(res);
                if (formAction === 'draft') {
                    ADK.Messaging.trigger('action:draft:refresh');
                }
                displayBanner(formAction);
            },
            onError: function(req, res) {
                var errorMessage = JSON.parse(res.responseText).message;

                if (errorMessage) {
                    formModel.set('errorMessage', errorMessage);
                }

                form.unBlockUI();
            }
        };

        ADK.ResourceService.fetchCollection(fetchOptions);
    };

    var sendSignalPost = function(e, collection, formModel, signalAction, userSession, visitInfo, form) {
        signalAction = signalAction || '';

        var newestActivity = Utils.findLatest(collection, 'Order.Request');

        formModel.set({
            deploymentId: newestActivity.get('deploymentId')
        });

        var formModelJSON = formModel.toJSON();

        var reqActivity = buildClinicalObject(formModel, signalAction, userSession, visitInfo);

        // Format json to match signaling body
        reqActivity = _.omit(reqActivity, ['formAction']);
        reqActivity.formAction = signalAction;
        reqActivity.uid = formModelJSON.uid;

        var fetchOptions = {
            resourceTitle: 'activities-signal',
            fetchType: 'POST',
            cache: false,
            criteria: {
                deploymentId: formModelJSON.deploymentId,
                processInstanceId: Number(formModel.get('activity').processInstanceId),
                signalName: 'EDIT',
                parameter: {
                    requestActivity: reqActivity
                }
            },
            onSuccess: function(req, res) {
                modalCloseAndRefresh(res);
                if (signalAction === 'draft') {
                    ADK.Messaging.trigger('action:draft:refresh');
                }
                displayBanner(signalAction);
            },
            onError: function(req, res) {
                var errorMessage = JSON.parse(res.responseText).message;

                if (errorMessage) {
                    formModel.set('errorMessage', errorMessage);
                }

                form.unBlockUI();
            }
        };

        ADK.ResourceService.fetchCollection(fetchOptions);
    };

    function sendRequestUpdate(collection, formModel, formAction, userSession, patientContext, visitInfo) {

        Async.waterfall([
            function(next) {
                if (formModel.get('taskStatus').toLowerCase() === 'inprogress') {
                    next(null);
                } else {
                    var startResponseTaskPostOptions = {
                        resourceTitle: 'tasks-update',
                        fetchType: 'POST',
                        criteria: {
                            deploymentId: formModel.get('activity') ? formModel.get('activity').deploymentId : formModel.get('deploymentId'),
                            processDefId: formModel.get('activity') ? formModel.get('activity').processDefinitionId : formModel.get('processDefinitionId'),
                            parameter: {
                                out_activity: buildActivity(formModel, formAction, userSession),
                                out_request: buildRequest(formModel, userSession, visitInfo),
                                out_formAction: 'start'
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
                        deploymentId: formModel.get('activity') ? formModel.get('activity').deploymentId : formModel.get('deploymentId'),
                        processDefId: formModel.get('activity') ? formModel.get('activity').processDefinitionId : formModel.get('processDefinitionId'),
                        parameter: {
                            out_activity: buildActivity(formModel, formAction, userSession),
                            out_request: buildRequest(formModel, userSession, visitInfo),
                            out_formAction: formAction
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
                    title: 'Error while saving Request.',
                    message: err
                });
                errorBanner.show();
            } else {
                displayBanner(formAction);
            }

            modalCloseAndRefresh(result);
        });
    }

    var displayBanner = function(action, options) {
        var suppressBanner = !!(_.get(options, 'suppressBanner', false));
        if (suppressBanner === false) {
            var message = 'Successfully ' + constructBannerMessage(action);
            var successBanner = new ADK.UI.Notification({
                title: 'Success',
                message: message,
                type: 'success'
            });
            successBanner.show();
        }
    };

    var constructBannerMessage = function(action) {
        switch (action) {
            case 'delete':
                return 'deleted';
            case 'draft':
                return 'created draft';
            default:
                return action;
        }
    };

    var eventHandler = {
        handleRequest: function(e, formModel, formAction, form) {
            var userSession = ADK.UserService.getUserSession().attributes;
            var patientContext = ADK.PatientRecordService.getCurrentPatient();
            var visitInfo = ADK.PatientRecordService.getCurrentPatient().get('visit');

            var fetchOptions = {
                resourceTitle: 'activities-available',
                fetchType: 'GET',
                viewModel: {
                    parse: function(response) {
                        response.uniqueId = _.uniqueId();
                        return response;
                    },
                    idAttribute: 'uniqueId'
                },
                onSuccess: function(collection) {
                    startRequestPost(collection, formModel, formAction, userSession, patientContext, visitInfo, form);
                }
            };
            ADK.ResourceService.fetchCollection(fetchOptions);
        },
        sendUpdate: function(e, formModel, formAction) {
            var userSession = ADK.UserService.getUserSession().attributes;
            var patientContext = ADK.PatientRecordService.getCurrentPatient();
            var visitInfo = ADK.PatientRecordService.getCurrentPatient().get('visit');
            var fetchOptions = {
                resourceTitle: 'activities-available',
                fetchType: 'GET',
                viewModel: {
                    parse: function(response) {
                        response.uniqueId = _.uniqueId();
                        return response;
                    },
                    idAttribute: 'uniqueId'
                },
                onSuccess: function(collection) {
                    sendRequestUpdate(collection, formModel, formAction, userSession, patientContext, visitInfo);
                }
            };
            ADK.ResourceService.fetchCollection(fetchOptions);
        },
        sendSignal: function(e, formModel, formAction, form) {
            var userSession = ADK.UserService.getUserSession().attributes;
            var patientContext = ADK.PatientRecordService.getCurrentPatient();
            var visitInfo = ADK.PatientRecordService.getCurrentPatient().get('visit');
            // Fetch jbpm deployments
            var fetchOptions = {
                resourceTitle: 'activities-available',
                fetchType: 'GET',
                viewModel: {
                    parse: function(response) {
                        response.uniqueId = _.uniqueId();
                        return response;
                    },
                    idAttribute: 'uniqueId'
                },
                onSuccess: function(collection) {
                    // Find the newest consult deployment
                    sendSignalPost(e, collection, formModel, formAction, userSession, visitInfo, form);
                }
            };
            ADK.ResourceService.fetchCollection(fetchOptions);
        },
        closeModal: function(e) {
            EventHandler.fireCloseEvent(e);
        },
        fetchHelper: TaskFetchHelper
    };

    return eventHandler;
});
