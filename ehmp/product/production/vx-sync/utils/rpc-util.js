'use strict';
var _ = require('lodash');
var nullUtil = require('./null-utils');
var rpcClientFactory = require('./rpc-client-factory');

//----------------------------------------------------------------------------------------------------------------------
//                               Calling RPC's in a standard way
//----------------------------------------------------------------------------------------------------------------------
/**
 * Calls a VistA RPC and returns the data.  parameters can be zero or more arguments.
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param rpcName the name of the RPC to call
 * @param parameters the parameters to pass to the RPC (can be zero or more parameters).
 * @param parse This will be called with the data retrieved from the RPC to parse into JSON.
 * @param callback This will be called with the parsed json data retrieved from the RPC (or if there's an error).
 */
module.exports.standardRPCCall = function(logger, configuration, rpcName, parameters, parse, callback) {
    callback = arguments[arguments.length - 1];
    parse = arguments[arguments.length - 2];

    //The following code is a close duplication of the code in VistaJS.callRpc for validation.
    if (!rpcName) {
        logger.error('rpc-util.standardRPCCall error no rpcName parameter was passed to standardRPCCall()');
        return callback('no rpc parameter was passed to standardRPCCall()');
    }

    if (!configuration) {
        logger.error('rpc-util.standardRPCCall error RPC (' + rpcName + '): No configuration was passed to standardRPCCall()');
        return callback('No configuration was passed to standardRPCCall()');
    }

    if (!configuration.host) {
        logger.error('rpc-util.standardRPCCall error RPC (' + rpcName + '): No host was found in the configuration');
        return callback('No host was found in the configuration');
    }

    if (arguments.length < 5) {
        logger.error('rpc-util.standardRPCCall error RPC (' + rpcName + '): Invalid number of arguments passed to standardRPCCall()');
        return callback('Invalid number of arguments passed to standardRPCCall()');
    }

    if (!(arguments[arguments.length - 1] instanceof Function)) {
        logger.error('rpc-util.standardRPCCall error RPC (' + rpcName + '): No callback function was passed to standardRPCCall()');
        return callback('No callback function was passed to standardRPCCall()');
    }

    var params = [];
    if (arguments.length > 5) {
        var args = _.toArray(arguments);
        params = _.map(args.slice(3, args.length - 2), function(param) {
            return param;
        });
    }

    logger.debug('rpc-util.standardRPCCall RPC (' + rpcName + '): params: ' + JSON.stringify(params, null, 2));

    params = _.flatten(params, true);
    params = _.filter(params, function(param) {
        return param !== null && param !== undefined;
    });

    logger.debug('rpc-util.standardRPCCall RPC (' + rpcName + '): params flattened and filtered: ' + JSON.stringify(params, null, 2));
    //End the following code is a close duplication of the code in VistaJS.callRpc for validation.

    var rpcClient = rpcClientFactory.getClient(logger, configuration);

    rpcClient.execute(rpcName, params, function(err, rpcData) {
        if (err) {
            logger.error('rpc-util.standardRPCCall error RPC (' + rpcName + '): ' + err);
            return callback(err);
        }

        try {
            logger.debug('rpc-util.standardRPCCall RPC (' + rpcName + ') data returned from RPC: ' + rpcData);
            var obj = rpcData;
            if(parse) {
                obj = parse(logger, rpcData);
            }

            if (nullUtil.isNullish(obj)) {
                logger.info('rpc-util.standardRPCCall RPC (' + rpcName + ') parsed JSON: was nullish');
            }
            else {
                logger.debug('rpc-util.standardRPCCall RPC (' + rpcName + ') parsed JSON: ' + JSON.stringify(obj, null, 2));
            }

            callback(null, obj);
        }
        catch (parseError) {
            logger.error('rpc-util.standardRPCCall error parsing RPC (' + rpcName + '): ' + (parseError.message || parseError));
            return callback((parseError.message || parseError));
        }
    });
};
