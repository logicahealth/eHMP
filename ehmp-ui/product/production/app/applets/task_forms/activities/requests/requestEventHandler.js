define([
    'async',
    'moment',
    'app/applets/task_forms/common/utils/eventHandler',
    'app/applets/task_forms/common/utils/taskFetchHelper',
    'app/applets/orders/writeback/common/assignmentType/assignmentTypeUtils',
    'app/applets/task_forms/common/utils/requestCommonUtils'
], function(Async, moment, EventHandler, TaskFetchHelper, AssignmentTypeUtils, Utils) {
    'use strict';

    var parseAssignment = function(assignment) {
        if (assignment === 'opt_me') {
            return 'Me';
        } else if (assignment === 'opt_person') {
            return 'Person';
        } else if (assignment === 'opt_myteams') {
            return 'My Teams';
        } else if (assignment === 'opt_anyteam') {
            return 'Any Team';
        } else if (assignment === 'opt_patientteams') {
            return 'Patient\'s Teams';
        } else {
            return null;
        }
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
        var assignTo = parseAssignment(formModel.get('assignment'));
        var userSession = ADK.UserService.getUserSession().attributes;
        if (assignTo === 'Me') {
            return userSession.site + ';' + userSession.duz[userSession.site];
        } else if (assignTo === 'Person') {
            return formModel.get('person');
        } else {
            var roles = formModel.get('roles');
            var team = formModel.get('team');

            var friendlyTeamName;
            var friendlyRoleName;
            _.each(formModel.get('storedTeamsList'), function(singleTeam){
                if(singleTeam.teamID == team) {
                    friendlyTeamName = sanitizedRouteString(singleTeam.teamName);
                }
            });

            var codes = [];
            _.each(roles, function(role) {
                _.each(formModel.get('storedRolesList'), function(singleRole){
                    if(singleRole.roleID == role) {
                        friendlyRoleName = sanitizedRouteString(singleRole.name);
                    }
                });
                codes.push('[TM:' + friendlyTeamName + '(' + team + ')/TR:' + friendlyRoleName + '(' + role + ')]');

            });
            return codes.join();
        }
    };

    var sanitizedRouteString = function(value) {
        return _.trim(value.replace(/\(|\)|\:|\[|\]|\,/g, '-'));
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
            displayName: Utils.removeWhiteSpace(formModel.get('title')),
            referenceId: '', // For Request Activity this will be empty string since there is not a corresponding Vista/JDS record.
            instanceName: Utils.removeWhiteSpace(formModel.get('title')),
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
        if (formModel.get('assignment') !== 'opt_me') {
            request.route = {};
            if (formModel.get('assignment') === 'opt_person') {
                request.route.facility = formModel.get('facility');
                request.route.facilityName = formModel.get('facilityName');
                request.route.person = formModel.get('person');
                if (!_.isEmpty(request.route.person) && formModel.has('storedPersonsList')) {
                    request.route.personName = lookupPersonName(formModel.get('storedPersonsList'), request.route.person);
                }
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
                    request.route.facilityName = formModel.get('facilityName');
                }
            }
        }
        return request;
    };

    var buildActivity = function(formModel, formAction, userSession) {
        var activity = {
            objectType: 'activity',
            deploymentId: formModel.get('activity') ? formModel.get('activity').deploymentId : formModel.get('deploymentId'),
            processDefinitionId: formModel.get('activity') ? formModel.get('activity').processDefinitionId : 'Order.Request',
            processInstanceId: formModel.get('activity') ? formModel.get('activity').processInstanceId : '', // Populated when the activity instance is created
            state: formAction,
            initiator: userSession.duz[userSession.site],
            assignTo: parseAssignment(formModel.get('assignment')),
            timeStamp: '',
            urgency: parseUrgencyId(formModel.get('urgency')),
            assignedTo: routingCode(formModel, formAction),
            instanceName: Utils.removeWhiteSpace(formModel.get('title')),
            domain: 'Request',
            sourceFacilityId: ADK.UserService.getUserSession().get('division'),
            destinationFacilityId: formModel.get('facility') ? formModel.get('facility') : ADK.UserService.getUserSession().get('division'),
            type: 'Order'
        };

        return activity;
    };

    var buildRequest = function(formModel, userSession, visitInfo) {
        var request = {
            objectType: 'request',
            taskinstanceId: '',
            urgency: formModel.get('urgency'), // from form
            earliestDate: moment(formModel.get('earliest')).startOf('day').utc().format('YYYYMMDDHHmmss'), // from form
            latestDate: moment(formModel.get('latest')).endOf('day').utc().format('YYYYMMDDHHmmss'), // from form
            title: Utils.removeWhiteSpace(formModel.get('title')), // from form
            assignTo: parseAssignment(formModel.get('assignment')), // from form
            request: Utils.removeWhiteSpace(formModel.get('requestDetails') || ' '), // from form
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

    function lookupPersonName(personList, personID) {
        if (!personList) {
            return null;
        }

        var foundPerson = _.find(personList, function(person) {
            if (!person) {
                return false;
            }

            return (personID === person.personID);
        });

        return foundPerson ? foundPerson.name : null;
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
        Utils.triggerRefresh();
    };

    // handles all the click events on the form, what is clicked is passed
    // through in formAction
    var startRequestPost = function(collection, formModel, formAction, userSession, patientContext, visitInfo, form) {

        var newestActivity = findLatestRequest(collection);

        // Add to form model to be stored into pJDS
        formModel.set({
            deploymentId: newestActivity.get('deploymentId'),
            processDefId: newestActivity.get('id'),
            objectType: 'requestActivity',
            // orderingProviderId: userSession.site + ';' + userSession.duz[userSession.site],
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

    // Compare two versions numbers and return the highest one
    function versionCompare(v1, v2) {
        // Split version numbers to its parts
        var v1parts = v1.split('.');
        var v2parts = v2.split('.');

        // Shift 0 to the beginning of the version number that might be shorter
        //      ie. 1.2.3 and 1.2.3.4 => 0.1.2.3 and 1.2.3.4
        while (v1parts.length < v2parts.length) v1parts.unshift('0');
        while (v2parts.length < v1parts.length) v2parts.unshift('0');

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
            //formModel.trigger('draft:saveConsult');
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