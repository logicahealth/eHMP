define([
    'backbone',
    'marionette',
    'app/applets/patient_selection/views/baseSearchView',
    'app/applets/patient_selection/views/table/view',
    'app/applets/patient_selection/views/table/row'
], function(
    Backbone,
    Marionette,
    BaseSearchView,
    SearchResultsCollectionView,
    PatientSearchResultView
) {
    'use strict';

    var SearchView = BaseSearchView.extend({
        _emptyMessage: 'No results found. Please make sure your CPRS Default Search is configured properly.',
        resultsView: SearchResultsCollectionView.extend({
            templateName: 'myCprsList',
            childView: PatientSearchResultView.extend({
                templateName: 'myCprsList'
            })
        }),
        patientRecordResultsCollectionEvents: {
            'error': 'onError'
        },
        initialize: function() {
            this.bindEntityEvents(this.collection, this.patientRecordResultsCollectionEvents);
            this.listenToOnce(ADK.Messaging.getChannel('patient-selection-myCprsList'), 'patientSearchTray.show', this.executeSearch);
        },
        executeSearch: function(myCPRSSearchString) {
            var searchOptions = {
                resourceTitle: 'search-default-search',
                viewModel: {
                    defaults: {
                        ageYears: 'Unk'
                    }
                },
                cache: true,
                collectionConfig: {
                    comparator: function(patient) {
                        return [patient.get('appointment'), patient.get('displayName')];
                    }
                }
            };

            ADK.ResourceService.fetchCollection(searchOptions, this.collection);
        },
        onError: function(model, resp, options) {
            if (!_.isUndefinded(resp.message)) {
                this.showError(resp.message);
            } else {
                this.setEmpty();
                collection.reset();
            }
        },
        onBeforeDestroy: function() {
            this.unbindEntityEvents(this.collection, this.patientRecordResultsCollectionEvents);
        }
    });

    return SearchView;
});