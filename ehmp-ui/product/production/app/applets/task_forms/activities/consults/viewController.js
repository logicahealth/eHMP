define([
    'backbone',
    'marionette',
    'app/applets/task_forms/activities/consults/views/requestView',
    'app/applets/task_forms/common/views/activityOverview_View',
    'app/applets/task_forms/common/views/activityOverviewFooter_View',
    'app/applets/task_forms/activities/consults/views/signView',
    'app/applets/task_forms/activities/consults/eventHandler',
    'app/applets/task_forms/activities/consults/views/selectConsultType',
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
                        viewModel: new Backbone.Model()
                    }],
                    'actions'
                );
            });

            channel.on('Order.Consult.EDIT', function(params){
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

                OrderEntryUtils.launchOrderEntryForm(params);
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

                var formModel = params.formModel.toJSON();
                var views = [{
                    view: RequestView.form.extend({
                        actions: actions
                    }),
                    viewModel: new RequestView.model(formModel)
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
                    });
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

                workflowSetup(
                    'Scheduling Request',
                    'false', [{
                        view: RequestView.form.extend({
                            actions: actions
                        }),
                        viewModel: new RequestView.model(params.formModel.toJSON())
                    }],
                    'actions'
                );
            });

            channel.on(PROCESSID + 'Sign', function(params) {
                workflowSetup(
                    'Sign Consult Order',
                    'false', [{
                        view: SignView.form.extend({}),
                        viewModel: new Backbone.Model(params.formModel.toJSON())
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

                // return response.promise();
            });

            channel.on(PROCESSID + 'Review', function(params) {
                var response = $.Deferred();
                // Claim task to be completed
                EventHandler.fetchHelper(null, params.model, 'start', null, function() {
                    resolveHelper(response, null, null, false);
                });

                // After task is claimed
                $.when(response).then(function() {
                    // Complete task
                    EventHandler.taskProcessing({}, params.model, '',
                        function() {
                            // After task is completed, navigate to overview screen and open Notes tray
                            ADK.Navigation.displayScreen('overview');
                            $('#patientDemographic-noteSummary button').click();
                        }
                    );
                });
            });
        }
    };

    return viewController;
});
