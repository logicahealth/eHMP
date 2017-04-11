define([
    'jquery',
    'underscore',
    'main/Utils',
    'main/backgrid/datagrid',
    'main/backgrid/filter',
    'api/ResourceService',
    'api/SessionStorage',
    'main/components/views/loadingView',
    'main/components/views/errorView',
    'main/components/applets/grid_applet/views/filterDateRangeView',
    'hbs!main/components/applets/grid_applet/templates/containerTemplate',
    'main/adk_utils/crsUtil',
    '/main/components/behaviors/tooltip.js'
], function($, _, utils, DataGrid, CollectionFilter, ResourceService, SessionStorage, LoadingView, ErrorView, FilterDateRangeView, containerTemplate, CrsUtil, Tooltip) {
    'use strict';

    var SCROLL_TRIGGERPOINT = 40;

    function markInfobuttonData(that) {
        if (that.dataGridOptions.collection.length > 0 && !_.isUndefined(that.dataGridOptions.tblRowSelector)) {
            _.each(that.$(that.dataGridOptions.tblRowSelector), function(row) {
                this.$(row).attr('data-infobutton', $(this).find('td:first').text());
            }, that);
        }
    }

    var GridAppletViewBase = Backbone.Marionette.LayoutView.extend({
        initialize: function(options) {
            if (this.options.appletConfig && _.isUndefined(this.options.appletConfig.instanceId)) {
                this.options.appletConfig.instanceId = this.options.appletConfig.id;
            } else if (!this.options.appletConfig) {
                this.options.appletConfig = {};
                this.options.appletConfig.id = this.dataGridOptions.appletConfig.id;
                this.options.appletConfig.instanceId = this.dataGridOptions.appletConfig.instanceId;
            }

            this.options.appletConfig.filterName = ADK.SessionStorage.getAppletStorageModel(this.options.appletConfig.instanceId, 'filterName', true);

            var maximizedApplet = ADK.Messaging.request('applet:maximized');
            if (!_.isUndefined(maximizedApplet)) {
                this.options.appletConfig.filterName = maximizedApplet.get('filterName');
                ADK.Messaging.reply("applet:maximized", function() {
                    return undefined;
                });
            }

            var appletConfig = this.options.appletConfig;
            this.appletConfig = appletConfig;
            var dataGridOptions = this.dataGridOptions || {}; //Set in extending view
            this.dataGridOptions = dataGridOptions;
            this.dataGridOptions.emptyText = dataGridOptions.emptyText || 'No Records Found';
            this.dataGridOptions.appletConfig = appletConfig;
            this.routeParam = this.options.routeParam;
            this.expandedAppletId = this.appletConfig.instanceId;
            if (this.appletConfig.fullScreen) {
                this.parentWorkspace = ADK.Messaging.request('get:current:workspace');
                var expandedModel = SessionStorage.get.sessionModel('expandedAppletId');
                if (!_.isUndefined(expandedModel) && !_.isUndefined(expandedModel.get('id'))) {
                    this.expandedAppletId = expandedModel.get('id');
                    SessionStorage.set.sessionModel('expandedAppletId', new Backbone.Model({
                        'id': undefined
                    }));

                }
            }
            //Set default filterEnabled
            if (this.dataGridOptions.filterEnabled === undefined) {
                this.dataGridOptions.filterEnabled = true;
            }
            //Set Data Grid Columns
            if (appletConfig.fullScreen) {
                dataGridOptions.columns = dataGridOptions.fullScreenColumns || dataGridOptions.summaryColumns || dataGridOptions.columns;
                SessionStorage.setAppletStorageModel(this.appletConfig.instanceId, 'fullScreen', true);
            } else {
                dataGridOptions.columns = dataGridOptions.summaryColumns || dataGridOptions.columns;
                SessionStorage.setAppletStorageModel(this.appletConfig.instanceId, 'fullScreen', false);
            }

            appletConfig.workspaceId = ADK.Messaging.request('get:current:screen').config.id;

            this.model = new Backbone.Model(appletConfig);
            this.model.set('filterName', this.model.get('filterName'));

            if (this.model.get('filterName') || !ADK.ADKApp.currentScreen.config.predefined) {
                this.model.set('hasSubHeader', true);
            } else {
                this.model.set('hasSubHeader', false);
            }

            if (ADK.ADKApp.currentScreen.config.predefined) {
                this.model.set('isPredefined', true);
            } else {
                this.model.set('isPredefined', false);
            }


            this.initFilterView();
            if (this.dataGridOptions.hasOwnProperty('onClickAdd') && !_.isUndefined(this.dataGridOptions.onClickAdd)) {
                this.onClickAdd = this.dataGridOptions.onClickAdd;
            }

            if (this.dataGridOptions.toolbarView) {
                this.toolbarView = this.dataGridOptions.toolbarView;
            }

            //Create Loading View
            this.loadingView = LoadingView.create();
            this.listenTo(dataGridOptions.collection, 'fetch:success', this.onSync);
            this.listenTo(dataGridOptions.collection, 'error', this.onError);

            this.dataGridOptions.collection.markInfobutton = {
                'that': this,
                'func': markInfobuttonData
            };
            var self = this;


            this.listenTo(this.dataGridOptions.collection, 'backgrid:sort', function() {
                self.dataGridOptions.collection.markInfobutton.func(self.dataGridOptions.collection.markInfobutton.that);
            });

            if (this.options.appletConfig.viewType === 'gist') {
                //set up events to close quicklooks
                var manualScrollingEvent = function() {
                    self.$('[data-toggle=popover]').popover('hide');
                };
                this.listenTo(this, 'show', function() {
                    /* listen for scroll on mousewheel only */
                    this.$('.grid-applet-panel').on('mousewheel', function() {
                        manualScrollingEvent();
                    });
                    /* listen for up and down arrow keys */
                    this.$('.grid-applet-panel').on('keydown', function(e) {
                        if (e.which === 38 || e.which === 40) {
                            manualScrollingEvent();
                        }
                    });
                });
                this.listenTo(this, 'destroy', function() {
                    this.$('.grid-applet-panel').off('mousewheel');
                    this.$('.grid-applet-panel').off('keydown');
                });
            }

            this.createDataGridView();
            this.listenTo(ADK.Messaging, 'adk:globalDate:selected', this.abort);
        },

        /**
         * Cancel the active requests to the RDK.
         */
        abort: function() {
            var gridView = this.dataGridView.collection;
            var gridOptions = this.dataGridOptions.collection;

            if ((gridView && gridView.fetchOptions.allowAbort) || (gridOptions && gridOptions.fetchOptions.allowAbort)) {
                if (gridView && gridView.xhr) {
                    gridView.xhr.abort();
                } else if (gridOptions && gridOptions.xhr) {
                    gridOptions.xhr.abort();
                }
            }
        },

        initFilterView: function() {
            //Create Filter and Filter Button View
            if (this.dataGridOptions.filterEnabled === true) {
                var filterFields;
                if (this.dataGridOptions.filterFields) {
                    filterFields = this.dataGridOptions.filterFields;
                } else {
                    filterFields = _.pluck(this.dataGridOptions.columns, 'name');
                }

                var maximizedScreen = false;
                if (!_.isUndefined(this.options.appletConfig.filterName)) {
                    maximizedScreen = true;
                }

                var filterOptions = {
                    collection: this.dataGridOptions.collection,
                    filterFields: filterFields,
                    filterDateRangeEnabled: this.dataGridOptions.filterDateRangeEnabled,
                    filterDateRangeField: this.dataGridOptions.filterDateRangeField,
                    formattedFilterFields: this.dataGridOptions.formattedFilterFields,
                    id: this.appletConfig.instanceId,
                    workspaceId: ADK.Messaging.request('get:current:screen').config.id,
                    model: this.model,
                    maximizedScreen: maximizedScreen,
                    filterName: this.appletConfig.filterName,
                    fullScreen: this.appletConfig.fullScreen
                };

                this.filterView = CollectionFilter.create(filterOptions);

                this.dataGridOptions.appletId = this.appletConfig.id;
                this.dataGridOptions.instanceId = this.appletConfig.instanceId;
                if (this.dataGridOptions.filterDateRangeEnabled && this.appletConfig.fullScreen) {
                    this.filterDateRangeView = new FilterDateRangeView({
                        model: new Backbone.Model(this.dataGridOptions),
                        appletId: this.dataGridOptions.appletId,
                        appletView: this
                    });
                }
            }
        },
        createDataGridView: function() {
            if (!this.appletConfig.fullScreen && this.dataGridOptions.SummaryView) {

                var summaryViewOptions = this.dataGridOptions.SummaryViewOptions || {};
                summaryViewOptions.collection = this.dataGridOptions.collection;
                summaryViewOptions.appletConfig = this.appletConfig;

                this.dataGridView = new this.dataGridOptions.SummaryView(summaryViewOptions);
            } else {
                this.dataGridView = DataGrid.create(this.dataGridOptions);
            }
        },
        onRender: function() {
            this.loading();
            var self = this;
            if (this.filterView) {
                $(this.filterView.el).css({
                    marginLeft: '0px',
                    marginTop: '0px',
                    marginBottom: '6px'
                });

                this.gridFilter.show(this.filterView);
                var queryInputSelector = 'input[name=\'q-' + this.appletConfig.instanceId + '\']';
                this.filterView.$el.find('input[type=search]').on('change', function() {
                    SessionStorage.setAppletStorageModel(self.expandedAppletId, 'filterText', $(this).val(), true, this.parentWorkspace);
                });

                this.filterView.$el.find('button[data-backgrid-action=clear]').on('click', function() {
                    SessionStorage.setAppletStorageModel(self.expandedAppletId, 'filterText', $(this).val(), true, this.parentWorkspace);
                });

                if (this.filterDateRangeView) {
                    this.gridFilterDateRange.show(this.filterDateRangeView);
                }

                $('.grid-filter').find('input').attr('tabindex', '0');
            }
            if (this.dataGridOptions.collection instanceof Backbone.PageableCollection) {
                this.dataGridOptions.collection.setClientInfinite(true);
            }
            this.$el.find('.edit-filter-name').on('click', function(evt) {
                var appletInstanceId = self.appletConfig.instanceId;
                var filterArea = $('#grid-filter-' + appletInstanceId);
                var filterButton = this.$el;

                if (filterArea.hasClass('in')) {
                    filterArea.one('hidden.bs.collapse', function() {

                        var filterText = SessionStorage.getAppletStorageModel(appletInstanceId, 'filterText');
                        if (filterText !== undefined && filterText !== null && filterText.trim().length > 0) {
                            var queryInputSelector = 'input[name=\'q-' + appletInstanceId + '\']';
                            $(queryInputSelector).val('').change().keydown();
                        }
                    });

                    var filterName = ADK.SessionStorage.getAppletStorageModel(appletInstanceId, 'filterName', true) || '';
                    filterArea.collapse('hide');
                } else {
                    filterArea.one('shown.bs.collapse', function() {
                        filterArea.find('input.filter-title-input').focus();
                    });

                    filterArea.collapse('show');
                }
                filterArea.collapse('toggle');
            });
        },
        onShow: function() {
            this.showFilterView();
        },
        template: containerTemplate,
        regions: {
            gridContainer: '.grid-container',
            gridToolbar: '.grid-toolbar',
            gridFilterDateRange: '.grid-filter-daterange',
            gridFilter: '.grid-filter'
        },
        eventMapper: {
            'refresh': 'refresh',
            'add': 'onClickAdd'
        },
        ui: {
            'GroupHeader': 'tr.group-by-header',
            '$tooltip': '[tooltip-data-key], [data-toggle=tooltip]'
        },
        events: {
            'click @ui.GroupHeader': 'fetchRowsOnClick'
        },
        fetchRowsOnClick: function(event) {
            event.preventDefault();
            if (this.dataGridOptions.collection instanceof Backbone.PageableCollection) {
                var $target = this.$(event.currentTarget);

                // Find the last item
                var _group = $target.nextUntil('tr.group-by-header');
                var _lastInGroup = _group.last();

                var _collection = this.dataGridOptions.collection;
                var _fullCollection = this.dataGridOptions.collection.fullCollection;

                while (!_lastInGroup.hasClass('group-by-header') && _collection.length !== _fullCollection.length) {
                    this.dataGridOptions.collection.getNextPage({});

                    // This would be faster if there was away to append to group instead of remaking it
                    _group = $target.nextUntil('tr.group-by-header');
                    _lastInGroup = _group.last();
                }
                _group.toggle();
                return;
            }
            this.$(event.currentTarget).nextUntil('tr.group-by-header').toggle();
        },
        fetchRows: function(event) {
            var e = event.currentTarget;
            if ((e.scrollTop + e.clientHeight + SCROLL_TRIGGERPOINT > e.scrollHeight) && this.dataGridOptions.collection.hasNextPage()) {
                event.preventDefault();
                this.dataGridOptions.collection.getNextPage({});
                if (this.dataGridOptions.collection.length > 0 && !_.isUndefined(this.dataGridOptions.tblRowSelector)) {
                    $(this.dataGridOptions.tblRowSelector).each(function() {
                        $(this).attr('data-infobutton', $(this).find('td:first').text());
                    });
                }
            }
        },
        toolbar: function() {
            if (this.toolbarView) {
                this.gridToolbar.show(this.toolbarView);
            }
        },
        onSync: function() {
            var applet = this.$("[data-instanceid='" + this.appletConfig.instanceId + "']");
            if (applet.length === 0) {
                applet = this.$el.closest("[data-instanceid='" + this.appletConfig.instanceId + "']");
            }
            applet.find('.fa-refresh').removeClass('fa-spin');

            this.toolbar();

            if (this.filterView) {
                var searchText = SessionStorage.getAppletStorageModel(this.expandedAppletId, 'filterText', true, this.parentWorkspace);
                if (this.filterView.userDefinedFilters.length > 0 || (searchText !== undefined && searchText !== null && searchText.trim().length > 0)) {
                    this.filterView.applyFilters();
                }
            }

            if (this.dataGridOptions.gistView) {
                /* Adds Fields to the collection that match Gist Fields. It is up to the applet to provide the correct gist field names */
                /* Mapping done here to avoid double rendering in initialize */

                var options = this.dataGridOptions;
                this.dataGridOptions.collection.each(function(model) {
                    _.each(options.appletConfiguration.gistModel, function(object) {
                        model.set(object.id, model.get(object.field));
                    });
                });
                if (this.dataGridView instanceof Backbone.Marionette.View && this.dataGridView.collection !== this.dataGridOptions.collection) {
                    this.dataGridView.collection = this.dataGridOptions.collection;
                }
            } else {
                if (this.dataGridView instanceof Backbone.Marionette.View && this.dataGridView.collection) {
                    if (this.dataGridView.collection !== this.dataGridOptions.collection) {
                        this.dataGridView.collection = this.dataGridOptions.collection.models;
                    }
                } else {
                    if (this.dataGridView instanceof Backbone.Marionette.View && this.dataGridView.collection !== this.dataGridOptions.collection) {
                        this.dataGridView.collection = this.dataGridOptions.collection;
                    }
                }
            }

            if (this.dataGridView.isRendered) {
                this.gridContainer.empty({
                    preventDestroy: true
                });
                this.gridContainer.attachView(this.dataGridView);
                this.gridContainer.attachHtml(this.dataGridView);
            } else {
                this.showViewInGridContainer(this.dataGridView, {
                    preventDestroy: true
                });
            }
            this.configureDataInfoButton();

            if (this.dataGridOptions.collection instanceof Backbone.PageableCollection) {
                var self = this;
                //  scroll event does not bubble up and needs bind event here
                var elementToScroll = this.$el.find('.gist-item-list');
                if (elementToScroll.length === 0) {
                    elementToScroll = this.$el.find('.data-grid table tbody');
                }
                elementToScroll.off('scroll.infinite');
                elementToScroll.on('scroll.infinite', function(event) {
                    self.fetchRows(event);
                    var newItems = CrsUtil.findCurrentCRSItems('gridAppletView');
                    if (newItems) {
                        $('#aria-live-assertive-region p').replaceWith('<p>' + CrsUtil.screenReaderFeedback.FOUND_RELATED_CONCEPT + '</p>');
                    }
                });
                this.listenTo(this, 'destroy', function() {
                    elementToScroll.off('scroll.infinite');
                });
                elementToScroll.trigger("scroll.infinite");
            }
            this.bindUIElements();
            Tooltip.prototype.onRender.call(this);
        },
        buildConfig: Tooltip.prototype.buildConfig,
        configureDataInfoButton: function() {
            if (this.dataGridOptions.collection.length > 0 && !_.isUndefined(this.dataGridOptions.tblRowSelector)) {
                _.each(this.$(this.dataGridOptions.tblRowSelector), function(el) {
                    var $el = this.$(el);
                    $el.attr({
                        'data-infobutton': $el.find('td:first').text(),
                    }).find('td:first-child').prepend("<span class='sr-only toolbar-instructions'>Press enter to open the toolbar menu.</span>");
                }, this);
            }
        },
        onError: function(collection, resp) {
            if (resp.statusText === "abort") {
                // This can not be handled at the Resource Service level because it is fired off
                // a listenTo(collection, 'error', ...)
                return;
            }
            var errorModel = new Backbone.Model(resp);
            var errorView = ErrorView.create({
                model: errorModel
            });
            this.showViewInGridContainer(errorView);
        },
        loading: function() {
            this.showViewInGridContainer(this.loadingView, {
                preventDestroy: true
            });
        },
        showViewInGridContainer: function(viewToShow, options) {
            options = _.extend({
                preventDestroy: (this.gridContainer.currentView == this.loadingView)
            }, options || {});
            this.gridContainer.show(viewToShow, options);
        },
        refresh: function(event) {
            var collection = this.dataGridOptions.collection;
            ResourceService.clearCache(collection.url);
            if (this.dataGridOptions.refresh !== undefined) {
                this.dataGridOptions.refresh(this);
                return;
            }
            this.loading();
            //ResourceService.clearCache(collection.url);
            if (this.dataGridOptions.filterEnabled !== true) {
                this.listenToOnce(this.dataGridOptions.collection, 'fetch:success', function() {
                    //repopulate backgrid where filter is not used
                    //when the filter mechanism is cleaned up to stop the multi-render, this will need to change
                    this.trigger('sort');
                });
            }
            collection.comparator = null;  // disable automatic sort on applet refresh
            this.fetchData({
                silent: true
            });
        },
        fetchData: function(options) {
            ResourceService.fetchCollection(_.extend(this.dataGridOptions.collection.fetchOptions, options), this.dataGridOptions.collection);
        },
        buildJdsDateFilter: function(dateField, options) {
            var isOverrideGlobalDate, fromDate, toDate, customFilter, operator;

            options = options || {};
            _.defaults(options, {
                isOverrideGlobalDate: false,
                operator: 'and'
            }); // by default use global date
            isOverrideGlobalDate = options.isOverrideGlobalDate;
            customFilter = options.customFilter;
            operator = options.operator;

            if (isOverrideGlobalDate) {
                fromDate = options.fromDate;
                toDate = options.toDate;
            } else {
                var globalDate = SessionStorage.getModel('globalDate');
                if (globalDate.get('selectedId') !== undefined && globalDate.get('selectedId') !== null) {
                    fromDate = globalDate.get('fromDate');
                    toDate = globalDate.get('toDate');
                }
            }

            if (fromDate === undefined || fromDate === null || fromDate.trim().length === 0) {
                fromDate = '';
            } else {
                fromDate = '"' + utils.formatDate(fromDate, 'YYYYMMDD', 'MM/DD/YYYY') + '"';
            }

            if (toDate === undefined || toDate === null || toDate.trim().length === 0) {
                toDate = '';
            } else {
                toDate = '"' + utils.formatDate(toDate, 'YYYYMMDD', 'MM/DD/YYYY') + '235959"';
            }

            var dateFilter;

            if (fromDate !== '' && toDate !== '') {
                dateFilter = 'between(' + dateField + ',' + fromDate + ',' + toDate + ')';
            } else if (fromDate === '' && toDate !== '') {
                dateFilter = 'lte(' + dateField + ',' + toDate + ')';
            } else if (fromDate !== '' && toDate === '') {
                dateFilter = 'gte(' + dateField + ',' + fromDate + ')';
            } else {
                console.error('gridAppletView buildJdsDateFilter both fromDate and toDate are empty.');
            }

            if (customFilter !== undefined && customFilter !== null) {
                dateFilter = operator + '(' + dateFilter + ',' + customFilter + ')';
            }

            return dateFilter;
        },
        dateRangeRefresh: function(filterParameter, options) {
            this.abort();
            this.dataGridOptions.collection.fetchOptions.criteria.filter =
                this.buildJdsDateFilter(filterParameter, options);

            if (this.dataGridOptions.filterRemoved)
                this.dataGridOptions.collection.fetchOptions.criteria.filter = 'and(ne(removed, true),' + this.dataGridOptions.collection.fetchOptions.criteria.filter + ')';

            var collection = this.dataGridOptions.collection;
            this.loading();

            ResourceService.fetchCollection(collection.fetchOptions, collection);
        },
        onClickAdd: function(event) {
            this.onClickAdd(event);
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
        },
        showFilterView: function() {
            var filterText = SessionStorage.getAppletStorageModel(this.expandedAppletId, 'filterText', true, this.parentWorkspace);
            if (this.dataGridOptions.filterEnabled === true && filterText !== undefined && filterText !== null && filterText.length > 0) {
                this.$el.find('#grid-filter-' + this.appletConfig.instanceId).toggleClass('collapse in');
                this.$el.find('input[name=\'q-' + this.appletConfig.instanceId + '\']').val(filterText);
                this.filterView.showClearButtonMaybe();
            } else if (this.dataGridOptions.filterDateRangeEnabled && this.appletConfig.fullScreen) {
                this.$el.find('#grid-filter-' + this.appletConfig.instanceId).toggleClass('collapse in');
            }
        },
        onBeforeDestroy: function() {
            this.abort();
        },
        onDestroy: function() {
            if (this.filterView) {
                this.filterView.$el.find('input[type=search]').off('change');
                this.filterView.$el.find('a[data-backgrid-action=clear]').off('click');
            }

            delete this.dataGridOptions.collection.markInfobutton;

            this.dataGridOptions.collection.cleanUp();

            try {
                if (this.loadingView && !this.loadingView.isDestroyed) {
                    this.loadingView.destroy();
                    this.loadingView = null;
                }
            } catch (e) {
                console.error('Error destroying loadingView in applet:', this.appletConfig.id, e);
            }

            try {
                if (this.dataGridView && !this.dataGridView.isDestroyed) {
                    this.dataGridView.destroy();
                }
                delete this.dataGridView;
                delete this.dataGridOptions;

            } catch (e) {
                console.error('Error destroying dataGridView in applet:', this.appletConfig.id, e);
            }
        }
    });

    //DE3878: Applets extending BaseGridApplet not running base destroy methods
    //this piece will insure any methods defined here are run on both the base and extended view.
    var GridAppletView = GridAppletViewBase.extend({
            constructor: function() {
                if (!this.options) this.options = {};
                var args = Array.prototype.slice.call(arguments),
                    onDestroy = this.onDestroy,
                    onBeforeDestroy = this.onBeforeDestroy;

                this.onDestroy = function() {
                    var args = Array.prototype.slice.call(arguments);
                    GridAppletViewBase.prototype.onDestroy.apply(this, args);
                    if (GridAppletViewBase.prototype.onDestroy === onDestroy) return;
                    onDestroy.apply(this, args);
                };

                this.onBeforeDestroy = function() {
                    var args = Array.prototype.slice.call(arguments);
                    GridAppletViewBase.prototype.onBeforeDestroy.apply(this, args);
                    if (GridAppletViewBase.prototype.onBeforeDestroy === onBeforeDestroy) return;
                    onBeforeDestroy.apply(this, args);
                };

                GridAppletViewBase.prototype.constructor.apply(this, args);
            }
        });

    return GridAppletView;


});