define([
    "backbone",
    "marionette"
], function(Backbone, Marionette) {
    'use strict';

    var screenConfig = {
        id: 'notifications-full',
        contentRegionLayout: 'gridOne',
        appletHeader: 'navigation',
        appLeft: 'patientInfo',
        predefined: true,
        freezeApplets: true, //if true, applets won't be draggable and resizable by gridster
        applets: [{
            "id": "notifications",
            "title": "Notifications",
            "region": "center",
            "dataRow": "1",
            "dataCol": "1",
            "dataSizeX": "12",
            "dataSizeY": "12",
            "dataMinSizeX": "4",
            "dataMinSizeY": "2",
            "dataMaxSizeX": "12",
            "dataMaxSizeY": "12",
            "viewType": "expanded",
            "fullScreen": true
        }],
        locked: {
            filters: true
        },
        globalDatepicker: false,
        patientRequired: true,
        onStart: function() {},
        onStop: function() {}
    };
    return screenConfig;
});