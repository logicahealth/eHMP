define([
    'backbone',
    'marionette',
    'underscore',
    'app/applets/military_hist/views/histListView'
], function(Backbone, Marionette, _, HistListView) {
    "use strict";

    var applet = {
        id: 'military_hist',
        viewTypes: [{
            type: 'summary',
            view: HistListView,
            chromeEnabled: true
        } ,{
            type: 'expanded',
            view: HistListView,
            chromeEnabled: true
        }],

        defaultViewType: 'summary'
    };
    return applet;
});