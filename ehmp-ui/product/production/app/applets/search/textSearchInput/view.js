define([
    "backbone",
    "marionette",
    "hbs!app/applets/search/textSearchInput/template",
    "hbs!app/applets/search/textSearchInput/searchSuggestTemplate"
], function(Backbone, Marionette, InputTemplate, SearchSuggestTemplate) {
    "use strict";

    var SuggestView = Backbone.Marionette.ItemView.extend({
        template: InputTemplate,
        className: 'btn-group text-search-input-container',
        attributes: {
            'id': 'text-search-input'
        },
        searchSuggestTemplate: SearchSuggestTemplate,
        isSearching: null, // wait (500ms) for user to stop typing before search
        suggestResults: {},
        searchResults: {},
        searchTerm: null,
        suggestionsLocked: false, // never display the suggestion list while this is true (should be true while there is an outstanding search until the search text changes)
        lastQuery: '',
        initialize: function() {
            var storageText = ADK.SessionStorage.getAppletStorageModel('search', 'searchText');
            if (storageText) {
                this.searchTerm = storageText;
            }
        },
        events: {
            'keydown #searchText': 'onSearchTextKey',
            'keydown #suggestList a': 'onSuggestionKey',
            'click #submit': 'doSubmitSearch',
            'blur #searchText': 'leaveSearchBox',
            'blur #suggestList a': 'leaveSearchBox',
        },
        leaveSearchBox: function(event) {
            if (this.$(event.relatedTarget).length === 0) {
                this.hideSuggest();
            }
        },
        hideSuggest: function(event) {
            this.clearSuggestList();
            this.$('#suggestListDiv').hide();
            this.$('#suggestList').remove();
        },
        doAutocomplete: function(keyEvent) {
            var self = this;


            this.cancelSuggest(); //cancel timeout previous suggestion

            this.isSearching = setTimeout(function() {
                var $searchText = $('#searchText');
                var trimmedSearchText = $searchText.val().trim();
                if (trimmedSearchText && trimmedSearchText.length > 2) {
                    self.$('#suggestList').remove();
                    self.$('#noResults').remove();
                    self.$('#suggestSpinner').remove();
                    self.$('#suggestListDiv').append('<div id="suggestSpinner" class="left-padding-sm"><i class="fa fa-spinner fa-spin right-margin-xs"></i>Loading...</div>').show();

                    var fetchOptions = {
                        criteria: {
                            "query": trimmedSearchText
                        }
                    };
                    fetchOptions.patient = ADK.PatientRecordService.getCurrentPatient();

                    fetchOptions.resourceTitle = 'patient-record-search-suggest';

                    self.suggestResults = ADK.PatientRecordService.fetchCollection(fetchOptions);
                    self.suggestResults.on("sync", self.fillSuggestList, self);
                }
            }, 500);
        },
        clearSuggestList: function($list) {
            if (!$list) {
                $list = $('#suggestList');
            }
            $list.empty();
        },
        destroyDropdownList: function(event, query) {
            event.preventDefault();
            this.searchFromSuggest(query);
            this.hideSuggest();
        },
        regExpEscape: function(s) {
            return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        },
        fillSuggestList: function() {
            // don't display this if suggestions are locked
            if (this.suggestionsLocked) {
                return;
            }
            this.$('#suggestListDiv').append('<ul id="suggestList" class="list-group"></ul>');
            var $suggestList = this.$('#suggestList');
            this.clearSuggestList($suggestList);
            $suggestList.show();
            $("#suggestSpinner").remove();

            var me = this,
                IDNumCount = 0;
            var duplicates = [];
            var modelsLength = this.suggestResults.models.length;
            if (modelsLength === 1) {
                this.$('#suggestListDiv').append('<div id="noResults" class="left-padding-sm">No results</div>').show();
                this.$('#suggestList').remove();
            } else {
                this.suggestResults.models.forEach(function(item) {
                    var query = item.get('query');
                    for (var i = 0; i < duplicates.length; i++) {
                        if (query == duplicates[i]) {
                            return;
                        }
                    }
                    if (IDNumCount !== 0) {
                        duplicates.push(query);
                    }
                    document.getElementById('suggestPanel').className = 'dropdown open';
                    var suggestID = 'SuggestItem' + IDNumCount.toString();
                    var display = (item.get('display') || '');
                    var searchText = $('#searchText').val().toString();

                    var category = item.attributes.category;

                    var displaySplit = display.split(new RegExp(me.regExpEscape(searchText), 'i'));

                    if (category === 'Spelling Suggestion') {
                        searchText = '';
                    }
                    var boldDisplay = '';
                    if (searchText !== '') {
                        var boldStringMatch = new RegExp(me.regExpEscape(searchText), 'ig');
                        boldDisplay = display.match(boldStringMatch);
                    }
                    var $suggestItem = $(me.searchSuggestTemplate({
                        itemId: suggestID,
                        category: category,
                        firstString: displaySplit[0],
                        boldString: boldDisplay,
                        lastString: displaySplit[1],
                        cleansedSearchResult: display.replace(/<[^>]*>/g, "")
                    }));
                    if (IDNumCount === 0) {
                        $suggestItem.remove('.suggestListCategory');
                    }
                    $suggestList.append($suggestItem);

                    // Switching to click so this will fire before blur
                    $("#" + suggestID).on('click.searchList', function(event) {
                        me.destroyDropdownList(event, query);
                    });
                    IDNumCount++;
                });
            }
        },

        cancelSuggest: function() {
            if (this.isSearching) {
                clearTimeout(this.isSearching);
            }
        },

        searchFromSuggest: function(suggestion) {
            this.$('#searchText').val(suggestion);
            this.doSubmitSearch();
        },
        doSubmitSearch: function() {
            this.cancelSuggest(); //cancel any pending suggestion call

            var trimmedSearchText = $('#searchText').val().trim();
            this.searchTerm = trimmedSearchText;
            if (trimmedSearchText) {
                this.doReturnResults();
            }

        },
        doReturnResults: function() {
            this.$("#suggestList").remove();
            this.$("#suggestSpinner").remove();
            //use this function to implement sending the data to the text-Search applet
            var completedSearchData = {
                searchTerm: this.searchTerm
            };
            ADK.Navigation.navigate('record-search');
            this.$('#searchText').val(this.searchTerm);
            ADK.SessionStorage.setAppletStorageModel('search', 'searchText', completedSearchData);

            // This was previously in a setInterval, however ADK.SessionStorage seems to be linear and
            // I could not determine any race conditions so I removed the interval.
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
                        this.$("#suggestListDiv").hide();
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
                    $suggestList.remove();
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
                    var me = this;
                    setTimeout(function() {
                        var currentQuery = me.$('#searchText').val();
                        if (currentQuery !== me.lastQuery) {
                            me.lastQuery = currentQuery;
                            me.suggestionsLocked = false;
                            me.doAutocomplete(keyEvent);
                        }
                    }, 0);
                    break;
            }
        },
        onSuggestionKey: function(keyEvent) {
            var $target = $(keyEvent.target);
            var self = this;
            switch (keyEvent.keyCode) {
                case 38: // up arrow
                    if ($target.is(this.getFirstSearchSuggestion())) {
                        // move focus to search box
                        setTimeout(function() {
                            self.$('#searchText').focus();
                        }, 0);
                    }
                    break;
                case 8: // backspace
                    keyEvent.preventDefault();
                    break;
                case 9: //tab
                    if (!keyEvent.shiftKey && $target.is(this.getLastSearchSuggestion())) {
                        this.hideSuggest();
                        self.$('#searchText').focus();
                    }
                    break;
                case 40: // down arrow
                    if ($target.is(this.getLastSearchSuggestion())) {
                        // move focus to search box
                        setTimeout(function() {
                            self.$('#searchText').focus();
                        }, 0);
                    }
                    break;
            }
        }
    });

    ADK.Messaging.trigger('register:component', {
        type: "contextNavigationItem",
        group: ["patient", "patient-right"],
        key: "textSearchInput",
        view: SuggestView,
        orderIndex: 2,
        shouldShow: function() {
            return (ADK.UserService.hasPermissions('read-patient-record'));
        }
    });

    return SuggestView;
});