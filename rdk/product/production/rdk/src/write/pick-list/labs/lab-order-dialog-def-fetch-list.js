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
 * @param params object which can contain optional parameters.
 */
module.exports.fetch = function(logger, configuration, callback, params) {
    var location = _.get(params, 'location');
    var division = _.get(params, 'division');

    return rpcUtil.standardRPCCall(logger, configuration, 'ORWDLR32 DEF', location, division , parse, callback);
};
