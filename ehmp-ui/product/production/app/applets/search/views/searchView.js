define([
    'backbone',
    'marionette',
    'hbs!app/applets/search/templates/searchTemplate',
    'app/applets/search/views/dateRangeFilterView',
    'app/applets/search/views/resultsContentView',
    'app/applets/search/views/resultsHeaderView',
    'app/applets/search/views/rightSideButtonView'
], function(Backbone, Marionette, searchTemplate, DateRangeFilterView, SearchResultsContentView, SearchResultsHeaderView, RightSideButtonView) {
    'use strict';
    var TEXT_SEARCH_CHANNEL = ADK.Messaging.getChannel('search');
    var SearchView = Backbone.Marionette.LayoutView.extend({
        template: searchTemplate,
        regions: {
            searchDateRangeFilter: '.search-date-range-filter',
            rightSideButtonContent: '.text-search-right-side-button-content',
            searchResultsHeader: '.search-results-header',
            searchResultsContent: '.search-results-content'
        },
        ui: {
            searchResultsContent: '.search-results-content'
        },
        initialize: function(options) {
            this.appletId = options.appletConfig.id;
            this.model = new Backbone.Model({
                numberOfResults: 0,
                synonymList: ''
            });
            this.listenTo(TEXT_SEARCH_CHANNEL, 'newSearch', function() {
                this.ui.searchResultsContent.addClass('percent-height-100');
                this.ui.searchResultsContent.removeClass('auto-overflow');
            });
            this.listenTo(TEXT_SEARCH_CHANNEL, 'newSearchComplete newSearchError', function() {
                this.ui.searchResultsContent.removeClass('percent-height-100');
                this.ui.searchResultsContent.addClass('auto-overflow');
            });
        },
        onRender: function() {
            this.showChildView('rightSideButtonContent', new RightSideButtonView());
            this.showChildView('searchDateRangeFilter', new DateRangeFilterView({
                appletId: this.appletId,
                model: this.model
            }));
            this.showChildView('searchResultsHeader', new SearchResultsHeaderView({
                model: this.model
            }));
            this.showChildView('searchResultsContent', new SearchResultsContentView({
                model: this.model
            }));
        }
    });

    return SearchView;
});