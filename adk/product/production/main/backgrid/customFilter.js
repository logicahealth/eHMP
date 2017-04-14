define([
    'backbone',
    'marionette',
    'main/backgrid/filter',
    'hbs!main/backgrid/filterTemplate',
], function(Backbone, Marionette, Filter, filterTemplate) {
    'use strict';
    // Capture the name of the browser
    var browser = window.navigator.userAgent;
    var msie = browser.indexOf("MSIE ");
    var go = {
        doFilter: function(options) {
            Filter.create(options);
            var Bar = Backgrid.ClientSideFilterWithDateRangePickerFilter.extend({
                doSearch: function(e) {
                    var filterValues = this.getFilterValues();
                    var query = _.reduce(filterValues, function(queryThusFar, filterValue) {
                        var seperator = (queryThusFar === '' ? '' : ' ');
                        return queryThusFar + seperator + filterValue;
                    }, '');

                    if (msie > 0) {
                        query = query.replace(/[\%&\^$\!]/gi, '');
                    }
                    //replace the spaces with | to represent logical OR
                    query = query.replace(/\s/g, '|');

                    var searchNeeded = true;
                    if (query.length === 0) {
                        if (!this.hasActiveSearch) {
                            // the query is empty and it was already empty (no active search) - so there's nothing to do.
                            searchNeeded = false;
                        } else {
                            // the query is empty, but it must have just *now* become empty (there was an active search)
                            // so go ahead with doSearch in order to clear the current filter
                            // then set hasActiveSearch to false so that the next call to doSearch is a no-op
                            this.hasActiveSearch = false;
                        }
                    } else {
                        this.hasActiveSearch = true;
                    }

                    var matcher = _.bind(this.makeMatcher(query), this);

                    this.destinationCollection.set(this.collection.filter(matcher), {
                        reindex: false //what is the purpose of this line? maybe should delete?
                    });
                },
                onCollectionChange: function(){
                    return;
                }
            });

            return new Bar({
                instanceId: options.id,
                workspaceId: options.workspaceId,
                maximizedScreen: options.maximizedScreen,
                fullScreen: options.fullScreen,
                collection: options.collection,
                destinationCollection: options.destinationCollection,
                fields: options.filterFields,
                placeholder: 'Enter your text filter',
                name: 'q-' + options.id,
                template: filterTemplate,
                filterName: options.filterName || '',
                filterText: options.filterText || '',
                model: options.model
            });
        }
    };
    return go;
});
