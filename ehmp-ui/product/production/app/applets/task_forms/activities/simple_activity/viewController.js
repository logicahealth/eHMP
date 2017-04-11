define([
    'app/applets/task_forms/activities/simple_activity/views/activityModalView',
    'app/applets/task_forms/activities/simple_activity/views/activityModalFooterView',
    'app/applets/task_forms/activities/simple_activity/views/taskModalView',
    'app/applets/task_forms/activities/simple_activity/views/taskModalFooterView',
    'app/applets/task_forms/common/views/modalFooterView'
], function(ActivityModalView, ActivityModalFooterView, TaskModalView, TaskModalFooterView, ModalFooterView) {
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

            channel.reply('start_activity', function(params) {
                var response = $.Deferred();
                var modalView = new ActivityModalView({
                    model: params.model
                });

                var footerView = new ActivityModalFooterView({
                    parentView: modalView,
                    taskListView: params.taskListView
                });

                resolveHelper(response, modalView, footerView, true);

                return response.promise();
            });

            channel.reply('start_task', function(params) {
                var response = $.Deferred();
                var modalView = new TaskModalView({
                    model: params.model
                });

                var footerView = new TaskModalFooterView({
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
