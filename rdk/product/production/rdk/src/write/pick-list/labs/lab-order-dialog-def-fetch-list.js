'use strict';
var parse = require('./lab-order-dialog-def-parser').parse;
var rpcUtil = require('./../utils/rpc-util');
var _ = require('lodash');

/**
 * Calls the RPC 'ORWDLR32 DEF' and parses out the data<br/><br/>
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param callback This will be called with the data retrieved from the RPC (or if there's an error).
 * @param params Object containing required/optional parameters (e.g. division)
 */
module.exports.fetch = function(logger, configuration, callback, params) {
    var location = _.get(params, 'location');
    var division = _.get(params, 'division');

    if (!_.isEmpty(division)) {
        // Internally RPC 'ORWDLR32 DEF' does not use the division parameter. For it to return division specific values
        // it needs to be set in the configuration object so that it is set in the RPC Client as part of the connection
        // context (XUS DIVISION SET).
        configuration.division = division;
    }

    if (!location) {
        return callback('location for Lab Order Dialog Cannot be Empty');
    }
    return rpcUtil.standardRPCCall(logger, configuration, 'ORWDLR32 DEF', location, parse, callback);
};
