define([], function() {
    'use strict';

    return {
        id: 'individual-permissions-full',
        context: 'admin',
        contentRegionLayout: 'gridster',
        appletHeader: 'navigation',
        applets: [{
            id: 'individual_permissions',
            title: 'Individual Permissions',
            region: 'center',
            fullScreen: true,
            viewType: 'expanded',
            dataRow: '1',
            dataCol: '1',
            dataSizeX: '12',
            dataSizeY: '12'
        }],
        locked: {
            filters: false
        },
        onStart: function() {
            // The container is set too small before the applets are loaded.
            ADK.utils.resize.gridsterResize();
        },
        globalDatepicker: false,
        predefined: true,
        freezeApplets: true,
        patientRequired: false
    };
});