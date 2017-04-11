define([
    'app/applets/orders/tray/labs/trayView',
    'app/applets/orders/writeback/labs/formModel',
    'app/applets/orders/writeback/writebackUtils'
], function(LabTrayView, LabFormModel, Utils) {
    'use strict';

    return (function() {

        var launchLabForm = function() {
            var formModel = new LabFormModel();
            var options = {
                onBeforeShow: function() {
                    ADK.Messaging.getChannel('addOrders').trigger('visit:ready');
                }
            };
            Utils.launchWorkflow(formModel, LabTrayView, options, 'Order a Lab Test', 'actions');
        };

        return {
            launchLabForm: launchLabForm
        };
    })();
});