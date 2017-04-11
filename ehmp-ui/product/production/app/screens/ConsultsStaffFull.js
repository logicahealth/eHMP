define([
    'backbone',
    'marionette'
], function(Backbone, Marionette) {
    'use strict';
    var screenConfig = {
        id: 'consults-staff-full',
        context: 'staff',
        contentRegionLayout: 'gridOne',
        applets: [{
            id: 'consults',
            title: 'Consults',
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
