/**
 * separateString
 * Sepatartes a separator from the rest of the stringToBreak, 
 * and capitalizes all the new created strings.
 * It returns an empty string if the stringToBreak or the separator are not valid (null or undefined).
 * and it returns the initial string capitalized, if the separator is an empty string.
 */

define(
    ['handlebars'],
    function(Handlebars) {
        function separateString(stringToBreak, separator) {
            var separated = "";

            if (stringToBreak) {
                separated = stringToBreak.charAt(0).toUpperCase() + stringToBreak.slice(1);

                if (separator) {
                    var key = stringToBreak.toLowerCase();
                    separator = separator.toLowerCase();

                    //split stringToBreak only if the spearator exists within
                    if (key.indexOf(separator) >= 0) {
                        var otherWords = [];
                        _.each(key.split(separator), function(element) {
                            element = element.charAt(0).toUpperCase() + element.slice(1);
                            otherWords.push(element);
                        });

                        separated = otherWords.join(" " + (separator.charAt(0).toUpperCase() + separator.slice(1)) + " ");
                    } else {
                        separated = key;
                    }
                }
            }

            return separated;
        }

        Handlebars.registerHelper('separateString', separateString);
        return separateString;
    }
);
