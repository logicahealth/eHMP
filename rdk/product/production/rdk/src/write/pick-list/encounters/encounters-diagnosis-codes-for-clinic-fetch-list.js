'use strict';
var parse = require('./encounters-diagnosis-codes-for-clinic-parser').parse;
var rpcUtil = require('./../utils/rpc-util');
var validate = require('./../utils/validation-util');
var _ = require('lodash');


/**
 * Calls the RPC 'ORWPCE DIAG' and parses out the data<br/><br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>REQUIRED PARAMS</b></th></tr>
 * 	<tr>
 * 		<td>clinic</td>
 * 		<td>
 * 			The clinic to get diagnostic code for
 * 		</td>
 * 	</tr>
 * </table>
 * <br/>
 * <br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>OPTIONAL PARAMS</b></th></tr>
 * 	<tr><td colspan=2><b>NONE</b></td></tr>
 * </table>
 * <br/><br/>
 *
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param callback This will be called with the data retrieved from the RPC (or if there's an error).
 * @param params object which can contain optional and/or required parameters as described above.
 */
module.exports.fetch = function(logger, configuration, callback, params) {
    var clinic = _.get(params, 'clinic');

    if (!validate.isWholeNumber(clinic)) {
        return callback('Clinic cannot be empty.');
    }

    return rpcUtil.standardRPCCall(logger, configuration, 'ORWPCE DIAG', clinic, parse, callback);
};
