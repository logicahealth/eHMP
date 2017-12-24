define([
    'backbone',
    'marionette',
    'app/applets/patient_selection/views/baseSearchView',
    'app/applets/patient_selection/views/table/view',
    'app/applets/patient_selection/views/table/row',
    'app/applets/patient_selection/views/wards/filter'
], function(
    Backbone,
    Marionette,
    BaseSearchView,
    SearchResultsCollectionView,
    PatientSearchResultView,
    WardFilter
) {
    'use strict';

    var SearchView = BaseSearchView.extend({
        FilterView: WardFilter,
        patientRecordResultsCollectionEvents: {
            'error': 'onError'
        },
        resultsView: SearchResultsCollectionView.extend({
            templateName: 'wards',
            childView: PatientSearchResultView.extend({
                templateName: 'wards'
            })
        }),
        initialize: function() {
            this.bindEntityEvents(this.collection, this.patientRecordResultsCollectionEvents);
            this.listenTo(ADK.Messaging.getChannel(this.getOption('eventChannelName')), 'execute-search', this.executeSearch);
            this.setEmpty();
        },
        onBeforeShow: function() {
            this.searchResultsRegion.$el.addClass('hidden');
        },
        executeSearch: function(model) {
            if (this.collection.xhr) this.collection.xhr.abort();
            if (!_.isString(model.get('wardLocation'))) {
                this.showError('Invalid location.');
                return;
            }
            this.searchResultsRegion.$el.removeClass('hidden');
            var criteria = {
                uid: model.get('wardLocation')
            };
            var searchOptions = {
                resourceTitle: 'locations-wards-search',
                criteria: criteria,
                cache: true
            };

            ADK.ResourceService.fetchCollection(searchOptions, this.collection);
        },
        onError: function(collection, resp, options) {
            collection.reset(null, {
                silent: true
            });
            if (_.isEqual(resp.statusText,"abort")){
                return;
            }
            this.showError('There was an error retrieving the patient list.  Try again later.');
        },
        onBeforeDestroy: function() {
            this.unbindEntityEvents(this.collection, this.patientRecordResultsCollectionEvents);
        }
    });

    return SearchView;
});