define([
    'jquery',
    'underscore',
    'main/Utils',
    'main/backgrid/filter',
    'api/ResourceService',
    'api/SessionStorage',
    'main/components/views/appletViews/TileSortManager',
    'main/components/views/loadingView',
    'main/components/views/errorView',
    'main/components/applets/baseDisplayApplet/views/filterDateRangeView',
    'hbs!main/components/applets/baseDisplayApplet/templates/containerTemplate'
], function($, _, utils, CollectionFilter, ResourceService, SessionStorage, TileSortManager, LoadingView, ErrorView, FilterDateRangeView, containerTemplate) {
    'use strict';

    // this.
    //      appletConfig    : {id, instanceId, fullscreen}
    //      appletOptions
    //      routeParam
    //      toolbarView

    // this.appletOptions = {
    //      AppletView              : view to show
    //      filterFields
    //      filterDateRangeField
    //      appletConfig            : {id, instanceId, fullscreen}
    //      collection
    //      refresh                 : method (optional overwrite)
    //      onClickAdd              : method
    // }

    // this.model
    //      instanceId
    var AppletLayoutView = Backbone.Marionette.LayoutView.extend({
        initialize: function(options) {
            var maximizedScreen = false;
            if ((!this.appletConfig) || _.isUndefined(this.appletConfig.instanceId)) {
                if (this.options.appletConfig && _.isUndefined(this.options.appletConfig.instanceId)) {
                    this.options.appletConfig.instanceId = this.options.appletConfig.id;
                } else if (!this.options.appletConfig) {
                    this.options.appletConfig = {};
                    this.options.appletConfig.id = this.appletOptions.appletConfig.id;
                    this.options.appletConfig.instanceId = this.appletOptions.appletConfig.instanceId;
                    this.options.appletConfig.fullScreen = false;
                }

                this.options.appletConfig.filterName = ADK.SessionStorage.getAppletStorageModel(this.options.appletConfig.instanceId, 'filterName', true);

                var maximizedApplet = ADK.Messaging.request('applet:maximized');
                if (!_.isUndefined(maximizedApplet)) {
                    this.options.appletConfig.filterName = maximizedApplet.get('filterName');
                    maximizedScreen = true;
                    ADK.Messaging.reply("applet:maximized", function() {
                        return undefined;
                    });
                }
                this.appletConfig = this.options.appletConfig;
            }
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
            var appletOptions = this.appletOptions || {}; //Set in extending view
            this.appletOptions = appletOptions;

            this.appletOptions.emptyText = appletOptions.emptyText || 'No Records Found';
            this.listenTo(this.appletOptions.collection, 'fetch:success', this.onSync);
            this.listenTo(this.appletOptions.collection, 'error', this.onError);

            this.routeParam = this.options.routeParam;

            //Set applet's fullScreen option in session
            if (this.appletConfig.fullScreen) {
                SessionStorage.setAppletStorageModel(this.appletConfig.instanceId, 'fullScreen', true);
            } else {
                SessionStorage.setAppletStorageModel(this.appletConfig.instanceId, 'fullScreen', false);
            }

            // Used for template
            this.model = new Backbone.Model({
                instanceId: this.appletConfig.instanceId,
                workspaceId: ADK.Messaging.request('get:current:screen').config.id,
                filterName: this.appletConfig.filterName
            });

            var filterName = this.appletConfig.filterName;
            if (this.appletConfig.filterName || !ADK.ADKApp.currentScreen.config.predefined) {
                this.model.set('hasSubHeader', true);
            } else {
                this.model.set('hasSubHeader', false);
            }

            if (ADK.ADKApp.currentScreen.config.predefined) {
                this.model.set('isPredefined', true);
            } else {
                this.model.set('isPredefined', false);
            }

            //Create Filter and Filter Button View
            if (this.appletOptions.filterFields || this.appletOptions.filterDateRangeField) {
                var filterFields, filterDateRangeField, dateRangeEnabled = false;
                if (this.appletOptions.filterFields) {
                    filterFields = this.appletOptions.filterFields;
                }
                if (this.appletOptions.filterDateRangeField) {
                    filterDateRangeField = this.appletOptions.filterDateRangeField;
                    dateRangeEnabled = true;
                }

                var filterOptions = {
                    id: this.appletConfig.instanceId,
                    workspaceId: ADK.Messaging.request('get:current:screen').config.id,
                    maximizedScreen: maximizedScreen,
                    fullScreen: this.appletConfig.fullScreen,
                    collection: this.appletOptions.collection,
                    filterFields: filterFields,
                    filterDateRangeField: filterDateRangeField,
                    filterName: this.appletConfig.filterName,
                    model: this.model
                };

                this.filterView = CollectionFilter.create(filterOptions);

                this.appletOptions.appletId = this.appletConfig.id;
                this.appletOptions.instanceId = this.appletConfig.instanceId;
                if (this.appletOptions.filterDateRangeField && this.appletConfig.fullScreen) {
                    this.filterDateRangeView = new FilterDateRangeView({
                        model: new Backbone.Model(appletOptions),
                        appletId: this.appletOptions.appletId,
                        appletView: this
                    });
                }
            }

            if (this.appletOptions.hasOwnProperty('onClickAdd')) {
                this.onClickAdd = this.appletOptions.onClickAdd;
            }

            if (this.appletOptions.toolbarView) {
                this.toolbarView = this.appletOptions.toolbarView;
            }

            //Create Data Grid View
            this.setAppletView();

            //Create Loading View
            this.loadingView = LoadingView.create();

            if (this.options.appletConfig.viewType === 'gist') {
                //set up events to close quicklooks
                this.listenTo(this, 'show', function() {
                    this.$('.grid-applet-panel').on('scroll', function() {
                        self.$('[data-toggle=popover]').popover('hide');
                        self.$('.dropdown.applet-dropdown.open').trigger('dropdown.hide');
                    });
                });
                this.listenTo(this, 'destroy', function() {
                    this.$('.grid-applet-panel').off('scroll');
                });
            }

            this.listenTo(ADK.Messaging, 'adk:globalDate:selected', this.abort);

        },

        /**
         * Cancel the active requests to the RDK.
         */
        abort: function() {
            var collection = this.appletOptions.collection;
            if (collection && collection.fetchOptions.allowAbort) {
                if (collection.xhr) {
                    collection.xhr.abort();
                } else if (collection.fullCollection && collection.fullCollection.xhr) {
                    collection.fullCollection.xhr.abort();
                }
            }
        },

        setAppletView: function() {
            this.displayAppletView = new this.appletOptions.AppletView(this.appletOptions);
        },
        onRender: function() {
            this.loading();
            if (this.filterView) {
                $(this.filterView.el).css({
                    marginLeft: '0px',
                    marginTop: '0px',
                    marginBottom: '6px'
                });

                this.appletFilter.show(this.filterView);
                var queryInputSelector = 'input[name=\'q-' + this.appletConfig.instanceId + '\']';
                var self = this;

                this.filterView.$el.find('input[type=search]').on('change', function() {
                    SessionStorage.setAppletStorageModel(self.expandedAppletId, 'filterText', $(this).val(), true);
                });
                this.filterView.$el.find('button[data-backgrid-action=clear]').on('click', function() {
                    SessionStorage.setAppletStorageModel(self.expandedAppletId, 'filterText', $(this).val(), true);
                });

                if (this.filterDateRangeView) {
                    this.appletFilterDateRange.show(this.filterDateRangeView);
                }

                this.$el.find('.grid-filter input').attr('tabindex', '0');
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
        template: containerTemplate,
        regions: {
            appletContainer: '.grid-container',
            appletToolbar: '.grid-toolbar',
            appletFilterDateRange: '.grid-filter-daterange',
            appletFilter: '.grid-filter'
        },
        eventMapper: {
            'refresh': 'refresh',
            'add': 'onClickAdd'
        },
        onSync: function(collection) {
            var applet = this.$("[data-instanceid='" + this.appletConfig.instanceId + "']");
            if (applet.length === 0) {
                applet = this.$el.closest("[data-instanceid='" + this.appletConfig.instanceId + "']");
            }
            applet.find('.fa-refresh').removeClass('fa-spin');
            if (this.toolbarView) {
                this.appletToolbar.show(this.toolbarView);
            }

            this.showStandardAppletView();

            if (this.filterView) {
                var searchText = SessionStorage.getAppletStorageModel(this.expandedAppletId, 'filterText', true, this.parentWorkspace);
                if (this.filterView && (this.filterView.userDefinedFilters.length > 0 || (!_.isUndefined(searchText) && !_.isNull(searchText) && searchText.trim().length > 0))) {
                    this.filterView.applyFilters();
                }
            }

            if (this.appletOptions.collection.length > 0 && !_.isUndefined(this.appletOptions.tblRowSelector)) {
                _.each(this.$(this.appletOptions.tblRowSelector), function(row) {
                    var dataInfoButton = this.$(row).find('td:nth-child(2)').text();
                    var attrs = {
                        'title': '',
                        'data-infobutton': ''
                    };

                    if (dataInfoButton.indexOf('Panel') !== -1) {
                        attrs['aria-expanded'] = 'false';
                        attrs.title = 'Press enter to expand accordion.';
                        attrs['data-infobutton'] = dataInfoButton.replace('Panel', '').trim();
                    } else {
                        this.$(row).find('td:first-child').prepend("<span class='sr-only toolbar-instructions'>Press enter to open the toolbar menu.</span>");
                        attrs['data-infobutton'] = dataInfoButton.trim();
                    }
                    this.$(row).attr(attrs);
                }, this);
            }
        },
        onError: function(collection, resp) {
            if (resp.statusText === "abort") {
                return;
            }
            var errorModel = new Backbone.Model(resp);
            var errorView = ErrorView.create({
                model: errorModel
            });
            this.showViewInAppletContainer(errorView);
        },
        loading: function() {
            this.showViewInAppletContainer(this.loadingView);
        },
        showStandardAppletView: function() {
            this.showViewInAppletContainer(this.displayAppletView);
        },
        showViewInAppletContainer: function(viewToShow, options) {
            options = options || {};
            options.preventDestroy = (this.appletContainer.currentView == this.loadingView);
            this.appletContainer.show(viewToShow, options);
        },
        refresh: function(event) {
            if (this.appletOptions.refresh !== undefined) {
                this.loading();
                this.appletOptions.refresh(this);
                return;
            }
            var collection = this.appletOptions.collection;

            if(!!collection.xhr) {
                // If we're currently refreshing, then skip.
                return;
            }

            this.loading();
            this.setAppletView();

            if (collection instanceof Backbone.PageableCollection) {
                collection.fullCollection.reset();
                collection.fullCollection.comparator = null;  // disable automatic sort on applet refresh
            } else {
                collection.reset();
                collection.comparator = null;  // disable automatic sort on applet refresh
            }

            ResourceService.clearCache(collection.url);
            ResourceService.fetchCollection(collection.fetchOptions, collection);
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
                console.error('BaseDisplayAppletView: buildJdsDateFilter both fromDate and toDate are empty.');
            }

            if (customFilter !== undefined && customFilter !== null) {
                dateFilter = operator + '(' + dateFilter + ',' + customFilter + ')';
            }

            return dateFilter;
        },
        dateRangeRefresh: function(filterParameter, options) {
            this.abort();

            this.appletOptions.collection.fetchOptions.criteria.filter =
                this.buildJdsDateFilter(filterParameter, options);

            var collection = this.appletOptions.collection;
            this.loading();
            this.displayAppletView = new this.appletOptions.AppletView(this.appletOptions);

            if (collection instanceof Backbone.PageableCollection) {
                collection.fullCollection.reset();
            } else {
                collection.reset();
            }

            ResourceService.fetchCollection(collection.fetchOptions, collection);
        },
        showFilterView: function() {
            var filterText = SessionStorage.getAppletStorageModel(this.expandedAppletId, 'filterText', true, this.parentWorkspace);
            if (this.appletOptions.filterFields && filterText !== undefined && filterText !== null && filterText.length > 0) {
                this.$el.find('#grid-filter-' + this.appletConfig.instanceId).toggleClass('collapse in');
                this.$el.find('input[name=\'q-' + this.appletConfig.instanceId + '\']').val(filterText);
                this.filterView.showClearButtonMaybe();
            } else if (this.appletOptions.filterDateRangeField && this.appletConfig.fullScreen) {
                this.$el.find('#grid-filter-' + this.appletConfig.instanceId).toggleClass('collapse in');
            }
        },
        onShow: function() {
            this.showFilterView();
        },
        onDestroy: function() {
            this.abort();
            try {
                if (this.toolbarView && !this.toolbarView.isDestroyed) {
                    this.toolbarView.destroy();
                    this.toolbarView = null;
                }
            } catch (e) {
                console.error('Error destroying toolbarView in applet:', this.appletConfig.id, e);
            }

            try {
                if (this.loadingView && !this.loadingView.isDestroyed) {
                    this.loadingView.destroy();
                    this.loadingView = null;
                }
            } catch (e) {
                console.error('Error destroying loadingView in applet:', this.appletConfig.id, e);
            }

            try {
                if (this.displayAppletView && !this.displayAppletView.isDestroyed) {
                    this.displayAppletView.destroy();
                    this.displayAppletView = null;
                }
            } catch (e) {
                console.error('Error destroying displayAppletView in applet:', this.appletConfig.id, e);
            }
        }
    });

    return AppletLayoutView;
});