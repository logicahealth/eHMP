define([
    'underscore',
    'moment'
], function(_, moment) {
    'use strict';

    var Utils = {
        setRequest: function(model) {
            var clinicalObject = model.get('clinicalObject');
            var request = _.clone(_.last(_.get(clinicalObject, 'data.requests')));
            if (_.get(request, 'earliestDate')) {
                request.earliestDate = moment.utc(request.earliestDate, 'YYYYMMDDHHmmss').local();
            }
            if (_.get(request, 'latestDate')) {
                request.latestDate = moment.utc(request.latestDate, 'YYYYMMDDHHmmss').local();
            }

            if (_.has(clinicalObject, 'data') && !_.isEmpty(clinicalObject.data.requests)) {
                model.set('request', request);
            }
        },
        getCreatedAtFacilityName: function(facilityId, facilityCollection) {
            var facilityName = '';
            if (!_.isEmpty(facilityId) && !_.isUndefined(facilityCollection)) {
                var facility = facilityCollection.findWhere({
                    facilityID: facilityId
                });
                if (!_.isUndefined(facility)) {
                    facilityName = facility.get('vistaName');
                }
            }

            return facilityName;
        },
        setActions: function(model, user) {
            var actions = model.get('actions');

            if (!_.isUndefined(actions)) {
                var actionButtons = [];

                _.each(model.get('actions'), function(action) {
                    switch (action) {
                        case 'END':
                            model.set('showDiscontinue', true);
                            break;
                        case 'EDIT':
                            var fullUserId = user.get('site') + ';' + user.get('duz')[user.get('site')];

                            if (model.has('userID') && (model.get('userID') === fullUserId) && ADK.UserService.hasPermissions('edit-coordination-request&edit-task&add-task')) {
                                actionButtons.push({
                                    signal: action,
                                    label: 'Edit Request'
                                });
                            }
                            break;
                    }
                });
                model.set('actionButtons', actionButtons);
            }
        },
        buidEditParametersForActivities: function(model) {
            var trimmedState = '';
            var trimmedSubstate = '';
            if (!_.isNull(model.get('state'))) {
                trimmedState = model.get('state').replace(/ +/g, '');
            }

            if (!_.isNull(model.get('substate'))) {
                trimmedSubstate = model.get('substate').replace(/ +/g, '');
            }

            var requestState = trimmedState;
            if (trimmedSubstate) {
                requestState += ':' + trimmedSubstate;
            }

            var options = {};
            var activity = null;
            if (_.has(model.get('clinicalObject'), 'data.activity')) {
                activity = model.get('clinicalObject').data.activity;
            }

            var responses = _.get(model.get('clinicalObject') || {}, 'data.responses', null);
            var request = model.get('request');

            var params = {
                pid: model.get('pid'),
                requestState: requestState,
                options: this.buildOptions(request, responses, options, activity)
            };
            return params;
        },
        buildEditParameters: function(model) {
            var requestState = model.state;
            var request = model.request;
            var responses = model.responses;
            var activity = model.activity;
            var taskId = model.taskId;
            var taskStatus = model.taskStatus;
            var options = {};
            var params = {
                requestState: requestState,
                options: this.buildOptions(request, responses, options, activity, taskId, taskStatus)
            };

            return params;
        },
        buildOptions: function(request, responses, options, activity, taskId, taskStatus) {
            if (!_.isNull(taskId) && !_.isUndefined(taskId)) {
                options.taskId = taskId;
            }

            if (!_.isNull(taskStatus) && !_.isUndefined(taskStatus)) {
                options.taskStatus = taskStatus;
            }

            if (!_.isNull(activity) && !_.isUndefined(activity)) {
                options.activity = activity;
            }
            if (!_.isNull(request)) {
                if (!_.isNull(request.urgency)) {
                    options.urgency = request.urgency;
                }
                if (!_.isNull(request.earliestDate)) {
                    options.earliest = moment.utc(request.earliestDate, 'YYYYMMDDHHmmss').local().format('MM/DD/YYYY');
                }

                if (!_.isNull(request.latestDate)) {
                    options.latest = moment.utc(request.latestDate, 'YYYYMMDDHHmmss').local().format('MM/DD/YYYY');
                }


                if (!_.isNull(request.title)) {
                    options.title = request.title;
                }

                if (!_.isNull(request.request)) {
                    options.requestDetails = request.request;
                }

                var route = _.get(request, 'route');
                var assignment = {};

                if (_.isArray(responses) && responses.length>1 &&
                    _.isEqual(_.get(responses, [responses.length-1, 'action']), 'clarification') &&
                    _.isEqual(_.get(responses, [responses.length-2, 'action']), 'reassign')) {
                    //get the route information of person who sent request for clarification
                    route = _.get(responses, [responses.length - 2, 'route']);
                    _.extend(assignment, {
                        type: this.mapAssignTo(_.get(responses, [responses.length - 2, 'assignTo']))
                    });

                } else if (!_.isNull(request.assignTo)) {
                    _.extend(assignment, {
                        type: this.mapAssignTo(request.assignTo)
                    });
                }
                if(!_.isNull(route) && !_.isUndefined(route)) {
                    _.extend(options, {
                        assignment: this.buildTeamOptions(route, assignment)
                    });
                }
            }
            return options;

        },
        buildTeamOptions: function(route, assignment) {
            if (route.person) {
                _.extend(assignment, {
                    person: route.person
                });
            }
            if (route.team) {
                _.extend(assignment, {
                    team: route.team.code
                });
            }
            if (route.assignedRoles && _.isArray(route.assignedRoles)) {
                var roles = [];
                _.each(route.assignedRoles, function(role) {
                    if (role) {
                        roles.push(role.code);
                    }
                });
                _.extend(assignment, {
                    roles: roles
                });
            }

            if (route.facility) {
                _.extend(assignment, {
                    facility: route.facility,
                    facilityName: route.facilityName
                });
            }
            return assignment;
        },
        mapAssignTo: function (assignTo) {
            if (assignTo === 'My Teams') {
                return 'opt_myteams';
            } else if (assignTo === 'Patient\'s Teams') {
                return 'opt_patientteams';
            } else if (assignTo === 'Any Team') {
                return 'opt_anyteam';
            } else if (assignTo === 'Person') {
                return 'opt_person';
            } else {
                return 'opt_me';
            }
        },
        buildAcceptActionModel: function(model, acceptActionModel) {
            var deploymentId = model.get('deploymentId');
            var signalName = model.get('signalName');
            var processInstanceId = Number(model.get('processInstanceId'));

            var signalBody = new Backbone.Model({
                objectType: 'requestSignal',
                name: signalName,
                actionText: 'Discontinue',
                actionId: '2',
                data: {
                    comment: model.get('comment')
                }
            });

            acceptActionModel.set({
                'deploymentId': deploymentId,
                'signalName': signalName,
                'processInstanceId': processInstanceId,
                'parameter': {
                    'signalBody': signalBody
                }
            });

            return acceptActionModel;
        },
    };

    return Utils;
});