define([
    'jquery',
    'underscore',
    'main/Utils',
    'main/components/applets/baseDisplayApplet/view',
    'main/backgrid/datagrid',
    'main/backgrid/filter',
    'api/ResourceService',
    'api/SessionStorage',
    'main/components/views/loadingView',
    'main/components/views/errorView',
    'main/components/applets/grid_applet/views/filterDateRangeView',
    'hbs!main/components/applets/grid_applet/templates/containerTemplate'
], function($, _, utils, BaseDisplayApplet, DataGrid, CollectionFilter, ResourceService, SessionStorage, LoadingView, ErrorView, FilterDateRangeView, containerTemplate) {
    'use strict';

    var SCROLL_TRIGGERPOINT = 30;
    var SCROLL_ADDITIONAL_ROWS = 100;
    var INITIAL_NUMBER_OF_ROWS = 30;


    // this.appletOptions = {
    //      filterFields
    //      filterDateRangeField
    //      collection
    //      onClickAdd              : method
    //      onClickRow              : method
    //      detailsView             : used by dataGrid
    //
    //      refresh                 : method (optional overwrite)
    //      appletConfig            : {id, instanceId, fullscreen}
    // }

    function markInfobuttonData(that) {
        if (that.appletOptions.collection.length > 0 && !_.isUndefined(that.appletOptions.tblRowSelector)) {
            $(that.appletOptions.tblRowSelector).each(function() {
                $(this).attr("data-infobutton", $(this).find('td:nth-child(2)').text().replace('Panel', ''));
            });
        }
    }

    var baseDisplayApplet = BaseDisplayApplet;

    var GridView = BaseDisplayApplet.extend({
        initialize: function(options) {
            this._base = baseDisplayApplet.prototype;
            if (!this.options.appletConfig) {
                this.options.appletConfig = {};
                this.options.appletConfig.id = this.appletOptions.appletConfig.id;
                this.options.appletConfig.instanceId = this.appletOptions.appletConfig.instanceId;
                this.options.appletConfig.fullScreen = false;
                this.appletConfig = this.options.appletConfig;
            }

            var appletOptions = this.appletOptions || {}; //Set in extending view
            this.appletOptions = appletOptions;
            this.appletOptions.appletConfig = this.options.appletConfig;


            //Set Data Grid Columns
            if (this.options.appletConfig.fullScreen) {
                this.appletOptions.columns = appletOptions.fullScreenColumns || appletOptions.summaryColumns || appletOptions.columns;
            } else {
                this.appletOptions.columns = appletOptions.summaryColumns || appletOptions.columns;
            }

            this.appletOptions.AppletView = DataGrid.returnView(this.appletOptions);
            this._base.initialize.apply(this, arguments);

            this.appletOptions.collection.markInfobutton = {
                'that': this,
                'func': markInfobuttonData
            };
        },
        onRender: function() {
            this._base.onRender.apply(this, arguments);
            if (this.appletOptions.collection instanceof Backbone.PageableCollection) {
                this.appletOptions.collection.setClientInfinite(true);
            }
        },
        ui: {
            'GroupHeader': 'tr.groupByHeader'
        },
        events: {
            'click @ui.GroupHeader': 'fetchRowsOnClick'
        },
        fetchRowsOnClick: function(event) {
            event.preventDefault();

            var e = this.$(event.currentTarget).nextUntil('tr.groupByHeader');
            e = $(e.get(e.length-1));

            this.fetchRows(event);
            e.nextUntil('.groupByHeader').toggle();
        },

        fetchRows: function(event) {
            var e = event.currentTarget;
            if ((e.scrollTop + e.clientHeight + SCROLL_TRIGGERPOINT > e.scrollHeight) && this.appletOptions.collection.hasNextPage()) {
                event.preventDefault();
                this.appletOptions.collection.getNextPage({});
                var searchText = SessionStorage.getAppletStorageModel(this.appletConfig.instanceId, 'filterText', true);
                if (this.filterView && (this.filterView.userDefinedFilters.length > 0 || (!_.isUndefined(searchText) && !_.isNull(searchText) && searchText !== ''))) {
                    this.filterView.doSearch();
                }
                if (this.appletOptions.collection.length > 0 && !_.isUndefined(this.appletOptions.tblRowSelector)) {
                    $(this.appletOptions.tblRowSelector).each(function() {
                        $(this).attr("data-infobutton", $(this).find('td:nth-child(2)').text().replace('Panel', ''));
                    });
                }
            }
        },
        onSync: function() {
            if (this.filterView) {
                this.filterView.doSearch();
            }
            this._base.onSync.apply(this, arguments);
            if (this.appletOptions.collection instanceof Backbone.PageableCollection) {
                var self = this;
                //  scroll event does not bubble up and needs bind event here
                var elementToScroll = this.$el.find('.gist-item-list');
                if (elementToScroll.length === 0) {
                    elementToScroll = this.$el.find('.data-grid table tbody');
                }
                elementToScroll.off('scroll.infinite');
                elementToScroll.on('scroll.infinite', function(event) {
                    self.fetchRows(event);
                });
                this.listenTo(this, 'destroy', function() {
                    elementToScroll.off('scroll.infinite');
                });
                elementToScroll.trigger("scroll.infinite");
            }
        },
        refresh: function(event) {
            if (this.appletOptions.refresh !== undefined) {
                this._base.refresh.apply(this, arguments);
            } else {
                this._base.refresh.apply(this, arguments);
            }
        },
        dateRangeRefresh: function(filterParameter, options) {
            this.appletOptions.collection.fetchOptions.criteria.filter = this.buildJdsDateFilter(filterParameter, options);
            var collection = this.appletOptions.collection;
            this.loading();
            this.displayAppletView = DataGrid.create(this.appletOptions);
            ResourceService.fetchCollection(collection.fetchOptions, collection);
        },
        expandRowDetails: function(routeParam) {
            if (routeParam) {
                var row = $('#' + routeParam);
                row.click();
                var windowHeight = $(window).height();
                var scrollPosition = row.offset().top;
                if ((scrollPosition + row.next().height() + 50) > windowHeight) {
                    $('html, body').animate({
                        scrollTop: scrollPosition - 100
                    }, 0);
                }
            }
        }
    });

    return GridView;
});
