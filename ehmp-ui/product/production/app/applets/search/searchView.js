define([
    "backbone",
    "marionette",
    "moment",
    "app/applets/search/searchUtil",
    "hbs!app/applets/search/templates/searchTemplate",
    "hbs!app/applets/search/templates/searchResultTemplate",
    "hbs!app/applets/search/templates/searchResultGroupTemplate",
    "jquery.inputmask",
    "bootstrap-datepicker",
    "underscore"
], function(Backbone, Marionette, moment, searchUtil, searchTemplate, searchResultTemplate, searchResultGroupTemplate, inputmask, datepicker, underscore) {
    "use strict";

    var SuggestResultsModel = Backbone.Model.extend({
            defaults: {}
        }),
        itemDisplay = null,
        groupDisplay = null,
        preSearchTime = null,
        DATE_FORMAT = 'MM/DD/YYYY';

    var SearchView = Backbone.Marionette.ItemView.extend({
        behaviors: {
            HelpLink: {
                container: '.help-button-container',
                mapping: 'record_search',
                buttonOptions: {
                    icon: 'fa-question-circle'
                }
            }
        },
        util: searchUtil,
        template: searchTemplate,
        searchResultTemplate: searchResultTemplate,
        searchResultGroupTemplate: searchResultGroupTemplate,
        isSearching: null, // wait (500ms) for user to stop typing before search
        suggestResults: {},
        suggestionsLocked: false, // never display the suggestion list while this is true (should be true while there is an outstanding search until the search text changes)
        lastQuery: '',
        drillDownCount: 0,
        totalResults: 0,
        fromDate: null,
        toDate: null,
        searchTerm: null,
        //
        initialize: function() {
            var self = this;
            var storageText = ADK.SessionStorage.getAppletStorageModel('search', 'searchText');

            var Collection = Backbone.Collection.extend({
                model: Backbone.Model.extend({
                    'idAttribute': 'uid',
                    parse: function(resp) {
                        resp.displayTitle = _.camelCase(resp.localTitle);
                        return resp;
                    }
                })
            });

            var ehmpConfig = ADK.Messaging.request('ehmpConfig');
            var featureFlags = ehmpConfig.get('featureFlags');
            var trackSolrStorageBoolean = _.get(featureFlags, 'trackSolrStorage');
            this.model = new Backbone.Model();
            this.model.set('showWarningMessage', !trackSolrStorageBoolean);

            this.collection = new Collection();
            this.searchResults = new Collection();

            this.clearDateFilters();
            this.listenTo(ADK.Messaging.getChannel('search'), 'newSearch', function() {
                storageText = ADK.SessionStorage.getAppletStorageModel('search', 'searchText');
                if (storageText) {
                    self.searchTerm = storageText.searchTerm;

                    self.filterType = ADK.SessionStorage.getAppletStorageModel('search', 'filterType');
                    if (self.filterType === "all") {
                        self.$('.active-range').removeClass('active-range');
                        self.$('#all-range-text-search').addClass('active-range');
                    } else if (self.filterType === "2y") {
                        self.$('.active-range').removeClass('active-range');
                        self.$('#2yr-range-text-search').addClass('active-range');
                    } else if (self.filterType === "1y") {
                        self.$('.active-range').removeClass('active-range');
                        self.$('#1yr-range-text-search').addClass('active-range');
                    } else if (self.filterType === "3m") {
                        self.$('.active-range').removeClass('active-range');
                        self.$('#3mo-range-text-search').addClass('active-range');
                    } else if (self.filterType === "1m") {
                        self.$('.active-range').removeClass('active-range');
                        self.$('#1mo-range-text-search').addClass('active-range');
                    } else if (self.filterType === "7d") {
                        self.$('.active-range').removeClass('active-range');
                        self.$('#7d-range-text-search').addClass('active-range');
                    } else if (self.filterType === "72hr") {
                        self.$('.active-range').removeClass('active-range');
                        self.$('#72hr-range-text-search').addClass('active-range');
                    } else if (self.filterType === "24hr") {
                        self.$('.active-range').removeClass('active-range');
                        self.$('#24hr-range-text-search').addClass('active-range');
                    } else if (self.filterType === "custom") {
                        self.$('.active-range').removeClass('active-range');
                        var customDates = ADK.SessionStorage.getAppletStorageModel('search', 'customDates');
                        this.toDate = moment(customDates.toDate).format('MM/DD/YYYY');
                        this.fromDate = moment(customDates.fromDate).format('MM/DD/YYYY');

                        $('#fromDateText').datepicker('update', self.fromDate);
                        $('#toDateText').datepicker('update', self.toDate);

                    }
                    self.doSubmitSearch();
                }

            });

        },
        onRender: function(event) {
            this.formatDates();
        },

        events: {
            'click .search-result-item': 'onSelectSearchResult',
            'keydown .search-result-item': function(e) {
                if (e.which === 13) {
                    this.onSelectSearchResult(e);
                }
            },
            'show.bs.collapse .collapse': 'onExpandGroup',
            'hide.bs.collapse .collapse': 'onCollapseGroup',

            //Data Range filters (not final. may move to another applet)
            'click #all-range-text-search': 'doAllDateFilter',
            'click #24hr-range-text-search': 'do24HrDateFilter',
            'click #72hr-range-text-search': 'do72HrDateFilter',
            'click #7d-range-text-search': 'do7DDateFilter',
            'click #1mo-range-text-search': 'do1MDateFilter',
            'click #3mo-range-text-search': 'do3MDateFilter',
            'click #1yr-range-text-search': 'do1YDateFilter',
            'click #2yr-range-text-search': 'do2YDateFilter',
            'click #custom-range-apply': 'doCustomDateFilter',
            'click #fromCalendar': 'showFromCalendar',
            'click #toCalendar': 'showToCalendar',

            'keyup input': 'monitorCustomDateRange',
            'blur input': 'monitorCustomDateRange',
            'change input': 'monitorCustomDateRange'
        },


        doSubmitSearch: function() {
            var fetchOptions = {
                criteria: {
                    "query": this.searchTerm
                },
                cache: false
            };
            fetchOptions.patient = ADK.PatientRecordService.getCurrentPatient();
            fetchOptions.resourceTitle = 'patient-record-search-text';
            ADK.PatientRecordService.fetchCollection(fetchOptions, this.searchResults);
            this.preSearchTime = new Date().getTime();
            this.listenTo(this.searchResults, 'sync', this.fillSearchResultsTemplate);
            this.listenTo(this.searchResults, 'error', this.onError);
            this.suggestionsLocked = true;

            $(".search-spinner").show();
            $(".search-applet-main").focus();


        },

        onError: function(collection, resp) {
            var errorModel = new Backbone.Model(resp);
            var errorView = ADK.Views.Error.create({
                model: errorModel
            });
            errorView.render();
            $('.search-results').append(errorView.$el);
            $(".search-spinner").hide();
        },

        getKeywords: function() {
            var keywords = ADK.SessionStorage.getAppletStorageModel('search', 'searchText').searchTerm.toString().toLowerCase();
            keywords = keywords.split(' ');
            _.each(keywords, function(kw) {
                if (!_.find(keywords, function(key) {
                        if (_.isUndefined(ADK.utils.stringUtils.singularize(kw))) {
                            return true;
                        }
                        return key === ADK.utils.stringUtils.singularize(kw);
                    })) {
                    keywords.push(ADK.utils.stringUtils.singularize(kw));
                }
            });
            return keywords;
        },

        getHighlights: function(highlightedText) {
            var highlights = [];
            var regex = new RegExp('<span class="cpe-search-term-match">(.*?)<\/span>', 'g');
            var match = regex.exec(highlightedText);
            while (match) {
                highlights.push(match[1].toString().trim());
                match = regex.exec(highlightedText);
            }
            return _.uniq(highlights);
        },

        fillSearchResultsTemplate: function() {
            var mainGroupList = [];
            var afterSearchTime = new Date().getTime();
            var timeToComplete = (afterSearchTime - this.preSearchTime) / 1000;
            var me = this,
                $searchResultList = $('.search-results'),
                totalResults = 0,
                formattedResults = [],
                groupedResults = {};

            $searchResultList.empty();
            this.searchResults.forEach(function(item) {

                var groupName = item.attributes.kind,
                    type = item.attributes.type,
                    where = item.attributes.where,
                    summary = (item.attributes.summary || '').replace("\n", ""),
                    uid = item.attributes.uid;

                if (typeof(item.attributes.count) !== 'undefined') {
                    totalResults += parseInt(item.attributes.count, 10);
                } else {
                    totalResults++;
                }

                // group results by category
                if (groupName) {
                    if (groupedResults[groupName]) {
                        groupedResults[groupName].push(item);
                    } else {
                        groupedResults[groupName] = [item];
                    }
                }
            });
            this.totalResults = totalResults;

            var subgroupIdCounts = {};

            // generate grouped results for display
            var IDNumCount = 0; //numberto append to dateID (for future filtering)


            for (var groupName in groupedResults) { //iterate over the groups

                var items = groupedResults[groupName],
                    cleanGroupName = groupName.replace(/[^a-zA-Z0-9]/g, ""),
                    groupId = 'result-group-' + cleanGroupName,
                    highlightedGroupName = _.get(items[0], 'attributes.highlights.kind'),
                    calcount = 0,
                    i,
                    itemCount;

                if (!highlightedGroupName) {
                    highlightedGroupName = ADK.utils.stringUtils.addSearchResultElementHighlighting(groupName, this.getKeywords());
                }

                for (i = 0; i < items.length; i++) {
                    itemCount = items[i];
                    if (!_.isUndefined(_.get(itemCount, 'attributes.count'))) {
                        calcount += parseInt(_.get(itemCount, 'attributes.count'));
                    } else {
                        calcount++;
                    }
                }

                var $group = $(me.searchResultGroupTemplate({
                        groupName: highlightedGroupName,
                        titleElemId: 'result-group-title-' + cleanGroupName,
                        groupId: groupId,
                        subGroupClass: 'mainGroup dataFetched',
                        mainGroup: 'mainGroupIndent',
                        count: calcount
                    })),
                    $groupList = $group.find('#' + groupId + ' .group-content');

                formattedResults = [];

                for (i = 0; i < items.length; i++) { //iterate over each item in the result group
                    IDNumCount++;

                    var item = items[i],
                        highlightedWhere = _.get(item, 'attributes.highlights.where'),
                        highlightedDomain = _.get(item, 'attributes.highlights.kind'),
                        highlightedSummary = _.get(item, 'attributes.highlights.summary'),
                        summary = (item.attributes.summary || '').replace("\n", ""),
                        uid = item.attributes.uid,
                        datetime = me.util.doDatetimeConversion(item.attributes.datetime),
                        count = '1', // default result count
                        highlights = '';

                    if (typeof(item.attributes.count) !== 'undefined') {
                        count = (item.attributes.count).toString();
                    }
                    if (typeof(item.attributes.highlights) !== 'undefined') {
                        var AllHighlights = _.values(_.omit(item.attributes.highlights, ['summary', 'where', 'kind']));
                        for (var h = 0; h < AllHighlights.length; h++) {
                            var currentHighlight = AllHighlights[h].toString().replace(/\uFFFD/g, "");
                            highlights = highlights + "... " + currentHighlight + " ...<br>";
                        }
                    }

                    var kind = item.get('kind').toLowerCase();
                    if (kind === 'laboratory' && item.get('observed') !== undefined) {
                        datetime = me.util.doDatetimeConversion(item.get('observed'));
                    }
                    var type = item.get('type');
                    var isLabDoc = (kind === 'pathology' || kind === 'surgical pathology' || kind === 'microbiology');

                    if ((isLabDoc || type === 'document' || type === 'problem') && count > 1) {

                        var subGroupList = '';


                        var groupOnText = summary;
                        var docSearchText = summary; //default
                        if (type === 'problem') {
                            groupOnText = item.attributes.icd_code;
                            docSearchText = item.attributes.icd_code;
                            //console.log(groupOnText);
                        }
                        var subGroupType = type;
                        if (kind === 'surgical pathology') {
                            subGroupType = kind;
                            groupOnText = item.attributes.group_name;
                            docSearchText = item.attributes.group_name;

                        }

                        //Documents should search by the local_title, not the summary, which can be a calculated value
                        if (type === 'document') {
                            docSearchText = item.attributes.local_title;
                        }

                        var cleanGroupName2 = summary.replace(/[^a-zA-Z0-9]/g, ""),
                            subgroupIdCount = subgroupIdCounts[cleanGroupName2] = (subgroupIdCounts[cleanGroupName2] || 0) + 1,
                            subGroupId = 'result-subGroup-' + cleanGroupName2 + '-' + subgroupIdCount,
                            highlightedSubGroupName = ADK.utils.stringUtils.addSearchResultElementHighlighting(summary, this.getKeywords()),
                            subGroup = me.searchResultGroupTemplate({
                                groupName: highlightedSubGroupName,
                                titleElemId: 'result-subGroup-title-' + cleanGroupName2 + '-' + subgroupIdCount,
                                groupId: subGroupId,
                                count: count.toString(),
                                subGroup: true,
                                subGroupType: subGroupType,
                                groupOnText: groupOnText,
                                subGroupItems: subGroupList,
                                subGroupClass: 'topLevelItem documentSubgroup dataUnfetched',
                                datetime: datetime,
                                docSearchText: docSearchText
                            });



                        formattedResults.push({
                            item: subGroup,
                            sortText: summary.toString()
                        });
                    } else {
                        if (highlightedSummary) {
                            var fullSummaryHl = "";
                            for (var hl = 0; hl < highlightedSummary.length; hl++) {
                                fullSummaryHl = fullSummaryHl + highlightedSummary[hl].toString().replace(/\uFFFD/g, "");
                            }
                            highlightedSummary = ADK.utils.stringUtils.addSearchResultElementHighlighting(summary, this.getHighlights(fullSummaryHl));
                        } else {
                            var summaryPlus = summary;

                            if (item.attributes.problem_status !== undefined) {
                                summaryPlus = item.attributes.problem_status + ':' + summary;
                                if (item.attributes.acuity_name !== undefined) {
                                    summaryPlus = item.attributes.problem_status + '(' + item.attributes.acuity_name + '): ' + summary;
                                }
                            }
                            highlightedSummary = ADK.utils.stringUtils.addSearchResultElementHighlighting(summaryPlus, this.getKeywords());
                        }
                        if (!highlightedWhere) {
                            highlightedWhere = ADK.utils.stringUtils.addSearchResultElementHighlighting(item.attributes.where, this.getKeywords());
                        }
                        if (!highlightedDomain) {
                            highlightedDomain = ADK.utils.stringUtils.addSearchResultElementHighlighting(item.attributes.kind, this.getKeywords());

                        }
                        var entry = me.searchResultTemplate({
                            Class: "topLevelItem search-result-item all-padding-xs searchResultItem-filterable",
                            resultId: IDNumCount,
                            uid: uid.toString(),
                            count: count.toString(),
                            summary: highlightedSummary,
                            highlights: highlights,
                            datetime: datetime,
                            domain: highlightedDomain,
                            facility: highlightedWhere,
                            basicResult: true,
                            singleResult: true
                        });

                        formattedResults.push({
                            item: entry,
                            sortText: summary.toString()
                        });
                    }
                }


                var sortedResults = underscore.sortBy(formattedResults, 'sortText');
                for (var k = 0; k < sortedResults.length; k++) {
                    $groupList.append(sortedResults[k].item);
                }
                var sortText = groupName.toString();
                mainGroupList.push({
                    group: $group,
                    sortText: sortText
                });


            }


            var sortedGroups = underscore.sortBy(mainGroupList, 'sortText');

            for (var g = 0; g < mainGroupList.length; g++) {
                $searchResultList.append(sortedGroups[g].group);
            }
            //hide "loading" image
            var filterType = ADK.SessionStorage.getAppletStorageModel('search', 'filterType');
            if (filterType === "all") {
                this.doAllDateFilter();
            } else if (filterType === "2y") {
                this.do2YDateFilter();
            } else if (filterType === "1y") {
                this.do1YDateFilter();
            } else if (filterType === "3m") {
                this.do3MDateFilter();
            } else if (filterType === "1m") {
                this.do1MDateFilter();
            } else if (filterType === "7d") {
                this.do7DDateFilter();
            } else if (filterType === "72hr") {
                this.do72HrDateFilter();
            } else if (filterType === "24hr") {
                this.do24HrDateFilter();
            } else if (filterType === "custom") {
                var customDates = ADK.SessionStorage.getAppletStorageModel('search', 'customDates');
                this.toDate = moment(customDates.toDate).format('MM/DD/YYYY');
                this.fromDate = moment(customDates.fromDate).format('MM/DD/YYYY');

                $('#fromDateText').datepicker('update', this.fromDate);
                $('#toDateText').datepicker('update', this.toDate);

                this.doCustomDateFilter();

            } else {
                this.doAllDateFilter();
            }

            $(".search-spinner").hide();

        },
        getDocumentDrilldownData: function(group_value, subGroupList, drilldown_type) {

            var query = this.searchTerm;
            var group_field = 'local_title';
            if (drilldown_type === "problem") {
                group_field = "icd_code";
            }
            if (drilldown_type === "result" || drilldown_type === "lab") {
                group_field = "qualified_name_units";
            }
            if (drilldown_type === 'surgical pathology') {
                group_field = "group_name";
            }
            var fetchOptions = {
                criteria: {
                    "query": query,
                    "group.field": group_field,
                    "group.value": group_value
                },
                cache: false
            };
            var self = this;
            fetchOptions.onSuccess = function(collection, resp) {
                self.drillDownCount++;
                var returnedSubGroupData = resp.data.items.results;
                var snippets = '';
                if (resp.data.items.highlights !== 'undefined') {
                    snippets = resp.data.items.highlights;
                }

                for (var subgroupData = 0; subgroupData < returnedSubGroupData.length; subgroupData++) {
                    var drillDownItem = returnedSubGroupData[subgroupData];
                    var where = ADK.utils.stringUtils.addSearchResultElementHighlighting(drillDownItem.facility_name, self.getKeywords());
                    var name = drillDownItem.author_display_name;
                    var problemStatus = drillDownItem.problem_status;
                    var uid = drillDownItem.uid;
                    var signer = drillDownItem.signer_display_name;
                    var highlights = '';
                    var datetime = self.util.doDatetimeConversion(drillDownItem.datetime);
                    var codes = [{
                        code: _.get(drillDownItem, 'codes_code[0]', {}),
                        display: _.get(drillDownItem, 'codes_display[0]', {}),
                        system: _.get(drillDownItem, 'codes_system[0]', {})
                    }];
                    drillDownItem.codes = codes;

                    if ((datetime === null || datetime === "" || datetime === "Unknown") && drillDownItem.observed !== undefined) {
                        datetime = self.util.doDatetimeConversion(drillDownItem.observed);
                    }

                    if (drillDownItem.problem_status !== undefined) {
                        problemStatus = ADK.utils.stringUtils.addSearchResultElementHighlighting(drillDownItem.problem_status, self.getKeywords());
                    }
                    if (snippets[uid].body !== 'undefined' && !underscore.isEmpty(snippets[uid])) {
                        highlights = '<p class="all-margin-no">...' + snippets[uid].body.join(" ... </p><p class='all-margin-no'>...") + '...</p>';
                    }

                    self.collection.add(drillDownItem, {
                        merge: true,
                        parse: true
                    });

                    var subGroupEntryItem = self.searchResultTemplate({
                        Class: "subgroupItem search-result-item all-padding-xs searchResultItem-filterable",
                        resultId: 'subgroupItem' + subgroupData.toString(),
                        uid: uid.toString(),
                        datetime: datetime,
                        count: 1,
                        name: name,
                        problemStatus: problemStatus,
                        signer: signer || name,
                        facility: where,
                        highlights: highlights,
                        basicResult: true
                    });

                    subGroupList = subGroupList.append(subGroupEntryItem);

                }
                subGroupList.find($('.subgroup-data-fetchspinner')).hide();
                self.refreshDateFilter();
            };

            fetchOptions.patient = ADK.PatientRecordService.getCurrentPatient();
            fetchOptions.resourceTitle = 'patient-record-search-detail-document';
            ADK.PatientRecordService.fetchCollection(fetchOptions);

        },
        checkforSubGroups: function(subGroup) {

            var docSearchText = subGroup.attr('docSearchText').toString();
            var drilldown_type = subGroup.attr('subGroupType');
            var $subGroupList = subGroup.find($('.group-content'));

            this.getDocumentDrilldownData(docSearchText, $subGroupList, drilldown_type);
            subGroup.removeClass('dataUnfetched');
            subGroup.removeClass('searchResultItem-filterable');
            subGroup.addClass('dataFetched');



        },
        showFromCalendar: function() {

            this.$('#fromDateText').datepicker('show');
            this.$('#toDateText').datepicker('hide');

        },
        showToCalendar: function() {

            this.$('#toDateText').datepicker('show');
            this.$('#fromDateText').datepicker('hide');

        },
        doDateFilterCommon: function(dateRange, textSearchId, dateRangeId, selectedId) {
            this.fromDate = dateRange;
            this.toDate = moment();
            if (dateRangeId === 'all') {
                this.doDateFilter(true, null, null);
            } else {
                this.doDateFilter(false);
            }
            this.$('.active-range').removeClass('active-range');
            this.$(textSearchId).addClass('active-range');
            this.clearDateFilters();
            ADK.SessionStorage.setAppletStorageModel('search', 'filterType', dateRangeId);
            ADK.SessionStorage.setAppletStorageModel('search', 'modalOptions', {
                selectedId: selectedId
            });
        },
        doAllDateFilter: function() {
            this.doDateFilterCommon(moment().subtract('years', 100), '#all-range-text-search', 'all', 'all-range');
        },
        do2YDateFilter: function() {
            this.doDateFilterCommon(moment().subtract('years', 2), '#2yr-range-text-search', '2y', '2yr-range');
        },
        do1YDateFilter: function() {
            this.doDateFilterCommon(moment().subtract('years', 1), '#1yr-range-text-search', '1y', '1yr-range');
        },
        do3MDateFilter: function() {
            this.doDateFilterCommon(moment().subtract('months', 3), '#3mo-range-text-search', '3m', '3mo-range');
        },
        do1MDateFilter: function() {
            this.doDateFilterCommon(moment().subtract('months', 1), '#1mo-range-text-search', '1m', '1mo-range');
        },
        do7DDateFilter: function() {
            this.doDateFilterCommon(moment().subtract('days', 7), '#7d-range-text-search', '7d', '7d-range');
        },
        do72HrDateFilter: function() {
            this.doDateFilterCommon(moment().subtract('hours', 72), '#72hr-range-text-search', '72hr', '72hr-range');
        },
        do24HrDateFilter: function() {
            this.doDateFilterCommon(moment().subtract('hours', 24), '#24hr-range-text-search', '24hr', '24hr-range');
        },
        doCustomDateFilter: function(event) {
            if (event) event.preventDefault();

            this.$('.active-range').removeClass('active-range');
            var toDateText = this.$('#toDateText').val();
            var fromDateText = this.$('#fromDateText').val();
            var fromDate = moment(fromDateText, 'MM/DD/YYYY');
            var toDate = moment(toDateText, 'MM/DD/YYYY');
            this.fromDate = fromDate;
            this.toDate = toDate;
            if (toDate < fromDate) {
                //switch dates if in wrong order
                this.fromDate = toDate;
                this.toDate = fromDate;
            }
            var customDates = {
                fromDate: this.fromDate,
                toDate: this.toDate
            };
            ADK.SessionStorage.setAppletStorageModel('search', 'filterType', 'custom');
            ADK.SessionStorage.setAppletStorageModel('search', 'customDates', customDates);

            ADK.SessionStorage.setAppletStorageModel('search', 'modalOptions', {
                selectedId: 'custom-range-apply',
                customFromDate: fromDate.format('MM/DD/YYYY'),
                customToDate: fromDate.format('MM/DD/YYYY')
            });
            this.doDateFilter(false);
        },
        clearDateFilters: function() {
            this.$('#fromDateText').val("");
            this.$('#toDateText').val("");
            this.toggleApplyBtn();
        },
        refreshDateFilter: function() {
            var showAll = false;
            var filterType = ADK.SessionStorage.getAppletStorageModel('search', 'filterType');
            if (filterType === "all") {
                showAll = true;
            }
            this.doDateFilter(showAll);
        },
        formatDates: function() {
            ADK.utils.dateUtils.datepicker(this.$('#fromDateText'), {
                format: 'mm/dd/yyyy',
                forceParse: false,
                autoclose: true,
                todayBtn: 'linked',
                todayHighlight: true
            });
            ADK.utils.dateUtils.datepicker(this.$('#toDateText'), {
                format: 'mm/dd/yyyy',
                forceParse: false,
                autoclose: true,
                todayBtn: 'linked',
                todayHighlight: true
            });

            this.$('#fromDateText').inputmask('m/d/y', {
                'placeholder': 'MM/DD/YYYY'
            });
            this.$('#toDateText').inputmask('m/d/y', {
                'placeholder': 'MM/DD/YYYY'
            });
            this.$('#toDateText').datepicker('remove');
            this.$('#fromDateText').datepicker('remove');
        },
        monitorCustomDateRange: function(event) {
            this.toggleApplyBtn();
        },
        toggleApplyBtn: function() {
            if (this.checkCustomRangeCondition()) {
                this.$('#custom-range-apply').removeAttr('disabled');
            } else {
                this.$('#custom-range-apply').prop('disabled', true);
            }
        },
        checkCustomRangeCondition: function() {
            var hasCustomRangeValuesBeenSetCorrectly = true;
            var customFromDate = this.$('#fromDateText').val();
            var customToDate = this.$('#toDateText').val();

            if (!moment(customFromDate, 'MM/DD/YYYY', true).isValid()) {

                hasCustomRangeValuesBeenSetCorrectly = false;
            }

            if (!moment(customToDate, 'MM/DD/YYYY', true).isValid()) {
                hasCustomRangeValuesBeenSetCorrectly = false;
            }

            return hasCustomRangeValuesBeenSetCorrectly;
        },
        doDateFilter: function(displayAll) {
            var items = $('.search-results .searchResultItem-filterable');
            var filteredOut = 0;
            var fromTimeInMilisec = null;
            var toTimeInMilisec = null;
            for (var i = 0; i < items.length; ++i) {
                var nextItem = $(items[i]);

                var dateString = nextItem.attr("date") || null;
                // if all button is selected show me all results
                var itemVisibility = nextItem.css("display");
                if (nextItem.css("display") !== "none")
                    itemDisplay = nextItem.css("display");
                if (displayAll === true) {
                    nextItem.css("display", itemDisplay);
                } else {
                    var hasDate = false;
                    var itemDate = null;
                    var isInvalidDate = (dateString === null || dateString === "" || dateString === "Unknown");
                    if (isInvalidDate) {
                        nextItem.css("display", itemDisplay);
                    } else if (dateString !== null) {
                        var itemDateTimeStr = dateString.split("-") || '';
                        var nextDate = moment(itemDateTimeStr[0], 'MM/DD/YYYY');
                        if (this.fromDate !== 'undefined' && this.toDate !== null && this.toDate !== 'undefined') {

                            if (nextDate >= this.fromDate && nextDate <= this.toDate) {
                                nextItem.css("display", itemDisplay);

                            } else
                                nextItem.css("display", "none");
                        }

                    } else
                        nextItem.css("display", "none");
                } //end DateTime not all filters
                var itemCountStr = nextItem.attr("count");


                var itemCount = parseInt(itemCountStr);
                if (nextItem.css("display") !== itemDisplay) {
                    filteredOut = filteredOut + itemCount;
                }


            } //end for-loop
            var results = this.totalResults - filteredOut;
            this.$('.number-of-results').html(results.toString() + " results");


            this.changeEntireSearchResultGroupVisibility();
        },
        changeEntireSearchResultGroupVisibility: function() {
            var groups = $('.dataFetched');

            for (var i = 0; i < groups.length; i++) {
                var newCount = 0;
                var visible = false;
                var nextGroup = $(groups[i]);
                var list = nextGroup.find('.searchResultItem-filterable');

                if (nextGroup.css("display") !== "none") {
                    groupDisplay = nextGroup.css("display");
                }


                for (var k = 0; k < list.length; k++) {
                    var nextItem = $(list[k]);
                    if (nextItem.css("display") === groupDisplay) {
                        visible = true;
                        newCount++;
                    }

                }
                var countBadge = nextGroup.find(".badge");

                if (countBadge.length > 0 && nextGroup.hasClass('documentSubgroup')) {
                    countBadge.html(newCount.toString());
                }
                if (visible === true)
                    nextGroup.css("display", groupDisplay);
                else
                    nextGroup.css("display", "none");
            }
        },
        onSelectSearchResult: function(e) {
            event.preventDefault();
            var $resultContainer = $(event.target).closest('.search-result-item'),
                uid = $resultContainer.attr('data-uid'),
                currentPatient = ADK.PatientRecordService.getCurrentPatient();
            var model = this.collection.find({'uid':uid}) || this.searchResults.find({uid: uid});
            ADK.Messaging.getChannel('search').trigger('resultClicked', {
                uid: uid,
                patient: {
                    icn: currentPatient.attributes.icn,
                    pid: currentPatient.attributes.pid
                },
                model: model
            });
        },
        accordionExpandCollapse: function(caret1, caret2, accordionState) {
            var groupIcon = this.$(event.target).closest('.search-group').find('button.btn-accordion:first');
            groupIcon.children('.fa').removeClass(caret1).addClass(caret2);
            var accordionHeading = groupIcon.find('.text-uppercase').text().trim();
            groupIcon.attr('title', 'Press enter to ' + accordionState + accordionHeading + ' accordion');
            groupIcon.blur().focus();
        },
        onCollapseGroup: function(event) {
            this.accordionExpandCollapse('fa-chevron-down', 'fa-chevron-right', 'expand ');
        },
        onExpandGroup: function(event) {
            var $group = $(event.target).closest('.search-group');
            if ($group.hasClass('dataUnfetched')) {
                this.checkforSubGroups($group);
            }
            this.accordionExpandCollapse('fa-chevron-right', 'fa-chevron-down', 'collapse ');
        }
    });

    return SearchView;
});