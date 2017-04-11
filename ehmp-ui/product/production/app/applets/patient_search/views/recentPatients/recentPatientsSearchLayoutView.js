define([
    'backbone',
    'marionette',
    'app/applets/patient_search/views/common/searchResultsCollectionView',
    'hbs!app/applets/patient_search/templates/mySite/all/mySiteAllSearchResultsTemplate'
], function(Backbone, Marionette, SearchResultsCollectionView, mySiteAllSearchResultsTemplate) {
    'use strict';
    var MySiteAllLayoutView = Backbone.Marionette.LayoutView.extend({
        searchApplet: undefined,
        template: mySiteAllSearchResultsTemplate,
        regions: {
            patientSearchResults: '.patient-search-results'
        },
        initialize: function(options) {
            this.searchApplet = options.searchApplet;
        },
        clearSearchResultsRegion: function() {
            this.patientSearchResults.empty();
        },
        fetchRecentPatients: function() {
            this.clearSearchResultsRegion();
            var patientsView = new SearchResultsCollectionView({
                searchApplet: this.searchApplet
            });
            this.patientSearchResults.show(patientsView);
            var recentPatients = ADK.PatientRecordService.getRecentPatients();
            recentPatients.on('sync', function() {
                if (recentPatients.length === 0) {
                    patientsView.setEmptyMessage('No recent patients found.');
                }
                patientsView.collection = recentPatients;
                patientsView.render();
            });
        }
    });

    return MySiteAllLayoutView;
});