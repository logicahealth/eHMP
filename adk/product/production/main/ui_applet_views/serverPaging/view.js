define([
    'jquery',
    'underscore',
    'handlebars',
    'api/ResourceService',
    'api/SessionStorage',
    'api/Messaging',
    'main/api/WorkspaceFilters',
    'main/ui_views/table/view',
    'main/adk_utils/crsUtil',
    'main/accessibility/components',
    'main/ui_views/text_filter/layoutView'
], function(
    $,
    _,
    Handlebars,
    ResourceService,
    SessionStorage,
    Messaging,
    WorkspaceFilters,
    TableView,
    CrsUtil,
    Accessibility,
    FilterLayoutView
) {
    "use strict";

    var FilterCollection = FilterLayoutView.prototype.Collection;

    var View = Backbone.Marionette.LayoutView.extend({
        className: 'server-paging-view',
        template: Handlebars.compile(
            '<div class="filter-container"></div>' +
            '<div class="toolbar-container"></div>' +
            '<div class="content-container">' +
            '<div></div>' +
            '</div>'
        ),
        toolbarView: null,
        onClickAdd: null,
        onClickRow: _.noop,
        groupable: false,
        emptyText: 'No Records Found',
        eventMapper: {
            'refresh': '_onRefresh',
            'add': 'onClickAdd'
        },
        tableOptions: {
            columns: []
        },
        options: {
            appletConfig: {
                id: null
            }
        },
        ui: {
            filterContainer: '.filter-container',
            contentContainer: '.content-container > div',
            toolbarContainer: '.toolbar-container'
        },
        regions: {
            filterRegion: '@ui.filterContainer',
            contentRegion: '@ui.contentContainer',
            toolbarRegion: '@ui.toolbarContainer'
        },
        behaviors: function() {
            return {
                InfiniteScroll: {
                    getCollection: function() {
                        return this.collection;
                    },
                    container: 'table tbody',
                    tagName: {
                        wrapper: 'tr',
                        content: 'th'
                    },
                    className: 'empty no-hover-state all-border-no',
                    events: 'click tr.row-header'
                }
            };
        },
        initialize: function(options) {
            this._showToolBar();
            this._createFilterView();
        },
        onRender: function() {
            this._showContentView();
            this._showFilterView();
        },
        onAttach: function() {
            if (this._anyVisibleFilters()) {
                Messaging.trigger('filters:collectionChanged:' + this.appletInstanceId, { anyFilters: true });
            }
        },
        onBeforeDestroy: function() {
            // This would prevent filters from being persisted on pre-defined screens
            //this._deleteFiltersFromSession();
            this.collection.abort();
        },
        onDestroy: function() {
            try {
                if (this.contentView && !this.contentView.isDestroyed) {
                    this.contentView.destroy();
                }
                delete this.contentView;
                delete this.dataGridOptions;

            } catch (e) {
                console.error('Error destroying dataGridView in applet:', this.appletConfig.id, e);
            }
            this.unbindEntityEvents(this, this._viewEvents);
            this.unbindEntityEvents(this._filterCollection, this._sessionFilterCollectionEvents);
            this.unbindEntityEvents(this._filterCollection, this._viewFilterCollectionEvents);
        },
        _viewEvents: {
            'refresh': '_onRefresh'
        },
        // Events used for Server-Side Infinite Scrolling Pattern
        _serverPagingCollectionEvents: {
            'clean:fetch:success': '_onSync',
            'page:fetch:success': '_pageFetchSuccess',
            'sort:success': '_configureInfoButtonOnRows',
            'sort:user': '_onUserSort'
        },
        _defineProperties: function() {
            Object.defineProperty(this, 'collection', {
                get: function() {
                    return this._collection;
                },
                set: function(instantiatedCollection) {
                    this._collection = instantiatedCollection;
                    this._onCollectionInstantiation();
                }
            });
        },
        _initializeCurrentScreenProperties: function(options) {
            var appletConfig = _.get(options, 'appletConfig');
            var currentWorkspace = ADK.WorkspaceContextRepository.currentWorkspace;
            var isPredefinedWorkspace = currentWorkspace.get('predefined');
            isPredefinedWorkspace = _.isBoolean(isPredefinedWorkspace) ? isPredefinedWorkspace : true;
            var multipleFilters = _.isBoolean(appletConfig.fullScreen) && appletConfig.fullScreen ? true : !isPredefinedWorkspace;
            _.extend(this, {
                'isPredefinedWorkspace': isPredefinedWorkspace,
                'multipleFilters': multipleFilters,
                'appletInstanceId': _.get(appletConfig, 'instanceId'),
                'workspaceId': _.get(options, 'screenModule.id')
            });
        },
        _onCollectionInstantiation: function() {
            // Prepopulate the filter collection here
            // to ensure the first fetch includes any predefined/prepopulated filters
            if (this._shouldLoadAndSaveFilters()) {
                this.bindEntityEvents(this._filterCollection, this._sessionFilterCollectionEvents);
            }
            this._prePopulateFilterCollection(this._filterCollection);
            this.bindEntityEvents(this._filterCollection, this._viewFilterCollectionEvents);

            if (!this.isPredefinedWorkspace) {
                this.bindEntityEvents(this._filterCollection, this._userDefinedFilterEvents);
            }
            var defaultSortColumn = _.result(this, 'defaultSortColumn');
            if (_.isString(defaultSortColumn)) {
                var column = _.findWhere(this.getColumns(), {
                    name: defaultSortColumn
                });
                if (_.isUndefined(column)) {
                    throw new Error('DefaultSortColumn is not a valid column', defaultSortColumn);
                }
                this._setDefaultGrouping(column);
                this._setDefaultSort(column);
            }
            this.bindEntityEvents(this._collection, this._serverPagingCollectionEvents);
            this._createContentView();
            this._fetchData();
        },
        _showToolBar: function() {
            if (!!this.toolbarView) {
                this.toolbarRegion.show(this.toolbarView);
            }
        },
        _showContentView: function() {
            if (!_.isEqual(this.contentRegion.view, this.contentView)) {
                this.contentRegion.show(this.contentView);
            }
        },
        getColumns: function() {
            return _.get(this.getOption('tableOptions'), 'columns', []);
        },
        _createContentView: function() {
            this.contentView = new TableView(_.extend({}, this.dataGridOptions, {
                collection: this.collection,
                columns: this.getColumns(),
                helpers: this.helpers,
                onClickRow: this.onClickRow,
                label: _.get(this, 'options.appletConfig.title', null),
                initialSortedColumn: _.result(this, 'defaultSortColumn')
            }));
        },
        _configureInfoButtonOnRows: function() {
            if (this.collection.length > 0 && !_.isUndefined(this.getOption('tblRowSelector'))) {
                _.each(this.$(this.getOption('tblRowSelector')), function(el) {
                    var $el = this.$(el);
                    $el.attr({
                        'data-infobutton': $el.find('td:first').text()
                    }).find('td:first-child').prepend("<span class='sr-only toolbar-instructions'>Press enter to open the toolbar menu.</span>");
                }, this);
            }
        },
        _onSync: function() {
            if (this.contentView.isDestroyed) {
                this._createContentView();
            }
            this._configureInfoButtonOnRows();
        },
        _fetchData: function(options) {
            if (_.isFunction(this.beforeFetch)) {
                this.beforeFetch();
            }
            var collection = this.collection;
            if (collection.url) {
                ResourceService.clearCache(collection.url);
            }
            var customSuccess = _.get(collection, 'fetchOptions.success');
            customSuccess = _.isFunction(customSuccess) ? customSuccess : _.noop;
            _.set(collection, 'fetchOptions.criteria', _.omit(_.get(collection, 'fetchOptions.criteria', {}), 'pid'), {});
            collection.fetch(_.extend({}, collection.fetchOptions, options, {
                success: _.compose(customSuccess,
                    function(collection, resp) {
                        collection.trigger('clean:fetch:success');
                    })
            }));
        },
        _pageFetchSuccess: function(collection, resp) {
            if (_.isArray(resp.data.items) && !_.isEmpty(resp.data.items)) {
                if (CrsUtil.findCurrentCRSItems('gridAppletView')) {
                    Accessibility.Notification.new({
                        'type': 'Assertive',
                        'message': CrsUtil.screenReaderFeedback.FOUND_RELATED_CONCEPT
                    });
                }
            }
        },
        _setDefaultGrouping: function(column) {
            if (_.isFunction(this.collection.setInitialGrouping)) {
                this.collection.setInitialGrouping({
                    groupName: column.name,
                    groupKey: column.groupKey
                });
            }
        },
        _setDefaultSort: function(column) {
            if (_.isUndefined(column.sortKeys)) {
                throw new Error('Sort key must be defined on the defaultSortColumn', column.name);
            }
            var initialSortString = column.sortKeys[_.get(column, 'sortKeys.defaultDirection', 'asc')];
            this.collection.Criteria.Order.setSortKey(initialSortString);
            this.collection.Criteria.Order.setDefaultKey(initialSortString);
        },
        _onUserSort: function(direction, column) {
            if (!_.isString(direction)) {
                this.collection.serverSort();
                return;
            }
            this.collection.serverSort(_.get(column, ('sortKeys.' + direction)), {
                groupName: _.get(column, 'name'),
                groupKey: _.get(column, 'groupKey')
            });
        },
        _onRefresh: function(event, options) {
            ResourceService.clearCacheByResourceTitle(this.collection.resourceTitle);
            this.collection.groupName = this.collection._initialGroupName;
            this.collection.setGrouping(this.collection._initialGroupKey);
            this.collection.Criteria.Order.setSortKey(this.collection.Criteria.Order.default);
            this.collection.reset();
            this.collection.trigger('refresh');
            this._fetchData(_.extend({
                cache: false
            }, (options || {})));
        },
        /*
        Start of Filter Specific Code
        -----------------------------
        */
        // Events tied to user's filter action
        _viewFilterCollectionEvents: {
            'update': '_onFilter'
        },
        // Events tied to syncing filters to Browser's local Session Storage
        _sessionFilterCollectionEvents: {
            'update': '_saveFiltersToSession'
        },
        // Events tied to syncing filters to Server's User Preference Storage
        _userDefinedFilterEvents: {
            'add': '_saveFilterToServer',
            'remove': '_deleteFilterFromServer'
        },
        _createFilterView: function() {
            this.filterView = new FilterLayoutView({
                collection: this._filterCollection,
                showFilterTitle: !this.isPredefinedWorkspace,
                multipleFilters: this.multipleFilters,
                instanceId: this.appletInstanceId,
                filterTitle: _.get(this.getOption('appletConfig'), 'filterName', '')
            });
        },
        _showFilterView: function() {
            this.showChildView('filterRegion', this.filterView);
        },
        /*
        Determine if filters should be persisted / previous filter be loaded from storage
        (Filters are not saved/loaded when current screen is navigated to via an expand applet method)
        */
        _shouldLoadAndSaveFilters: function() {
            return !_.get(this, 'options.fromMinimizedToMaximized', false);
        },
        /*
        Determine if there are any user entered filters

        This does not include filters that the user can't remove.
        An example of a filter that a user can't remove would be a filter
        on a Condition Based Workspace or an Applet with hardcoded filters.
        */
        _anyVisibleFilters: function() {
            var conditionObject = { removable: true };
            if (this.multipleFilters) {
                conditionObject.shouldShow = true;
            }
            return !_.isEmpty(this._filterCollection.getCombinedFilterString(conditionObject));
        },
        _saveFilterToServer: function(model, collection, options) {
            var filterString = model.get('text');
            WorkspaceFilters.saveFilterToJDS(this.workspaceId, this.appletInstanceId, filterString);
        },
        _deleteFilterFromServer: function(model, collection, options) {
            var filterString = model.get('text');
            WorkspaceFilters.deleteFilterFromJDS(this.workspaceId, this.appletInstanceId, filterString);
        },
        _saveFiltersToSession: function(collection, options) {
            var arrayOfFiltersToSave = collection.getCombinedFilterString({ removable: true });
            SessionStorage.setAppletStorageModel(this.appletInstanceId, 'filterText', arrayOfFiltersToSave, true);
        },
        _deleteFiltersFromSession: function() {
            SessionStorage.clearAppletStorageModelAttribute(this.appletInstanceId, 'filterText', true, this.workspaceId);
        },
        /*
        Collect any persisted filters from:
        - navigation's options object (used when expanding an applet)
        - browser's session stroage
        - server's stroage
        and add them to the view's filter collection.
        */
        _prePopulateFilterCollection: function(collection) {
            var appletConfig = this.getOption('appletConfig') || {};

            // Build up an array of filter object's that contain the "text" that is used to filter the results
            // in order to just add the filters in one single call to the collection's "add" method.
            var filtersToAdd = [];
            var filterTextFromNavigation = _.get(this, 'options.textFilter', null);
            if (filterTextFromNavigation && _.isString(filterTextFromNavigation)) {
                filtersToAdd.push({
                    text: filterTextFromNavigation
                });
            }
            if (this._shouldLoadAndSaveFilters()) {
                var filterTextFromSession = SessionStorage.getAppletStorageModel(this.appletInstanceId, 'filterText', true);
                if (!_.isUndefined(filterTextFromSession) && _.isString(filterTextFromSession)) {
                    filtersToAdd.push({
                        text: filterTextFromSession
                    });
                }
                /*
                Retrieve user-defined filters from user's screen config.
                Callback is used to avoid race condition of screen config not being loaded into memory yet.
                */
                WorkspaceFilters.onRetrieveWorkspaceFilters(this.appletInstanceId, this._onUserDefinedFiltersLoaded, this);
            }
            if (!_.isEmpty(filtersToAdd)) {
                collection.add(filtersToAdd);
            }

            // Update Collection's Filter Criteria
            var filterArray = this._filterCollection.map('text');
            this.collection.Criteria.TextFilter.addTextValues(filterArray);
        },
        _onUserDefinedFiltersLoaded: function(args) {
            /*
            The "args" argument is an object that contains an "applet" property
            that is an object of all user-defined items saved for this applet.
            */
            var userDefinedFilterArray = _.get(args, 'applet.filters', []);
            if (!_.isArray(userDefinedFilterArray)) return;
            this._filterCollection.add(_.map(userDefinedFilterArray, function(filterText) {
                return {
                    text: filterText
                };
            }));
        },
        _onFilter: function() {
            var filterArray = this._filterCollection.map('text');
            this.collection.serverFilter({
                values: filterArray
            });
            /*
            Trigger event for outside views that might want to listen and react.
            (Example: Chrome View wants to highlight the applet's header when it is being filtered.)
            */
            Messaging.trigger('filters:collectionChanged:' + this.appletInstanceId, { anyFilters: this._anyVisibleFilters() });
        }
        /*
        -----------------------------
        End of Filter Specific Code
        */
    });

    var Orig = View,
        Modified = Orig.extend({
            constructor: function() {
                if (!this.options) this.options = {};
                var args = Array.prototype.slice.call(arguments),
                    init = this.initialize,
                    onRender = this.onRender,
                    onDestroy = this.onDestroy,
                    onBeforeDestroy = this.onBeforeDestroy,
                    behaviors = this.behaviors,
                    getColumns = this.getColumns,
                    onClickAdd = this.onClickAdd,
                    onClickRow = this.onClickRow,
                    toolbarView = this.toolbarView;

                var nonExtendableProperties = [];
                _.forIn(Orig.prototype, function(value, key) {
                    if (_.startsWith(key, '_')) {
                        nonExtendableProperties.push(key);
                    }
                });
                _.extend(this, _.pick(Orig.prototype, nonExtendableProperties));

                // Extending the view with common screen properties for easy reference
                // (In constructor to avoid race conditions)
                this._initializeCurrentScreenProperties.apply(this, args);

                // This needs to be defined before collection property gets set
                // in order to prevent an error being thrown in _onCollectionInstantiation
                this._filterCollection = new FilterCollection();

                // Call property immediately in constructor to avoid race conditions.
                this._defineProperties();

                // If "getColumns" and "onClickeAdd" are extended ensure that they are functions
                if (Orig.prototype.getColumns !== getColumns && _.isFunction(getColumns)) {
                    this.getColumns = getColumns;
                }
                if (Orig.prototype.onClickAdd !== onClickAdd && _.isFunction(onClickAdd)) {
                    this.onClickAdd = _.bind(onClickAdd, this);
                }
                if (Orig.prototype.onClickRow !== onClickRow && _.isFunction(onClickRow)) {
                    this.onClickRow = _.bind(onClickRow, this);
                }

                if (Orig.prototype.toolbarView !== toolbarView && toolbarView instanceof Backbone.View) {
                    this.toolbarView = toolbarView;
                }

                this.initialize = function() {
                    var args = Array.prototype.slice.call(arguments);
                    this.bindEntityEvents(this, this._viewEvents);
                    init.apply(this, args);
                    if (Orig.prototype.initialize === init) return;
                    Orig.prototype.initialize.apply(this, args);
                };

                this.onDestroy = function() {
                    var args = Array.prototype.slice.call(arguments);
                    View.prototype.onDestroy.apply(this, args);
                    if (View.prototype.onDestroy === onDestroy) return;
                    onDestroy.apply(this, args);
                };

                this.onBeforeDestroy = function() {
                    var args = Array.prototype.slice.call(arguments);
                    View.prototype.onBeforeDestroy.apply(this, args);
                    if (View.prototype.onBeforeDestroy === onBeforeDestroy) return;
                    onBeforeDestroy.apply(this, args);
                };

                if (Orig.prototype.behaviors !== behaviors && (_.isObject(behaviors) || _.isFunction(behaviors)))
                    this.behaviors = _.extend({}, _.isFunction(Orig.prototype.behaviors) ? Orig.prototype.behaviors() : Orig.prototype.behaviors, _.isFunction(behaviors) ? behaviors() : behaviors);

                Orig.prototype.constructor.apply(this, args);
            }
        });

    return Modified;
});
