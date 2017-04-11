define(function() {
    'use strict';
    var screenConfig = {
        id: 'military-history-full',
        contentRegionLayout: 'gridOne',
        appletHeader: 'navigation',
        appHeader: 'nav',
        appLeft: 'patientInfo',
        applets: [{
            id: 'military_hist',
            title: 'Military History',
            region: 'center',
            fullScreen: true,
            viewType: 'expanded'
        }],
        patientRequired: true
    };

    return screenConfig;
});