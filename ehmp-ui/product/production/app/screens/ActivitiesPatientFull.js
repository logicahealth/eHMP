define([
    'backbone',
    'marionette'
], function(Backbone, Marionette) {
    'use strict';
    var screenConfig = {
        id: 'activities-patient-full',
        context: 'patient',
        contentRegionLayout: 'gridOne',
        appletHeader: 'navigation',
        appLeft: 'patientInfo',
        applets: [{
            id: 'activities',
            title: 'Activities',
            region: 'center',
            fullScreen: true,
            viewType: 'expanded'
        }],
        locked:{
            filters: false
        },
        patientRequired: true,
        globalDatepicker: false
    };

    return screenConfig;
});
