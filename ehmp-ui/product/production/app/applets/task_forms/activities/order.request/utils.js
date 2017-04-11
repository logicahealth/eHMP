define([
    'underscore',
    'moment'
], function (_, moment) {
    'use strict';

    var Utils = {
        setRequest: function(model){
            var clinicalObject = model.get('clinicalObject');
            if(_.has(clinicalObject, 'data') && !_.isEmpty(clinicalObject.data.requests)){
                model.set('request', clinicalObject.data.requests[clinicalObject.data.requests.length - 1]);
            }
        },
        getCreatedAtFacilityName: function(facilityId, facilityCollection){
            var facilityName = '';
            if(!_.isEmpty(facilityId) && !_.isUndefined(facilityCollection)){
                var facility = facilityCollection.findWhere({facilityID: facilityId});
                if(!_.isUndefined(facility)){
                    facilityName = facility.get('vistaName');
                }
            }

            return facilityName;
        },
        setActions: function(model, user){
            var actions = model.get('actions');

            if(!_.isUndefined(actions)){
                var actionButtons = [];

                _.each(model.get('actions'), function(action){
                    switch(action){
                        case 'END':
                            model.set('showDiscontinue', true);
                            break;
                        case 'EDIT':
                            var fullUserId = user.get('site') + ';' + user.get('duz')[user.get('site')];

                            if(model.has('userID') && (model.get('userID') === fullUserId)){
                                actionButtons.push({signal: action, label: 'Edit Request'});
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
             if(!_.isNull(model.get('state'))){
             trimmedState = model.get('state').replace(/ +/g, '');
             }

             if(!_.isNull(model.get('substate'))){
             trimmedSubstate = model.get('substate').replace(/ +/g, '');
             }

             var requestState = trimmedState;
             if(trimmedSubstate){
             requestState += ':' + trimmedSubstate;
             }

             var options = {};
             var activity = null;

             if(_.has(model.get('clinicalObject'), 'data.activity')){
                 activity = model.get('clinicalObject').data.activity;
             }

             var request = model.get('request');

             var params = {
                pid: model.get('pid'),
                requestState: requestState,
                options: this.buildOptions(request, options, activity)
             };
            return params;
        },
        buildEditParameters: function(model){
            var requestState=model.state;
            var request=model.request;
            var activity = model.activity;
            var taskId = model.taskId;
            var taskStatus = model.taskStatus;
            var options = {};
            var params = {
                requestState: requestState,
                options: this.buildOptions(request,options,activity, taskId, taskStatus)
            };

            return params;
        },
        buildOptions: function(request,options,activity, taskId, taskStatus){
            if(!_.isNull(taskId) && !_.isUndefined(taskId)) {
                options.taskId = taskId;
            }

            if(!_.isNull(taskStatus) && !_.isUndefined(taskStatus)) {
                options.taskStatus = taskStatus;
            }

            if(!_.isNull(activity) && !_.isUndefined(activity)) {
                options.activity = activity;
            }
            if(!_.isNull(request)){
                if(!_.isNull(request.urgency)){
                    options.urgency = request.urgency;
                }
                if(!_.isNull(request.earliestDate)){
                    var earliest = request.earliestDate.substring(0, 8);
                    options.earliest = moment(earliest, 'YYYYMMDD').format('MM/DD/YYYY');
                }

                if(!_.isNull(request.latestDate)){
                    var latest = request.latestDate.substring(0, 8);
                    options.latest = moment(latest, 'YYYYMMDD').format('MM/DD/YYYY');
                }

                if(!_.isNull(request.title)){
                    options.title = request.title;
                }

                if(!_.isNull(request.request)){
                    options.requestDetails = request.request;
                }

                if(!_.isNull(request.assignTo)){
                    if(request.assignTo === 'Me'){
                        options.assignment = 'opt_me';
                    } else if(request.assignTo === 'Person'){

                        if (!_.isNull(request.route.facility)) {
                            options.pendingFacility=request.route.facility;
                        }
                        if (!_.isNull(request.route.person)) {
                            options.pendingPerson=request.route.person;
                        }
                        options.assignment = 'opt_person';
                    }
                    else {
                        if (!_.isNull(request.route.team)) {
                            options.pendingTeam=request.route.team.code;
                        }
                        if (!_.isNull(request.route.assignedRoles) && _.isArray(request.route.assignedRoles)) {
                            var pendingRoles = [];
                            _.each(request.route.assignedRoles, function(role) {
                                if (role) {
                                    pendingRoles.push(role.code);
                                }
                            });
                            options.pendingRoles=pendingRoles;
                        }

                        if (request.assignTo === 'My Teams') {
                            options.assignment='opt_myteams';
                        } else if(request.assignTo === 'Patient\'s Teams') {
                            options.assignment = 'opt_patientteams';
                        } else if (request.assignTo === 'Any Team') {
                            if (!_.isNull(request.route.facility)) {
                                options.pendingFacility=request.route.facility;
                            }
                            options.assignment='opt_anyteam';
                        }
                    }
                }
            }

            return options;

        },
        buildAcceptActionModel: function(model, acceptActionModel){
            var deploymentId = model.get('deploymentId');
            var signalName = model.get('signalName');
            var processInstanceId = Number(model.get('processInstanceId'));

            var signalBody = new Backbone.Model({
                objectType: 'requestSignal',
                name: signalName,
                actionText: 'discontinue',
                data: {
                    comment: model.get('comment')
                }
            });

            acceptActionModel.set({
                'deploymentId': deploymentId,
                'signalName': signalName,
                'processInstanceId': processInstanceId,
                'parameter': {'discontinueData':signalBody}
            });

            return acceptActionModel;
        },
    };

    return Utils;
});