define([
    'underscore',
    'backbone',
    'marionette',
    'app/applets/addApplets/appletLayoutView'
], function(_, Backbone, Marionette, AppletLayoutView) {

    'use strict';

    var RootView = Backbone.Marionette.LayoutView.extend({
        showView: function(event, options) {
        }
    });

    var applet = {
        id: 'addApplets',
        getRootView: function() {
            return RootView;
        }
    };

    (function initMessaging() {
        var channel = ADK.Messaging.getChannel('addAppletsChannel');
        channel.on('addApplets', function() {
            var view = new ADK.UI.FullScreenOverlay({
                view: new AppletLayoutView(),
                options: {
                    'callShow': true,
                    'keyboard': false
                }
            });
            view.show();
        });
    })();

    return applet;
});
