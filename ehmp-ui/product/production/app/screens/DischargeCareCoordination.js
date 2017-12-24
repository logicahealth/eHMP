define([
    'backbone',
    'marionette'
], function(Backbone, Marionette) {
    'use strict';
    var screenConfig = {
        id: 'discharge-care-coordination',
        context: 'staff',
        appletHeader: 'navigation',
        appLeft: 'patientInfo',
        predefined: true,
        freezeApplets: true,
        contentRegionLayout: 'gridster',
        applets: [{
            id: 'discharge_followup',
            instanceId: 'discharge-applet-1',
            title: 'Inpatient Discharge Follow-Up',
            region: 'center',
            dataRow: '1',
            dataCol: '1',
            dataSizeX: '12',
            dataSizeY: '12',
            fullScreen: true,
            viewType: 'expanded'
        }],
        locked: {
            filters: false
        },
        patientRequired: false,
        globalDatepicker: false
    };

    return screenConfig;
});
