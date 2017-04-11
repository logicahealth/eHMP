'use strict';
var parse = require('./medication-orders-calc-max-refills-parser-object').parse;
var validate = require('./../utils/validation-util');
var rpcUtil = require('./../utils/rpc-util');
var _ = require('lodash');


/**
 * Calls the RPC 'ORWDPS2 MAXREF' and parses out the data<br/><br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>REQUIRED PARAMS</b></th></tr>
 * 	<tr>
 * 		<td>patientDFN</td>
 * 		<td>The patient DFN</td>
 * 	</tr>
 * 	<tr>
 * 		<td>drug</td>
 * 		<td>The drug</td>
 * 	</tr>
 *
 * 	<tr>
 * 		<td>days</td>
 * 		<td>The days</td>
 * 	</tr>
 *
 * 	<tr>
 * 		<td>ordItem</td>
 * 		<td>The ordItem</td>
 * 	</tr>
 *
 * 	<tr>
 * 		<td>discharge</td>
 * 		<td>Boolean on whether to discharge</td>
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
    var patientDFN = _.get(params, 'patientDFN');
    var drug = _.get(params, 'drug');
    var days = _.get(params, 'days');
    var ordItem = _.get(params, 'ordItem');
    var discharge = Boolean(_.get(params, 'discharge')); //Wrap with Boolean to force a default value instead of undefined.

    if (validate.isStringNullish(patientDFN)) {
        return callback('patientDFN cannot be empty');
    }
    if (validate.isStringNullish(drug)) {
        return callback('drug cannot be empty');
    }
    if (validate.isStringNullish(days)) {
        return callback('days cannot be empty');
    }
    if (validate.isStringNullish(ordItem)) {
        return callback('ordItem cannot be empty');
    }

    patientDFN = patientDFN.toUpperCase();
    drug = drug.toUpperCase();
    days = days.toUpperCase();
    ordItem = ordItem.toUpperCase();

    discharge = rpcUtil.convertBooleanToYN(discharge);

	return rpcUtil.standardRPCCall(logger, configuration, 'ORWDPS2 MAXREF', patientDFN, drug, days, ordItem, discharge, parse, callback);
};
