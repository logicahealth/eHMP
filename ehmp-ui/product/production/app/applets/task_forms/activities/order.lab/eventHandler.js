define([
    'underscore',
    'moment',
    "app/applets/task_forms/common/utils/utils",
    'app/applets/task_forms/common/utils/eventHandler'
], function(_, moment, Utils, EventHandler) {
    'use strict';

    var LAB_ORDER_FORM_ATTRIBUTES = ['action', 'assignment', 'roles', 'team', 'facility', 'notificationDate', 'comment'];

    var fetchHelper = function(e, taskModel, state, parameterObj, onSuccess) {
        var fetchOptions = {
            resourceTitle: 'tasks-update',
            fetchType: 'POST',
            criteria: {
                deploymentId: taskModel.get('deploymentId'),
                processDefId: taskModel.get('processId'),
                taskid: String(taskModel.get('id')),
                state: state,
                icn: taskModel.get('patientIcn'),
                pid: taskModel.get('patientIcn'),
                parameter: parameterObj
            },
            onSuccess: onSuccess
        };

        ADK.ResourceService.fetchCollection(fetchOptions);
    };

    var sanitizedRouteString = function(value) {
        return _.trim(value.replace(/\(|\)|\:|\[|\]|\,/g, '-'));
    };

    var buildOutGroupsString = function(model) {
        var groupAttributes = ['facility', 'team', 'roles'];
        var groupAttributesMapping = {
            facility: 'FC',
            team: 'TM',
            roles: 'TR'
        };
        var assignment = model.get('assignment');
        var group = _.pick(_.get(assignment, '_labelsForSelectedValues'), groupAttributes);

        var routeString, facilityRoute, teamRoute, roleRoute;

        if (!_.isEmpty(group.facility)) {
            facilityRoute = groupAttributesMapping.facility + ': ' + sanitizedRouteString(group.facility) + '(' + _.get(assignment, 'facility') + ')';
        }
        if (!_.isEmpty(group.team)) {
            teamRoute = groupAttributesMapping.team + ': ' + sanitizedRouteString(group.team) + '(' + _.get(assignment, 'team') + ')';
        }
        var groupObj = [];
        if (_.isString(group.roles)) {
            var roles = group.roles.split(', ');
            _.each(roles, function(value, index) {
                if (!_.isEmpty(teamRoute)) {
                    groupObj.push('[' + (facilityRoute ? facilityRoute + '/' : '') + teamRoute + '/' +
                        groupAttributesMapping.roles + ': ' + sanitizedRouteString(value) + '(' + _.get(assignment, 'roles[' + index + ']') + ')]');
                }
            });
        }

        routeString = groupObj.join(',');
        return routeString;
    };

    // Builds and return the parameter object
    var paramHelper = function(formModel, outFormAction) {
        var out_form_actions = ['Remind Me Later', 'Reassign Reminder', 'Cancel Reminder'];
        if (!_.includes(out_form_actions, outFormAction)) {
            return false;
        }
        var parameterObject = {
            out_formAction: outFormAction,
            out_userComment: formModel.get('comment'),
            out_actor: _.get(formModel.get('assignment'), 'person') // Ensure it must be on the assignment person options
        };

        if (outFormAction === 'Remind Me Later') {
            _.extend(parameterObject, {
                out_notificationDate: moment(formModel.get('notificationDate'), 'MM/DD/YYYY').format('YYYYMMDD')
            });
        }

        if (outFormAction === 'Reassign Reminder') {
            _.extend(parameterObject, {
                out_groups: buildOutGroupsString(formModel)
            });
        }
        return parameterObject;
    };

    var sendSignal = function(e, taskModel, parameterObj, signalAction, onSuccess) {
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
                var newestConsult = Utils.findLatest(collection, 'Order.Consult');
                sendSignalPost(e, newestConsult, taskModel, parameterObj, signalAction, onSuccess);
            }
        };
        ADK.ResourceService.fetchCollection(fetchOptions);
    };

    var sendSignalPost = function(e, newestDeploy, taskModel, parameterObj, signalAction, onSuccess) {
        signalAction = signalAction || '';

        // Format json to match signaling body
        var outFormAction = signalAction;
        parameterObj = _.omit(parameterObj, ['out_formAction']);
        parameterObj.out_order.formAction = outFormAction;

        var fetchOptions = {
            resourceTitle: 'activities-signal',
            fetchType: 'POST',
            cache: false,
            criteria: {
                deploymentId: newestDeploy.id,
                processInstanceId: Number(taskModel.get('activity').processInstanceId),
                signalName: 'orderUpdateSignal',
                parameter: parameterObj
            },
            onSuccess: onSuccess
        };

        ADK.ResourceService.fetchCollection(fetchOptions);
    };

    // Close the modal and refresh the todo list applet to fetch new tasks
    var modalCloseAndRefresh = function(e) {
        EventHandler.fireCloseEvent(e);
        ADK.Messaging.trigger('refresh:applet:todo_list');
    };

    // Given the key, get and return the proper value
    var outOrderValueHelper = function(formModel, taskVar, key) {
        var value = taskVar[key];
        if (formModel && formModel.get(key) !== undefined && formModel.get(key) !== null) {
            value = formModel.get(key);
        }
        return value || '';
    };

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
        validateOutGroupString: function(formModel) {
            if (buildOutGroupsString(formModel).length < 2000) {
                return true;
            }
            return false;
        },
        completeTask: function(e, formModel, orderAction) {
            var action = (formModel && formModel.get('action') || orderAction);
            if (action !== 'Remind Me Later') {
                formModel.set('notificationDate', '');
            }
            if (action === 'Reassign Reminder') {
                formModel.set('out_actor', '');
            }
            fetchHelper(e, formModel, 'complete', paramHelper(formModel, action), _.partial(modalCloseAndRefresh, e));
        },
        saveTask: function(e, formModel) {
            if (formModel.get('sendActivitySignal')) {
                sendSignal(e, formModel, paramHelper(formModel, 'saved'), 'saved',
                    function() {
                        modalCloseAndRefresh(e);
                    }
                );
            } else {
                fetchHelper(e, formModel, 'complete',
                    paramHelper(formModel, 'saved'),
                    function() {
                        modalCloseAndRefresh(e);
                    },
                    formModel
                );
            }
        },
        signTask: function(e, formModel) {
            if (formModel.get('sendActivitySignal')) {
                sendSignal(e, formModel, paramHelper(formModel, 'accepted'), 'accepted',
                    function() {
                        modalCloseAndRefresh(e);
                    });
            } else {
                fetchHelper(e, formModel, 'complete',
                    paramHelper(formModel, 'accepted'),
                    function() {
                        modalCloseAndRefresh(e);
                    }
                );
            }
        },
        beginWorkup: function(e, formModel) {
            if (formModel.get('sendActivitySignal')) {
                sendSignal(e, formModel, paramHelper(formModel, 'workup'), 'workup',
                    function() {
                        modalCloseAndRefresh(e);
                    });
            } else {
                fetchHelper(e, formModel, 'complete',
                    paramHelper(formModel, 'workup'),
                    function() {
                        modalCloseAndRefresh(e);
                    }
                );
            }
        },
        deleteTask: function(e, taskModel, formModel) {
            var fetchOptions = {
                resourceTitle: 'activities-abort',
                fetchType: 'POST',
                criteria: {
                    deploymentId: taskModel.get('deploymentId'),
                    processInstanceId: parseInt(taskModel.get('processInstanceId')),
                },
                onSuccess: function(response) {
                    modalCloseAndRefresh(e);
                }
            };
            //Delete trigger will work once Consult Loading is working
            //This will delete the Clinical Object of the Consult Order
            ADK.ResourceService.fetchCollection(fetchOptions);
        },
        fetchHelper: fetchHelper,
        // Flexible call that exposes all options
        tempTaskProcessing: function(e, taskModel, outFormStatus, onSuccess) {
            fetchHelper(e, taskModel, 'complete',
                paramHelper(taskModel, outFormStatus), onSuccess
            );
            modalCloseAndRefresh(e);
        }
    };

    return eventHandler;
});
