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
            "id": "patient_search",
            "title": "Patient Search",
            "region": "88c9e691ddef",
            "dataRow": "1",
            "dataCol": "1",
            "dataSizeX": "2",
            "dataSizeY": "12",
            "dataMinSizeX": "3",
            "dataMinSizeY": "12",
            "dataMaxSizeX": "4",
            "dataMaxSizeY": "12",
            "viewType": "summary"
        }, {
            "id": "todo_list",
            "title": "Tasks",
            "region": "bc2652653929",
            "dataRow": "1",
            "dataCol": "2",
            "dataSizeX": "5",
            "dataSizeY": "12",
            "dataMinSizeX": "4",
            "dataMinSizeY": "4",
            "dataMaxSizeX": "6",
            "dataMaxSizeY": "12",
            "viewType": "summary",
            "maximizeScreen": "todo-list-provider-full"
        }, {
            'id': 'activities',
            'title': 'Activities',
            'region': 'bc2652653930',
            'dataRow': '2',
            'dataCol': '1',
            'dataSizeX': '5',
            'dataSizeY': '12',
            'viewType': 'summary',
            'maximizeScreen': 'activities-staff-full'
        }],
        onStart: function() {},
        onStop: function() {},
        patientRequired: false
    };

    return config;
});