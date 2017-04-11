'use strict';
var parse = require('./lab-time-valid-immediate-collect-time-parser').parse;
var rpcUtil = require('./../utils/rpc-util');
var validate = require('./../utils/validation-util');
var _ = require('lodash');


/**
 * Calls the RPC 'ORWDLR32 IC VALID' and parses out the data<br/><br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>REQUIRED PARAMS</b></th></tr>
 * 	<tr>
 * 		<td>time</td>
 * 		<td>Determines whether the supplied time is a valid lab immediate collect time.</td>
 * 	</tr>
 * </table>
 * <br/>
 * <br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>OPTIONAL PARAMS</b></th></tr>
 * 	<tr><td colspan=2><b>NONE</b></td></tr>
 * </table>
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param callback This will be called with the data retrieved from the RPC (or if there's an error).
 * @param params object which can contain optional and/or required parameters as described above.
 */
module.exports.fetch = function(logger, configuration, callback, params) {
    var time = _.get(params, 'time');
    if (validate.isStringNullish(time)) {
        return callback('time cannot be empty');
    }

    return rpcUtil.standardRPCCall(logger, configuration, 'ORWDLR32 IC VALID', time, parse, callback);
};
