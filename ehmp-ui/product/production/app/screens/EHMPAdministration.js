define(function() {
    'use strict';
    var config = {
        id: 'ehmp-administration',
        context: 'admin',
        contentRegionLayout: 'gridster',
        appletHeader: 'navigation',
        appLeft: 'patientInfo',
        applets: [{
            id: 'user_management',
            title: 'Users',
            region: 'top-left',
            dataRow: "1",
            dataCol: "1",
            dataSizeX: "6",
            dataSizeY: "4",
            showInUDWSelection: true,
            maximizeScreen: 'ehmp-administration-full',
            viewType: 'summary'
        }, {
            id: 'individual_permissions',
            title: 'Individual Permissions',
            region: 'top-right',
            dataRow: "7",
            dataCol: "1",
            dataSizeX: "6",
            dataSizeY: "4",
            maximizeScreen: 'individual-permissions-full',
            viewType: 'summary'
        }, {
            id: 'permission_sets',
            title: 'Permission Sets',
            region: 'bottom',
            dataRow: "1",
            dataCol: "5",
            dataSizeX: "12",
            dataSizeY: "8",
            maximizeScreen: 'permission-sets-full',
            viewType: 'expanded'
        }],
        onStart: function() {
            // The container is set too small before the applets are loaded.
            ADK.utils.resize.gridsterResize();
        },
        patientRequired: false,
        predefined: true,
        freezeApplets: true
    };

    return config;
});