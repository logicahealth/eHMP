define([
    'underscore',
    'backbone',
    'marionette',
    'moment',
    'hbs!app/applets/search/templates/searchResultTemplate',
    'hbs!app/applets/search/templates/searchResultGroupTemplate',
    'hbs!app/applets/search/templates/searchResultContentTemplate',
    'hbs!app/applets/search/templates/badgeTemplate',
    'hbs!app/applets/search/templates/emptyViewTemplate',
    'hbs!app/applets/search/templates/searchingTemplate'
], function(_, Backbone, Marionette, moment, searchResultTemplate, searchResultGroupTemplate, searchResultContentTemplate, badgeTemplate, emptyViewTemplate, searchingTemplate) {
    'use strict';
    var COMMUNITY_DOMAIN = 'Community Health Summaries';
    var TEXT_SEARCH_CHANNEL = ADK.Messaging.getChannel('search'),
        DATE_FORMAT = 'MM/DD/YYYY';
    var BadgeView = Backbone.Marionette.ItemView.extend({
        tagName: 'span',
        template: badgeTemplate,
        modelEvents: {
            'change:count': 'render'
        }
    });
    var SearchingView = Backbone.Marionette.ItemView.extend({
        template: searchingTemplate,
        className: 'percent-height-100',
        ui: {
            cancelTextSearchButton: '.cancel-text-search-button'
        },
        events: {
            'keydown @ui.cancelTextSearchButton': 'handleEnterOrSpaceBar',
            'click @ui.cancelTextSearchButton': 'returnToPreviousWorkspace'
        },
        returnToPreviousWorkspace: function() {
            TEXT_SEARCH_CHANNEL.trigger('cancelCloseSearch');
        },
        handleEnterOrSpaceBar: function(event) {
            var keyCode;
            if (!_.isUndefined(event)) {
                if (event.which) {
                    keyCode = event.which;
                } else {
                    keyCode = event.keyCode;
                }
            }
            if (!_.isUndefined(keyCode) && (keyCode === 13 || keyCode === 32)) {
                var targetElement = this.$(event.currentTarget);
                targetElement.focus();
                targetElement.trigger('click');
            }
        },
    });
    var EmptyView = Backbone.Marionette.ItemView.extend({
        template: emptyViewTemplate,
        initialize: function(options) {
            this.model = new Backbone.Model({
                groupId: options.groupId
            });
        }
    });
    var SearchResultsSingleResultView = Backbone.Marionette.ItemView.extend({
        template: searchResultTemplate,
        serializeData: function() {
            var data = this.model.toJSON();
            var replaceHighlightTags = function(highlight, limit) {
                if (limit) {
                    // replace only the first 3 instances
                    var match = highlight.match(/^((?:[\s\S]*?<\/span>){1,3})/)[0] || '';
                    var replace = match.replace(/<span /g, '<mark ').replace(/<\/span>/g, '</mark>');
                    return highlight.replace(match, replace);
                }
                return highlight.replace(/<span /g, '<mark ').replace(/<\/span>/g, '</mark>');
            };
            if (data.summary) {
                data.summary = ADK.utils.stringUtils.toTitleCase(data.summary);
            }
            if (data.isDrillDownModel) {
                var highlightsObj = this.model.collection.highlights[data.uid];
                if (!_.isUndefined(highlightsObj.body)) {
                    var parsedHighlights = [];
                    _.each(highlightsObj.body, function(highlight) {
                        parsedHighlights.push(replaceHighlightTags(highlight));
                    });
                    data.highlights = '...' + parsedHighlights.join(' ...</br>...') + ' ...';
                } else {
                    data.highlights = '';
                }
            } else if (data.highlights) {
                data.highlights = replaceHighlightTags(data.highlights, data.domain === COMMUNITY_DOMAIN);
            }
            return data;
        },
        initialize: function(options) {
            if (options.doOwnDateFilter) {
                this.model.set('filterCacheCount', this.model.get('count'));
                this.listenTo(TEXT_SEARCH_CHANNEL, 'execute-filter', function(filterOptions) {
                    this.applyDateFilter(_.extend(filterOptions, {
                        allCase: !(filterOptions.toDate || filterOptions.fromDate)
                    }));
                });
            }
        },
        onRender: function() {
            if (this.options.doOwnDateFilter) {
                var sessionFilterOptions = ADK.SessionStorage.getAppletStorageModel('search', 'filterOptions');
                var filterOptions = _.extend({
                    allCase: !(_.get(sessionFilterOptions, 'fromDate') || _.get(sessionFilterOptions, 'toDate'))
                }, sessionFilterOptions);
                if (!_.isUndefined(filterOptions.toDate)) {
                    filterOptions.toDate = moment(filterOptions.toDate, DATE_FORMAT).endOf('day');
                }
                if (!_.isUndefined(filterOptions.fromDate)) {
                    filterOptions.fromDate = moment(filterOptions.fromDate, DATE_FORMAT).startOf('day');
                }
                this.applyDateFilter(filterOptions);
            }
        },
        applyDateFilter: function(filterOptions) {
            var dateString = this.model.get('datetime');
            var isInvalidDate = (dateString === null || dateString === '' || dateString === 'Unknown');
            if (isInvalidDate) {
                return true;
            }
            var date = moment(dateString, 'MM/DD/YYYY - HH:mm');
            var showView = isInvalidDate || (date >= filterOptions.fromDate && date <= filterOptions.toDate);
            if (showView || filterOptions.allCase === true) {
                return this.showView();
            }
            return this.hideView();

        },
        showView: function(hasDataToFetch, setCountFlag) {
            this.model.set('viewHidden', false);
            this.model.set('count', this.model.get('filterCacheCount'));
            this.$el.show();
        },
        hideView: function(hasDataToFetch, setCountFlag) {
            this.model.set('viewHidden', true);
            this.model.set('count', 0);
            this.$el.hide();
        },
        events: {
            'click .search-result-item': 'onSelectSearchResult',
            'keydown .search-result-item': function(event) {
                var keyCode;
                if (!_.isUndefined(event)) {
                    if (event.which) {
                        keyCode = event.which;
                    } else {
                        keyCode = event.keyCode;
                    }
                }
                if (!_.isUndefined(keyCode) && (keyCode === 13 || keyCode === 32)) {
                    this.onSelectSearchResult(event);
                }
            },
        },
        onSelectSearchResult: function(event) {
            event.preventDefault();
            var currentPatient = ADK.PatientRecordService.getCurrentPatient();
            TEXT_SEARCH_CHANNEL.trigger('resultClicked', {
                uid: this.model.get('uid'),
                patient: {
                    icn: currentPatient.attributes.icn,
                    pid: currentPatient.attributes.pid
                },
                model: this.model
            });
        }
    });
    var SearchResultsAccordionView = Backbone.Marionette.LayoutView.extend({
        template: searchResultGroupTemplate,
        regions: {
            'loadingRegion': '.loading-region',
            'badgeRegion': '.badge-region',
            'contentRegion': '.group-content'
        },
        modelEvents: {},
        initialize: function(options) {
            var data = this.model.toJSON();
            var groupIdPrefix = 'result-Group-';
            var groupTitlePrefix = 'result-Group-Title-';
            var cleanGroupName = this.model.get('kind').replace(/[^a-zA-Z0-9]/g, "-");
            if (!_.isUndefined(this.model.get('collection').hasDataToFetch)) {
                cleanGroupName = this.model.get('summary').replace(/[^a-zA-Z0-9]/g, "-");
                groupIdPrefix = 'result-Sub-Group-';
                groupTitlePrefix = 'result-Sub-Group-Title-';
            }
            this.model.set({
                viewHidden: false,
                titleElemId: _.camelCase(groupTitlePrefix + cleanGroupName),
                groupId: _.camelCase(groupIdPrefix + cleanGroupName)
            });
            var groupId = this.model.get('groupId');
            var count;
            this.childEvents[groupId + ':setCount'] = this.setCount;
            var isDateFilterable = true;
            var hasMixedChildViews = false;
            var subGroup = this.model.get('subGroup');
            var self = this;
            var iterateOverCollection = function(isSubGroup) {
                count = 0;
                self.model.get('collection').each(function(model) {
                    if ((isSubGroup && !_.isUndefined(model.get('singleResult')) && model.get('singleResult')) ||
                        (!isSubGroup && !_.isUndefined(model.get('subGroup')) && model.get('subGroup'))) {
                        hasMixedChildViews = true;
                    }
                    if (!_.isUndefined(model.get('count'))) {
                        {
                            count += model.get('count');
                        }
                    }

                });
            };
            if (_.isUndefined(subGroup) || subGroup === true) {
                this.childViewConstructor = SearchResultsAccordionView;
                if (!_.isUndefined(this.model.get('collection').hasDataToFetch)) {
                    this.childViewConstructor = SearchResultsSingleResultView;
                    count = this.model.get('count');
                } else {
                    isDateFilterable = false;
                    iterateOverCollection(true);
                }

            } else {
                this.childViewConstructor = SearchResultsSingleResultView;
                iterateOverCollection(false);
            }
            this.isSubGroup = this.model.get('collection').hasDataToFetch || false;
            this.model.set('count', count);
            this.SearchResultsGroupViewOptions = {
                isDateFilterable: isDateFilterable,
                hasMixedChildViews: hasMixedChildViews,
                model: this.model,
                groupId: groupId,
                childView: this.childViewConstructor,
                isSubGroup: this.isSubGroup
            };
            this.BadgeView = new BadgeView({
                model: this.model
            });
            if (!isDateFilterable || hasMixedChildViews) {
                this.listenTo(this.model.get('collection'), 'change:count change:setCount', function(model) {
                    this.setCount();
                });
            } else {
                this.listenTo(TEXT_SEARCH_CHANNEL, 'execute-filter', function(filterOptions) {
                    this.showView();
                    this.SearchResultsGroupView.applyDateFilter(_.extend(filterOptions, {
                        allCase: !(filterOptions.toDate || filterOptions.fromDate)
                    }));
                });
            }
            if (this.isSubGroup) {
                this.listenTo(this.model.get('collection'), 'document-data-fetch-complete', function(error, collection, response) {
                    this.removeRegion('loadingRegion');
                    this.setCount();
                    if (error) {
                        this.showChildView('contentRegion', ADK.Views.Error.create({
                            model: new Backbone.Model(response)
                        }));
                    }
                });
            }
        },
        childEvents: {},
        setCount: function() {
            var sessionFilterOptions = ADK.SessionStorage.getAppletStorageModel('search', 'filterOptions');
            var filterOptions = _.extend({
                allCase: !(_.get(sessionFilterOptions, 'fromDate') || _.get(sessionFilterOptions, 'toDate'))
            }, sessionFilterOptions);
            var hasDataToFetch = this.model.get('collection').hasDataToFetch;
            var newCount = 0;
            if (hasDataToFetch) {
                if (filterOptions.allCase) {
                    newCount = this.model.get('count');
                }
            } else {
                _.each(this.SearchResultsGroupView.children._views, function(view) {
                    if (!_.isUndefined(view.model.get('count'))) {
                        var viewHidden = view.model.get('viewHidden') || false;
                        if (!viewHidden) {
                            newCount += view.model.get('count');
                        }
                    }
                });
                this.model.set('count', newCount);
            }
            if (!this.isSubGroup) {
                TEXT_SEARCH_CHANNEL.trigger('updateGroupResultCount', this.model.get('groupId'), newCount);
            }
            if (newCount > 0) {
                this.showView(hasDataToFetch, !filterOptions.allCase);
            } else {
                this.hideView(hasDataToFetch, !filterOptions.allCase);
            }
        },
        showView: function(hasDataToFetch, setCountFlag) {
            this.model.set('viewHidden', false);
            this.$el.find('[groupid="' + this.model.get('groupId') + '"]').show();
            if (hasDataToFetch) {
                this.model.set('setCount', setCountFlag);
            }
        },
        hideView: function(hasDataToFetch, setCountFlag) {
            this.model.set('viewHidden', true);
            this.$el.find('[groupid="' + this.model.get('groupId') + '"]').hide();
            if (hasDataToFetch) {
                this.model.set('setCount', setCountFlag);
            }
        },
        onRender: function() {
            if (this.model.get('collection').hasDataToFetch) {
                this.showChildView('loadingRegion', ADK.Views.Loading.create());
            }
            this.SearchResultsGroupView = new SearchResultsGroupView(this.SearchResultsGroupViewOptions);
            this.showChildView('badgeRegion', this.BadgeView);
            this.showChildView('contentRegion', this.SearchResultsGroupView);
        },
        events: {
            'show.bs.collapse .collapse': 'onExpandGroup',
            'hide.bs.collapse .collapse': 'onCollapseGroup'
        },
        accordionExpandCollapse: function(caret1, caret2, accordionState, event) {
            var groupIcon = this.$el.find(event.target).closest('.search-group').find('button.btn-accordion:first');
            groupIcon.children('.fa').removeClass(caret1).addClass(caret2);
            var accordionHeading = groupIcon.find('.text-uppercase').text().trim();
            groupIcon.attr('title', 'Press enter to ' + accordionState + accordionHeading + ' accordion');
            groupIcon.blur().focus();
        },
        onCollapseGroup: function(event) {
            this.accordionExpandCollapse('fa-chevron-down', 'fa-chevron-right', 'expand ', event);
        },
        onExpandGroup: function(event) {
            if (this.model.get('collection').hasDataToFetch) {
                this.model.get('collection').fetchCollection({
                    drilldown_type: this.model.get('subGroupType'),
                    group_value: this.model.get('docSearchText'),
                    searchTerm: ADK.SessionStorage.getAppletStorageModel('search', 'searchText').searchTerm.toString().toLowerCase()
                });
            }
            this.accordionExpandCollapse('fa-chevron-right', 'fa-chevron-down', 'collapse ', event);
        }
    });
    var SearchResultsGroupView = Backbone.Marionette.CollectionView.extend({
        emptyView: EmptyView,
        setFilter: function(filterOptions) {
            this.filter = null;
            if (!_.isUndefined(filterOptions.allCase) && !filterOptions.allCase) {
                this.filter = function(model, index, collection) {
                    var dateString = model.datetime || model.get('datetime');
                    var isInvalidDate = (dateString === null || dateString === '' || dateString === 'Unknown');
                    if (isInvalidDate) {
                        return true;
                    }
                    var date = moment(dateString, 'MM/DD/YYYY - HH:mm');
                    return date >= filterOptions.fromDate && date <= filterOptions.toDate;
                };
            }
        },
        applyDateFilter: function(filterOptions) {
            if (!this.hasMixedChildViews) {
                this.setFilter(filterOptions);
                return this.render();
            }

        },
        triggerViewEvent: function(eventName, param) {
            this.triggerMethod(this.groupId + ':' + eventName, param);
        },
        onShow: function() {
            this.triggerViewEvent('setCount');
        },
        onRender: function() {
            this.triggerViewEvent('setCount');
        },
        getChildView: function(model) {
            var collection = model.get('collection');
            var hasDataToFetch = false;
            if (!_.isUndefined(collection)) {
                hasDataToFetch = collection.hasDataToFetch;
            }
            if (hasDataToFetch) {
                return SearchResultsAccordionView;
            }
            return SearchResultsSingleResultView;
        },
        initialize: function(options) {
            this.collection = this.model.get('collection');
            this.groupId = options.groupId;
            this.isSubGroup = options.isSubGroup;
            this.isDateFilterable = options.isDateFilterable;
            this.hasMixedChildViews = options.hasMixedChildViews;
            this.childViewOptions = {
                doOwnDateFilter: this.hasMixedChildViews
            };
            this.emptyViewOptions = {
                groupId: this.groupId
            };
            if (this.isDateFilterable && !this.hasMixedChildViews) {
                var sessionFilterOptions = ADK.SessionStorage.getAppletStorageModel('search', 'filterOptions');
                var filterOptions = _.extend({
                    allCase: !(_.get(sessionFilterOptions, 'fromDate') || _.get(sessionFilterOptions, 'toDate'))
                }, sessionFilterOptions);
                if (!_.isUndefined(filterOptions.toDate)) {
                    filterOptions.toDate = moment(filterOptions.toDate, DATE_FORMAT).endOf('day');
                }
                if (!_.isUndefined(filterOptions.fromDate)) {
                    filterOptions.fromDate = moment(filterOptions.fromDate, DATE_FORMAT).startOf('day');
                }
                this.setFilter(filterOptions);
            }
        }
    });

    var SearchResultsContentView = Backbone.Marionette.LayoutView.extend({
        template: searchResultContentTemplate,
        regions: {
            searchResultsRegion: '#searchResultsRegion',
            loadingRegion: '#loadingRegion'
        },
        isSearching: false,
        groupResultCounts: {},
        initialize: function(options) {
            var self = this;
            var ehmpConfig = ADK.Messaging.request('ehmpConfig');
            var featureFlags = ehmpConfig.get('featureFlags');
            var trackSolrStorageBoolean = _.get(featureFlags, 'trackSolrStorage');
            this.collection = new ADK.UIResources.Fetch.TextSearch.AggregateCollection();
            this.model.set('showWarningMessage', !trackSolrStorageBoolean);
            this.listenTo(TEXT_SEARCH_CHANNEL, 'updateGroupResultCount', function(groupName, count) {
                self.groupResultCounts[groupName] = count;
                var showingResultsCount = 0;
                _.each(self.groupResultCounts, function(count) {
                    showingResultsCount += count;
                });
                self.model.set('numberOfResults', showingResultsCount);
            });
            this.listenTo(TEXT_SEARCH_CHANNEL, 'newSearch', function() {
                var storageText = ADK.SessionStorage.getAppletStorageModel('search', 'searchText');
                if (storageText) {
                    this.model.set('searchTerm', storageText.searchTerm);
                    this.showChildView('searchResultsRegion', new EmptyView());
                    self.fetchNewSearchResults();
                }
            });
            this.listenTo(TEXT_SEARCH_CHANNEL, 'cancelCloseSearch', function() {
                this.abortCollectionFetch();
                ADK.Navigation.back();
            });
        },
        onRender: function() {
            this.showChildView('loadingRegion', ADK.Views.Loading.create());
        },
        abortCollectionFetch: function() {
            var xhrAbort = _.get(this.collection, 'collection.xhr.abort');
            if (_.isFunction(xhrAbort)) {
                xhrAbort();
            }
        },
        collectionEvents: {
            'fetch:success': function(collection, response) {
                this.isSearching = false;
                this.$el.removeClass('percent-height-100');
                this.showChildView('loadingRegion', new EmptyView());
                this.showChildView('searchResultsRegion', new Backbone.Marionette.CollectionView({
                    emptyView: EmptyView,
                    collection: this.collection,
                    childView: SearchResultsAccordionView,
                    childViewOptions: {
                        collection: this.collection
                    }
                }));
                TEXT_SEARCH_CHANNEL.trigger('newSearchComplete');
            },
            'fetch:error': function(error, response) {
                this.isSearching = false;
                this.$el.removeClass('percent-height-100');
                this.removeRegion('loadingRegion');
                this.showChildView('searchResultsRegion', ADK.Views.Error.create({
                    model: new Backbone.Model(response)
                }));
                TEXT_SEARCH_CHANNEL.trigger('newSearchError');
            }
        },
        fetchNewSearchResults: function() {
            this.$el.addClass('percent-height-100');
            this.showChildView('loadingRegion', new SearchingView());
            if (this.isSearching) {
                this.abortCollectionFetch();
            }
            this.isSearching = true;
            this.groupResultCounts = {};
            this.collection.fetchCollection({
                searchTerm: this.model.get('searchTerm'),
                getSynonyms: false
            });
        }
    });

    return SearchResultsContentView;
});