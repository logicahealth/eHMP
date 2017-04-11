'use strict';

var _ = require('lodash');
var validate = require('../utils/validation-util');
var doSearch = require('../../../subsystems/orderables/enterprise-orderable-subsystem').doSearchOnPjds;

/**
 * Searches for enterprise orderables -- note that this involves a call to pjds instead of an RPC.
 */
module.exports.fetch = function(logger, configuration, callback, params) {
    var searchString = _.get(params, 'searchString');
    if (validate.isStringNullish(searchString)) {
        searchString = '';
    }
    searchString = searchString.toUpperCase();

    var dummyReq = {
        app: {
            config: configuration
        },
        logger: logger
    };
    var dummyRes = {};
    doSearch(dummyReq, dummyRes, searchString, undefined, function(err, result) {
        if (!err && result && result.data && result.data.items) {
            callback(null, result.data.items);
        } else {
            callback(err, result);
        }
    });
};
