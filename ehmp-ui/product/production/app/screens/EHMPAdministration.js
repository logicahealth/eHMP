define(function() {
    'use strict';
    var config = {
        id: 'ehmp-administration',
        contentRegionLayout: 'gridTwo',
        appletHeader: 'navigation',
        appLeft: 'patientInfo',
        applets: [{
            id: 'user_management',
            title: 'Users',
            region: 'left',
            showInUDWSelection: true,
            maximizeScreen: 'ehmp-administration-full',
            viewType: 'summary'
        }],
        patientRequired: false,
        predefined: true,
        freezeApplets: true, //if true, applets won't be draggable and resizable by gridster
        onStart: function() {},
        onStop: function() {},
        nonPatientCentricView: true,
        addNavigationTab: true
    };

    return config;
});