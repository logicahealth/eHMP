define(['jquery', 'moment', 'underscore'], function($, Moment, _) {
    "use strict";

    var StringUtils = {};


    var singulars = [],
        uncountables = [];

    var singular = function (rule, replacement) {
        singulars.unshift([rule, replacement]);
    };

    var uncountable = function (word) {
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

    StringUtils.singularize = function (word) {
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

    StringUtils.addSearchResultElementHighlighting = function (textToHighlight, keywords) {
        var markStart = '<mark class="cpe-search-term-match">';
        var markEnd = '</mark>';
        _.each(keywords, function(key) {
            var regex = new RegExp('\\b' + key.replace(/[-[\]{}()*+?.,\\^$|#\key]/g, "\\$&") + '\\b' + '(?=[^<>]*(<|$))', "gi");
            textToHighlight = textToHighlight.replace(regex, markStart + '$&' + markEnd);
        });
        return textToHighlight;
    };


    return StringUtils;
});
