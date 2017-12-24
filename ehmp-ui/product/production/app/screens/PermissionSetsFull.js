define([], function() {
    'use strict';

    return {
        id: 'permission-sets-full',
        context: 'admin',
        contentRegionLayout: 'gridster',
        appletHeader: 'navigation',
        applets: [{
            id: 'permission_sets',
            title: 'Permission Sets',
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
        globalDatepicker: false,
        predefined: true,
        freezeApplets: true,
        patientRequired: false
    };
});