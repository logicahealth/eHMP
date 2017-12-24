define([
    'backbone',
    'marionette',
    'underscore'
], function(Backbone, Marionette, _) {
    "use strict";

    var Util = {};

    Util.serializeObject = function(ccdObject) {
        ccdObject.referenceDateDisplay = Util.getReferenceDateDisplay(ccdObject.ccdDateTime);
        ccdObject.referenceDateTimeDisplay = Util.getReferenceDateTimeDisplay(ccdObject.ccdDateTime);
        ccdObject.facilityName = 'VLER';
        return ccdObject;
    };

    Util.getReferenceDateDisplay = function(ccdDateTime) {
        if (!ccdDateTime) {
            return 'N/A';
        }
        return ADK.utils.formatDate(ccdDateTime);
    };

    Util.getReferenceDateTimeDisplay = function(ccdDateTime) {
        if (!ccdDateTime) {
            return 'N/A';
        }
        return ADK.utils.formatDate(ccdDateTime, 'MM/DD/YYYY - HH:mm');
    };

    /**
     * Highlights search term and synonyms
     * @param {String} html - the html string to process
     * @param {Array} synonyms - array of synonyms
     * @param {String} highlights - html string from solr that provides relevant word forms to highlight
     * @return {String} html - the edited html string now containing <mark> elements on the keywords
     */
    Util.highlightSearchTerm = function(html, synonyms, highlights) {
        var searchTerm = ADK.SessionStorage.getAppletStorageModel('search', 'searchText').searchTerm;
        var searchTermArray = searchTerm ? searchTerm.toLowerCase().split(' ') : [];
        highlights = getHighlights(highlights);
        var keywords = _.uniq(mergeHighlights(synonyms, highlights).concat(searchTermArray));

        var markStart = '<mark class="cpe-search-term-match">';
        var markEnd = '</mark>';
        _.each(keywords, function(key) {
            var regex = new RegExp('\\b' + key.replace(/[-[\]{}()*+?.,\\^$|#\key]/g, "\\$&") + '\\b' + '(?=[^<>]*(<|$))', "gi");
            html = html.replace(regex, markStart + '$&' + markEnd);
        });
        return html;
    };

    // pretty ugly, but this gets us at least some of the word forms that should be highlighted for this doc
    var getHighlights = function(highlights) {
        var markStart = '{{addTag \"';
        var markEnd = '\" \"mark\" \"cpe-search-term-match\"}}';
        var regex = new RegExp(markStart + '(.*?)' + markEnd, 'g');
        var match;
        var keywords = [];

        while ((match = regex.exec(highlights)) !== null) {
            var synonym = match[1].toLowerCase();
            if (_.indexOf(keywords, synonym) === -1) {
                keywords.push(synonym);
            }
        }
        return keywords;
    };

    var mergeHighlights = function(synonyms, highlights) {
        // only add unique highlights to synonyms
        if (_.isEmpty(synonyms)) {
            return highlights;
        }
        // split the multiword synonyms to get array of all words used.
        var synonymWords = synonyms.join(' ').split(' ');
        highlights = _.filter(highlights, function(highlight) {
            return !_.includes(synonymWords, highlight);
        });
        if (highlights.length === 0) {
            return synonyms;
        } else {
            return synonyms.concat(highlights);
        }
    };

    return Util;
});