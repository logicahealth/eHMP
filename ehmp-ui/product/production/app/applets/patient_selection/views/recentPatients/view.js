define([
    'backbone',
    'marionette',
    'app/applets/patient_selection/views/baseSearchView',
], function(
    Backbone,
    Marionette,
    BaseSearchView
) {
    'use strict';

    var SearchView = BaseSearchView.extend({
        initialize: function() {
            this.listenToOnce(ADK.Messaging.getChannel('patient-selection-recentPatients'), 'patientSearchTray.show', this.executeSearch);
        },
        executeSearch: function(){
            ADK.PatientRecordService.getRecentPatients(this.collection);
        }
    });

    return SearchView;
});