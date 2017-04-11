define([
    'underscore',
    'app/applets/task_forms/common/views/activityOverview',
    'app/applets/task_forms/activities/simple_activity/utils/popupView',
    'app/applets/orders/tray/requests/requestTrayUtils',
    'hbs!app/applets/task_forms/activities/simple_activity/templates/lockedModalFooterTemplate'
], function(_, ActivityOverview, PopupView, RequestTrayUtils, LockedModalFooterTemplate) {
    "use strict";

    function resolveHelper(response, modalView, footerView, closeOnESC) {
        response.resolve({
            view: modalView,
            footerView: footerView,
            closeOnESC: closeOnESC
        });
    }

    var viewController = {
        initialize: function(appletId) {
            //Activity management form router
            var taskChannel = ADK.Messaging.getChannel('task_forms');
            var activityChannel = ADK.Messaging.getChannel('activity-management');
            activityChannel.on('show:form', function(params) {
                if (!_.isUndefined(params.processDefinitionId) && !_.isUndefined(params.signalFormId)) {
                    //If processDefinitionId and signalFormId then is activity signal and needs to skip
                    //pulling a task.
                    taskChannel.request(params.processDefinitionId + '.' + params.signalFormId, params);
                } else {
                    //Fetch task will call function launchForm() when it returns with a task.
                    fetchTask(params);
                }
            });

            var channel = ADK.Messaging.getChannel('task_forms');
            channel.reply('activity_detail', function(params) {
                ActivityOverview.startActivityDetails(params.processId);
            });

            channel.reply('edit:request', function(params) {
                var contextType = ADK.WorkspaceContextRepository.currentContext.get('id');
                if (contextType === 'staff') {
                    ADK.PatientRecordService.setCurrentPatient(params.pid, {
                        navigation: true,
                        callback: function() {
                            RequestTrayUtils.launchRequestForm(params.options, params.requestState);
                        }
                    });
                } else {
                    RequestTrayUtils.launchRequestForm(params.options, params.requestState);
                }
            });
        }
    };

    // Fetches the task's data
    var fetchTask = function(params) {
        var fetchOptions = {
            resourceTitle: 'tasks-gettask',
            fetchType: 'get',
            cache: false,
            criteria: {
                taskid: params.taskId
            },
            onSuccess: function(resp) {
                var taskObj = resp.models[0];
                var currentUser = ADK.UserService.getUserSession();
                var site = currentUser.get('site');
                var duz = currentUser.get('duz')[site];
                var userId = site + ';' + duz;
                var status = taskObj.get('status');
                var ownerId = taskObj.get('actualOwnerId');
                taskObj.set('lockedDate', moment(taskObj.get('statusTimeStamp')).format('MM/DD/YYYY HH:mm'));

                if (status === 'Ready' || (status === 'Reserved' && (ownerId === userId)) || (status === 'InProgress' && (ownerId === userId))) {
                    //If the task isn't 'locked' proceed to form
                    launchForm(params, taskObj);
                } else {
                    //Else we need to show the locked modal and ask if the user wants to unlock the task.
                    lockModal(params, taskObj);
                }
            }
        };
        ADK.ResourceService.fetchCollection(fetchOptions);
    };

    //If task is 'locked' this is the code that's run before the form is launched.
    var lockModal = function(params, taskObj) {
        var headerView = Backbone.Marionette.ItemView.extend({
            template: Handlebars.compile('<h4 class="modal-title"><i class="fa fa-lock font-size-18 left-padding-sm right-padding-xs" aria-hidden="true"></i>Task is Currently Locked</h4>')
        });
        var view = new PopupView({
            model: taskObj
        });
        var modalOptions = {
            'size': 'normal',
            'headerView': headerView,
            'footerView': Backbone.Marionette.ItemView.extend({
                template: LockedModalFooterTemplate,
                events: {
                    'click #unlockBtn': 'unlock',
                    'click #activDetailBtn': 'activDetail'
                },
                params: params,
                model: taskObj,
                unlock: function(event) {
                    event.preventDefault();
                    this.fetchUnlock();
                },
                activDetail: function(event) {
                    ActivityOverview.startActivityDetails(params.activityId);
                },
                onSuccess: function(obj) {
                    ADK.UI.Modal.hide();
                    launchForm(this.params, this.model);
                },
                onError: function(err, msg) {
                    var alertView = new ADK.UI.Notification({
                        title: 'Unable to unlock task',
                        icon: 'fa-info',
                        type: 'warning',
                        message: msg.responseText
                    });
                    alertView.show();
                },
                fetchUnlock: function() {
                    var fetchCollection = new Backbone.Collection() || this.collection;

                    var fetchOptions = {
                        resourceTitle: 'tasks-update',
                        fetchType: 'POST',
                        pageable: false,
                        cache: false,
                        criteria: {
                            taskid: this.model.get('id').toString(),
                            deploymentid: this.model.get('deploymentId'),
                            state: "release",
                            parameter: {}
                        },
                    };
                    _.extend(fetchOptions, {
                        onSuccess: function(collection) {
                            collection.trigger('fetchcall:success');
                        },
                        onError: function(collection) {
                            collection.trigger('fetchcall:error');
                        }
                    });
                    this.listenToOnce(fetchCollection, 'fetchcall:success', this.onSuccess);
                    this.listenToOnce(fetchCollection, 'fetchcall:error', this.onError);

                    ADK.ResourceService.fetchCollection(fetchOptions, fetchCollection);
                }
            })
        };
        var modal = new ADK.UI.Modal({
            view: view,
            options: modalOptions
        });
        modal.show();
    };

    var launchForm = function(params, taskObj) {
        //Getting the id by which to launch the appropriate form.
        if (!params.taskDefinitionId) {
            console.error('Missing required variable "taskDefinitionId" to navigate to correct form.');
            return;
        }

        var formModel = buildFormModel(taskObj.get('variables'));
        $.extend(formModel, _.pick(params, ['activityId', 'taskDefinitionId', 'taskId', 'taskName']));
        $.extend(formModel, _.pick(taskObj.attributes, ['deploymentId', 'processId', 'processInstanceId']));
        params.formModel = new Backbone.Model(formModel);
        ADK.Messaging.getChannel('task_forms').trigger(params.taskDefinitionId, params);
    };

    var buildFormModel = function(processVariables) {
        // Values to pull out of the clinical object to be used for the forms
        var PICK = [
            'consultOrder',
            'state',
            'icn',
            'signalOwner_internal',
            'deploymentId',
            'clinicalObjectUid',
            'notificationDate'
        ];
        var parts = _.pick(arrToObj(processVariables), PICK);

        // Build formModel
        var formModel = {};
        $.extend(formModel, {
            processInstanceId: parts.processInstanceId,
            patientIcn: parts.icn,
            state: parts.state,
            deploymentId: parts.deploymentId,
            consultOrder: parts.consultOrder,
            clinicalObjectUid: parts.clinicalObjectUid,
            notificationDate: parts.notificationDate
        });

        // Parse state into state and substate
        if (_.has(formModel, 'state')) {
            if (!_.isEmpty(formModel.state)) {
                var parsed = formModel.state.split(':');
                if (parsed.length === 1) {
                    formModel.subState = '';
                } else if (parsed.length === 2) {
                    formModel.state = parsed[0].trim();
                    formModel.subState = parsed[1].trim();
                } else {
                    console.error('The key "state" is being parsed by the character ":" to get substate. It seems that "-" is being used more than once.');
                }
            }
        }

        return formModel;
    };

    // Helper function
    var arrToObj = function(array) {
        var obj = {};
        for (var i = 0, l = array.length; i < l; ++i) {
            obj[array[i].name] = parseJson(array[i].value);
        }

        return obj;
    };

    // Recursively convert to json
    var parseJson = function(str) {
        var obj;
        try {
            obj = JSON.parse(str);
            _.each(obj, function(value, key) {
                obj[key] = parseJson(value);
            });
        } catch (e) {
            return str;
        }
        return obj;
    };

    return viewController;
});