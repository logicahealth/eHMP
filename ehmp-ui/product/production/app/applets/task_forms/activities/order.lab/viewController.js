define([
    'backbone',
    'marionette',
    'moment',
    'app/applets/task_forms/activities/order.lab/views/trayView',
    'app/applets/orders/writeback/writebackUtils',
    'app/applets/orders/taskNavigation'
], function(Backbone, Marionette, moment, LabTrayView, Utils, TaskNavigation) {
    "use strict";

    function workflowSetup(title, showProgress, steps, trayId) {
        var workflowOptions = {
            title: title || '',
            showProgress: showProgress || false,
            steps: steps
        };
        var workflowController = new ADK.UI.Workflow(workflowOptions);

        var inTray = {};
        if (trayId) {
            inTray = {
                inTray: trayId
            };
        }
        workflowController.show(inTray);

        return workflowController;
    }

    var viewController = {
        initialize: function(appletId) {
            var PROCESSID = 'Lab.';
            var channel = ADK.Messaging.getChannel(appletId);

            channel.on(PROCESSID + 'Contact_Lab', function(params) {
                params.processName = 'Contact_Lab';
                showLabOrderTasks(params);
            });

            channel.on(PROCESSID + 'Contact_Patient', function(params) {
                params.processName = 'Contact_Patient';
                showLabOrderTasks(params);
            });

            var showLabOrderTasks = function(params) {
                var model = params.formModel;
                var clinicalObjectUid = model.get('clinicalObjectUid');

                var formModel = new Backbone.Model({
                    id: params.taskId,
                    processName: params.processName,
                    deploymentId: model.get('deploymentId'),
                    processId: model.get('processId'),
                    patientIcn: model.get('patientIcn'),
                    title: params.taskName,
                    taskDescription: params.taskName,
                    state: model.get('state'),
                    subState: model.get('subState'),
                    processInstanceId: model.get('processInstanceId'),
                    notificationDate: moment(model.get('notificationDate'), 'YYYYMMDD').format('MM/DD/YYYY') || ''
                });

                if (!_.isEmpty(clinicalObjectUid)) {
                    var callback = function(model) {
                        if (!_.isEmpty(model.get('localId'))) {

                            _.extend(formModel, {
                                orderId: model.get('localId'),
                                uid: model.get('uid')
                            });

                            var detailModel = new ADK.UIResources.Writeback.Orders.Detail(formModel);
                            formModel.set('action', 'Remind Me Later');

                            formModel.listenTo(detailModel, 'read:success', function(model, resp) {
                                var orderDetail = model.get('detail').replace(/(\r\n|\n|\r)/gm, '//');
                                formModel.set('detail', orderDetail);
                                return workflowSetup(
                                    formModel.get('title'),
                                    'false', [{
                                        view: LabTrayView,
                                        viewModel: formModel
                                    }],
                                    'actions'
                                );
                            });

                            formModel.listenTo(detailModel, 'read:error', function(model, resp) {
                                console.log('Server error occurred while retrieving order detail');
                            });

                            detailModel.execute();
                        }
                    };
                    TaskNavigation.fetchOrderDetails.call(formModel, {
                        clinicalObjectUid: clinicalObjectUid
                    }, callback);
                }
            };
        }
    };

    return viewController;
});