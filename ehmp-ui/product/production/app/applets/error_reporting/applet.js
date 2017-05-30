define([
    'backbone',
    'marionette',
    'underscore',
    'app/applets/error_reporting/report/button'
], function(
    Backbone,
    Marionette,
    _,
    FooterButton
) {
    "use strict";

    var applet = {
        id: "error_reporting",
        viewTypes: [{
            type: 'footer-error-report-button',
            view: FooterButton,
            chromeEnabled: false
        }],
        defaultViewType: 'footer-error-report-button'
    };

    return applet;
});