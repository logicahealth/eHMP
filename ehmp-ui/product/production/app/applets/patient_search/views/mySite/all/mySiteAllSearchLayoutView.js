define([
    'backbone',
    'marionette',
    'app/applets/patient_search/views/common/searchResultsCollectionView',
    'hbs!app/applets/patient_search/templates/mySite/all/mySiteAllSearchResultsTemplate',
    'app/applets/patient_search/views/common/blankView'
], function(Backbone, Marionette, SearchResultsCollectionView, mySiteAllSearchResultsTemplate, BlankView) {
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
            this.patientSearchResults.show(new BlankView());
        },
        executeSearch: function(fullNameFilter) {
            if (fullNameFilter && fullNameFilter !== '') {
                if (fullNameFilter.length < 3) {
                    this.patientSearchResults.show(new BlankView());
                    this.searchApplet.inputView.$el.find('.instructions p span').removeClass('hidden');
                } else {
                    var patientsView = new SearchResultsCollectionView({
                        searchApplet: this.searchApplet
                    });
                    this.patientSearchResults.show(patientsView);

                    var viewModel = {
                        defaults: {
                            ageYears: 'Unk'
                        }
                    };

                    var searchOptions = {
                        viewModel: viewModel,
                        cache: true
                    };

                    var last5Pattern = /^[a-zA-Z]\d{4}$/;
                    if (last5Pattern.test(fullNameFilter)) {
                        searchOptions.criteria = {
                            'last5': fullNameFilter
                        };
                        searchOptions.resourceTitle = 'patient-search-last5';
                    } else {
                        searchOptions.criteria = {
                            'name.full': fullNameFilter,
                            'rows.max': 100
                        };
                        searchOptions.resourceTitle = 'patient-search-full-name';
                    }

                    var self = this;

                    searchOptions.onError = function(model, resp) {
                        if (resp.status === 406) {
                            patientsView.setEmptyMessage('Too many results have returned. Please be more specific in your search criteria.');
                        } else if (resp.status === 400) {
                            patientsView.setEmptyMessage('Invalid search criteria.');
                        }
                        else {
                            var errorMessage = self.searchApplet.getSearchErrorMessage(resp, self.searchApplet.getAlertText('unknownErrorText'));
                            patientsView.setEmptyMessage(errorMessage);
                        }
                        patientsView.render();
                    };
                    searchOptions.onSuccess = function(resp) {
                        if (patientsCollection.length === 0) {
                            patientsView.setEmptyMessage('No patient record found. Please make sure your search criteria is correct.');
                        }
                        patientsView.collection = patientsCollection;
                        patientsView.render();

                        // this has to be checked after render b/c of element availability
                        if (patientsCollection.length > 0) {
                            // size the height of the results
                            self.searchApplet.onResize();

                            // apply scrollbar css to column headers for adjustments.
                            if (self.searchApplet.hasScrollbars($('#main-search-mySiteAll-results .results-table .list-group')[0]).vertical) {
                                $('#main-search-mySiteAll-results .results-table').toggleClass('data-scroll');
                            }
                        }
                    };
                    var patientsCollection = ADK.ResourceService.fetchCollection(searchOptions);
                }
            }
        }
    });

    return MySiteAllLayoutView;
});