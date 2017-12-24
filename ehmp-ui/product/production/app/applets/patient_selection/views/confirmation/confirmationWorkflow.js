define([
    'underscore',
    'backbone',
    'marionette',
    'handlebars',
    'app/applets/patient_selection/views/confirmation/sensitivity',
    'app/applets/patient_selection/views/confirmation/patient',
    'app/applets/patient_selection/views/confirmation/flags'
], function(
    _,
    Backbone,
    Marionette,
    Handlebars,
    Sensitivity,
    Patient,
    Flags
) {
    'use strict';

    var Confirmation = ADK.UI.Workflow.extend({
        Sensitivity: Sensitivity,
        Patient: Patient,
        Flags: Flags
    });
    return Confirmation;
});
