define([
    'underscore',
    'backbone',
    'marionette',
    'app/applets/action/tray/trayView'
], function(_, Backbone, Marionette, TrayView) {
    'use strict';

    return {
        id: 'action',
        viewTypes: [{
            type: 'tray',
            view: TrayView,
            chromeEnabled: false
        }],
        defaultViewType: 'tray'
    };
});