define([
    'underscore',
    'handlebars',
    'backbone',
    'marionette'
], function(_, Handlebars, Backbone, Marionette) {
    'use strict';

    var ObservationsTray = ADK.Views.TrayActionSummaryList.extend({
        options: {
            key: "observations",
            headerLabel: "Observations",
            dropdownLabel: "New Observation",
            helpMapping: 'observations_tray' // subject to change based on new mappings
        }
    });

    var trayView = ADK.UI.Tray.extend({
        attributes: {
            id: 'patientDemographic-newObservation',
        },
        options: {
            tray: ObservationsTray,
            position: 'right',
            buttonLabel: 'Observations',
            iconClass: 'icon icon-icon_observations'
        }
    });

    ADK.Messaging.trigger('register:component', {
        type: "tray",
        key: "observations",
        group: "writeback",
        orderIndex: 20,
        view: trayView,
        shouldShow: function() {
            return ADK.PatientRecordService.isPatientInPrimaryVista() && ADK.UserService.hasPermissions('add-immunization|add-allergy|add-vital|add-condition-problem');
        }
    });

    return ObservationsTray;
});