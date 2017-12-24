define([
    'app/applets/orders/tray/dischargefollowup/responseTrayUtils'
], function(ResponseTrayUtils) {
    'use strict';

    var viewController = {
        initialize: function(appletId) {
            var channel = ADK.Messaging.getChannel(appletId);
            var action = 'Order.DischargeFollowup';

            channel.off(action);
            channel.on(action, function(params) {
                //necessary code when clicking on a task in action tray,
                //to navigate to the 'discharge-follow-up' context
                if (params.workspaceId) {
                    ADK.Navigation.navigate(params.workspaceId);
                }
                ResponseTrayUtils.launchResponseTrayForm(params);
            });
        }
    };

    return viewController;
});