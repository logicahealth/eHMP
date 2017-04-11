define([
    'backbone',
    'marionette',
    'underscore',
    'app/applets/patient_information/demographics/views/main',
    'app/applets/patient_information/postings/views/main',
    'app/applets/patient_information/provider/views/main'
], function(
    Backbone,
    Marionette,
    _,
    DemographicsView,
    PostingsView,
    NEWPostingsView,
    ProviderInfoView
) {
    "use strict";

    var applet = {
        id: "patient_information",
        viewTypes: [{
            type: 'demographics',
            view: DemographicsView,
            chromeEnabled: false
        }, {
            type: 'postings',
            view: PostingsView,
            chromeEnabled: false
        }, {
            type: 'providerInfo',
            view: ProviderInfoView,
            chromeEnabled: false
        }],
        defaultViewType: 'demographics'
    };

    return applet;
});