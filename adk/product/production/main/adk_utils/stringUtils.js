define(['jquery', 'moment', 'underscore', 'libphonenumber'], function($, Moment, _, Libphone) {
    "use strict";

    var StringUtils = {};


    var singulars = [],
        uncountables = [];

    var singular = function(rule, replacement) {
        singulars.unshift([rule, replacement]);
    };

    var uncountable = function(word) {
        uncountables.unshift(word);
    };

    singular(/s$/i, "");
    singular(/(n)ews$/i, "$1ews");
    singular(/([ti])a$/i, "$1um");
    singular(/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/i, "$1$2sis");
    singular(/(^analy)ses$/i, "$1sis");
    singular(/([^f])ves$/i, "$1fe");
    singular(/(hive)s$/i, "$1");
    singular(/(tive)s$/i, "$1");
    singular(/([lr])ves$/i, "$1f");
    singular(/([^aeiouy]|qu)ies$/i, "$1y");
    singular(/(s)eries$/i, "$1eries");
    singular(/(m)ovies$/i, "$1ovie");
    singular(/(x|ch|ss|sh)es$/i, "$1");
    singular(/([m|l])ice$/i, "$1ouse");
    singular(/(bus)es$/i, "$1");
    singular(/(o)es$/i, "$1");
    singular(/(shoe)s$/i, "$1");
    singular(/(cris|ax|test)es$/i, "$1is");
    singular(/(octop|vir)i$/i, "$1us");
    singular(/(alias|status)es$/i, "$1");
    singular(/^(ox)en/i, "$1");
    singular(/(vert|ind)ices$/i, "$1ex");
    singular(/(matr)ices$/i, "$1ix");
    singular(/(quiz)zes$/i, "$1");
    singular(/(database)s$/i, "$1");

    uncountable("equipment");
    uncountable("information");
    uncountable("rice");
    uncountable("money");
    uncountable("species");
    uncountable("series");
    uncountable("fish");
    uncountable("sheep");
    uncountable("jeans");

    StringUtils.singularize = function(word) {
        var wlc = word.toLowerCase();
        for (var i = 0; i < uncountables.length; i++) {
            var uncountable = uncountables[i];
            if (wlc == uncountable) {
                return word;
            }
        }
        for (var j = 0; j < singulars.length; j++) {
            var rule = singulars[j][0],
                replacement = singulars[j][1];
            if (rule.test(word)) {
                return word.replace(rule, replacement);
            }
        }
    };

    StringUtils.addSearchResultElementHighlighting = function(textToHighlight, keywords) {
        var applyHighlighing = _.isString(textToHighlight) && _.isArray(keywords) && !_.isEmpty(keywords);
        if (!applyHighlighing) {
            return textToHighlight;
        }
        var markStart = '{{addTag \"';
        var markEnd = '\" \"mark\" \"cpe-search-term-match\"}}';
        var escapedKeywords = [];
        _.each(keywords, function(key) {
            /* escapes special characters in keywords */
            escapedKeywords.push(key.replace(/[-[\]{}()*+?.,\\^$|#\key]/g, "\\$&"));
        });
        var escapedSortedKeywords = _.sortBy(escapedKeywords, function(key) {
            return -key.length;
        });
        /* takes escaped keywords and marks each match found with the start & end tags */
        var regex = new RegExp('\\b(' + escapedSortedKeywords.join('|') + ')\\b', "gi");
        return textToHighlight.replace(regex, markStart + '$&' + markEnd);
    };

    StringUtils.toTitleCase = function(string) {
        if (!_.isString(string)) {
            return '';
        }

        var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|is|nor|of|on|or|per|the|to|vs?\.?|via)$/i;

        return string.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, function(match, index, title) {
            if (index > 0 && index + match.length !== title.length &&
                match.search(smallWords) > -1 && title.charAt(index - 2) !== ":" &&
                (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
                title.charAt(index - 1).search(/[^\s-]/) < 0) {
                return match.toLowerCase();
            }

            if (match.substr(1).search(/[A-Z]|\../) > -1) {
                return match;
            }

            return match.charAt(0).toUpperCase() + match.substr(1);
        });
    };

    StringUtils.formatPhoneNumber = function(number) {
        var phoneUtil = Libphone.PhoneNumberUtil.getInstance(),
        retval = number,
        libNumber;

        try {
            libNumber = phoneUtil.parseAndKeepRawInput(number, 'US');
            retval = phoneUtil.formatInOriginalFormat(libNumber, 'US');
        } catch(e) {
            // Couldn't format, return the input.
        }
        return retval;
    };
    return StringUtils;
});
