define([
    'underscore',
    'backbone',
    'marionette',
    'app/applets/observations/tray/patientHeaderTray'
], function(_, Backbone, Marionette, PatientHeaderTrayActionListView) {
    'use strict';

    return {
        id: 'observations',
        viewTypes: [{
            type: 'tray',
            view: PatientHeaderTrayActionListView,
            chromeEnabled: false
        }],
        defaultViewType: 'tray'
    };
});