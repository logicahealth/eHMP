define([
    'underscore',
    'backbone',
    'marionette', 
    'hbs!app/applets/ordersearch/tray/trayTpl',
    'app/applets/ordersearch/tray/mainMenuView',
    'app/applets/ordersearch/tray/searchBarView',
    'app/applets/ordersearch/tray/orderSearchView'
], function(_, Backbone, Marionette, Tpl, MainMenuView, SearchBarView, OrderSearchView) {
    'use strict';

    var view = Backbone.Marionette.LayoutView.extend({
        template: Tpl,
        ui: {
            headerRegion: '.order-search-header',
            searchRegion: '.order-search-control',
            contentRegion: '.order-search-content',
            footerRegion: '.order-search-footer',
            cancelButton: '.order-search-cancel-btn'
        },
        regions: {
            HeaderRegion: '@ui.headerRegion',
            SearchRegion: '@ui.searchRegion',
            ContentRegion: '@ui.contentRegion',
            FooterRegion: '@ui.footerRegion'
        },
        events: {
            'click @ui.cancelButton': function() {
                var TrayView = ADK.Messaging.request("tray:writeback:actions:trayView");
                if (TrayView) {
                    TrayView.$el.trigger('tray.reset');
                }
            }
        },
        className: 'order-search modal-content panel panel-default',
        attributes: {
            'data-trayid': 'ordersearch'
        },
        initialize: function() {
            this.searchCriteriaModel = new Backbone.Model();
            this.listenTo(this.searchCriteriaModel, 'change', function(model) {
                if (_.isEmpty(model.get('criteria'))) {
                    this.showMenu();
                } else {
                    this.showContentView(new OrderSearchView({
                        searchCriteriaModel: model
                    }));
                }
            });
        },
        onBeforeShow: function() {
            this.showChildView('SearchRegion', new SearchBarView({
                model: this.searchCriteriaModel,
                placeholder: 'Search Orders',
                screenReaderLabel: 'Search Orders',
                instructions: 'Begin typing to search for an order, then view results below.'
            }));
            this.showMenu();
        },
        onShow: function() {
            var self = this;
            // adjust dimensions when the app is resized
            this.listenTo(ADK.utils.resize.dimensions.centerRegion, 'change:height', _.debounce(this.adjustDimensions, 500), this);

            // initial adustment
            this.adjustDimensions();
        },
        showContentView: function(view) {
            if (view) {
                this.showChildView('ContentRegion', view);
            }
        },
        showMenu: function() {
            // clear search criteria
            this.searchCriteriaModel.set('criteria', null);

            this.showContentView(new MainMenuView());
        },
        adjustDimensions: function() {
            var $header = this.ui.headerRegion;
            var $searchBar = this.ui.searchRegion;
            var $body = this.ui.contentRegion;
            var $footer = this.ui.footerRegion;

            if (!_.isEmpty($body)) {
                var containerHeight = this.$el.parent().height();
                var headerHeight = _.isEmpty($header) ? 0 : $header.outerHeight();
                var searchBarHeight = _.isEmpty($searchBar) ? 0 : $searchBar.outerHeight();
                var footerHeight = _.isEmpty($footer) ? 0 : $footer.outerHeight();
                var bodyHeight = containerHeight - headerHeight - searchBarHeight - footerHeight;
                $body.css({
                    'height': bodyHeight + 'px'
                });
            }
        }
    });
    return view;
});