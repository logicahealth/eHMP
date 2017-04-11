define([
], function() {
    'use strict';
    var Util = {};

    Util.parseExposure = function(exposureArray) {
        var expStr = '';
        exposureArray.forEach(function(exp) {
            var arr = exp.uid.split(':');
            if (arr[3] == 'Y') {
                if (expStr !== '') {
                    expStr += '; ';
                }
                expStr += arr[2];
            }
        });
        if (!expStr || expStr.trim() === '') {
            expStr = 'No exposures';
        }
        return expStr;
    };

    Util.toTitleCase = function(str) {
        if (!str) {
            return '';
        } else {
            return str.replace(/\w\S*/g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        }
    };

    Util.getProblemGroupByData = function(response) {
        var groupbyValue;
        var groupbyField;

        if (response.get('standardizedDescription')) {
            groupbyField = 'standardizedDescription';
            groupbyValue = response.get(groupbyField);
        } else {
            //get the first word from 'name' with no commas or spaces
            groupbyField = 'problemText';
            groupbyValue = response.get(groupbyField);
        }
        return {
            groupbyValue: groupbyValue,
            groupbyField: groupbyField
        };
    };

    Util.sortDate = function(a, b) {
        var c = new Date(a.dateTime);
        var d = new Date(b.dateTime);
        return (c - d) * -1;
    };

    Util.sortData = function(property) {
        property.problemGroup.get("allGroupedEncounters").sort(function(a, b) {
            return Util.sortDate(a, b);
        });
    };

    Util.compare = function(a, b) {
        return a - b;
    };

    return Util;
});