/**
 * getSum
 * Returns the sum of n item.
 */

define(['handlebars'], function(Handlebars) {
    'use strict';
    function commaSeparateValues (parameters) {
        var fullString = "",
            definedArguments = [];
        _.each(arguments, function(item){
            if (_.isString(item) && !_.isEmpty(item)){
                definedArguments.push(item);
            }
        });
        for (var i = 0, l = definedArguments.length; i < l; i++) {
            if (_.isString(definedArguments[i]) && !_.isEmpty(definedArguments[i])){
                fullString = fullString + definedArguments[i] + (i!==(l-1) ? ", ":"");
            }
        }
        return fullString;
    }

    Handlebars.registerHelper('commaSeparateValues', commaSeparateValues);
    return commaSeparateValues;
});