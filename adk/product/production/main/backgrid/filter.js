define([
    'backbone',
    'marionette',
    'jquery',
    'underscore',
    'backgrid',
    'main/backgrid/filterTagView',
    'api/ResourceService',
    'hbs!main/backgrid/filterTemplate',
    'api/Messaging',
    'main/api/WorkspaceFilters',
    'main/Utils'
], function(Backbone, Marionette, $, _, Backgrid, FilterTagView, ResourceService, filterTemplate, Messaging, WorkspaceFilters, Utils) {
    'use strict';
    var Filter = {};
    var custprocessId;

    var UserDefinedFilter = Backbone.Model.extend({
        defaults: {
            name: '',
            workspaceId: '',
            instanceId: '',
            status: ''
        }
    });

    var UserDefinedFilters = Backbone.Collection.extend({
        model: UserDefinedFilter
    });
    Filter.create = function(options) {
        // Customize Backgrid's default ClientSideFilter
        Backgrid.ClientSideFilterWithDateRangePickerFilter = Backgrid.Extension.ClientSideFilter.extend({
            preFilterCollection: null,
            dateField: null,
            setDateField: function(dateField) {
                this.dateField = dateField;
            },
            events: _.extend({}, Backgrid.Extension.ClientSideFilter.prototype.events, {
                'submit': 'addFilterOnSubmit',
                'click .input-filters': 'clickInputFilters',
                'click .filter-title-input': 'clickInputFilterTitle',
                'click button.remove-all': 'removeAllFilters',
                'click .filter-title': 'filterEditModeFromUi',
                'keypress .filter-name-container': 'filterEditModeFromUIKeypress',
                'focusout .filter-title-input': 'filterEditModeFromUi',
                'change .filter-title-input': 'saveFilter',
                'keypress .filter-title-input': 'filterKeypress',
                'click .clear-input': 'clear'
            }),
            addFilter: function(filterText) {
                if (filterText.length < 1) {
                    return;
                }
                var filterAlreadyDefined = this.userDefinedFilters.findWhere({
                    name: filterText
                });
                if (filterAlreadyDefined) {
                    return;
                }
                var userDefinedFilter, udafTag;
                userDefinedFilter = new UserDefinedFilter({
                    name: filterText,
                    workspaceId: this.workspaceId,
                    instanceId: this.instanceId,
                    status: 'new'
                });
                this.userDefinedFilters.add(userDefinedFilter);
                udafTag = new FilterTagView({
                    model: userDefinedFilter,
                    onUserWorkspace: this.onUserWorkspace,
                    fullScreen: this.fullScreen
                });
                this.$('.udaf').append(udafTag.render().el);
                ADK.SessionStorage.setAppletStorageModel(this.instanceId, 'filterText', '', true);
                this.searchBox().val('');
                if (this.collection._events.customfilter !== undefined) {
                    this.doCustomSearch();
                } else {
                    this.doSearch();
                }
                this.userDefinedFiltersCollectionChanged();
            },
            addFilterOnSubmit: function(e) {
                e.preventDefault();
                this.$('.filter-add').blur();
                //if not on a user defined workspace, return
                if (!this.onUserWorkspace) {
                    return;
                }
                var searchText = this.searchBox().val().trim();
                if (searchText.length === 0) {
                    return;
                }
                var filterTerms = searchText.split(' ');
                _.each(filterTerms, this.addFilter, this);

                var formControl = this.$('.form-control.input-filters');
                this.clearInputBtnDisplay();
                formControl.focus();
            },
            clickInputFilters: function() {
                this.$('input.input-filters').focus();
            },
            clickInputFilterTitle: function() {
                this.$('input.filter-title-input').focus();
            },
            getFilterTextbox: function() {
                return this.$el.find('.filter-title-input');
            },
            getFilterLabel: function() {
                return this.$el.find('.filter-title');
            },
            filterKeypress: function(e) {
                if (e.which === 13) {
                    this.filterEditModeFromUIKeypress(e);
                }
            },
            saveFilter: function() {
                var filterTitleTextbox = this.getFilterTextbox();
                var newTitle = filterTitleTextbox.val();
                if (newTitle === '')
                    return;

                var filterLabel = this.getFilterLabel();
                filterLabel.text(newTitle);
                this.$el.parents('.gs-w').attr('data-filter-name', newTitle);
                Messaging.trigger('gridster:saveAppletsConfig');
                if (this.fullScreen) {
                    this.$el.parents().find('.applet-filter-title').text(newTitle);
                } else {
                    this.$el.parents('.gs-w').find('.applet-filter-title').text(newTitle);
                    ADK.SessionStorage.setAppletStorageModel(this.instanceId, 'filterName', newTitle, true);
                }
                this.$el.parents('.panel-body').find('.sub-header').show();
                this.$el.parents('div[data-appletid]').addClass('filtered');
            },
            removeAllFilters: function(e) {
                e.preventDefault();
                this.filterName = '';
                if (this.fullScreen) {
                    WorkspaceFilters.removeAllFiltersFromAppletFromSession(this.workspaceId, this.instanceId);
                } else {
                    WorkspaceFilters.removeAllFiltersFromApplet(this.workspaceId, this.instanceId);
                }
                ADK.SessionStorage.setAppletStorageModel(this.instanceId, 'filterText', '', true);
                ADK.SessionStorage.setAppletStorageModel(this.instanceId, 'filterName', this.filterName, true);
                this.$el.parents('.gs-w').attr('data-filter-name', this.filterName);
                this.$('.filter-title').text(this.filterName);
                Messaging.trigger('gridster:saveAppletsConfig');
                this.userDefinedFilters.reset();
                this.clear();
                this.$('.udaf').find('span.udaf-tag').remove();
                this.$('.filter-container').find('.filter-title-input').val('');
                this.userDefinedFiltersCollectionChanged();
                this.$el.parents('.panel-body').find('.sub-header').hide();
                this.$el.parents('.filtered').removeClass('filtered');
                this.$('.input-filters').focus();
            },
            filterEditModeFromUi: function(event) {
                if (!this.fullScreen) {
                    var editFilter = $(event.target).hasClass('filter-title-input');
                    this.filterEditMode(!editFilter);
                }
            },
            filterEditModeFromUIKeypress: function(event) {
                if (event.which === 13 || event.which === 32) {
                    event.preventDefault();
                    this.filterEditModeFromUi(event);
                }
            },
            filterEditMode: function(editFilter) {
                var filterTitleLabel = this.getFilterLabel();
                var filterTitleTextbox = this.getFilterTextbox();

                if (editFilter) {
                    var filterTitle = filterTitleLabel.text();
                    filterTitleTextbox.focus().val(filterTitle);
                }
            },
            setVisibleWithTransition: function(element, makeVisible) {
                if (makeVisible) {
                    element.removeClass('hidden');
                    element.collapse('show');
                } else {
                    element.collapse('hide');
                }
            },
            onShow: function() {
                var self = this;
                WorkspaceFilters.onRetrieveWorkspaceFilters(self.instanceId, function(args) {
                    var j, filters, filterCount, userDefinedFilter, udafTag, status;
                    self.getFilterLabel().text(self.filterName);

                    filters = args.applet ? args.applet.filters : args.applet;
                    filterCount = filters ? filters.length : 0;
                    for (j = 0; j < filterCount; j++) {
                        userDefinedFilter = new UserDefinedFilter({
                            name: filters[j],
                            workspaceId: self.workspaceId,
                            instanceId: self.instanceId,
                            status: 'SAVED'
                        });
                        self.userDefinedFilters.add(userDefinedFilter);
                        udafTag = new FilterTagView({
                            model: userDefinedFilter,
                            onUserWorkspace: self.onUserWorkspace,
                            fullScreen: self.fullScreen
                        });
                        self.$('.udaf').append(udafTag.render().el);
                    }

                    self.userDefinedFiltersCollectionChanged.call(self);
                }, self);

                this.listenTo(this.collection, 'fetchSuccessful', this.onFetchCollection);
                this.listenTo(this.collection, 'backgrid:sorted', this.onSort);
                this.listenTo(this.collection, 'baseGistView:sortNone', this.onSortNone);
                this.listenTo(this.collection, 'baseGistView:sortManual', this.onSortManual);
                this.getFilterTextbox().val(this.filterName);

                if (this.filterName === "") {
                    this.$el.parents('.panel-body').find('.sub-header').hide();
                } else {
                    this.$el.parents('.panel-body').find('.sub-header').show();
                }
            },
            render: function() {
                this.$el.html(this.template(this));
                Utils.applyMaskingForSpecialCharacters(this.$el.find('.filter-title-input'));
                this.getFilterTextbox().text(this.filterName);
                var bodyTag = $('body').attr('class');
                if (bodyTag.search('-full') > 0) {
                    this.$el.find('.filter-header').remove();
                    this.$el.find('.input-group.input-group-sm').addClass('not-udws');
                }
                this.clearInputBtnDisplay();
                return this;
            },
            initialize: function(options) {
                Backgrid.ClientSideFilterWithDateRangePickerFilter.__super__.initialize.apply(this, arguments);
                this.userDefinedFilters = new UserDefinedFilters();

                this.instanceId = options.instanceId;
                this.workspaceId = options.workspaceId;
                this.fullScreen = options.fullScreen;
                this.collection = options.collection;
                this.maximizedScreen = options.maximizedScreen;
                this.filterName = options.filterName || '';
                this.filterText = options.filterText || '';
                this.model = options.model;
                this.destinationCollection = options.destinationCollection;

                var currentScreen = Messaging.request('get:current:screen');
                this.onUserWorkspace = (currentScreen.config.predefined === false ? true : false);
                var lockedScreen = currentScreen.config.locked;
                if (lockedScreen) {
                    this.onUserWorkspace = !lockedScreen.filters;
                }
                this.prevSearchTextLength = 0; //when using backspace the search text of less than 3 characters will be allowed
                this.hasActiveSearch = false;

                this.listenTo(this.userDefinedFilters, 'model: remove', this.onUserDefinedFilterRemove);
            },
            updateAdvancedFilterOptionsVisibility: function() {
                var filterContainer = this.$el.find('.filter-container');
                var anyUserDefinedFilters = this.userDefinedFilters.length > 0;
                var showAdvancedFilterOptions = anyUserDefinedFilters;

                this.setVisibleWithTransition(filterContainer, showAdvancedFilterOptions);
            },
            userDefinedFiltersCollectionChanged: function() {
                this.updateAdvancedFilterOptionsVisibility();

                var anyFilters = this.userDefinedFilters.length > 0;
                WorkspaceFilters.triggerGlobalFiltersChangedAlert(this.instanceId, anyFilters);
            },
            onUserDefinedFilterRemove: function() {
                //when a filter is deleted, set focus to the search box and run the search
                ADK.SessionStorage.setAppletStorageModel(this.instanceId, 'filterText', '', true);
                this.searchBox().focus();
                if (this.collection._events.customfilter !== undefined) {
                    this.doCustomSearch();
                } else {
                    this.doSearch();
                }
                this.userDefinedFiltersCollectionChanged();
            },

            applyFilters: function() {
                var originalModelsCount = 0;
                // custom filter
                if (this.collection._events.customfilter !== undefined) {
                    this.doCustomSearch();
                    return;
                }
                if (this.collection.pageableCollection !== undefined && this.collection.pageableCollection.originalModels !== undefined) {
                    originalModelsCount = this.collection.pageableCollection.originalModels.length;
                } else if (this.collection.originalModels !== undefined) {
                    originalModelsCount = this.collection.originalModels.length;
                }

                var isFilterKeyMatchingPattern = this.isFilterKeyMatchingPattern(this.searchBox());

                // expect at least 1 characters to start filtering.
                if (!isFilterKeyMatchingPattern || (this.searchBox().val().length < 1 &&
                    this.collection.models.length === originalModelsCount && this.userDefinedFilters.length === 0)) {
                    this.prevSearchTextLength = this.searchBox().val().length;
                    if (!isFilterKeyMatchingPattern) {
                        this.$('.filter-add').attr('disabled', true);
                    }
                    return;
                }

                // non empty filter key string that is in valid format
                this.prevSearchTextLength = this.searchBox().val().length;
                this.doSearch();
                // trigger filterDone event for GistView.
                if (this.collection._events.filterDone !== undefined) {
                    options.collection.trigger('filterDone');
                }
                this.clearInputBtnDisplay();
            },

            // Note: search is being wrapped around a debounce by Backgrid.
            // the debounce prevents the code from running immediately after typing one character, so a few characters can be typed.
            search: function() {
                this.applyFilters();
            },
            doCustomSearch: function() {
                //console.log('doCustomSearch');
                var regexp = this.getFilterRegExp();
                options.collection.trigger("customfilter", regexp);

                this.clearInputBtnDisplay();
            },
            getFilterRegExp: function() {
                var query = this.searchBox().val().trim();
                if (this.userDefinedFilters !== undefined && this.userDefinedFilters.length > 0) {
                    this.userDefinedFilters.each(function(model) {
                        query = query + (query.length > 0 ? ' ' : '') + model.get('name');
                    });
                }

                var regexp;
                try {
                    regexp = this.makeRegExp(query);
                } catch (e) {
                    //ignore this error.
                    //it is caused by the user not completing the full search string
                    //which causes it to be syntactically incorrect regex expression
                    return true;
                }
                return regexp;
            },
            getFilterValues: function() {
                var filterValues = [];
                if (this.userDefinedFilters !== undefined) {
                    filterValues = _.map(this.userDefinedFilters.models, function(filterModel) {
                        return filterModel.get('name');
                    });
                }

                var termInTextBox = this.searchBox().val().trim();
                filterValues.push(termInTextBox);
                return _.filter(filterValues, function(filterTerm) {
                    return filterTerm !== '';
                });
            },
            doSearch: function(e) {
                //console.log('doSearch');
                var filterValues = this.getFilterValues();
                var query = _.reduce(filterValues, function(queryThusFar, filterValue) {
                    var seperator = (queryThusFar === '' ? '' : ' ');
                    return queryThusFar + seperator + filterValue;
                }, '');

                //remove the special characters
                query = query.replace(/[\*%&\$#\!\\\/]/g, '');

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

                if (!searchNeeded) {
                    return;
                }

                var fullCollection = this.collection.fullCollection || this.collection;
                if (!_.isUndefined(fullCollection.preFilterCollection) && fullCollection.length === fullCollection.preFilterCollection.length) {
                    var fullColModels = fullCollection.filter(function(model) {
                        return model;
                    });
                    var preFilterColModels = fullCollection.preFilterCollection.filter(function(model) {
                        return model;
                    });
                    if (_.difference(fullColModels, preFilterColModels)) {
                        this.preFilterCollection = fullCollection.preFilterCollection;
                    }
                }
                // capture pre-filtered collections for restoring collections on clearing of filters.
                if (_.isEmpty(this.preFilterCollection)) {
                    this.preFilterCollection = fullCollection.clone();
                }

                var matcher = _.bind(this.makeMatcher(query), this);
                var col = this.collection;
                if (col.pageableCollection) col.pageableCollection.getFirstPage({
                    silent: true
                });

                if (col instanceof Backbone.PageableCollection) {
                    var clonedModels = this.preFilterCollection.models;
                    // deep cloning models if the collection has panels (nested collections) that should be filtered
                    if (col.fullCollection.where({
                        isPanel: "Panel"
                    }).length > 0) {
                        clonedModels = this.preFilterCollection.map(function(model) {
                            var newModel = model.clone();
                            if (model.has('labs')) {
                                newModel.set('labs', model.get('labs').clone());
                            }
                            return newModel;
                        });
                    }
                    col.fullCollection.reset(clonedModels, {
                        silent: true
                    });
                    col.getFirstPage({
                        silent: true
                    });
                    col.fullCollection.reset(col.fullCollection.filter(matcher), {
                        reindex: true
                    });
                } else {
                    col.reset(this.preFilterCollection.filter(matcher), {
                        reindex: false
                    });
                }
                if (col.comparator) {
                    col.sort();
                }
                if (col.markInfobutton) {
                    col.markInfobutton.func(col.markInfobutton.that);
                }
            },
            destroy: function() {

                if (this.collection.fullCollection && this.collection.fullCollection.markInfobutton) {
                    this.collection.fullCollection.markInfobutton = null;
                }

                if (this.collection && this.collection.markInfobutton) {
                    this.collection.markInfobutton = null;
                }

                this.remove();

                options = null;
            },
            onFetchCollection: function() {
                this.preFilterCollection = null;
            },
            onSort: function() {
                if (this.collection._events.customfilter !== undefined) {
                    this.doCustomSearch();
                } else {
                    this.doSearch();
                }
            },
            onSortNone: function() {
                this.preFilterCollection = null;
                if (this.collection._events.customfilter !== undefined) {
                    this.doCustomSearch();
                } else {
                    this.doSearch();
                }
            },
            onSortManual: function(col) {
                if (_.isUndefined(col)) {
                    this.preFilterCollection = null;
                } else {
                    this.preFilterCollection = col;
                }
                if (this.collection._events.customfilter !== undefined) {
                    this.doCustomSearch();
                } else {
                    this.doSearch();
                }
            },
            clear: function() {
                this.searchBox().val('');
                this.toggleClearButton();
                this.$(".clear-input").hide();
                this.$('.filter-add').attr('disabled', true);

                // trigger filterDone event for GistView.
                if (this.collection._events.filterDone !== undefined) {
                    options.collection.trigger('filterDone');
                }
                if (this.collection._events.clear_customfilter !== undefined) {
                    var filterRegExp = this.getFilterRegExp();
                    options.collection.trigger('clear_customfilter', filterRegExp);
                    this.searchBox().focus();
                    return;
                }
                this.searchBox().focus();
                if (this.collection._events.customfilter !== undefined) {
                    this.doCustomSearch();
                } else {
                    this.doSearch();
                }
                if (options.collection.markInfobutton) {
                    options.collection.markInfobutton.func(options.collection.markInfobutton.that);
                }
            },
            toggleClearButton: function() {
                var $clearButton = this.clearButton();
                var searchTerms = this.searchBox().val();
                if (searchTerms.length > 0) {
                    $clearButton.show();
                } else {
                    $clearButton.hide();
                }
            },
            clearInputBtnDisplay: function() {
                var searchVal = this.searchBox().val() || this.filterText;
                if (searchVal) {
                    this.$(".clear-input").show();
                    if (searchVal.length > 2) {
                        this.$('.filter-add').attr('disabled', false);
                        return;
                    }
                } else {
                    this.$(".clear-input").hide();
                }
                this.$('.filter-add').attr('disabled', true);
            },
            isFilterKeyMatchingPattern: function(object) {
                var filterKey = $(object).parent().find('input').val();
                var pattern = /[\*%&\$#\!\\\/]/g;
                return !pattern.test(filterKey);
            },
            makeMatcher: function(query) {
                var regexp;

                try {
                    regexp = this.makeRegExp(query);
                } catch (e) {
                    //ignore this error.
                    //it is caused by the user not completing the full search string
                    //which causes it to be syntactically incorrect regex expression
                    return true;
                }

                var tryMatch = function(text) {
                    return regexp.test(text);
                };

                var getCellValue = function(json, key) {
                    if (typeof(key) === 'string') {
                        return json[key];
                    } else {
                        // appletOptions.filterFields is typically a list of strings, but for
                        //  complex types (nested arrays) it could be a function that will
                        //  return a string (such a a space separated list of the values to search)
                        return key(json);
                    }
                };

                return function(model) {
                    var json = model.toJSON();
                    // Test the search filter on all other fields
                    var fields = this.fields;
                    var keys = this.fields || model.keys();

                    var isMatched = false;
                    for (var i = 0, l = keys.length; i < l; i++) {
                        var key = keys[i];
                        var cellValue = getCellValue(json, key);
                        if (key === 'observed' || key === 'entered') {
                            //some records have blank dates
                            if (cellValue !== undefined) {
                                var observed1 = cellValue + '';
                                observed1 = cellValue.slice(0, 8);
                                observed1 = cellValue.replace(/(\d{4})(\d{2})(\d{2})/, '$2/$3/$1');

                                var observed2 = cellValue + '';
                                observed2 = cellValue.slice(0, 8);

                                if (tryMatch(observed1) || tryMatch(observed2)) {
                                    isMatched = true;
                                }
                            }
                        }
                        if (!_.isUndefined(cellValue) && tryMatch(cellValue + '')) {
                            isMatched = true;
                        }
                    }

                    // for Panel, add all of its enclosed laps' keys, too.
                    var isPanel = model.get('isPanel');
                    if (isPanel !== undefined && isPanel !== null && isPanel === 'Panel') {
                        var labs = model.get('labs');
                        if (labs !== undefined && labs !== null) {
                            var matcher = _.bind(this.makeMatcher(query), this);
                            var filteredLabs = new Backbone.Collection(labs.filter(matcher));
                            if (filteredLabs.length > 0) {
                                isMatched = true;
                                labs.reset(filteredLabs.models, {
                                    reindex: false
                                });
                            }
                        }
                    }

                    return isMatched;
                };
            }
        });

        var filterView = new Backgrid.ClientSideFilterWithDateRangePickerFilter({
            instanceId: options.id,
            workspaceId: options.workspaceId,
            maximizedScreen: options.maximizedScreen,
            fullScreen: options.fullScreen,
            collection: options.collection,
            fields: options.filterFields,
            placeholder: 'Filter',
            name: 'q-' + options.id,
            template: filterTemplate,
            filterName: options.filterName || '',
            model: options.model
        });

        if (!_.isUndefined(filterView.instanceId)) {
            filterView.filterId = filterView.filterName + '-' + filterView.instanceId;
        } else {
            console.error('508: filter-title-input has no ID. The label element is broken.');
        }

        if (options.filterDateRangeEnabled) {
            filterView.setDateField(options.filterDateRangeField);
        }



        return filterView;
    };

    return Filter;

});