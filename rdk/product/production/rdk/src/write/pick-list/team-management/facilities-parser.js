'use strict';

var _ = require('lodash');

module.exports.parse = function(rows, division) {
    var result = _.map(_.filter(rows, function(row) {
        if (!division) {
            return true;
        }
        return _.get(row, 'STATIONNUMBER') === division;
    }), function(row) {
        var displayName = _.get(row, 'VISTANAME');

        var city = _.get(row, 'STREETCITY');
        var state = _.get(row, 'POSTALNAME');
        if (city && state) {
            displayName = displayName + ', ' + city + ', ' + state;
        } else if (city) {
            displayName = displayName + ', ' + city;
        } else if (state) {
            displayName = displayName + ', ' + state;
        }

        return {
            'facilityID': _.get(row, 'STATIONNUMBER'),
            'vistaName': displayName
        };
    });
    return result;
};
