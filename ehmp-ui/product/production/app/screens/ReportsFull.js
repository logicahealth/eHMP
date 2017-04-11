define([
    "backbone",
    "marionette",
], function(Backbone, Marionette) {
    'use strict';

    var screenConfig = {
        id: 'reports-full',
        context: 'patient',
        contentRegionLayout: 'gridOne',
        appletHeader: 'navigation',
        appLeft: 'patientInfo',
        applets: [{
            id: 'reports',
            title: 'Reports',
            region: 'center',
            fullScreen: true
        }],
        locked: {
            filters: false
        },
        patientRequired: true
    };
    return screenConfig;
});