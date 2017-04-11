define([
    'underscore',
    'backbone',
    'marionette',
    'app/applets/notes/tray/trayView'
], function(_, Backbone, Marionette, NotesTrayView) {
    'use strict';

    var applet = {
        id: 'notes',
        viewTypes: [{
            type: 'tray',
            view: NotesTrayView,
            chromeEnabled: false
        }],
        defaultViewType: 'tray'
    };

    return applet;
});
