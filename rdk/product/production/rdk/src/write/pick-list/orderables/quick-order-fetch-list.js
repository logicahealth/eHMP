'use strict';

var _ = require('lodash');
var validate = require('../utils/validation-util');
var doSearch = require('../../../subsystems/orderables/quickorder-subsystem').doSearchOnPjds;

/**
 * Searches for quick orders -- note that this involves a call to pjds instead of an RPC.
 */
module.exports.fetch = function(logger, configuration, callback, params) {
    var searchString = _.get(params, 'searchString');
    if (validate.isStringNullish(searchString)) {
        searchString = '';
    }
    searchString = searchString.toUpperCase();

    var scope = _.get(params, 'scope');
    if (_.isUndefined(scope) || _.isEmpty(scope)) {
        scope = '';
    }

    var userId = _.get(params, 'userId');
    if (validate.isStringNullish(userId)) {
        userId = '';
    }

    var dummyReq = {
        app: {
            config: configuration
        },
        logger: logger
    };
    var dummyRes = {};
    doSearch(dummyReq, dummyRes, searchString, configuration.site, userId, function(err, result) {
        if (!err && result && result.data && result.data.items) {
            callback(null, result.data.items);
        } else {
            callback(err, result);
        }
    });
};
