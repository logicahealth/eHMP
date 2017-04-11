define(function() {
    'use strict';
    var screenConfig = {
        id: 'appointments-full',
        context: 'patient',
        contentRegionLayout: 'gridOne',
        appletHeader: 'navigation',
        appLeft: 'patientInfo',
        applets: [{
            id: 'appointments',
            title: 'Appointments & Visits',
            region: 'center',
            fullScreen: true,
            viewType: 'expanded'
        }],
        locked: {
            filters: false
        },
        patientRequired: true,
        globalDatepicker: false
    };

    return screenConfig;
});