define([
    'underscore',
    'backbone'
], function(_, Backbone) {
    'use strict';
    var FINAL_ATTEMPT_CODE = '3';

    var Utils = {
        buildAcceptActionModel: function(model, acceptActionModel) {
            var deploymentId = model.get('deploymentId');
            var signalName = 'END';
            var processInstanceId = Number(_.get(model.get('clinicalObject'), 'data.activity.processInstanceId'));

            var signalBody = new Backbone.Model({
                objectType: 'dischargeSignal',
                name: signalName,
                actionText: 'Discontinue',
                actionId: FINAL_ATTEMPT_CODE,
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
        buildTaskStartModel: function(taskId, deploymentId) {
            if (!_.isUndefined(taskId)) {
                taskId = taskId.toString();
            }
            return new ADK.UIResources.Writeback.Tasks.Model({
                taskid: taskId,
                deploymentid: deploymentId,
                state: 'start',
                processDefId: Utils.DISCHARGE_PROCESS_DEFINITION_ID,
                parameter: {}
            });
        },
        buildTaskActionModel: function(model) {
            var taskIdString = _.get(model, 'attributes.taskId', '').toString();
            var patient = ADK.PatientRecordService.getCurrentPatient();
            var visit = patient.get('visit');
            var user = ADK.UserService.getUserSession();
            var userId = user.get('site') + ';' + user.get('duz')[user.get('site')];

            var parameter = {
                followup: {
                    objectType: 'followup',
                    actionId: Number(model.get('action')),
                    executionUserId: userId,
                    executionUserName: user.get('lastname') + ', ' + user.get('firstname'),
                    visit: {
                        dateTime: _.get(visit, 'dateTime'),
                        location: _.get(visit, 'locationUid'),
                        serviceCategory: _.get(visit, 'serviceCategory')
                    },
                    comment: model.get('comment') || ''
                }
            };

            if (model.get('action') === Utils.TASK_ACTION_REASSIGN) {
                switch(_.get(model.get('assignment'), 'type', '')) {
                    case 'opt_me':
                        parameter.assignmentType = 'Me';
                        parameter.routingCode = userId;
                        break;
                    case 'opt_person':
                        parameter.assignmentType = 'Person';
                        parameter.routingCode = _.get(model.get('assignment'), 'person');
                        break;
                    case 'opt_myteams':
                        parameter.assignmentType = 'My Teams';
                        parameter.routingCode = Utils.generateRoutingCode(model.get('assignment'));
                        break;
                    case 'opt_patientteams':
                        parameter.assignmentType = 'Patient\'s Teams';
                        parameter.routingCode = Utils.generateRoutingCode(model.get('assignment'));
                        break;
                    case 'opt_anyteam':
                        parameter.assignmentType = 'Any Team';
                        parameter.routingCode = Utils.generateRoutingCode(model.get('assignment'), true);
                        break;
                    default:
                        parameter.routingCode = patient.get('pid');
                }
            } else {
                parameter.routingCode = patient.get('pid');
            }

            return new ADK.UIResources.Writeback.Tasks.Model({
                deploymentId: model.get('deploymentId'),
                taskid: taskIdString,
                state: 'complete',
                parameter: parameter
            });
        },
        generateRoutingCode: function(assignment, includeFacility) {
            var routingCode = '';
            if (!_.isUndefined(assignment)) {
                var teamId = _.get(assignment, 'team', '');
                var teamName = _.get(assignment, '_labelsForSelectedValues.team', '');
                var teamRoute = 'TM:' + teamName + '(' + teamId + ')';

                var facility = '';
                if (includeFacility) {
                    var facilityName = _.get(assignment, '_labelsForSelectedValues.facility', '');
                    var facilityId = _.get(assignment, 'facility', '');
                    facility = '/FC:' + facilityName + '(' + facilityId + ')';
                }

                var roleLabels = _.get(assignment, '_labelsForSelectedValues.roles', '').split(',');
                var routes = [];
                _.each(_.get(assignment, 'roles'), function(roleId, index) {
                    var roleRoute = 'TR:' + roleLabels[index] + '(' + roleId + ')';
                    var fullRoute = '[' + teamRoute + '/' + roleRoute + facility + ']';
                    routes.push(fullRoute);
                });

                routingCode = routes.join(',');
            }
            return routingCode;
        },
        TASK_ACTION_SUCCESFUL_CONTACT: '1',
        TASK_ACTION_UNABLE_TO_CONTACT: '2',
        TASK_ACTION_FINAL_ATTEMPT: '3',
        TASK_ACTION_REASSIGN: '4',
        DISCHARGE_PROCESS_DEFINITION_ID: 'Order.DischargeFollowup'
    };

    return Utils;
});