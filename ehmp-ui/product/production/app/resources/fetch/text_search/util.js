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
            var TEXT_SEARCH_CHANNEL = ADK.Messaging.getChannel('search');
            var storageText = TEXT_SEARCH_CHANNEL.request('get:current:search:term');
            var keywords = _.get(storageText, 'searchTerm', '').toLowerCase();
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
            var markStart = '{{addTag \"';
            var markEnd = '\" \"mark\" \"cpe-search-term-match\"}}';
            var regex = new RegExp(markStart + '(.*?)' + markEnd, 'g');
            var match = regex.exec(highlightedText);
            while (match) {
                highlights.push(match[1].toString().trim());
                match = regex.exec(highlightedText);
            }
            return _.uniq(highlights);
        },
        getADKHighlights: function(text, keywords, useTitleCase) {
            var textToHighlight = text || '';
            if (useTitleCase === true) {
                textToHighlight = ADK.utils.stringUtils.toTitleCase(text);
            }
            if (!_.isEmpty(keywords)) {
                return ADK.utils.stringUtils.addSearchResultElementHighlighting(textToHighlight, keywords);
            }
            return textToHighlight;
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
            response.displayTitle = ADK.utils.stringUtils.toTitleCase(response.localTitle);
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
            response.useDomain = true;
            if (typeof(response.highlights) !== 'undefined') {
                if (response.type === 'ehmp-activity') {
                    response.useDomain = false;
                    var highlightedSummaryResponse = '';
                    if (response.sub_domain === 'request') {
                        highlightedSummaryResponse = _.last(_.get(response, 'highlights.request_title')) || response.summary || '';
                    } else {
                        highlightedSummaryResponse = _.get(response, 'highlights.consult_name') || response.summary || '';
                        if (_.isArray(highlightedSummaryResponse)) {
                            highlightedSummaryResponse = highlightedSummaryResponse[0];
                        }
                    }
                    highlightedSummary = ADK.utils.stringUtils.toTitleCase(highlightedSummaryResponse);
                }
                var AllHighlights = _.values(_.omit(response.highlights, ['summary', 'where', 'kind', 'request_title', 'consult_name']));
                var highlightsArray = [];
                var parseHighlights = function(highlightsList) {
                    _.each(highlightsList, function(highlight) {
                        if (_.isArray(highlight)) {
                            return parseHighlights(highlight);
                        }
                        var currentHighlight = highlight.toString().replace(/\uFFFD/g, "");
                        highlightsArray.push("... " + currentHighlight + " ...");
                    });
                };
                parseHighlights(AllHighlights);
                highlights = highlightsArray.join('\r\n');
            }

            var kind = (response.kind || '').toLowerCase();
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
                var groupName = ADK.utils.stringUtils.addSearchResultElementHighlighting(summary, this.getKeywords());

                if (type === 'problem') {
                    groupOnText = response.icd_code; //allowing the undefined value here, which indicates they were grouped by the lack of an icd code.
                    docSearchText = response.icd_code;
                    if(!response.icd_code){
                        groupName = 'Terminology Not Defined';
                    }
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
                response.summary = summary;
                response.groupName = groupName;
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
                    /*ignore if highlightedSummary exists but is not an array */
                    if (_.isArray(highlightedSummary)) {
                        var fullSummaryHl = "";
                        _.each(highlightedSummary, function(highlightedSummaryItem) {
                            fullSummaryHl = fullSummaryHl + highlightedSummaryItem.toString().replace(/\uFFFD/g, "");
                        });
                        highlightedSummary = this.getADKHighlights(summary, this.getHighlights(fullSummaryHl), true);
                    }
                } else {
                    var summaryPlus = summary;

                    if (response.problem_status !== undefined) {
                        summaryPlus = response.problem_status + ':' + summary;
                        if (response.acuity_name !== undefined) {
                            summaryPlus = response.problem_status + '(' + response.acuity_name + '): ' + summary;
                        }
                    }
                    highlightedSummary = this.getADKHighlights(summaryPlus, this.getKeywords(), true);
                }
                if (!highlightedWhere && response.where) {
                    highlightedWhere = this.getADKHighlights(response.where, this.getKeywords(), false);
                }

                if (response.vlerDoc && response.institution) {
                    response.institution = this.getADKHighlights(response.institution, this.getKeywords(), false);
                }
                
                if (!highlightedDomain && response.kind) {
                    highlightedDomain = this.getADKHighlights(response.kind, this.getKeywords(), false);

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