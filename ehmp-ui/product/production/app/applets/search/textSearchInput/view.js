define([
    'backbone',
    'marionette',
    'moment',
    'underscore',
    'handlebars',
    'hbs!app/applets/search/textSearchInput/template',
    'hbs!app/applets/search/textSearchInput/searchSuggestTemplate',
    'hbs!app/applets/search/textSearchInput/formInputTemplate'
], function(Backbone, Marionette, moment, _, Handlebars, InputTemplate, SearchSuggestTemplate, FormInputTemplate) {
    'use strict';

    var PLACEHOLDER_INDEXING = 'Building Search Data';
    var PLACEHOLDER_SEARCH_RECORD = 'Search Record';
    var PLACEHOLDER_ERROR = 'Search is Unavailable';
    var FORM_CONFIG_DEFAULTS = {
        'disabled': true,
        'placeholder': PLACEHOLDER_INDEXING,
        'errorIcon': false,
        'title': 'Enter text to search for records'
    };
    var TEXT_SEARCH_CHANNEL = ADK.Messaging.getChannel('search');

    var Form = Backbone.Marionette.ItemView.extend({
        className: 'percent-height-100 flex-display flex-align-center left-margin-lg',
        template: FormInputTemplate,
        modelEvents: {
            'change:disabled': 'render',
            'change:placeholder': 'render'
        },
        serializeModel: function() {
            var modelJSON = this.model.toJSON();
            modelJSON.cid = this.cid;
            return modelJSON;
        },
        behaviors: {
            Tooltip: {
                placement: 'bottom',
                trigger: 'hover'
            }
        }
    });

    var SuggestList = Backbone.Marionette.CollectionView.extend({
        tagName: 'ul',
        className: 'list-group suggest-list',
        onBeforeRender: function() {
            this.renderedModels = [];
        },
        isAttrDuplicate: function(model, attributes) {
            return !!_.find(this.renderedModels, function(m) {
                var isDuplicate = true;
                _.each(attributes, function(attribute) {
                    isDuplicate = m.get(attribute) === model.get(attribute);

                    if (!isDuplicate) {
                        return false;
                    }
                });

                return isDuplicate;
            });
        },
        filter: function(model, index, collection) {
            if (this.isAttrDuplicate(model, ['query', 'category'])) {
                return false;
            }
            this.renderedModels.push(model);
            return true;
        },
        childViewOptions: function() {
            return {
                searchText: this.searchText
            };
        },
        childView: Backbone.Marionette.ItemView.extend({
            tagName: 'li',
            className: 'list-group-item',
            attributes: function() {
                return {
                    'id': this._index
                };
            },
            triggers: {
                'click': 'select:result'
            },
            template: SearchSuggestTemplate,
            searchText: '',
            regExpEscape: function(s) {
                return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
            },
            serializeModel: function(model) {
                var suggestedObject = Backbone.Marionette.View.prototype.serializeModel.apply(this, arguments);

                var display = (suggestedObject.display || '');
                var searchText = this.getOption('searchText');

                var category = suggestedObject.category;

                var displaySplit = display.split(new RegExp(this.regExpEscape(searchText), 'i'));

                if (category === 'Spelling Suggestion') {
                    searchText = '';
                }

                var boldDisplay = '';
                if (searchText !== '') {
                    var boldStringMatch = new RegExp(this.regExpEscape(searchText), 'ig');
                    boldDisplay = display.match(boldStringMatch);
                }

                return {
                    category: category,
                    firstString: displaySplit[0],
                    boldString: boldDisplay,
                    lastString: displaySplit[1],
                    cleansedSearchResult: display.replace(/<[^>]*>/g, '')
                };
            }
        }),
    });

    var SuggestView = Backbone.Marionette.LayoutView.extend({
        template: InputTemplate,
        className: 'btn-group text-search-input-container text-search-input-container--full-width percent-height-100',
        attributes: {
            'id': 'text-search-input'
        },
        ui: {
            'suggestListDiv': '#suggestListDiv',
            'form': 'form'
        },
        regions: {
            'form': '@ui.form'
        },
        searchSuggestTemplate: SearchSuggestTemplate,
        isSearching: null, // wait (500ms) for user to stop typing before search
        searchTerm: null,
        suggestionsLocked: false, // never display the suggestion list while this is true (should be true while there is an outstanding search until the search text changes)
        lastQuery: '',
        childEvents: {
            'select:result': 'destroyDropdownList'
        },
        suggestResultsEvents: {
            'error fetch:error': function() {
                this.removeSuggestList();
                this.$('#suggestListDiv').append('<div id="noResults" class="left-padding-sm">No Suggestions</div>').show();
                this.$('#suggestSpinner').remove();
            },
            'sync': 'fillSuggestList',
            'request': function() {
                this.removeSuggestList();
                this.$('#noResults').remove();
                this.$('#suggestSpinner').remove();
                this.$('#suggestListDiv').append('<div id="suggestSpinner" class="left-padding-sm"><i class="fa fa-spinner fa-spin right-margin-xs"></i>Loading...</div>').show();
            }
        },
        initialize: function() {
            this.suggestResults = new Backbone.Collection();
            this.bindEntityEvents(this.suggestResults, this.suggestResultsEvents);

            var storageText = ADK.SessionStorage.getAppletStorageModel('search', 'searchText');
            if (storageText) {
                this.searchTerm = _.get(storageText, 'searchTerm');
            }

            var ehmpConfig = ADK.Messaging.request('ehmpConfig');
            var featureFlags = ehmpConfig.get('featureFlags');
            this.trackSolrStorage = _.get(featureFlags, 'trackSolrStorage');

            var settings = ehmpConfig.get('settings');
            this.delayConfig = parseInt(_.get(settings, 'solrIndexingDelay')) || 3000;

            if (this.trackSolrStorage) {
                var currentPatient = ADK.PatientRecordService.getCurrentPatient();
                if (currentPatient.get('solrSyncError') || currentPatient.get('syncError')) {
                    this.triggerMethod('solr:error');
                } else {
                    this.enableDisablePatientSearch(this.getMinumumRequiredStatus(currentPatient), 0);
                }
                this.listenTo(currentPatient, 'change:solrSyncCompleted change:mySiteSolrSyncCompleted change:solrSyncError change:syncError', function(model) {
                    if (model.get('solrSyncError') || model.get('syncError')) {
                        return this.triggerMethod('solr:error');
                    }
                    return this.enableDisablePatientSearch(this.getMinumumRequiredStatus(model), this.delayConfig);
                });
            } else {
                this.model = new Backbone.Model(_.defaults({
                    'disabled': false,
                    'placeholder': PLACEHOLDER_SEARCH_RECORD
                }, FORM_CONFIG_DEFAULTS));

            }
            this.currentWorkspaceModel = ADK.WorkspaceContextRepository.currentWorkspaceAndContext;
            this.listenTo(this.currentWorkspaceModel, 'change:workspace', this.onChangeWorkspace);
            TEXT_SEARCH_CHANNEL.reply('get:storage:text', function() {
                var searchTerm = this.$('[id^=searchText]').val().trim();
                if (_.isString(searchTerm) && searchTerm !== '') {
                    return {
                        searchTerm: searchTerm
                    };
                }
                return null;
            }.bind(this));
        },
        onShow: function() {
            if (_.isString(this.searchTerm) && this.searchTerm.trim() !== '') {
                this.$('[id^=searchText]').val(this.searchTerm.trim());
            }
        },
        getMinumumRequiredStatus: function(model) {
            var minumumRequiredStatus = model.get('mySiteSolrSyncCompleted');
            /*if selected patient is external*/
            if (_.isUndefined(minumumRequiredStatus)) {
                minumumRequiredStatus = model.get('solrSyncCompleted');
            }
            return minumumRequiredStatus;
        },
        onChangeWorkspace: function(model) {
            if (model.get('workspace') === 'record-search') {
                this.$el.removeClass('left-padding-xs');
            } else {
                this.$el.addClass('left-padding-xs');
                if (this.searchTerm !== '') {
                    this.searchTerm = '';
                    this.$('[id^=searchText]').val(this.searchTerm);
                }
            }
        },
        events: {
            'keydown input': 'onSearchTextKey',
            'keydown .suggest-list a': 'onSuggestionKey',
            'click #submit': 'doSubmitSearch',
            'blur input': 'leaveSearchBox',
            'blur .suggest-list a': 'leaveSearchBox',
        },
        onBeforeShow: function() {
            this.onChangeWorkspace(ADK.WorkspaceContextRepository.currentWorkspaceAndContext);
            this.getRegion('form').show(new Form({
                model: this.model
            }));
        },
        onSolrError: function() {
            var formConfig = _.defaults({
                'disabled': true,
                'placeholder': PLACEHOLDER_ERROR,
                'errorIcon': true,
                'title': 'There was a problem reaching all data sources. Try again later.'
            }, FORM_CONFIG_DEFAULTS);
            this.model.set(formConfig);
        },
        enableDisablePatientSearch: function(isSolrSyncCompleted, delay) {
            var formConfig;
            var self = this;

            if (isSolrSyncCompleted) {
                formConfig = _.defaults({
                    'disabled': false,
                    'placeholder': PLACEHOLDER_SEARCH_RECORD
                }, FORM_CONFIG_DEFAULTS);

                if (delay === 0) {
                    this.model.set(formConfig);
                } else {
                    setTimeout(function() {
                        self.model.set(formConfig);
                    }, delay);
                }
            } else {
                formConfig = _.defaults({
                    'disabled': true,
                    'placeholder': PLACEHOLDER_INDEXING
                }, FORM_CONFIG_DEFAULTS);

                this.model.set(formConfig);
            }
        },
        leaveSearchBox: function(event) {
            if (this.$(event.relatedTarget).length === 0) {
                this.hideSuggest();
            }
        },
        hideSuggest: function(event) {
            this.$('#suggestListDiv').hide();
            this.$('#suggestPanel').removeClass('open');
            this.removeSuggestList();
        },
        doAutocomplete: function(keyEvent) {
            this.cancelSuggest(); //cancel timeout previous suggestion

            this.isSearching = setTimeout(_.bind(function() {
                var $searchText = this.$('input');
                var trimmedSearchText = $searchText.val().trim();
                if (trimmedSearchText && trimmedSearchText.length > 2) {
                    var fetchOptions = {
                        criteria: {
                            'query': trimmedSearchText
                        }
                    };
                    fetchOptions.patient = ADK.PatientRecordService.getCurrentPatient();

                    fetchOptions.resourceTitle = 'patient-record-search-suggest';
                    ADK.PatientRecordService.fetchCollection(fetchOptions, this.suggestResults);
                }
            }, this), 500);
        },
        clearSuggestList: function($list) {
            if (!$list) {
                $list = this.$('.suggest-list');
            }
            if ($list.length) $list.empty();
        },
        destroyDropdownList: function(childView) {
            var query = childView.model.get('query');
            this.searchFromSuggest(query);
            this.hideSuggest();
        },
        fillSuggestList: function() {
            // don't display this if suggestions are locked
            if (this.suggestionsLocked) {
                return;
            }
            var $suggestList = this.ui.suggestListDiv.append('<ul class="suggest-list list-group"></ul>');
            this.addRegion('suggestList', Backbone.Marionette.Region.extend({
                'el': $suggestList
            }));
            this.clearSuggestList($suggestList);
            $suggestList.show();
            this.$('#suggestSpinner').remove();

            var modelsLength = this.suggestResults.models.length;
            if (modelsLength === 1) {
                this.removeSuggestList();
                this.$('#suggestListDiv').append('<div id="noResults" class="left-padding-sm">No Suggestions</div>').show();
            } else {
                this.$('#suggestPanel').addClass('open');
                var View = SuggestList.extend({
                    collection: this.suggestResults,
                    searchText: this.$('input').val().toString()
                });
                this.getRegion('suggestList').show(new View());
            }
        },
        cancelSuggest: function() {
            if (this.isSearching) {
                var xhrAbort = _.get(this, 'suggestResults.xhr.abort');
                if (_.isFunction(xhrAbort)) {
                    xhrAbort();
                }
                clearTimeout(this.isSearching);
            }
        },
        onDestroy: function() {
            TEXT_SEARCH_CHANNEL.stopReplying('get:storage:text');
            this.unbindEntityEvents(this.suggestResults, this.suggestResultsEvents);
        },
        searchFromSuggest: function(suggestion) {
            this.$('input').val(suggestion);
            this.doSubmitSearch();
        },
        doSubmitSearch: function() {
            this.cancelSuggest(); //cancel any pending suggestion call

            var trimmedSearchText = this.$('input').val().trim();
            this.searchTerm = trimmedSearchText;
            if (trimmedSearchText) {
                this.doReturnResults();
            }
        },
        doReturnResults: function() {
            this.$('#suggestSpinner').remove();
            //use this function to implement sending the data to the text-Search applet
            var completedSearchData = {
                searchTerm: this.searchTerm
            };
            this.$('input').val(this.searchTerm);

            var currentScreen = ADK.Messaging.request('get:current:screen');
            if (currentScreen.id !== 'record-search') {
                return ADK.Navigation.navigate('record-search');
            }
            return TEXT_SEARCH_CHANNEL.trigger('newSearch', completedSearchData);
        },
        onAccessibilityKeydown: function(keyEvent) {
            if (keyEvent.keyCode === 32 || keyEvent.keyCode === 13) { // trigger click on space/enter key for accessibility
                $(keyEvent.target).trigger('click');
            }
        },
        getFirstSearchSuggestion: function() {
            return this.$('.suggest-list > :first-child a');
        },
        getLastSearchSuggestion: function() {
            return this.$('.suggest-list > :last-child a');
        },
        onSearchTextKey: function(keyEvent) {
            var $suggestList = this.$('.suggest-list');
            switch (keyEvent.keyCode) {
                case 9: //tab
                    if (keyEvent.shiftKey) {
                        this.$('#suggestListDiv').hide();
                    }
                    break;
                case 13: // enter key
                    // submit real search
                    keyEvent.preventDefault();
                    this.doSubmitSearch();
                    this.$('#suggestListDiv').hide();
                    break;
                case 27: // escape key
                    // hide suggestion list
                    this.clearSuggestList($suggestList);
                    this.removeSuggestList();
                    this.$('#suggestListDiv').hide();
                    break;
                case 38: // up arrow
                    // move focus to last search suggestion (if suggestion list is visible)
                    if ($suggestList.css('display') && $suggestList.css('display') !== 'none') {
                        this.getLastSearchSuggestion().focus();
                    }
                    break;
                case 40: // down arrow
                    // move focus to first search suggestion (if suggestion list is visible)
                    if ($suggestList.css('display') && $suggestList.css('display') !== 'none') {
                        this.getFirstSearchSuggestion().focus();
                    }
                    break;
                default: // any other key
                    // submit suggestion search (but only if the search text changed)
                    var currentQuery = this.$('input').val();
                    if (currentQuery !== this.lastQuery) {
                        this.lastQuery = currentQuery;
                        this.suggestionsLocked = false;
                        this.doAutocomplete(keyEvent);
                    }
                    break;
            }
        },
        onSuggestionKey: function(keyEvent) {
            var $target = $(keyEvent.target);
            switch (keyEvent.keyCode) {
                case 38: // up arrow
                    if ($target.is(this.getFirstSearchSuggestion())) {
                        // move focus to search box
                        this.$('input').focus();
                    }
                    break;
                case 8: // backspace
                    keyEvent.preventDefault();
                    break;
                case 9: //tab
                    if (!keyEvent.shiftKey && $target.is(this.getLastSearchSuggestion())) {
                        this.hideSuggest();
                        this.$('input').focus();
                    }
                    break;
                case 40: // down arrow
                    if ($target.is(this.getLastSearchSuggestion())) {
                        // move focus to search box
                        this.$('input').focus();
                    }
                    break;
            }
        },
        removeSuggestList: function() {
            if (this.getRegion('suggestList')) {
                this.removeRegion('suggestList');
            }
            this.ui.suggestListDiv.empty();
        }
    });

    ADK.Messaging.trigger('register:component', {
        type: 'contextHeaderItem',
        group: ['patient', 'patient-right'],
        key: 'textSearchInput',
        view: SuggestView,
        orderIndex: 2,
        shouldShow: function() {
            return (ADK.UserService.hasPermissions('read-patient-record'));
        }
    });

    return SuggestView;
});