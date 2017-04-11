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
        doDatetimeConversion: function(datetimeNum) {
            if(!datetimeNum) return "Unknown";
            var dateLength = datetimeNum.length;
            if(dateLength === 4) {
                // YYYY -> YYYY
                return datetimeNum;
            } else if(dateLength === 6) {
                // YYYYMM -> MM/YYYY
                return [datetimeNum.slice(4), datetimeNum.slice(0,4)].join('/');
            } else if(dateLength === 7) {
                // YYYYMMD -> MM/15/YYYY   (if the day is weird, default to the 15th)
                return [datetimeNum.substr(4,2), '15', datetimeNum.slice(0,4)].join('/');
            } else if(dateLength === 8) {
                // YYYYMMDD -> MM/DD/YYYY
                return [datetimeNum.substr(4,2), datetimeNum.substr(6,2), datetimeNum.substr(0,4)].join('/');
            } else if(dateLength >= 10) {
                // YYYYMMDDHHmm -> MM/DD/YYYY - HH:mm
                if (dateLength === 10) {
                    datetimeNum = [datetimeNum, '00'].join('');
                }
                var date = [datetimeNum.substr(4,2), datetimeNum.substr(6,2), datetimeNum.substr(0,4)].join('/');
                var time = [datetimeNum.substr(8, 2), datetimeNum.substr(10, 2)].join(':');
                return [date, time].join(' - ');
            } else {
                return "Unknown";
            }
        }
    };
    return searchUtil;
});
