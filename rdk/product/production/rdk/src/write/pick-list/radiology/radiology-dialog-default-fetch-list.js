'use strict';
var parse = require('./radiology-dialog-default-parser').parse;
var rpcUtil = require('./../utils/rpc-util');
var validate = require('./../utils/validation-util');
var _ = require('lodash');


/**
 * Calls the RPC 'ORWDRA32 DEF' and parses out the data<br/><br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>REQUIRED PARAMS</b></th></tr>
 * 	<tr>
 * 		<td>patientDFN</td>
 * 		<td>The patient's DFN</td>
 * 	</tr>
 * 	<tr>
 * 		<td>imagingType</td>
 * 		<td>The imaging type</td>
 * 	</tr>
 * </table>
 * <br/>
 * <br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>OPTIONAL PARAMS</b></th></tr>
 * 	<tr>
 * 		<td>anEventDiv</td>
 * 		<td>An Event Div</td>
 * 	</tr>
 * </table>
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param callback This will be called with the data retrieved from the RPC (or if there's an error).
 * @param params object which can contain optional and/or required parameters as described above.
 */
module.exports.fetch = function(logger, configuration, callback, params) {
	var patientDFN = _.get(params, 'patientDFN');
    var anEventDiv = _.get(params, 'anEventDiv');
    var imagingType = _.get(params, 'imagingType');

    if (!validate.isWholeNumber(patientDFN)) {
        return callback('patientDFN cannot be empty and must be a whole number');
    }
    if (!validate.isWholeNumber(imagingType)) {
        return callback('imagingType cannot be empty and must be a whole number');
    }
    if (validate.isStringNullish(anEventDiv)) {
        anEventDiv = '';
    }

    anEventDiv = anEventDiv.toUpperCase();

    return rpcUtil.standardRPCCall(logger, configuration, 'ORWDRA32 DEF', patientDFN, anEventDiv, imagingType, parse, callback);
};
