'use strict';

var parse = require('./lab-current-time-parser').parseCurrentTime;
var RpcClient = require('vista-js').RpcClient;

/**
 * Calls the RPC 'ORWU DT' and parses out the data.<br/>
 * to retrieve a current time.<br/><br/>
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param callback This will be called with the data retrieved from the RPC (or if there's an error).
 */
module.exports.getCurrentTime = function(logger, configuration, callback) {
    return RpcClient.callRpc(logger, configuration, 'ORWU DT', 'NOW', function(err, rpcData) {
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
