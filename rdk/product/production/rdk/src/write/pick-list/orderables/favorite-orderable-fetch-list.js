'use strict';

var _ = require('lodash');
var validate = require('../utils/validation-util');
var doSearch = require('../../../subsystems/orderables/favorite-orderable-subsystem').findFavorites;

/**
 * Searches for favorite orderables -- note that this involves a call to pjds instead of an RPC.
 */
module.exports.fetch = function(logger, configuration, callback, params) {
    var userId = _.get(params, 'userId');
    if (validate.isStringNullish(userId)) {
        userId = '';
    }

    var dummyReq = {
        app: {
            config: configuration
        },
        logger: logger,
        session: {
            user: {
                uid: userId
            }
        }
    };
    var dummyRes = {};
    doSearch(dummyReq, dummyRes, function(err, result) {
        if (!err && result && result.data && result.data.items) {
            callback(null, result.data.items);
        } else {
            callback(err, result);
        }
    });
};
