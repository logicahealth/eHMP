define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'moment',
    'hbs!app/applets/task_forms/common/templates/currentTasks_Template'
    ], function(Backbone, Marionette, _, Handlebars, moment, currentTasksTemplate) {
        'use strict';

        var priority = {
            0: 'High',
            1: 'High',
            2: 'High',
            3: 'High',
            4: 'Medium',
            5: 'Medium',
            6: 'Medium',
            7: 'Low',
            8: 'Low',
            9: 'Low',
            10: 'Low'
        };

        function setOverdueText(dueDate, pastDueDate) {

            var now = moment();
            var ret = {
                '-1': {
                    dueText: 'Past due',
                    dueTextClass: 'text-danger',
                    dueTextValue: -1
                },
                '0': {
                    dueText: 'Due',
                    dueTextClass: '',
                    dueTextValue: 0
                },
                '1': {
                    dueText: '',
                    dueTextClass: '',
                    dueTextValue: 1
                }
            };

            if (moment(now).isBefore(dueDate)) {
                return ret[1];
            }

            if (moment(now).isBetween(dueDate, pastDueDate)) {
                return ret[0];
            }

            return ret[-1];
        }

        var statusMappings = {
            'Active': ['Created', 'Ready', 'Reserved', 'InProgress'],
            'Inactive': ['Completed', 'Failed', 'Exited', 'Suspended'],
            'All': ['All']
        };

        var hasPermissions = function(task) {
            var permission = task.PERMISSION;
            if(_.isString(permission)){
                permission = JSON.parse(permission);
            }

            if (_.isUndefined(permission) || _.isNull(permission)) {
                return true;
            }
            if (_.isEmpty(permission.ehmp) && _.isEmpty(permission.user)) {
                return true;
            }
            var userSession = ADK.UserService.getUserSession();
            var userId = userSession.get('duz')[userSession.get('site')];
            if (ADK.UserService.hasPermissions(permission.ehmp.join('|'))) {
                if (_.isEmpty(permission.user) || _.contains(permission.user, userId)) {
                    return true;
                }
            }
            if (_.contains(permission.user, userId)) {
                if (_.isEmpty(permission.ehmp)) {
                    return true;
                }
            }
            return false;
        };

        return Backbone.Marionette.ItemView.extend({
            template: currentTasksTemplate,
            events: {
                'click .activity-detail-task-table tbody tr': function(e) {
                    var dataTaskId = Number(e.currentTarget.dataset.taskid);

                    if(_.isNumber(dataTaskId)){
                        var task = _.find(this.model.get('tasks'), {TASKID: dataTaskId});
                        var isStaffView = ADK.WorkspaceContextRepository.currentContext.get('id') === 'staff';

                        if(!_.isUndefined(task) && task.hasPermissions){
                            var navigation = task.NAVIGATION;
                            if (_.isObject(task.NAVIGATION)) {
                                ADK.UI.Modal.hide();
                                navigation.parameters.createdBy = {
                                    CREATEDBYNAME: task.CREATEDBYNAME
                                };
                                ADK.PatientRecordService.setCurrentPatient(task.PATIENTICN, {
                                    reconfirm: isStaffView,
                                    navigation: isStaffView,
                                    staffnavAction: {
                                        channel: navigation.channel,
                                        event: navigation.event,
                                        data: navigation.parameters
                                    }
                                });
                            } else {
                                //Temporary fallback until all tasks have a navigation node
                                //Trigger the activity management form router to open the appropriate form.
                                ADK.Messaging.getChannel('activity-management').trigger('show:form', {
                                    taskId: dataTaskId,
                                    taskDefinitionId: task.DEFINITIONID,
                                    clinicalObjectUid: task.CLINICALOBJECTUID
                                });
                            }
                        }
                    }
                }
            },
            initialize: function(options){
                var self = this;
                this.model.bind('change:tasks', this.render);
                var fetchOptions = {
                    resourceTitle: 'tasks-current',
                    fetchType: 'POST',
                    criteria: {
                        processInstanceId: Number(this.model.get('processId'))
                    },
                    viewModel: {
                        parse: function(response){
                            // This should probably be a function in the tasks applet that we can leverage
                            response.DUEDATEFORMATTED = moment(response.DUE).format('MM/DD/YYYY');
                            response.EXPIRATIONTIMEFORMATTED = moment(response.EXPIRATIONTIME).format('MM/DD/YYYY');
                            response.earliestDateMilliseconds = moment(response.DUE).valueOf();
                            response.dueDateMilliseconds = moment(response.EXPIRATIONTIME).valueOf();
                            _.extend(response, setOverdueText(response.DUE, response.EXPIRATIONTIME));

                            if (response.PRIORITY !== undefined) {
                                response.priorityFormatted = priority[response.PRIORITY];
                            }

                            response.statusFormatted = _.findKey(statusMappings, function(mapping) {
                                return _.indexOf(mapping, response.STATUS) > -1;
                            }, response);

                            response.ACTIVE = (response.statusFormatted === 'Active');

                            response.hasPermissions = hasPermissions(response);

                            return response;
                        }
                    },
                    onSuccess: function(collection){
                        self.model.set('tasks', collection.toJSON());
                    }
                };

                ADK.PatientRecordService.fetchCollection(fetchOptions);
            }
        });
    });