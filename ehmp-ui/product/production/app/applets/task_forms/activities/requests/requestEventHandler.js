define([
    'async',
    'app/applets/task_forms/common/utils/eventHandler',
    'app/applets/task_forms/common/utils/taskFetchHelper',
    'app/applets/orders/writeback/common/assignmentType/assignmentTypeUtils',
    'app/applets/task_forms/common/utils/requestCommonUtils'
], function(Async, EventHandler, TaskFetchHelper, AssignmentTypeUtils, Utils) {
    "use strict";

    var parseAssignment = function(assignment) {
        if(assignment === 'opt_me') {
            return "Me";
        } else if(assignment === 'opt_person') {
            return 'Person';
        } else if(assignment === 'opt_myteams') {
            return 'My Teams';
        } else if(assignment === 'opt_anyteam') {
            return 'Any Team';
        } else if(assignment === 'opt_patientteams') {
            return 'Patient\'s Teams';
        } else {
            return null;
        }
    };

    var parseUrgencyId = function(urgency) {
        var urgencyId;
        if(urgency === 'routine') {
            urgencyId =  9;
        } else if(urgency === 'urgent') {
            urgencyId =  4;
        }
        return urgencyId;
    };

    var routingCode = function(formModel, formAction) {
        var assignTo = parseAssignment(formModel.get('assignment'));
        var userSession = ADK.UserService.getUserSession().attributes;
        if (assignTo === 'Me') {
            return userSession.site + ";" + userSession.duz[userSession.site];
        } else if (assignTo === 'Person') {
            return formModel.get('person');
        } else {
            var roles = formModel.get('roles');
            var team = formModel.get('team');
            var codes = [];
            _.each(roles, function(role) {
                codes.push('[TM:(' + team + ')/TR:(' + role + ')]');
            });
            return codes.join();
        }
    };

    // Builds and return the parameter object from the UI form
    var buildClinicalObject = function(formModel, formAction, userSession, visitInfo) {
        formAction = formAction || '';
        var requestClinicalObject = {
            objectType : "requestActivity",
            uid: formModel.get('patientIcn'),
            patientUid: ADK.PatientRecordService.getCurrentPatient().toJSON().uid,
            authorUid: 'urn:va:user:' + userSession.site + ":" + userSession.duz[userSession.site],
            creationDateTime: formModel.get('creationDateTime') || moment().format('YYYYMMDDHHmmss'),
            domain: "ehmp-activity",
            subDomain: "request",
            visit: {
                location: visitInfo.locationUid,
                serviceCategory: visitInfo.serviceCategory,
                dateTime: visitInfo.dateTime
            },
            ehmpState: formAction,
            displayName: formModel.get('title'),
            referenceId: "", // For Request Activity this will be empty string since there is not a corresponding Vista/JDS record.
            instanceName: formModel.get('title'),
            data: {
                activity: buildActivity(formModel, formAction, userSession),
                signals: [], // nothing to put here yet
                requests: [buildRequest(formModel, userSession, visitInfo)],
                responses: [] // only exists in completed state

            },
        };

        if (formModel.get('activity.processInstanceId')) {
            requestClinicalObject.data.signals.push('requestUpdateSignal');
        }
        return requestClinicalObject;
    };

    var setRouteToRequest = function(formModel, request) {
        if (formModel.get('assignment') !== 'opt_me') {
            request.route = {};
            if (formModel.get('assignment') === 'opt_person') {
                request.route.facility = formModel.get('facility');
                request.route.person = formModel.get('person');
            } else {
                request.route.routingCode = routingCode(formModel);
                var team = formModel.get('team');
                if (!_.isEmpty(team) && formModel.has('storedTeamsList')) {
                    request.route.team = {
                        code: team,
                        name: lookupTeamName(formModel.get('storedTeamsList'), team)
                    };
                }

                var roles = formModel.get('roles');
                if (_.isArray(roles) && formModel.has('storedRolesList')) {
                    var processedRoles = [];
                    _.each(roles, function(role) {
                        if (!_.isEmpty(role)) {
                            processedRoles.push({
                                code: role,
                                name: lookupRoleName(formModel.get('storedRolesList'), role)
                            });
                        }
                    });
                    request.route.assignedRoles = processedRoles;
                }

                if (formModel.get('assignment') === 'opt_anyteam') {
                    request.route.facility = formModel.get('facility');
                }
            }
        }
        return request;
    };

    var buildActivity = function(formModel, formAction, userSession) {
        var activity = {
            objectType : "activity",
            deploymentId: formModel.get('activity') ? formModel.get('activity').deploymentId : formModel.get('deploymentId'),
            processDefinitionId: formModel.get('activity') ? formModel.get('activity').processDefinitionId : 'Order.Request',
            processInstanceId: formModel.get('activity') ? formModel.get('activity').processInstanceId : "", // Populated when the activity instance is created
            state: formAction,
            initiator: userSession.duz[userSession.site],
            assignTo: parseAssignment(formModel.get('assignment')),
            timeStamp: "",
            urgency: parseUrgencyId(formModel.get('urgency')),
            assignedTo: routingCode(formModel, formAction),
            instanceName: formModel.get('title'),
            domain: 'Request',
            sourceFacilityId: ADK.UserService.getUserSession().get('division'),
            type: 'Order'
        };

        return activity;
    };

    var buildRequest = function(formModel, userSession, visitInfo) {
        var request = {
            objectType : "request",
            taskinstanceId: "",
            urgency: formModel.get('urgency'),  // from form
            earliestDate: moment.utc(formModel.get('earliest')).startOf('day').format('YYYYMMDDHHmmss'),  // from form
            latestDate: moment.utc(formModel.get('latest')).startOf('day').format('YYYYMMDDHHmmss'),  // from form
            title: formModel.get('title'), // from form
            assignTo: parseAssignment(formModel.get('assignment')), // from form
            request: formModel.get('requestDetails'), // from form
            submittedByUid: 'urn:va:user:' + userSession.site + ":" + userSession.duz[userSession.site],
            submittedByName: userSession.lastname + ',' + userSession.firstname,
            submittedTimeStamp: moment(),
            visit: {
                location: visitInfo.locationUid,
                serviceCategory: visitInfo.serviceCategory,
                dateTime: visitInfo.dateTime
            }
        };
        request = setRouteToRequest(formModel, request);

        return request;
    };


    function lookupTeamName(teamList, teamID) {
        if (!teamList) {
            return null;
        }

        var foundTeam = _.find(teamList, function(team) {
            if (!team) {
                return false;
            }

            return ((teamID === team.teamID) || (parseInt(teamID, 10) === team.teamID));
        });

        return foundTeam ? foundTeam.teamName : null;
    }

    function lookupRoleName(roleList, roleID) {
        if (!roleList) {
            return null;
        }

        var foundRole = _.find(roleList, function(role) {
            if (!role) {
                return false;
            }

            return ((roleID === role.roleID) || (parseInt(roleID, 10) === role.roleID));
        });

        return foundRole ? foundRole.name : null;
    }

    // Close the modal and refresh the todo list applet to fetch new tasks
    var modalCloseAndRefresh = function(e, taskListView) {
        EventHandler.fireCloseEvent(e);
        // ADK.Messaging.trigger('action:draft:refresh');
    };

    // handles all the click events on the form, what is clicked is passed
    // through in formAction
    var startRequestPost = function(collection, formModel, formAction, userSession, patientContext, visitInfo) {
        formModel = escapeAll(formModel);

        var newestActivity = findLatestRequest(collection);

        // Add to form model to be stored into pJDS
        formModel.set({
            deploymentId: newestActivity.get('deploymentId'),
            processDefId: newestActivity.get('id'),
            objectType: "requestActivity",
            // orderingProviderId: userSession.site + ";" + userSession.duz[userSession.site],
            icn: patientContext.get('pid'),
            pid: patientContext.get('pid')
        });

        var formModelJSON = formModel.toJSON();

        var fetchOptions = {
            resourceTitle: 'activities-start',
            fetchType: 'POST',
            cache: false,
            criteria: {
                deploymentId: formModelJSON.deploymentId,
                processDefId: formModelJSON.processDefId,
                parameter: {
                    requestActivity: buildClinicalObject(formModel, formAction, userSession, visitInfo),
                    icn: patientContext.get('pid'),
                    pid: patientContext.get('pid'),
                    instanceName: formModel.get('title'),
                    formAction: formAction,
                    urgency: parseUrgencyId(formModel.get('urgency')).toString(),
                    subDomain: 'Request',
                    assignedTo: routingCode(formModel, formAction),
                    type: 'Order',
                    facility: userSession.site,
                    description: 'Use this activity to request other providers or yourself to complete a patient specific task at any time now or in the future.'
                }

            },
            onSuccess: function(req, res) {
                modalCloseAndRefresh(res);
                if(formAction === "draft") {
                    ADK.Messaging.trigger('action:draft:refresh');
                }
                displayBanner(formAction, 'Request');
            }
        };

        ADK.ResourceService.fetchCollection(fetchOptions);
    };

    var sendSignalPost = function(e, collection, formModel, signalAction, userSession, visitInfo) {
        signalAction = signalAction || '';

        formModel = escapeAll(formModel);
        var newestActivity = findLatestRequest(collection);

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
                if(signalAction === "draft") {
                    ADK.Messaging.trigger('action:draft:refresh');
                }
                displayBanner(signalAction, 'Request');
            }
        };

        ADK.ResourceService.fetchCollection(fetchOptions);
    };

    function sendRequestUpdate(collection, formModel, formAction, userSession, patientContext, visitInfo) {
        formModel = Utils.escapeAll(formModel);

        Async.waterfall([
            function(next) {
                if (formModel.get('taskStatus').toLowerCase() === 'inprogress') {
                    next(null);
                } else {
                    var startResponseTaskPostOptions = {
                        resourceTitle: 'tasks-update',
                        fetchType: 'POST',
                        criteria: {
                            deploymentid: formModel.get('activity') ? formModel.get('activity').deploymentId : formModel.get('deploymentId'),
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
                        deploymentid: formModel.get('activity') ? formModel.get('activity').deploymentId : formModel.get('deploymentId'),
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
                var successBanner = new ADK.UI.Notification({
                    type: 'success',
                    title: 'Response Activity',
                    message: 'Request successfully updated.'
                });
                successBanner.show();
            }

            modalCloseAndRefresh(result);
        });
    }

    var displayBanner = function(action, activityType, options) {
        var suppressBanner = !!(_.get(options, 'suppressBanner', false));
        if (suppressBanner === false) {
            var bannerTitle = (_.capitalize(activityType || 'unknown') + ' Draft Activity');
            var message = 'Successfully ' + constructBannerMessage(action);

            var successBanner = new ADK.UI.Notification({
                title: bannerTitle,
                message: message,
                type: "success"
            });
            successBanner.show();
        }
    };

    var constructBannerMessage = function(action) {
        switch(action) {
            case 'delete':
                return "deleted";
            case 'draft':
                return "created draft";
            default:
                return action;
        }
    };
    
    // Compare two versions numbers and return the highest one
    function versionCompare(v1, v2) {
        // Split version numbers to its parts
        var v1parts = v1.split('.');
        var v2parts = v2.split('.');

        // Shift 0 to the beginning of the version number that might be shorter
        //      ie. 1.2.3 and 1.2.3.4 => 0.1.2.3 and 1.2.3.4
        while (v1parts.length < v2parts.length) v1parts.unshift("0");
        while (v2parts.length < v1parts.length) v2parts.unshift("0");

        // Convert all values to numbers
        v1parts = v1parts.map(Number);
        v2parts = v2parts.map(Number);

        for (var i = 0, l = v1parts.length; i < l; ++i) {
            if (v1parts[i] === v2parts[i]) {
                continue;
            } else if (v1parts[i] > v2parts[i]) {
                return 0;
            } else {
                return 1;
            }
        }

        return -1;
    }

    // Find the latest request deployment
    function findLatestRequest(collection) {
        var requests = [];

        // Get only the request deployments
        collection.each(function(model) {
            // if (model.get('id') === 'Order.Request') {
            if (model.get('id') === 'Order.Request') {
                requests.push(model);
            }
        });


        // Get the list of just the deployment version numbers
        var modReqs = requests.map(function(model) {
            return model.get('deploymentId').split(':').pop();
        });

        // Find the location, in the array, for the largest value
        var newestReq = 0;
        if (modReqs.length > 1) {
            for (var i = 1, l = modReqs.length; i < l; ++i) {
                if (versionCompare(modReqs[newestReq], modReqs[i])) {
                    newestReq = i;
                }
            }
        }
        return requests[newestReq];
    }

    // Escape all the special characters in the models attributes
    function escapeAll(model) {
        // Remove this from attributes
        model.attributes = _.omit(model.attributes, ['_labelsForSelectedValues']);

        _.each(model.attributes, function(value, key) {
            if (typeof value === 'string') {
                model.attributes[key] = _.escape(value);
            }
        });

        return model;
    }

    var eventHandler = {
        handleRequest: function(e, formModel, formAction) {
            var userSession = ADK.UserService.getUserSession().attributes;
            var patientContext = ADK.PatientRecordService.getCurrentPatient();
            var visitInfo = ADK.PatientRecordService.getCurrentPatient().get('visit');

            var fetchOptions = {
                resourceTitle: 'activities-available',
                fetchType: 'GET',
                viewModel: {
                    parse: function (response) {
                        response.uniqueId = _.uniqueId();
                        return response;
                    },
                    idAttribute: 'uniqueId'
                },
                onSuccess: function(collection) {
                    startRequestPost(collection, formModel, formAction, userSession, patientContext, visitInfo);
                }
            };
            //formModel.trigger('draft:saveConsult');
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
                    parse: function (response) {
                        response.uniqueId = _.uniqueId();
                        return response;
                    },
                    idAttribute: 'uniqueId'
                },
                onSuccess: function(collection) {
                    sendRequestUpdate(collection, formModel, formAction, userSession, patientContext, visitInfo);
                }
            };
            //formModel.trigger('draft:saveConsult');
            ADK.ResourceService.fetchCollection(fetchOptions);
        },
        sendSignal: function(e, formModel, formAction) {
            var userSession = ADK.UserService.getUserSession().attributes;
            var patientContext = ADK.PatientRecordService.getCurrentPatient();
            var visitInfo = ADK.PatientRecordService.getCurrentPatient().get('visit');
            // Fetch jbpm deployments
            var fetchOptions = {
                resourceTitle: 'activities-available',
                fetchType: 'GET',
                viewModel: {
                    parse: function (response) {
                        response.uniqueId = _.uniqueId();
                        return response;
                    },
                    idAttribute: 'uniqueId'
                },
                onSuccess: function(collection) {
                    // Find the newest consult deployment
                    sendSignalPost(e, collection, formModel, formAction, userSession, visitInfo);
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
