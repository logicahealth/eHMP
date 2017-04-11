'use strict';

var orderables = require('./orderables');

module.exports.getResourceConfig = function() {
    return [{
        name: 'orderables',
        path: '',
        get: orderables.getOrderables,
        parameters: {
            get: {
                criteria: {
                    required: false,
                    description: 'Search criteria',
                },
                domain: {
                    required: false,
                    description: 'List of domains to search. If empty, it searches all domains'
                }
            }
        },
        requiredPermissions: [],
        isPatientCentric: false,
    }];
};
