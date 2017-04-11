'use strict';

var _ = require('lodash');

module.exports.parse = function(rows, sites, vistaNameToFilterBy) {
    var abbreviationsBySite = {};
    _.each(_.keys(sites), function(siteCode) {
        _.set(abbreviationsBySite, sites[siteCode].name, sites[siteCode].abbreviation);
    });

    var result = _.map(_.filter(rows, function(row) {
        if (!vistaNameToFilterBy) {
            return true;
        }

        return _.get(row, 'VISTANAME') === vistaNameToFilterBy;
    }), function(row) {
        var vistaName = _.get(row, 'VISTANAME');
        var displayName = vistaName + ' (' + abbreviationsBySite[vistaName] + ')';

        var city = _.get(row, 'STREETCITY');
        var state = _.get(row, 'POSTALNAME');
        if (city && state) {
            displayName = displayName + ' ' + city + ', ' + state;
        } else if (city) {
            displayName = displayName + ' ' + city;
        } else if (state) {
            displayName = displayName + ' ' + state;
        }

        return {
            'facilityID': _.get(row, 'STATIONNUMBER'),
            'vistaName': displayName
        };
    });
    return result;
};
