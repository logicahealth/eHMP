define(function() {
    'use strict';
    var config = {
        id: 'ehmp-administration-full',
        context: 'admin',
        contentRegionLayout: 'gridOne',
        appletHeader: 'navigation',
        appLeft: 'patientInfo',
        applets: [{
            id: 'user_management',
            title: 'Users',
            region: 'center',
            showInUDWSelection: true,
            fullScreen: true,
            viewType: 'expanded'
        }],
        patientRequired: false,
        predefined: true,
        freezeApplets: true, //if true, applets won't be draggable and resizable by gridster
        onStart: function() {},
        onStop: function() {}
    };

    return config;
});