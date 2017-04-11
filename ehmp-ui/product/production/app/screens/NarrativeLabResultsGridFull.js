define([
    "backbone",
    "marionette"
], function(Backbone, Marionette) {
    'use strict';

    /*
     ** AddLab Orders call Modal
     */
    function onAddALabOrderClicked(event) {
        var channel = ADK.Messaging.getChannel('addALabOrderRequestChannel'),
            deferredResponse = channel.request('addLabOrderModal');

        deferredResponse.done(function(response) {
            var addLabOrderApplet = response.view;
            addLabOrderApplet.showModal();
            $('#mainModal').modal('show');
        });
    }

    var dataGridConfig = {
        id: "narrative-lab-results-grid-full",
        context: 'patient',
        contentRegionLayout: 'gridOne',
        appletHeader: 'navigation',
        appLeft: 'patientInfo',
        applets: [{
            id: "narrative_lab_results_grid",
            title: "Narrative Lab Results",
            region: "center",
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
            var addALabOrderChannel = ADK.Messaging.getChannel('addLabOrder');
            addALabOrderChannel.on('addLabOrder:clicked', onAddALabOrderClicked);
        },
        patientRequired: true,
        globalDatepicker: false
    };
    return dataGridConfig;
});