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
                var formModel = _.get(params, 'formModel', new Backbone.Model());
                var requestActivity = formModel.get('requestActivity') || {};
                var requests = _.get(requestActivity, 'data.requests');
                var modelObj = {
                    request: _.last(requests),
                    responses:  _.get(requestActivity, 'data.responses'),
                    state: formModel.get('state') + ': ' + formModel.get('subState'),
                    activity: _.get(requestActivity, 'data.activity'),
                    taskStatus: formModel.get('status'),
                    taskId: formModel.get('taskId')
                };

                params = Utils.buildEditParameters(modelObj);
                RequestTrayUtils.launchRequestForm(params.options, params.requestState);
            });
        }
    };

    return viewController;
});
