'use strict';

var rpcClientFactory = require('../utils/rpc-client-factory');
var parse = require('./lab-order-orderable-items-parser').parse;
var rpcUtil = require('./../utils/rpc-util');
var validate = require('./../utils/validation-util');
var _ = require('lodash');


/**
 * Calls the RPC 'ORWDX ORDITM' once and parses out the data to retrieve a list of 44 records at a time<br/><br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>REQUIRED PARAMS</b></th></tr>
 * 	<tr>
 * 		<td>labType</td>
 * 		<td>
 * 			The type of lab order for which to get a list of orderable items
 * 		</td>
 * 	</tr>
 * </table>
 * <br/>
 * <br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>OPTIONAL PARAMS</b></th></tr>
 * 	<tr>
 * 		<td>searchString</td>
 * 		<td>
 * 			The location to start returning data from - call with an empty String to retrieve the start of the data.<br/>
 *          To retrieve the next set of 44 records, call this with the value contained in the 44th records "synonym" field.<br/>
 *          used when an RPC call requires a minimum of 3 characters in order to return data<br/>
 * 			This is not a filter - it is a search string.  For example, searching for RAD may return RADIACARE;<br/>
 * 			however, searching for DIA will not return RADIACARE.  Also, the search term may not always be the<br/>
 * 			first 3 characters.  For example, DIA will also return "CONTRAST MEDIA <DIAGNOSTIC DYES>".
 * 		</td>
 * 	</tr>
 * </table>
 *
 * @param logger The logger.
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param callback This will be called with the array of data retrieved from multiple calls to the RPC (or if there's an error).
 * @param params object which can contain optional and/or required parameters as described above.
 */
module.exports.fetchDirectRpcCall = function(logger, configuration, callback, params) {
    logger.trace('lab-order-orderable-items-fetch-list.getLabOrderOrderableItemsDirectRpcCall(): entering method');

    var searchString = _.get(params, 'searchString');
    var labType = _.get(params, 'labType');


    if (validate.isStringNullish(labType)) {
        return callback('labType cannot be empty');
    }
    if (validate.isStringNullish(searchString)) {
        searchString = '';
    }

    searchString = searchString.toUpperCase();
    labType = labType.toUpperCase();

    return rpcUtil.standardRPCCall(logger, configuration, 'ORWDX ORDITM', searchString, '1', labType, parse, callback);
};

/**
 * Calls the RPC 'ORWDX ORDITM' repeatedly and parses out the data<br/><br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>REQUIRED PARAMS</b></th></tr>
 * 	<tr>
 * 		<td>searchString</td>
 * 		<td>
 * 			The location to start returning data from - call with an empty String to retrieve the start of the data.<br/>
 *          To retrieve the next set of 44 records, call this with the value contained in the 44th records "synonym" field.<br/>
 *          used when an RPC call requires a minimum of 3 characters in order to return data<br/>
 * 			This is not a filter - it is a search string.  For example, searching for RAD may return RADIACARE;<br/>
 * 			however, searching for DIA will not return RADIACARE.  Also, the search term may not always be the<br/>
 * 			first 3 characters.  For example, DIA will also return "CONTRAST MEDIA <DIAGNOSTIC DYES>".
 * 		</td>
 * 	</tr>
 * 	<tr>
 * 		<td>labType</td>
 * 		<td>
 * 			The type of lab order for which to get a list of orderable items
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
 *
 * @param logger The logger.
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param callback This will be called with the array of data retrieved from multiple calls to the RPC (or if there's an error).
 * @param params object which can contain optional and/or required parameters as described above.
 */
module.exports.fetch = function(logger, configuration, callback, params) {
    var labType = _.get(params, 'labType');

    if (!labType) {
        return callback('labType is a required parameter');
    }
    if (validate.isStringNullish(labType)) {
        return callback('labType cannot be empty');
    }

    rpcUtil.callRpcRecursively(logger, configuration, 'ORWDX ORDITM', parse, [], '', 'synonym', callback, labType.toUpperCase());
};
