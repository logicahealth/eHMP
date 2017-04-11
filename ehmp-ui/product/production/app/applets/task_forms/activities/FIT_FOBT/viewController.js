define([
    'app/applets/task_forms/activities/FIT_FOBT/views/provideTrainingAndKit_View',
    'app/applets/task_forms/activities/FIT_FOBT/views/contactPatientNormalResults_View',
    'app/applets/task_forms/activities/FIT_FOBT/views/contactPatientOrderConsult_View',
    'app/applets/task_forms/activities/FIT_FOBT/views/notification_View',
    'app/applets/task_forms/common/views/modalFooterView'
], function(ProvideTrainingAndKitView, ContactPatientNormalResultsView, ContactPatientOrderConsultView,
    NotificationView, ModalFooterView) {
    "use strict";

    function resolveHelper(response, modalView, footerView, closeOnESC) {
        response.resolve({
            view: modalView,
            footerView: footerView,
            closeOnESC: closeOnESC
        });
    }


    function workflowSetup(title, showProgress, steps, trayId) {
        var workflowOptions = {
            title: title || '',
            showProgress: showProgress || false,
            steps: steps,
            size: 'large'
        };
        var workflowController = new ADK.UI.Workflow(workflowOptions);

        var inTray = {};
        if (trayId) {
            ADK.Navigation.navigate('overview');
            inTray = {
                inTray: trayId
            };
        }
        workflowController.show(inTray);

        return workflowController;
    }

    var viewController = {
        initialize: function(appletId) {
            var channel = ADK.Messaging.getChannel(appletId);

            // Provide training and kit form
            channel.reply('fitlabproject.fitlabactivity-provide_training_and_kit', function(params) {



                return workflowSetup(
                    params.model.get('TASKNAME'),
                    'false', [{
                        view: ProvideTrainingAndKitView.form.extend({
                            taskListView: params.taskListView,
                            taskModel: params.model,
                        }),
                        viewModel: new ProvideTrainingAndKitView.model()
                    }]
                );

            });

            // Contact patient - Normal results form
            channel.reply('fitlabproject.fitlabactivity-contact_patient_-_normal_results', function(params) {



                return workflowSetup(
                    params.model.get('TASKNAME'),
                    'false', [{
                        view: ContactPatientNormalResultsView.form.extend({
                            taskListView: params.taskListView,
                            taskModel: params.model,
                        }),
                        viewModel: new ContactPatientNormalResultsView.model()
                    }]
                );


            });

            // Contact patient - Order consult form
            channel.reply('fitlabproject.fitlabactivity-contact_patient_-_order_consult', function(params) {



                return workflowSetup(
                    params.model.get('TASKNAME'),
                    'false', [{
                        view: ContactPatientOrderConsultView.form.extend({
                            taskListView: params.taskListView,
                            taskModel: params.model,
                        }),
                        viewModel: new ContactPatientOrderConsultView.model()
                    }]
                );

            });

            // Training and Kit past due notification
            channel.reply('fitlabproject.fitlabactivity-provide_training_and_kit_past_due_notification', function(params) {

                return workflowSetup(
                    params.model.get('TASKNAME'),
                    'false', [{
                        view: NotificationView.extend({
                            taskListView: params.taskListView
                        }),
                        viewModel: params.model
                    }]
                );

            });

            // Contact patient - Nnormal results past due notification
            channel.reply('fitlabproject.fitlabactivity-contact_patient_-_normal_results_past_due_notification', function(params) {
                return workflowSetup(
                    params.model.get('TASKNAME'),
                    'false', [{
                        view: NotificationView.extend({
                            taskListView: params.taskListView
                        }),
                        viewModel: params.model
                    }]
                );
            });

            // Contact patient - Oorder consult past due notification
            channel.reply('fitlabproject.fitlabactivity-contact_patient_-_order_consult_past_due_notification', function(params) {
                return workflowSetup(
                    params.model.get('TASKNAME'),
                    'false', [{
                        view: NotificationView.extend({
                            taskListView: params.taskListView
                        }),
                        viewModel: params.model
                    }]
                );
            });

            // Primary Care Provider notification
            channel.reply('fitlabproject.fitlabactivity-primary_care_provider_notification', function(params) {
                return workflowSetup(
                    params.model.get('TASKNAME'),
                    'false', [{
                        view: NotificationView.extend({
                            taskListView: params.taskListView
                        }),
                        viewModel: params.model
                    }]
                );
            });
        }
    };

    return viewController;
});