define([
    'backbone',
    'marionette',
    'app/applets/task_forms/activities/order.consult/views/request/requestView',
    'app/applets/task_forms/common/views/activityOverview_View',
    'app/applets/task_forms/common/views/activityOverviewFooter_View',
    'app/applets/task_forms/activities/order.consult/views/signView',
    'app/applets/task_forms/activities/order.consult/eventHandler',
    'app/applets/task_forms/activities/order.consult/views/selectConsultType',
    'app/applets/task_forms/activities/fields',
    'app/applets/orders/tray/consults/orderEntryUtils'
], function(Backbone, Marionette, RequestView, ActivityOverviewView, ActivityOverviewFooterView,
    SignView, EventHandler, SelectConsultType, Fields, OrderEntryUtils) {
    "use strict";

    function resolveHelper(response, modalView, footerView, closeOnESC) {
        response.resolve({
            view: modalView,
            footerView: footerView,
            closeOnESC: closeOnESC
        });
    }

    function workflowSetup(title, showProgress, steps, trayId, headerOptions) {
        var workflowOptions = {
            title: title || '',
            showProgress: showProgress || false,
            steps: steps,
            headerOptions: headerOptions
        };
        var workflowController = new ADK.UI.Workflow(workflowOptions);

        var inTray = {};
        if (trayId) {
            inTray = {
                inTray: trayId
            };
        }
        workflowController.show(inTray);
    }

    var viewController = {
        initialize: function(appletId) {
            var PROCESSID = 'Consult' + '.';
            var channel = ADK.Messaging.getChannel(appletId);

            channel.on(PROCESSID + 'consult-select_consult_type', function(params) {
                workflowSetup(
                    'Consult Order',
                    'false', [{
                        view: SelectConsultType,
                        viewModel: new Backbone.Model(),
                        helpMapping: 'consult_select_form'
                    }],
                    'actions'
                );
            });

            channel.on('Order.Consult.EDIT', function(params) {
                var screen = ADK.Messaging.request('get:current:screen').id;
                if (screen === 'provider-centric-view') {
                    ADK.Navigation.navigate('overview');
                }

                OrderEntryUtils.launchOrderEntryForm(params);
            });

            channel.on(PROCESSID + 'Accept', function(params) {
                var screen = ADK.Messaging.request('get:current:screen').id;
                if (screen === 'provider-centric-view') {
                    ADK.Navigation.navigate('overview');
                }

                OrderEntryUtils.launchOrderEntryForm($.extend(params, {
                    visitNotRequired: true
                }));
            });

            // Triage consult order form
            channel.on(PROCESSID + 'Triage', function(params) {
                // Populate form with the correct select actions based on form
                var actions = [{
                    value: 'triaged',
                    label: 'Send to Scheduling'
                }, {
                    value: 'clarification',
                    label: 'Return for Clarification'
                }, {
                    value: 'assigned',
                    label: 'Assign to triage member'
                }, {
                    value: 'eConsult',
                    label: 'eConsult'
                }, {
                    value: 'communityCare',
                    label: 'Referred to Community Care'
                }];

                var formModel = $.extend(true, {}, _.omit(params.formModel.attributes, ['consultOrder']), params.formModel.get('consultOrder'));
                var views = [{
                    view: RequestView.form.extend({
                        actions: actions
                    }),
                    viewModel: new RequestView.model(formModel),
                    helpMapping: 'consult_triage_form'
                }];

                // Send signal to change the state of the consult to Action if opened for the first time
                if (params.taskDefinitionId === 'Consult.Triage' && formModel.state !== 'Active') {
                    EventHandler.sendSignal(null, params.formModel, {
                        signalBody: {
                            objectType: 'signalBody',
                            comment: 'order activate',
                            userId: _.get(formModel, 'orderingProvider.uid')
                        }
                    }, 'ORDER.ACTIVATE', function() {
                        // Set order state to Active
                        views[0].viewModel.set('state', 'Active');
                        views[0].viewModel.set('subState', 'Under Review');
                        workflowSetup('Consult Triage', 'false', views, 'actions');
                    }, true);
                } else {
                    workflowSetup('Consult Triage', 'false', views, 'actions');
                }
            });

            // Consult scheduling form
            channel.on(PROCESSID + 'Scheduling', function(params) {
                // Populate form with the correct select actions based on form
                var actions = [{
                    value: 'scheduled',
                    label: 'Scheduled'
                }, {
                    value: 'contacted',
                    label: 'Contact Patient'
                }, {
                    value: 'communityCare',
                    label: 'Referred to Community Care'
                }, {
                    value: 'EWL',
                    label: 'Electronic Waiting List'
                }];

                var formModel = $.extend(true, {}, params.formModel.get('consultOrder'), _.omit(params.formModel.attributes, ['consultOrder']), _.omit(params, ['formModel']));

                workflowSetup(
                    'Scheduling Request',
                    'false', [{
                        view: RequestView.form.extend({
                            actions: actions
                        }),
                        viewModel: new RequestView.model(formModel),
                        helpMapping: 'consult_scheduling_form'
                    }],
                    'actions'
                );
            });

            channel.on(PROCESSID + 'Sign', function(params) {
                var formModel = $.extend(true, {}, params.formModel.get('consultOrder'), _.omit(params.formModel.attributes, ['consultOrder']), _.omit(params, ['formModel']));
                workflowSetup(
                    'Sign Consult Order',
                    'false', [{
                        view: SignView.form.extend({}),
                        viewModel: new Backbone.Model(formModel),
                        helpMapping: 'consult_esig_form'
                    }],
                    ''
                );
            });

            // ======================================================
            //              REDIRECT TO ANOTHER APPLET
            // ======================================================

            channel.on(PROCESSID + 'Complete', function(params) {
                var response = $.Deferred();
                // Claim task to be completed
                EventHandler.fetchHelper(null, params.model, 'start', null, function() {
                    resolveHelper(response, null, null, false);
                });

                // After task is claimed
                $.when(response).then(function() {
                    // Complete task
                    EventHandler.taskProcessing({}, params.model, 'signed',
                        function() {
                            // After task is completed, navigate to overview screen and open Notes tray
                            ADK.Navigation.displayScreen('overview');
                            $('#patientDemographic-noteSummary button').click();
                        }
                    );
                });
            });

            channel.on(PROCESSID + 'Review', function(params) {
                if (!params.formModel) {
                    console.error('Task model is undefined');
                    return;
                }

                var formModel = new Backbone.Model(params.formModel.attributes);
                var FormView = Backbone.Marionette.ItemView.extend({
                    model: formModel,
                    initialize: function() {
                        // Listener to open activity detail modal
                        this.listenToOnce(ADK.Messaging.getChannel('task-event'), 'show:activitydetail', function() {
                            ADK.Messaging.getChannel('task_forms').request('activity_detail', {
                                processId: formModel.get('processInstanceId')
                            });
                            EventHandler.modalCloseAndRefresh();
                        });
                    }
                });
                var formView = new FormView();

                var visitInfo = ADK.PatientRecordService.getCurrentPatient().toJSON().visit;
                var userSession = ADK.UserService.getUserSession().toJSON();
                var userName = [userSession.lastname, ',', userSession.firstname].join('');
                var uid = [userSession.site, userSession.duz[userSession.site]].join(';');
                EventHandler.sendSignalPost.call(formView, {}, formModel.get('deploymentId'), formModel.get('processInstanceId'), {
                    signalBody: {
                        objectType: "signalBody",
                        actionText: "Review Completed",
                        comment:"consult completed",
                        executionUserId: uid,
                        executionUserName: userName,
                        visit: {
                            location: visitInfo.locationUid,
                            serviceCategory: visitInfo.serviceCategory,
                            dateTime: visitInfo.dateTime
                        }
                    }
                }, 'REVIEW', function() {
                    // Trigger activity detail listener
                    ADK.Messaging.getChannel('task-event').trigger('show:activitydetail');
                }, true);
            });
        }
    };

    return viewController;
});
