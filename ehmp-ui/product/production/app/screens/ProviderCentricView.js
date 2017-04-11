define([], function() {
    'use strict';
    var detailAppletChannels = {
        // mapping of domain --> appletId
    };
    var config = {
        id: 'provider-centric-view',
        contentRegionLayout: 'gridster',
        appletHeader: 'navigation',
        appHeader: 'nav',
        appLeft: 'patientInfo',
        predefined: true,
        freezeApplets: true, //if true, applets won't be draggable and resizable by gridster
        applets: [
       {
            "id": "todo_list",
            "title": "My tasks",
            "region": "bc2652653929",
            "dataRow": "1",
            "dataCol": "1",
            "dataSizeX": "6",
            "dataSizeY": "6",
            "dataMinSizeX": "4",
            "dataMinSizeY": "4",
            "dataMaxSizeX": "6",
            "dataMaxSizeY": "12",
            "viewType": "summary",
            "maximizeScreen":"todo-list-provider-full"
        }],
        onStart: function() {},
        onStop: function() {},
        patientRequired: false,
        nonPatientCentricView: true
    };

    return config;
});