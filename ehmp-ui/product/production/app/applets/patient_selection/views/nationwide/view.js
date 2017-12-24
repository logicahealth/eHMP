define([
    'backbone',
    'marionette',
    'moment',
    'app/applets/patient_selection/views/baseSearchView',
    'app/applets/patient_selection/views/nationwide/filter'
], function(
    Backbone,
    Marionette,
    moment,
    BaseSearchView,
    NationwideFilter
) {
    'use strict';

    var SearchView = BaseSearchView.extend({
        _emptyMessage: 'No results found. Verify search criteria.',
        FilterView: NationwideFilter,
        patientRecordResultsCollectionEvents: {
            'error': 'onError'
        },
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
            this.searchResultsRegion.$el.removeClass('hidden');
            var fetchCriteria = this.getGlobalSearchCriteria(model);
            if (_.isNull(fetchCriteria)){
                this.showError('Verify that all required fields are populated.');
                return;
            }
            var searchOptions = {
                resourceTitle: 'search-global-search',
                criteria: fetchCriteria,
                fetchType: 'POST',
                viewModel: {
                    defaults: {
                        ageYears: 'Unk'
                    },
                    parse: function(response) {
                        delete response.icn;
                        return response;
                    }
                }
            };

            ADK.ResourceService.fetchCollection(searchOptions, this.collection);
        },
        onError: function(collection, resp, options) {
            collection.reset(null, {
                silent: true
            });
            if (_.isEqual(resp.statusText, "abort")) {
                return;
            }
            if (_.isEqual(resp.status, 200) && _.isString(resp.responseText)) {
                this.showError(resp.responseText);
            } else {
                this.showError('There was an error retrieving the patient list.  Try again later.');
            }
        },
        onBeforeDestroy: function() {
            this.unbindEntityEvents(this.collection, this.patientRecordResultsCollectionEvents);
        },
        getGlobalSearchCriteria: function(model) {
            var criteria = _.transform(model.toJSON(), function(result, value, key) {
                if (_.isEmpty(value)) {
                    return;
                }
                var newKey;
                var newValue = value;
                switch (key) {
                    case 'firstName':
                        newKey = 'name.first';
                        newValue = value.trim().toUpperCase();
                        break;
                    case 'lastName':
                        newKey = 'name.last';
                        newValue = value.trim().toUpperCase();
                        break;
                    case 'dob':
                        newKey = 'date.birth';
                        break;
                    default:
                        newKey = key;
                }
                result[newKey] = newValue;

            });
            
            if (!!criteria['name.first'] &&  !!criteria['name.last'] && !!criteria.ssn) {
                criteria.triggerSearch = true;
                return criteria;
            }

            return null;
        }
    });

    return SearchView;
});