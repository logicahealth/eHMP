define([
    'underscore',
    'backbone',
    'marionette',
    'app/applets/addApplets/appletLayoutView',
    'app/applets/addApplets/navigationButton'
], function(_, Backbone, Marionette, AppletLayoutView, NavigationButton) {

    'use strict';

    var RootView = Backbone.Marionette.LayoutView.extend({
        showView: function(event, options) {
        }
    });

    var applet = {
        id: 'addApplets',
        viewTypes: [{
            type: 'expanded',
            view: RootView,
            chromeEnabled: false
        }, {
            type: 'button',
            view: NavigationButton,
            chromeEnabled: false
        }],
        defaultViewType: 'expanded'
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
            view.overlayView.setBoundaryIndicator();
        });
    })();

    return applet;
});
