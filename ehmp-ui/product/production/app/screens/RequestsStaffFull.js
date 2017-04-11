define([
    'backbone',
    'marionette'
], function(Backbone, Marionette) {
    'use strict';
    var screenConfig = {
        id: 'requests-staff-full',
        context: 'staff',
        contentRegionLayout: 'gridOne',
        applets: [{
            id: 'requests',
            title: 'Requests',
            region: 'center',
            fullScreen: true,
            viewType: 'expanded'
        }],
        locked:{
            filters: false
        },
        patientRequired: false,
        globalDatepicker: false
    };

    return screenConfig;
});
