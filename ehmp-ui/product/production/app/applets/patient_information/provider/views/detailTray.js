define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/patient_information/provider/views/detail'
], function(
    Backbone,
    Marionette,
    _,
    Handlebars,
    DetailView
) {
    'use strict';

    var TrayView = ADK.UI.Tray.extend({
        _eventPrefix: 'patientInformationTray',
        options: {
            tray: DetailView,
            position: 'left',
            buttonView: Backbone.Marionette.ItemView.extend({
                tagName: 'span',
                className: 'fa-stack',
                template: Handlebars.compile('<span class="sr-only background-color-pure-white">Provider Information</span><i class="fa fa-circle fa-stack-2x color-pure-white"></i><i class="fa fa-chevron-circle-right fa-stack-1x font-size-20"></i>')
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