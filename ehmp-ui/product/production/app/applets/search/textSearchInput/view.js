define([
    "backbone",
    "marionette",
    "moment",
    "hbs!app/applets/search/textSearchInput/template",
    "hbs!app/applets/search/textSearchInput/searchSuggestTemplate"
], function(Backbone, Marionette, moment, InputTemplate, SearchSuggestTemplate) {
    "use strict";

    var PLACEHOLDER_INDEXING = 'Building Search Data';
    var PLACEHOLDER_SEARCH_RECORD = 'Search Record';

    var Form = Backbone.Marionette.ItemView.extend({
        'template': Handlebars.compile('<label for="searchText" class="sr-only">Search Record</label>' +
            '<input type="text" id="searchText" class="form-control" placeholder="{{placeholder}}"  ' +
            'autocomplete="off" focus="true" title="Enter text to search for records" {{#if disabled}}disabled="true"{{/if}} />' +
            '<i class="fa fa-search form-control-feedback"></i>'),
        modelEvents: {
            'change:disabled': 'render'
        },
    });

    var SuggestList = Backbone.Marionette.CollectionView.extend({
        tagName: 'ul',
        attributes: {
            id: 'suggestList'
        },
        className: 'list-group',
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
            if (this.isAttrDuplicate(model, ['query', 'category'])) return false;
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
        className: 'btn-group text-search-input-container',
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
                this.$('#suggestListDiv').append('<div id="noResults" class="left-padding-sm">No results</div>').show();
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
                this.searchTerm = storageText;
            }

            var ehmpConfig = ADK.Messaging.request('ehmpConfig');
            var featureFlags = ehmpConfig.get('featureFlags');
            this.trackSolrStorage = _.get(featureFlags, 'trackSolrStorage');

            var settings = ehmpConfig.get('settings');
            this.delayConfig = parseInt(_.get(settings, 'solrIndexingDelay')) || 3000;

            if (this.trackSolrStorage) {
                this.enableDisablePatientSearch(ADK.PatientRecordService.getCurrentPatient().get('solrSyncCompleted'), 0);

                this.listenTo(ADK.PatientRecordService.getCurrentPatient(), 'change:solrSyncCompleted', function(model) {
                    this.enableDisablePatientSearch(model.get('solrSyncCompleted'), this.delayConfig);
                });
            } else {
                this.model = new Backbone.Model({
                    'disabled': false,
                    'placeholder': PLACEHOLDER_SEARCH_RECORD
                });
            }
        },
        events: {
            'keydown #searchText': 'onSearchTextKey',
            'keydown #suggestList a': 'onSuggestionKey',
            'click #submit': 'doSubmitSearch',
            'blur #searchText': 'leaveSearchBox',
            'blur #suggestList a': 'leaveSearchBox',
        },
        onBeforeShow: function() {
            this.getRegion('form').show(new Form({
                model: this.model
            }));
        },
        enableDisablePatientSearch: function(isSolrSyncCompleted, delay) {
            var formConfig;
            var self = this;

            if (isSolrSyncCompleted) {
                formConfig = {
                    'disabled': false,
                    'placeholder': PLACEHOLDER_SEARCH_RECORD
                };

                if (delay === 0) {
                    this.model.set(formConfig);
                } else {
                    setTimeout(function() {
                        self.model.set(formConfig);
                    }, delay);
                }
            } else {
                formConfig = {
                    'disabled': true,
                    'placeholder': PLACEHOLDER_INDEXING
                };

                this.model.set(formConfig);
            }
        },
        leaveSearchBox: function(event) {
            if (this.$(event.relatedTarget).length === 0) {
                this.hideSuggest();
            }
        },
        hideSuggest: function(event) {
            this.clearSuggestList();
            this.$('#suggestListDiv').hide();
            this.$('#suggestPanel').removeClass('open');
            this.removeSuggestList();
        },
        doAutocomplete: function(keyEvent) {
            this.cancelSuggest(); //cancel timeout previous suggestion

            this.isSearching = setTimeout(_.bind(function() {
                var $searchText = this.$('#searchText');
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
                $list = this.$('#suggestList');
            }
            $list.find('.list-group-item').off('click');
            $list.empty();
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
            var $suggestList = this.ui.suggestListDiv.append('<ul id="suggestList" class="list-group"></ul>');
            this.addRegion('suggestList', Backbone.Marionette.Region.extend({
                'el': $suggestList
            }));
            this.clearSuggestList($suggestList);
            $suggestList.show();
            this.$('#suggestSpinner').remove();

            var modelsLength = this.suggestResults.models.length;
            if (modelsLength === 1) {
                this.removeSuggestList();
                this.$('#suggestListDiv').append('<div id="noResults" class="left-padding-sm">No results</div>').show();
            } else {
                this.$('#suggestPanel').addClass('open');
                var View = SuggestList.extend({
                    collection: this.suggestResults,
                    searchText: this.$('#searchText').val().toString()
                });
                this.getRegion('suggestList').show(new View());
            }
        },
        cancelSuggest: function() {
            if (this.isSearching) {
                var xhrAbort = _.get(this, 'suggestResults.xhr.abort');
                if (_.isFunction(xhrAbort)) xhrAbort();
                clearTimeout(this.isSearching);
            }
        },
        onDestroy: function() {
            this.unbindEntityEvents(this.suggestResults, this.suggestResultsEvents);
        },
        searchFromSuggest: function(suggestion) {
            this.$('#searchText').val(suggestion);
            this.doSubmitSearch();
        },
        doSubmitSearch: function() {
            this.cancelSuggest(); //cancel any pending suggestion call

            var trimmedSearchText = this.$('#searchText').val().trim();
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
            ADK.Navigation.navigate('record-search');
            this.$('#searchText').val(this.searchTerm);
            ADK.SessionStorage.setAppletStorageModel('search', 'searchText', completedSearchData);

            if (ADK.SessionStorage.getAppletStorageModel('search', 'searchText').searchTerm === completedSearchData.searchTerm) {
                ADK.Messaging.getChannel('search').trigger('newSearch');
            }
        },
        onAccessibilityKeydown: function(keyEvent) {
            if (keyEvent.keyCode === 32 || keyEvent.keyCode === 13) { // trigger click on space/enter key for accessibility
                $(keyEvent.target).trigger('click');
            }
        },
        getFirstSearchSuggestion: function() {
            return this.$('#suggestList > :first-child a');
        },
        getLastSearchSuggestion: function() {
            return this.$('#suggestList > :last-child a');
        },
        onSearchTextKey: function(keyEvent) {
            var $suggestList = this.$('#suggestList');
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
                    var currentQuery = this.$('#searchText').val();
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
                        this.$('#searchText').focus();
                    }
                    break;
                case 8: // backspace
                    keyEvent.preventDefault();
                    break;
                case 9: //tab
                    if (!keyEvent.shiftKey && $target.is(this.getLastSearchSuggestion())) {
                        this.hideSuggest();
                        this.$('#searchText').focus();
                    }
                    break;
                case 40: // down arrow
                    if ($target.is(this.getLastSearchSuggestion())) {
                        // move focus to search box
                        this.$('#searchText').focus();
                    }
                    break;
            }
        },
        removeSuggestList: function() {
            if (this.getRegion('suggestList'))
                this.removeRegion('suggestList');
            this.ui.suggestListDiv.empty();
        }
    });

    ADK.Messaging.trigger('register:component', {
        type: 'contextNavigationItem',
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