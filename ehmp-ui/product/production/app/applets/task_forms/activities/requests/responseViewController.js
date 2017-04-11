define([
    'app/applets/orders/tray/requests/responseTrayUtils',
    'app/applets/orders/tray/requests/requestTrayUtils',
    'app/applets/task_forms/activities/order.request/utils'
], function(ResponseTrayUtils,RequestTrayUtils,Utils) {
    'use strict';

    var viewController = {
        initialize: function(appletId) {
            var PROCESSID = 'Request.';
            var channel = ADK.Messaging.getChannel(appletId);

            channel.on(PROCESSID + 'Response', function(params) {
                var screen = ADK.Messaging.request('get:current:screen').id;

                if (screen === 'provider-centric-view') {
                    ADK.Navigation.navigate('overview');
                }

                ResponseTrayUtils.launchResponseForm(params);
            });
            channel.on(PROCESSID + 'Request', function(params) {

                var screen = ADK.Messaging.request('get:current:screen').id;
                if (screen === 'provider-centric-view') {
                    ADK.Navigation.navigate('overview');
                }
                var requests = params.formModel.attributes.requestActivity.data.requests;
                var modelObj = {
                    request: requests[requests.length - 1],
                    state: params.formModel.attributes.state + ": " + params.formModel.attributes.subState,
                    activity: params.formModel.attributes.requestActivity.data.activity,
                    taskStatus: params.formModel.attributes.status,
                    taskId: params.formModel.attributes.taskId
                };

                params = Utils.buildEditParameters(modelObj);
                RequestTrayUtils.launchRequestForm(params.options, params.requestState);
            });
        }
    };

    return viewController;
});
