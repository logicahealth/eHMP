'use strict';

var _ = require('lodash');

module.exports.parse = function(rows) {
    var result = _.map(rows, function(row) {
        return {
            'roleID': _.get(row, 'PCM_STD_TEAM_ROLE_ID'),
            'name': _.get(row, 'NAME')
        };
    });
    return result;
};
