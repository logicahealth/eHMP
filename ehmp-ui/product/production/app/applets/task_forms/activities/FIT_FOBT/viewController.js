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
            closeOnESC:closeOnESC
        });
    }

    var viewController = {
        initialize: function(appletId) {
            var channel = ADK.Messaging.getChannel(appletId);

            // Provide training and kit form
            channel.reply('fitlabproject.fitlabactivity-provide_training_and_kit', function(params) {
                var response = $.Deferred();
                // Pass the model to the view to populate template
                var modalView = new ProvideTrainingAndKitView({
                    model: params.model
                });

                var footerView = new ModalFooterView({
                    parentView: modalView,
                    taskListView: params.taskListView
                });

                resolveHelper(response, modalView, footerView, false);
                return response.promise();
            });

            // Contact patient - Normal results form
            channel.reply('fitlabproject.fitlabactivity-contact_patient_-_normal_results', function(params) {
                var response = $.Deferred();
                // Pass the model to the view to populate template
                var modalView = new ContactPatientNormalResultsView({
                    model: params.model
                });

                var footerView = new ModalFooterView({
                    parentView: modalView,
                    taskListView: params.taskListView
                });

                resolveHelper(response, modalView, footerView, false);
                return response.promise();
            });

            // Contact patient - Order consult form
            channel.reply('fitlabproject.fitlabactivity-contact_patient_-_order_consult', function(params) {
                var response = $.Deferred();
                // Pass the model to the view to populate template
                var modalView = new ContactPatientOrderConsultView({
                    model: params.model
                });

                var footerView = new ModalFooterView({
                    parentView: modalView,
                    taskListView: params.taskListView
                });

                resolveHelper(response, modalView, footerView, false);
                return response.promise();
            });

            // Training and Kit past due notification
            channel.reply('fitlabproject.fitlabactivity-provide_training_and_kit_past_due_notification', function(params) {
                var response = $.Deferred();
                // Pass the model to the view to populate template
                var modalView = new NotificationView({
                    model: params.model
                });

                var footerView = new ModalFooterView({
                    parentView: modalView,
                    taskListView: params.taskListView
                });

                resolveHelper(response, modalView, footerView, false);
                return response.promise();
            });

            // Contact patient - Nnormal results past due notification
            channel.reply('fitlabproject.fitlabactivity-contact_patient_-_normal_results_past_due_notification', function(params) {
                var response = $.Deferred();
                // Pass the model to the view to populate template
                var modalView = new NotificationView({
                    model: params.model
                });

                var footerView = new ModalFooterView({
                    parentView: modalView,
                    taskListView: params.taskListView
                });

                resolveHelper(response, modalView, footerView, false);
                return response.promise();
            });

            // Contact patient - Oorder consult past due notification
            channel.reply('fitlabproject.fitlabactivity-contact_patient_-_order_consult_past_due_notification', function(params) {
                var response = $.Deferred();
                // Pass the model to the view to populate template
                var modalView = new NotificationView({
                    model: params.model
                });

                var footerView = new ModalFooterView({
                    parentView: modalView,
                    taskListView: params.taskListView
                });

                resolveHelper(response, modalView, footerView, false);
                return response.promise();
            });

            // Primary Care Provider notification
            channel.reply('fitlabproject.fitlabactivity-primary_care_provider_notification', function(params) {
                var response = $.Deferred();
                // Pass the model to the view to populate template
                var modalView = new NotificationView({
                    model: params.model
                });

                var footerView = new ModalFooterView({
                    parentView: modalView,
                    taskListView: params.taskListView
                });

                resolveHelper(response, modalView, footerView, false);
                return response.promise();
            });
        }
    };

    return viewController;
});
