define([
    'backbone',
    'marionette'
], function(Backbone, Marionette) {
    'use strict';
    var screenConfig = {
        id: 'activities-staff-full',
        context: 'staff',
        contentRegionLayout: 'gridOne',
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
        patientRequired: false,
        globalDatepicker: false
    };

    return screenConfig;
});
