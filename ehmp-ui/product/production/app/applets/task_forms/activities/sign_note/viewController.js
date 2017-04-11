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

    var viewController = {
        initialize: function(appletId) {
            // Process ID of these forms
            var PROCESSID = 'general_medicine' + '.';
            var channel = ADK.Messaging.getChannel(appletId);

            // Provide training and kit form
            channel.reply(PROCESSID + 'note-sign_note', function(params) {
                var response = $.Deferred();
                // Pass the model to the view to populate template
                var modalView = new NotificationView({
                    model: params.model
                });
 
                var footerView = new ModalFooterView({
                    parentView: modalView,
                    taskListView: params.taskListView
                });

                resolveHelper(response, modalView, footerView, true);
                return response.promise();
            });
        }
    };

    return viewController;
});
