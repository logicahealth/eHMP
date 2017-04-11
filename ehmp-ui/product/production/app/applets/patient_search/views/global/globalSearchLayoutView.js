define([
    "backbone",
    "marionette",
    "app/applets/patient_search/views/common/searchResultsCollectionView",
    "hbs!app/applets/patient_search/templates/global/globalSearchResultsTemplate"

], function(Backbone, Marionette, SearchResultsCollectionView, globalSearchResultsTemplate) {
    "use strict";

    // constants
    var NATIONWIDE = 'global';

    var GlobalLayoutView = Backbone.Marionette.LayoutView.extend({
        searchApplet: undefined,
        template: globalSearchResultsTemplate,
        regions: {
            globalSearchResultsRegion: '#globalSearchResults'
        },
        initialize: function(options) {
            this.searchApplet = options.searchApplet;
        },
        clearSearchResultsRegion: function() {
            this.globalSearchResultsRegion.empty();
        },
        displayErrorMessage: function(message) {
            var patientsView = new SearchResultsCollectionView({
                searchApplet: this.searchApplet,
                source: NATIONWIDE
            });
            patientsView.setEmptyMessage(message);
            this.globalSearchResultsRegion.show(patientsView);
        },
        executeSearch: function(globalSearchParameters) {
            var patientsView = new SearchResultsCollectionView({
                searchApplet: this.searchApplet,
                source: NATIONWIDE
            });
            this.globalSearchResultsRegion.show(patientsView);

            var criteria = globalSearchParameters;
            criteria = this.removeEmptyGlobalSearchCriteria(criteria);

            var viewModel = {
                defaults: {
                    ageYears: 'Unk'
                },
                parse: function(response) {
                    delete response.icn;
                    return response;
                }
            };
            var self = this;
            var searchOptions = {};
            searchOptions.resourceTitle = 'search-global-search';
            searchOptions.viewModel = viewModel;
            searchOptions.criteria = criteria;
            searchOptions.fetchType = 'POST';

            searchOptions.onError = function(collection, resp) {
                if (resp.status === 200) {
                    patientsView.setEmptyMessage(resp.responseText);
                } else {
                    var errorMessage = self.searchApplet.getSearchErrorMessage(resp, self.searchApplet.getAlertText('unknownErrorText'));
                    patientsView.setEmptyMessage(errorMessage);
                }
                patientsView.render();
            };
            searchOptions.onSuccess = function(collection, resp) {
                if (resp.msg !== "") {
                    patientsView.setEmptyMessage(resp.msg);
                } else {
                    patientsView.collection = patientsCollection;
                }
                patientsView.render();
            };

            var patientsCollection = ADK.ResourceService.fetchCollection(searchOptions);
        },
        removeEmptyGlobalSearchCriteria: function(criteria) {
            var newCriteria = criteria;
            if (newCriteria !== undefined) {

                if (newCriteria['name.first'] === '') {
                    delete newCriteria['name.first'];
                }
                if (newCriteria['date.birth'] === '') {
                    delete newCriteria['date.birth'];
                }
                if (newCriteria.ssn === '') {
                    delete newCriteria.ssn;
                }
                if (newCriteria['name.first'] !== '' && newCriteria['date.birth'] !== '' && newCriteria.ssn !== '') {
                    newCriteria.triggerSearch = true;
                }

                return newCriteria;
            }
        }
    });

    return GlobalLayoutView;
});
