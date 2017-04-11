define([], function() {
    'use strict';
    var detailAppletChannels = {
        // mapping of domain --> appletId
    };
    var config = {
        id: 'provider-centric-view',
        context: 'staff',
        contentRegionLayout: 'gridster',
        appletHeader: 'navigation',
        appLeft: 'patientInfo',
        predefined: true,
        freezeApplets: true, //if true, applets won't be draggable and resizable by gridster
        applets: [{
            "id": "todo_list",
            "title": "Tasks",
            "region": "leftAppletRegion", //TODO Look into what it would take to remove "region" from being a required key that has to be defined
            "dataRow": "1",
            "dataCol": "1",
            "dataSizeX": "6",
            "dataSizeY": "12",
            "viewType": "summary",
            "maximizeScreen": "todo-list-provider-full"
        }, {
            "id": "consults",
            "title": "Consults",
            "region": "rightTopAppletRegion",
            "dataRow": "1",
            "dataCol": "2",
            "dataSizeX": "6",
            "dataSizeY": "6",
            "viewType": "summary",
            "maximizeScreen": "consults-staff-full"
        }, {
            "id": "requests",
            "title": "Requests",
            "region": "rightBottomAppletRegion",
            "dataRow": "2",
            "dataCol": "2",
            "dataSizeX": "6",
            "dataSizeY": "6",
            "viewType": "summary",
            "maximizeScreen": "requests-staff-full"
        }],
        onStart: function() {},
        onStop: function() {},
        patientRequired: false
    };

    return config;
});