define([
    'underscore',
    'backbone',
    'marionette',
    'app/applets/addApplets/navigationButton',
    'app/applets/addApplets/appletListener'
], function(_, Backbone, Marionette, NavigationButton, AppletListener) {
    'use strict';

    var RootView = Backbone.Marionette.LayoutView.extend({
        showView: function(event, options) {
        }
    });

    AppletListener.start();

    return {
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
});
