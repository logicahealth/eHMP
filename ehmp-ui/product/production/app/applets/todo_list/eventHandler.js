define(['backbone',
    'marionette',
    'underscore',
    'handlebars'
], function(Backbone, Marionette, _, Handlebars) {
    "use strict";

    // Fetches the tasks form data
    var fetchTask = function(chlOptions, event, session, taskForm) {
        var fetchOptions = {
            resourceTitle: 'tasks-gettask',
            fetchType: 'get',
            criteria: {
                taskid: chlOptions.model.get('TASKID')
            },
            onSuccess: function(taskObj) {
                // Converting all to object incase the order ever changes
                var variables = arrToObj(taskObj.models[0].get('variables')) || '';
                var taskVariables = variables;

                // If this is a consult, parse taskVariables from response
                if (variables.consultOrder) {
                    taskVariables = JSON.parse(variables.consultOrder);
                }

                // Add the task variables to the tasks model
                chlOptions.model.set('taskVariables', parseTaskStatus(taskVariables));

                launchModal.call(
                    chlOptions.taskListView, event, session, chlOptions, taskForm);
            }
        };
        ADK.ResourceService.fetchCollection(fetchOptions);
    };

    var arrToObj = function(array) {
        var obj = {};
        for (var i = 0, l = array.length; i < l; ++i) {
            obj[array[i].name] = array[i].value;
        }

        return obj;
    };

    var formCheck = function(retrieveTaskForm) {
        return retrieveTaskForm === 'order.consult-finalize_consult_order' ||
            retrieveTaskForm === 'order.consult-triage_consult_order' ||
            retrieveTaskForm === 'order.consult-call_patient' ||
            retrieveTaskForm === 'order.consult-send_letter' ||
            retrieveTaskForm === 'order.consult-sign_consult_order' ||
            retrieveTaskForm === 'order.consult-finalize_consult_scheduling';
    };

    var checkIfProviderScreen = function(req) {
        return req === 'provider-centric-view' || req === 'todo-list-provider-full';
    };

    var checkForPID = function(session) {
        return session !== undefined && session.attributes !== undefined && session.attributes.hasOwnProperty('pid');
    };

    // Parse task status and sub-status
    var parseTaskStatus = function(taskVariables) {
        // If there is no orderState, there is nothing to parse
        if (!taskVariables.orderState) return taskVariables;

        var parsed = taskVariables.orderState.split(':');
        if (parsed.length === 1) {
            taskVariables.subOrderState = '';
        } else if (parsed.length === 2) {
            taskVariables.orderState = parsed[0].trim();
            taskVariables.subOrderState = parsed[1].trim();
        } else {
            console.error('The key "orderState" is being parsed by the charactor "-" to get substate. It seems that "-" is being used more than once.');
        }
        return taskVariables;
    };

    /* 
     * Launch a modal
     *  event: Not being used currently (not sure if other teams need this
     *  session: Can be left blank if also passing in 'taskForm'
     *  taskForm: If passed in, this will override the retrieved task to be launched.
     *               Used to launch a specific modal, not defined by the task (i.e. overview)
     */
    var launchModal = function(event, session, channelOptions, taskForm) {
        var model = channelOptions.model;

        // The format to retrieve the appropriate form for the selected task
        var retrieveTaskForm = taskForm || [
            model.get('PROCESSID').toLowerCase(),
            '-',
            model.get('TASKNAME').replace(/ /g, '_').toLowerCase()
        ].join('');

        var modalSize = 'large';
        if (formCheck(retrieveTaskForm)) {
            modalSize = 'small';
        }

        var req = ADK.Messaging.request('get:current:screen').config.id;

        var taskChannel = ADK.Messaging.getChannel('task_forms');
        // Request appropariate response from task_forms viewController
        var deferredResponse = taskChannel.request(retrieveTaskForm, channelOptions);

        //set the title for each form
        var taskName = taskForm || model.get('TASKNAME');
        var titleText='';
        switch (taskName) {
            case ('Finalize Consult Order'):
                titleText = 'CONSULT ORDER';
            break;
            case ('Triage Consult Order'):
                titleText = 'CONSULT TRIAGE';
            break;
            case ('Finalize Consult Scheduling'):
                titleText = 'SCHEDULING REQUEST';
            break;
            case ('order.activity_overview_screen'):
                titleText = 'Activity Overview - ' + model.get('taskVariables').specialty;
            break;
            default:
                titleText = taskName;
        }

        // Show form from the task_forms viewController response
        deferredResponse.done(function(response, channelOptions) {

            if (formCheck(retrieveTaskForm)) {
                var LayoutView = Backbone.Marionette.LayoutView.extend({
                    template: Handlebars.compile('<div class="body"></div><div class="footer"></div>'),
                    regions: {
                        body: '.body',
                        footer: '.footer'
                    }
                });

                var layoutView = new LayoutView();

                if (checkIfProviderScreen(req)) {
                    if (checkForPID(session)) {
                        ADK.SessionStorage.set.sessionModel('patient', session, 'session');
                    }
                }

                ADK.Navigation.displayScreen("overview");

                var actionChannel = ADK.Messaging.getChannel('action');
                var action = actionChannel.request('getActionTray');
                action.done(function(response2) {
                    var tray = response2.tray;
                    tray.tray.ActionListRegion.show(layoutView);
                    layoutView.body.show(response.view);
                    layoutView.footer.show(response.footerView);
                    tray.tray.$('.panel-title').text(titleText);
                    tray.$('button[data-toggle="sidebar-tray"]').trigger('click');

                });
            } else if (response.view) {
                var modal = new ADK.UI.Modal({
                    view: response.view,
                    options: {
                        size: modalSize,
                        title: titleText,
                        keyboard: response.closeOnESC,
                        footerView: response.footerView,
                        model: model,
                        channelOptions: channelOptions
                    }
                });

                modal.show();
            }

        });
    };

    var eventHandler = {
        modalButtonsOnClick: function(ev) {
            ev.preventDefault();
        },
        todoListViewOnClickRow: function(model, event, session) {
            var channelOptions = {
                model: model,
                navHeader: false,
                taskListView: this
            };

            fetchTask(channelOptions, event, session);
        },
        fetchTask: fetchTask
    };

    return eventHandler;
});
