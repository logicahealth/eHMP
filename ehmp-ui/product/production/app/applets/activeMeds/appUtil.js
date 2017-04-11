define([
    "moment",
], function(moment) {
    'use strict';

    var appHelper = {
        getDaysToExpiration: function(expirationDateStr) {

            var expirationDate = moment(expirationDateStr, 'YYYYMMDDHHmmssSSS');
            var today = moment();
            var duration = moment.duration(expirationDate.diff(today));
            var days = Math.round(parseFloat(duration.asDays()));

            return days;

        }
    };
    return appHelper;
});
