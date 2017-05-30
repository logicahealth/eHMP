define([
    'backbone',
    'marionette',
    'underscore',
    'app/applets/system_communication/collection',
    'app/applets/system_communication/views/announcements'
], function(
    Backbone,
    Marionette,
    _,
    AnnouncementsCollection,
    AnnouncementsView
) {
    "use strict";

    var applet = {
        id: 'system_communication',
        viewTypes: [{
            type: 'announcements',
            view: AnnouncementsView,
            chromeEnabled: false
        }],
        defaultViewType: 'announcements'
    };
    return applet;
});
