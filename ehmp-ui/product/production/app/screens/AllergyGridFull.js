define([
    "backbone",
    "marionette"
], function(Backbone, Marionette) {
    'use strict';

    var dataGridConfig = {
        id: 'allergy-grid-full',
        context: 'patient',
        contentRegionLayout: 'gridOne',
        appletHeader: 'navigation',
        appLeft: 'patientInfo',
        applets: [{
            id: 'allergy_grid',
            title: 'Allergies',
            region: 'center',
            fullScreen: true,
            viewType: 'expanded'
        }],
        locked: {
            filters: false
        },
        globalDatepicker: false,
        onStart: function() {
            this.setUpEvents();
        },
        setUpEvents: function() {
        },
        patientRequired: true
    };

    return dataGridConfig;
});