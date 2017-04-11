define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/patient_information/demographics/views/detail'
], function(
    Backbone,
    Marionette,
    _,
    Handlebars,
    PatientHeaderDetailView
) {
    'use strict';

    var TrayView = ADK.UI.Tray.extend({
        _eventPrefix: 'patientInformationTray',
        options: {
            tray: PatientHeaderDetailView,
            position: 'left',
            buttonView: Backbone.Marionette.ItemView.extend({
                tagName: 'span',
                className: 'fa-stack',
                template: Handlebars.compile('<span class="sr-only">Patient Information</span><i class="fa fa-chevron-circle-right font-size-20"></i>')
            }),
            buttonClass: 'btn-icon btn-xs more-info',
            viewport: '.main-tray-viewport',
            preventFocusoutClose: true,
            containerHeightDifference: 20,
            widthScale: 0.3
        }
    });
    return TrayView;
});