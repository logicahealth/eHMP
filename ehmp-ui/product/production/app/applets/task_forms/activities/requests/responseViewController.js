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

            channel.reply(PROCESSID + 'Response', function(params) {
                var screen = ADK.Messaging.request('get:current:screen').id;

                if (screen === 'provider-centric-view') {
                    ADK.Navigation.navigate('overview');
                }

                ResponseTrayUtils.launchResponseForm(params);
            });
            channel.reply(PROCESSID + 'Request', function(params) {

                var screen = ADK.Messaging.request('get:current:screen').id;
                if (screen === 'provider-centric-view') {
                    ADK.Navigation.navigate('overview');
                }
                var requests = params.model.attributes.taskVariables.requestActivity.data.requests;
                var modelObj = {
                    request: requests[requests.length - 1],
                    state: params.model.attributes.taskVariables.state,
                    activity: params.model.attributes.taskVariables.activity,
                    taskStatus: params.model.attributes.status,
                    taskId: params.model.attributes.id
                };

                params = Utils.buildEditParameters(modelObj);
                RequestTrayUtils.launchRequestForm(params.options, params.requestState);
            });
        }
    };

    return viewController;
});
