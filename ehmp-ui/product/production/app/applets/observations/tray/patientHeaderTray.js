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
            dropdownLabel: "New Observation"
        }
    });

    var trayView = ADK.UI.Tray.extend({
        attributes: {
            id: 'patientDemographic-newObservation',
        },
        options: {
            tray: ObservationsTray,
            position: 'right',
            buttonLabel: 'Observations'
        }
    });

    ADK.Messaging.trigger('register:component', {
        type: "tray",
        key: "observations",
        group: "writeback",
        orderIndex: 10,
        view: trayView,
        shouldShow: function() {
            return ADK.PatientRecordService.isPatientInPrimaryVista() && ADK.UserService.hasPermissions('add-immunization|add-allergy|add-vital|add-condition-problem');
        }
    });

    return ObservationsTray;
});