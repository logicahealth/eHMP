define([
    'backbone',
    'marionette',
    'underscore',
    'app/applets/patient_sync_status/views/footerSummary',
    'app/applets/patient_sync_status/views/detailsModalView'
], function(
    Backbone,
    Marionette,
    _,
    FooterSummaryView,
    DetailsModalView
) {
    "use strict";

    var applet = {
        id: "patient_sync_status",
        viewTypes: [{
            type: 'footerSummary',
            view: FooterSummaryView,
            chromeEnabled: false
        }, {
            type: 'details',
            view: DetailsModalView,
            chromeEnabled: false
        }],
        defaultViewType: 'details'
    };

    return applet;
});