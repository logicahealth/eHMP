define([
    "backbone",
    "marionette"
], function(Backbone, Marionette) {
    'use strict';

    var screenConfig = {
        id: 'vista-health-summaries-full',
        context: 'patient',
        contentRegionLayout: 'gridOne',
        appletHeader: 'navigation',
        appLeft: 'patientInfo',
        applets: [{
            id: 'vista_health_summaries',
            title: 'VistA Health Summaries',
            region: 'center',
            fullScreen: true,
            viewType: 'summary'
        }],
        patientRequired: true,
        globalDatepicker: false,
        locked: {
            filters: false
        }
    };

    return screenConfig;
});