define([
    'backbone',
    'marionette',
    'handlebars',
    'app/applets/patient_selection/views/table/view'
], function(Backbone, Marionette, Handlebars, SearchResultsCollectionView) {
    'use strict';

    var LayoutView = Backbone.Marionette.LayoutView.extend({
        className: 'flex-width-1',
        resultsView: SearchResultsCollectionView,
        ui: {
            ariaLiveText: '.search-results-aria-live-region p'
        },
        template: Handlebars.compile(
            '<div class="filter"></div>' +
            '<div class="search-results" data-flex-width="1"></div>' +
            '<div class="search-results-aria-live-region sr-only" aria-live="polite" aria-hidden="true"><p></p></div>'
        ),
        regions: {
            filterRegion: '.filter',
            searchResultsRegion: '.search-results'
        },
        behaviors: {
            FlexContainer: {
                direction: 'column',
                container: [true, {
                    container: '[data-flex-width="1"]',
                    direction: 'column'
                }]
            }
        },
        collectionDefinition: Backbone.Collection,
        initialize: function(options) {
            this.collection = new this.collectionDefinition();
            this.bindEntityEvents(this.collection, this.collectionEvents);
            this.resultsView = new this.resultsView({
                collection: this.collection,
                searchType: this.getOption('searchType')
            });
        },
        onBeforeDestroy: function() {
            this.bindEntityEvents(this.collection, this.collectionEvents);
        },
        onBeforeShow: function() {
            this.showChildView('searchResultsRegion', this.resultsView);
            if (this.FilterView) {
                this.showChildView('filterRegion', new this.FilterView());
            }
        },
        collectionEvents: {
            'sync': function(collection, resp, options) {
                if (_.isUndefined(_.get(resp, 'data.items')) && !_.isArray(_.get(resp, 'data'))) {
                    collection.reset(null, {
                        silent: true
                    });
                }
                if (collection.isEmpty()) {
                    this.setEmptyMessage(resp.message || this._emptyMessage, true);
                } else {
                    var resultStr = (collection.length === 1 ? " Result" : " Results");
                    this.ui.ariaLiveText.text(collection.length + resultStr);
                }
            },
            'request': function(collection, resp, options) {
                collection.reset(null, {
                    silent: true
                });
                this.showLoading();
            }
        },
        _emptyMessage: 'No results found.',
        setEmpty: function() {
            this.setEmptyMessage(this._emptyMessage);
        },
        showLoading: function() {
            this.resultsView.emptyView = this.resultsView.getLoadingView();
            this.ui.ariaLiveText.text("Loading...");
            this.resultsView.render();
        },
        showError: function(message) {
            this.resultsView.setEmptyMessage(message, true);
            this.resultsView.render();
        },
        setEmptyMessage: function(message, triggerRender) {
            this.resultsView.setEmptyMessage(message);
            if (_.isBoolean(triggerRender) && triggerRender) {
                this.resultsView.render();
                this.ui.ariaLiveText.text(message);
            }
        }
    });

    var Orig = LayoutView,
        Modified = Orig.extend({
            constructor: function() {
                this.options = _.extend({}, this.options);
                var args = Array.prototype.slice.call(arguments),
                    init = this.initialize,
                    onBeforeShow = this.onBeforeShow,
                    onBeforeDestroy = this.onBeforeDestroy;
                this.initialize = function() {
                    var args = Array.prototype.slice.call(arguments);
                    Orig.prototype.initialize.apply(this, args);
                    if (Orig.prototype.initialize === init) return;
                    init.apply(this, args);
                };
                this.onBeforeShow = function() {
                    var args = Array.prototype.slice.call(arguments);
                    Orig.prototype.onBeforeShow.apply(this, args);
                    if (Orig.prototype.onBeforeShow === onBeforeShow) return;
                    onBeforeShow.apply(this, args);
                };
                this.onBeforeDestroy = function() {
                    var args = Array.prototype.slice.call(arguments);
                    Orig.prototype.onBeforeDestroy.apply(this, args);
                    if (Orig.prototype.onBeforeDestroy === onBeforeDestroy) return;
                    onBeforeDestroy.apply(this, args);
                };

                Orig.prototype.constructor.apply(this, args);
            }
        });
    LayoutView = Modified;

    return LayoutView;
});