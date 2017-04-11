define([
    'underscore',
    'backbone',
    'marionette',
    'app/applets/workspaceManager/appletLayoutView',
    'app/applets/workspaceManager/selector/view',
    'app/applets/workspaceManager/navigationButton'
], function(
    _,
    Backbone,
    Marionette,
    AppletLayoutView,
    WorkspaceSelector,
    NavigationButton
) {
    'use strict';

    var RootView = Backbone.Marionette.LayoutView.extend({
        showView: function(event, options) {
            var view = new ADK.UI.FullScreenOverlay({
                view: AppletLayoutView,
                options: {
                    'callShow': true
                }
            });
            view.show();
            view.initGridster();
        }
    });

    var applet = {
        id: 'workspaceManager',
        viewTypes: [{
            type: 'expanded',
            view: RootView,
            chromeEnabled: false
        }, {
            type: 'selector',
            view: WorkspaceSelector,
            chromeEnabled: false
        }, {
            type: 'button',
            view: NavigationButton,
            chromeEnabled: false
        }],
        defaultViewType: 'expanded'
    };


    (function initMessaging() {
        var channel = ADK.Messaging.getChannel('workspaceManagerChannel');
        channel.on('workspaceManager', function() {
            var view = new ADK.UI.FullScreenOverlay({
                view: new AppletLayoutView(),
                options: {
                    'callShow': true
                }
            });
            view.show();
        });
    })();

    return applet;
});