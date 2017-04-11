'use strict';
var parse = require('./medication-orders-default-days-parser-object').parse;
var validate = require('./../utils/validation-util');
var rpcUtil = require('./../utils/rpc-util');
var _ = require('lodash');


/**
 * Calls the RPC 'ORWDPS1 DFLTSPLY' and parses out the data<br/><br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>REQUIRED PARAMS</b></th></tr>
 * 	<tr>
 * 		<td>unitStr</td>
 * 		<td>A String</td>
 * 	</tr>
 * 	<tr>
 * 		<td>schedStr</td>
 * 		<td>A String</td>
 * 	</tr>
 * 	<tr>
 * 		<td>patientDFN</td>
 * 		<td>The patients dfn</td>
 * 	</tr>
 * 	<tr>
 * 		<td>drug</td>
 * 		<td>A drug</td>
 * 	</tr>
 * 	<tr>
 * 		<td>oi</td>
 * 		<td>A Number</td>
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
	var unitStr = _.get(params, 'unitStr');
    var schedStr = _.get(params, 'schedStr');
    var patientDFN = _.get(params, 'patientDFN');
    var drug = _.get(params, 'drug');
    var oi = _.get(params, 'oi'); //num

    if (validate.isStringNullish(unitStr)) {
        return callback('unitStr cannot be empty');
    }
    if (validate.isStringNullish(schedStr)) {
        return callback('schedStr cannot be empty');
    }
    if (validate.isStringNullish(patientDFN)) {
        return callback('patientDFN cannot be empty');
    }
    if (validate.isStringNullish(drug)) {
        return callback('drug cannot be empty');
    }
    if (!validate.isWholeNumber(oi)) {
        return callback('oi cannot be empty and must be a whole number');
    }

    unitStr = unitStr.toUpperCase();
    schedStr = schedStr.toUpperCase();
    patientDFN = patientDFN.toUpperCase();
    drug = drug.toUpperCase();

	return rpcUtil.standardRPCCall(logger, configuration, 'ORWDPS1 DFLTSPLY', unitStr, schedStr, patientDFN, drug, oi, parse, callback);
};
