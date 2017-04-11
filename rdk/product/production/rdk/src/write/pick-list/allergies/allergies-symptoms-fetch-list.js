'use strict';

var rpcClientFactory = require('../utils/rpc-client-factory');
var parse = require('./allergies-symptoms-parser').parse;
var rpcUtil = require('./../utils/rpc-util');
var validate = require('./../utils/validation-util');
var _ = require('lodash');


/**
 * Calls the RPC 'ORWDAL32 SYMPTOMS' repeatedly and parses out the data to retrieve a list of symptoms.<br/><br/>
 *
 * Each element is as follows:<br/>
 * 1 = ien<br/>
 * 2 = synonym<br/>
 * 3 = name<br/>
 * Where there is not a third piece (from the RPC call), the name will be set to the synonym<br/>
 * Where there is a third piece, the synonym will contain a tab character followed by the &lt;name&gt; (same as 3rd field
 * surrounded by less than and greater than symbols).
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param callback This will be called with the array of data retrieved from multiple calls to the RPC (or if there's an error).
 * //@param params object which can contain optional and/or required parameters as described above.
 */
module.exports.fetch = function(logger, configuration, callback/*, params*/) {
    rpcUtil.callRpcRecursively(logger, configuration, 'ORWDAL32 SYMPTOMS', parse, [], '', 'synonym', callback);
};

/**
 * Calls the RPC 'ORWDAL32 SYMPTOMS' once and parses out the data to retrieve a list of 44 symptoms at a time.<br/><br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>REQUIRED PARAMS</b></th></tr>
 * 	<tr>
 * 		<td>searchString</td>
 * 		<td>
 * 			The location to start returning data from - call with an empty String to retrieve the start of the data.
 *          To retrieve the next set of 44 records, call this with the value contained in the 44th records "synonym" field.
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
 * Each element is as follows:<br/>
 * 1 = ien<br/>
 * 2 = synonym<br/>
 * 3 = name<br/>
 * Where there is not a third piece (from the RPC call), the name will be set to the synonym<br/>
 * Where there is a third piece, the synonym will contain a tab character followed by the &lt;name&gt; (same as 3rd field
 * surrounded by less than and greater than symbols).
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param callback This will be called with the array of data retrieved from multiple calls to the RPC (or if there's an error).
 * @param params object which can contain optional and/or required parameters as described above.
 */
module.exports.fetchDirectRpcCall = function(logger, configuration, callback, params) {
    var searchString = _.get(params, 'searchString');

    logger.trace('Retrieving allergies symptoms');
    if (validate.isStringNullish(searchString)) {
        searchString = '';
    }
    searchString = searchString.toUpperCase();
    return rpcUtil.standardRPCCall(logger, configuration, 'ORWDAL32 SYMPTOMS', searchString, '1', parse, callback);
};
