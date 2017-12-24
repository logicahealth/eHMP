define([
    'underscore',
    'backbone',
    'marionette',
    'jquery',
    'handlebars'
], function(
    _,
    Backbone,
    Marionette,
    $,
    Handlebars
) {
    'use strict';

    var CurrentPatientNameView = Backbone.Marionette.ItemView.extend({
        className: 'current-patient-name',
        template: Handlebars.compile('<h2 class="all-margin-no color-primary-dark top-padding-xs right-padding-md"><strong>{{toTitleCase fullName}}</strong><small class="font-size-14 color-primary-dark"> ({{last5}})</small></h2>'),
        modelEvents: {
            'change:fullName': 'render'
        },
        initialize: function() {
            this.model = ADK.PatientRecordService.getCurrentPatient();
        }
    });

    ADK.Messaging.trigger('register:component', {
        type: "contextHeaderItem",
        group: ["patient", "patient-left"],
        key: "currentPatientName",
        view: CurrentPatientNameView,
        orderIndex: 1,
        shouldShow: function() {
            return (ADK.UserService.hasPermissions('read-patient-record'));
        }
    });

    return CurrentPatientNameView;
});
