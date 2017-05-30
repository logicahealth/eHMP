define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/search/textSearchInput/view',
    'app/applets/search/views/searchView',
], function(Backbone, Marionette, _, Handlebars, TextSearchInputView, SearchView) {
    'use strict';

    var AppletLayoutView = Backbone.Marionette.LayoutView.extend({
        template: Handlebars.compile('<div class="search-applet-container"><div>'),
        ui: {
            'SearchAppletRegion': '.search-applet-container'
        },
        regions: {
            MainAppletRegion: '@ui.SearchAppletRegion'
        },
        initialize: function(options) {
            this.searchView = new SearchView(options);
        },
        onBeforeShow: function() {
            this.MainAppletRegion.show(this.searchView);
        }
    });

    var applet = {
        id: 'search',
        viewTypes: [{
            type: 'expanded',
            view: AppletLayoutView,
            chromeEnabled: false
        }, {
            type: 'input',
            view: TextSearchInputView,
            chromeEnabled: false
        }],
        defaultViewType: 'expanded'
    };

    return applet;
});