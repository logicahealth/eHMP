define([
    "backbone",
    "marionette"
], function(Backbone, Marionette ) {
    'use strict';

    var dataGridConfig = {
        id: 'immunizations-full',
        context: 'patient',
        contentRegionLayout: 'gridOne',
        appletHeader: 'navigation',
        appLeft: 'patientInfo',
        applets: [{
            id: 'immunizations',
            title: 'Immunizations',
            region: 'center',
            fullScreen: true,
            viewType: 'expanded'
        }],
        locked: {
            filters: false
        },
        onStart: function() {
            this.setUpEvents();
        },
        setUpEvents: function() {
        },
        patientRequired: true,
        globalDatepicker: false
    };

    return dataGridConfig;
});