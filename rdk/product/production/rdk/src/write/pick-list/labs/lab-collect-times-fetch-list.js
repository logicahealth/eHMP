'use strict';
var parse = require('./lab-collect-times-parser').parse;
var rpcUtil = require('./../utils/rpc-util');
var _ = require('lodash');

/**
 * Calls the RPC 'ORWDLR32 IMMED COLLECT' and parses out the data.<br/>
 * to retrieve a list of lab collection times<br/><br/>
 *
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param callback This will be called with the data retrieved from the RPC (or if there's an error).
 * @param params Object containing required/optional parameters (e.g. division)
 */
module.exports.fetch = function(logger, configuration, callback, params) {
    var division = _.get(params, 'division');

    if (!_.isEmpty(division)) {
        // Set the division in the configuration object so that it is set in the RPC Client as part of the connection
        // context (XUS DIVISION SET) and we get results for that division.
        configuration.division = division;
    }

    return rpcUtil.standardRPCCall(logger, configuration, 'ORWDLR32 IMMED COLLECT', parse, callback);
};
