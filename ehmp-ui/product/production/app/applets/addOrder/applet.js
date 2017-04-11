define([
    'app/applets/addOrder/views/addOrderView'
], function(orderAddView) {
    "use strict";

    var applet = {
        id: 'addOrder',
        getRootView: function() {
            return orderAddView;
        }
    };

    (function initMessaging() {
        var channel = ADK.Messaging.getChannel('medicationChannel');
        channel.reply('addOrderModal', function() {
            var View = applet.getRootView();

            var response = $.Deferred();
            response.resolve({
                view: new View()
            });

            return response.promise();
        });
    })();

    return applet;
});
