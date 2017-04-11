define([
    'app/applets/task_forms/activities/sign_note/views/notification_View',
    'app/applets/task_forms/activities/sign_note/views/modalFooterView'
], function(NotificationView, ModalFooterView) {
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
            steps: steps
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
            // Process ID of these forms
            var PROCESSID = 'general_medicine' + '.';
            var channel = ADK.Messaging.getChannel(appletId);

            // Provide training and kit form
            channel.reply(PROCESSID + 'note-sign_note', function(params) {
                return workflowSetup(
                    'Note',
                    'false', [{
                        view: NotificationView,
                        viewModel: params.model
                    }]
                );
            });

            channel.reply(PROCESSID + 'note-sign_note_addendum', function(params) {
                return workflowSetup(
                    'Note Addendum',
                    'false', [{
                        view: NotificationView,
                        viewModel: params.model
                    }]
                );
            });
        }
    };

    return viewController;
});
