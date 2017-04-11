'use strict';
var parse = require('./medication-orders-dispense-drug-message-parser').parse;
var validate = require('./../utils/validation-util');
var rpcUtil = require('./../utils/rpc-util');
var _ = require('lodash');


/**
 * Calls the RPC 'ORWDPS32 DRUGMSG' and parses out the data<br/><br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>REQUIRED PARAMS</b></th></tr>
 * 	<tr>
 * 		<td>ien</td>
 * 		<td>The ien of the drug you want the message for</td>
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
	var ien = _.get(params, 'ien');

    if (!validate.isWholeNumber(ien)) {
        return callback('ien cannot be empty and must be a whole number');
    }

    return rpcUtil.standardRPCCall(logger, configuration, 'ORWDPS32 DRUGMSG', ien, parse, callback);
};
