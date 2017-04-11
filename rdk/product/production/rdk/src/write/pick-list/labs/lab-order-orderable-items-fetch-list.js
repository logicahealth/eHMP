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
    logger.info('lab-order-orderable-items-fetch-list.getLabOrderOrderableItemsDirectRpcCall(): entering method');

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
 * Calls the RPC 'ORWDX ORDITM' repeatedly and parses out the data.<br/><br/>
 *
 * If there are more than 44 results, we get back exactly 44 records. At that point, we call the exact same RPC call
 * again passing in the value of the name from the last record (the 44th record).<br/>
 * This will continue until we receive less than 44 records.<br/><br/>
 *
 * FOR MORE INFORMATION ON RPC PAGINATION WITH 44 RECORDS, LOOK AT &quot;rpc-util.removeExistingEntriesFromRPCResult&quot;<br/><br/>
 *
 * Because of pagination with this RPC call, it is a recursive function.<br/>
 * For those worried about recursive functions, it took 2283 recursive calls to an RPC before it blew up
 * with the Maximum call stack size exceeded on my machine (tested multiple times). That means 100,452 individual records
 * would need to be coming back to a pick list before you would ever run into an issue (something that would never happen).
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param retValue An array that will be populated by the recursive function - this array will be passed to the callback.
 * @param labType - The type of lab order for which to get a list of orderable items
 * @param searchString The location to start returning data from - call with an empty String to retrieve all of the data.
 * @param callback This will be called with the array of data retrieved from multiple calls to the RPC (or if there's an error).
 */
function callRpcRecursively(logger, configuration, retValue, searchString, labType, callback) {
    logger.debug('callRpc4LabOrderOrderableItems(): entering method: searchString=' + searchString + ', labType=' + labType);

    var rpcClient = rpcClientFactory.getClient(logger, configuration);

    rpcClient.execute('ORWDX ORDITM', searchString, '1', labType, function(err, rpcData) {
        if (err) {
            return callback(err.message || err);
        }
        if (validate.isStringNullish(rpcData)) {
            return callback('rpc did not return any data');
        }

        var MAX_RPC_RESULTS_RETURNED = 44;
        try {
            logger.debug(rpcData);
            var obj = parse(logger, rpcData);

            var localStartName = obj.length > 0 ? _.last(obj).synonym : null;

            var callAgain = false;
            if (obj.length === MAX_RPC_RESULTS_RETURNED) {
                callAgain = true;
            }

            obj = rpcUtil.removeExistingEntriesFromRPCResult(logger, retValue, obj);

            retValue = retValue.concat(obj);

            if (callAgain) {
                callRpcRecursively(logger, configuration, retValue, localStartName, labType, callback);
                return;
            }
        }
        catch (parseAndRpcUtilError) {
            return callback(parseAndRpcUtilError.message || parseAndRpcUtilError);
        }

        callback(null, retValue);
    });
}

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

    callRpcRecursively(logger, configuration, [], '', labType.toUpperCase(), callback);
};
