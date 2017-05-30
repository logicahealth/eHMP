define([
    "backbone",
    "marionette",
    "underscore",
    "moment"
], function(Backbone, Marionette, _, moment) {
    "use strict";

    //month and day are always two digits
    //things are sequential so if no month, no day
    var searchUtil = {
        getKeywords: function() {
            var keywords = ADK.SessionStorage.getAppletStorageModel('search', 'searchText').searchTerm.toString().toLowerCase();
            keywords = keywords.split(' ');
            _.each(keywords, function(kw) {
                var singularizedKeywords = ADK.utils.stringUtils.singularize(kw);
                var keywordsHasSingularizedKeywords = _.find(keywords, function(key) {
                    if (_.isUndefined(singularizedKeywords)) {
                        return true;
                    }
                    return key === singularizedKeywords;
                });
                if (!keywordsHasSingularizedKeywords) {
                    keywords.push(singularizedKeywords);
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
        doDatetimeConversion: function(datetimeNum, overrideFormat) {
            var returnValue = {
                display: 'Unknown',
                sort: 'Unknown'
            };
            if (!_.isUndefined(datetimeNum) && datetimeNum !== 'Invalid date') {
                var frmt, parseFrmt,
                    dtLen = datetimeNum.length;
                if (dtLen === 4) {
                    parseFrmt = 'YYYY';
                    frmt = 'YYYY';
                } else if (dtLen < 8 && dtLen >= 6) {
                    parseFrmt = 'YYYYMM';
                    frmt = 'MM/YYYY';
                    //if the day is wierd, default to the 15th
                    if (dtLen === 7) {
                        datetimeNum = datetimeNum.substring(0, (dtLen - 1)) + '15';
                        parseFrmt = 'YYYYMMDD';
                        frmt = 'MM/DD/YYYY';
                    }
                } else if (dtLen === 8) {
                    parseFrmt = 'YYYYMMDD';
                    frmt = 'MM/DD/YYYY';
                } else if (dtLen >= 10 && dtLen < 14) {
                    parseFrmt = 'YYYYMMDDHHmm';
                    frmt = 'MM/DD/YYYY - HH:mm';
                } else if (dtLen === 14) {
                    parseFrmt = 'YYYYMMDDHHmmss';
                    frmt = 'MM/DD/YYYY - HH:mm';
                }
                var date = moment(datetimeNum, parseFrmt);
                if (date.isValid()) {
                    returnValue.display = date.format(frmt);
                    returnValue.sort = date.format('YYYYMMDDHHmmss');
                }
            }
            return returnValue;
        },
        baseModelParse: function(response) {
            response.displayTitle = _.camelCase(response.localTitle);
            var highlightedWhere = _.get(response, 'highlights.where'),
                highlightedDomain = _.get(response, 'highlights.kind'),
                highlightedSummary = _.get(response, 'highlights.summary'),
                summary = (response.summary || '').replace("\n", ""),
                uid = response.uid,
                datetime = this.doDatetimeConversion(response.datetime),
                count = 1, // default result count
                highlights = '';
            if (typeof(response.count) !== 'undefined') {
                count = parseInt(response.count);
            }
            if (typeof(response.highlights) !== 'undefined') {
                var AllHighlights = _.values(_.omit(response.highlights, ['summary', 'where', 'kind']));
                _.each(AllHighlights, function(highlight) {
                    var currentHighlight = highlight.toString().replace(/\uFFFD/g, "");
                    highlights = highlights + "... " + currentHighlight + " ...<br>";
                });
            }

            var kind = response.kind.toLowerCase();
            if ((kind === 'laboratory' || (datetime.display === null || datetime.display === "" || datetime.display === "Unknown")) && response.observed !== undefined) {
                datetime = this.doDatetimeConversion(response.observed);
            }

            response.vlerDoc = kind === 'community health summaries';

            var type = response.type;
            var isLabDoc = (kind === 'pathology' || kind === 'surgical pathology' || kind === 'microbiology');

            if ((isLabDoc || type === 'document' || type === 'problem') && count > 1) {

                var subGroupList = '';
                var groupOnText = summary;
                var docSearchText = summary; //default
                if (type === 'problem') {
                    groupOnText = response.icd_code;
                    docSearchText = response.icd_code;
                }
                var subGroupType = type;
                if (kind === 'surgical pathology') {
                    subGroupType = kind;
                    groupOnText = response.group_name;
                    docSearchText = response.group_name;

                }

                //Documents should search by the local_title, not the summary, which can be a calculated value
                if (type === 'document') {
                    docSearchText = response.local_title;
                }
                var highlightedSubGroupName = ADK.utils.stringUtils.addSearchResultElementHighlighting(summary, this.getKeywords());
                response.summary = summary;
                response.groupName = highlightedSubGroupName;
                response.datetime = datetime.display;
                response.datetimeSort = datetime.sort;
                response.count = count;
                response.subGroup = true;
                response.subGroupType = subGroupType;
                response.groupOnText = groupOnText;
                response.subGroupItems = subGroupList;
                response.docSearchText = docSearchText;
                response.collection = new ADK.UIResources.Fetch.TextSearch.DocumentDrilldownCollection({});
            } else {
                if (highlightedSummary) {
                    var fullSummaryHl = "";
                    _.each(highlightedSummary, function(highlightedSummaryItem) {
                        fullSummaryHl = fullSummaryHl + highlightedSummaryItem.toString().replace(/\uFFFD/g, "");
                    });
                    highlightedSummary = ADK.utils.stringUtils.addSearchResultElementHighlighting(summary, this.getHighlights(fullSummaryHl));
                } else {
                    var summaryPlus = summary;

                    if (response.problem_status !== undefined) {
                        summaryPlus = response.problem_status + ':' + summary;
                        if (response.acuity_name !== undefined) {
                            summaryPlus = response.problem_status + '(' + response.acuity_name + '): ' + summary;
                        }
                    }
                    highlightedSummary = ADK.utils.stringUtils.addSearchResultElementHighlighting(summaryPlus, this.getKeywords());
                }
                if (!highlightedWhere && response.where) {
                    highlightedWhere = ADK.utils.stringUtils.addSearchResultElementHighlighting(response.where, this.getKeywords());
                }
                if (!highlightedDomain && response.kind) {
                    highlightedDomain = ADK.utils.stringUtils.addSearchResultElementHighlighting(response.kind, this.getKeywords());

                }
                response.summary = summary;
                response.uid = uid.toString();
                response.count = count;
                response.highlightedSummary = highlightedSummary;
                response.highlights = highlights;
                response.datetime = datetime.display;
                response.datetimeSort = datetime.sort;
                response.domain = highlightedDomain;
                response.facility = highlightedWhere;
                response.basicResult = true;
                response.singleResult = true;
                response.subGroup = false;
            }
            return response;
        }
    };
    return searchUtil;
});