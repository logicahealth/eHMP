define([
    "backbone",
    "marionette",
    "app/applets/patient_search/views/mySite/clinics_wards/singleSearchResultView",
     "app/applets/patient_search/views/common/loadingView",
], function(Backbone, Marionette, SingleSearchResultView, LoadingView) {
    "use strict";

    var SCROLL_TRIGGERPOINT = 50;
    var SCROLL_ADDITIONAL_ROWS = 100;
    var INITIAL_NUMBER_OF_ROWS = 30;

    var ErrorView = Backbone.Marionette.ItemView.extend({
        template: _.template('<p class="error-message padding">No results were found.</p>'),
        className: 'all-padding-md',
        attributes: {
            'aria-live': 'assertive'
        }
    });

    var SiteResultsCollectionView = Backbone.Marionette.CollectionView.extend({
        searchView: undefined,
        locationFilterView: undefined,
        emptyView: LoadingView,
        filterFields: ['name'],
        initialize: function(options) {
            this.searchView = options.searchView;
            this.locationFilterView = options.locationListFilterView;
            this.locationType = options.locationType;
            this.searchApplet = options.searchApplet;
            var siteCode = ADK.UserService.getUserSession().attributes.site;
            var self = this;

            var searchOptions = {
                resourceTitle: (this.locationType === 'clinics' ? 'write-pick-list-clinics-fetch-list' : 'write-pick-list-wards-fetch-list'),
                criteria: {
                    site: siteCode
                },
                cache: true,
                pageable: true
            };
            searchOptions.onError = function(model, resp) {
                self.emptyView = ErrorView;
                self.render();
            };
            searchOptions.onSuccess = function(resp) {
                self.emptyView = ErrorView;
                self.collection.setPageSize(INITIAL_NUMBER_OF_ROWS);
                self.updateResults(self.locationFilterView.model);
                self.render();
            };
            this.collection = ADK.ResourceService.fetchCollection(searchOptions);
            if (this.locationType === 'clinics') {
                this.searchApplet.clinicsList = this.collection;
            } else {
                this.searchApplet.wardsList = this.collection;
            }
            this.listenTo(this.locationFilterView.model, 'change:filterString', this.updateResults);
        },
        onRender: function() {},
        childView: SingleSearchResultView,
        childViewOptions: function() {
            return {
                searchView: this.searchView,
                locationCollectionView: this,
                locationType: this.locationType,
                searchApplet: this.searchApplet
            };
        },
        fetchRows: function(event) {
            var e = event.currentTarget;
            if ((e.scrollTop + e.clientHeight + SCROLL_TRIGGERPOINT > e.scrollHeight) && this.collection.hasNextPage()) {
                event.preventDefault();
                this.collection.setPageSize(this.collection.state.pageSize + SCROLL_ADDITIONAL_ROWS);
            }
        },
        updateResults: function(filterModel) {
            this.collection.setPageSize(INITIAL_NUMBER_OF_ROWS, {
                silent: true
            });
            this.collection.fullCollection.reset(this.collection.originalModels, {
                silent: true
            });
            if(!_.isUndefined(filterModel.get('filterString'))) {
                var matcher = _.bind(this.makeMatcher(filterModel.get('filterString').toLowerCase()), this);
                this.collection.getFirstPage({
                    silent: true
                });
                this.collection.fullCollection.reset(this.collection.fullCollection.filter(matcher), {
                    reindex: false
                });
            }
        },
        makeMatcher: function(query) {
            var regexp = this.makeRegExp(query);
            return function(model) {
                var keys = this.filterFields || model.keys();
                for (var i = 0, l = keys.length; i < l; i++) {
                    if (regexp.test(model.get(keys[i]) + "")) {
                        return true;
                    }
                }
                return false;
            };
        },
        makeRegExp: function(query) {
            return new RegExp(query.trim().split(/\s+/).join("|"), "i");
        },
        tagName: "div",
        className: "list-group",
        events:{
            "click": "goto-location"
        }
    });

    return SiteResultsCollectionView;

});