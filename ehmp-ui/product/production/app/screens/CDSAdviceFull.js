define(function() {
    'use strict';
    var screenConfig = {
        id: 'cds-advice-full',
        context: 'patient',
        contentRegionLayout: 'gridOne',
        appletHeader: 'navigation',
        appLeft: 'patientInfo',
        applets: [{
            id: 'cds_advice',
            title: 'Clinical Reminders',
            region: 'center',
            fullScreen: true,
            viewType: 'expanded'
        }],
        locked: {
            filters: false
        },
        patientRequired: true
    };

    return screenConfig;
});