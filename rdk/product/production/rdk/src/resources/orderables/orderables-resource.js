'use strict';

var orderables = require('./orderables');

module.exports.getResourceConfig = function() {
    return [{
        name: 'orderables',
        path: '',
        get: orderables.getOrderables,
        parameters: {
            get: {
                searchString: {
                    required: false,
                    description: 'Search string',
                },
            }
        },
        requiredPermissions: ['read-orderable'],
        isPatientCentric: false,
    }];
};
