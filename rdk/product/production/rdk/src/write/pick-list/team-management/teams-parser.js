'use strict';

var _ = require('lodash');
var utils = require('./requests-picklists-utils');

module.exports.parse = function (rows, sites, patientRelated) {
    var result = _.map(rows, function (row) {
        return {
            'teamID': _.get(row, 'TEAM_ID'),
            'teamName': _.get(row, 'TEAM_NAME') + ' - ' + utils.getSiteAbbreviation(sites, _.get(row, 'STATIONNUMBER')),
            'teamPrimaryFoci': _.get(row, 'PCM_STD_TEAM_FOCUS_ID', ''),
            'teamSecondaryFoci': _.get(row, 'PCM_STD_TEAM_FOCUS2_ID', '')
        };
    });
    return result;
};
