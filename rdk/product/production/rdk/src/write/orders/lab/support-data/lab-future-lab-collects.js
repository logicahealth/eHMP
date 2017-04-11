/**
 * This is temporary until 'ORWDLR33 FUTURE LAB COLLECTS' is in pick-list resource
 */
'use strict';

var parse = require('./lab-future-lab-collects-parser').parseFutureLabCollects;
var RpcClient = require('vista-js').RpcClient;
var validate = require('./../../../pick-list/utils/validation-util');

/**
 * Calls the RPC 'ORWDLR33 FUTURE LAB COLLECTS' and parses out the data.<br/>
 * Returns the number of days in the future to allow Lab Collects.<br/><br/>
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param location The location of the lab order
 * @param callback This will be called with the data retrieved from the RPC (or if there's an error).
 */
module.exports.getFutureLabCollects = function(logger, configuration, location, callback) {
    if (!validate.isWholeNumber(location)) {
        return callback('location cannot be empty and must be a whole number');
    }

    return RpcClient.callRpc(logger, configuration, 'ORWDLR33 FUTURE LAB COLLECTS', location, function(err, rpcData) {
        if (err) {
            return callback(err.message);
        }

        try {
            logger.debug(rpcData);
            var obj = parse(logger, rpcData);
            callback(null, obj);
        }
        catch (parseError) {
            return callback(parseError.message);
        }
    });
};
