'use strict';

var rpcClientFactory = require('../utils/rpc-client-factory');
var parse = require('./new-persons-parser').parse;
var removeExistingEntriesFromRPCResult = require('./../utils/rpc-util').removeExistingEntriesFromRPCResult;
var validate = require('./../utils/validation-util');
var rpcUtil = require('./../utils/rpc-util');
var _ = require('lodash');
var dateConverter = require('../../../utils/fileman-date-converter');

/**
 * Calls the RPC 'ORWU NEWPERS' repeatedly and parses out the data.<br/><br/>
 *
 * If the RPC supports pagination, and there are more than 44 results in VistA, you typically get back exactly 44 records
 * (though you can get more - see below).
 * At that point, we call the exact same RPC call again passing in the value of the name from the last record
 * (typically the 44th record).<br/>
 * This will continue until we receive less than 44 records.<br/>
 * Typically, you will receive exactly 44 records back; however, it is possible to get more than 44 records
 * back when making the same RPC call with some searchString's but not others.<br/>
 * Suppose you had 113 records all with the same name in VistA and you requested a record that was the one prior to this, you'd
 * probably expect to get 44 records back (with 43 of them having identical names) but would in fact receive 114 records
 * (the one before plus the 113 with the same name).<br/>
 * Suppose record 44 was the start of those 113 records, you'd get 157 records back.<br/><br/>
 *
 * FOR MORE INFORMATION ON RPC PAGINATION WITH 44+ RECORDS, LOOK AT &quot;rpc-util.removeExistingEntriesFromRPCResult&quot;<br/><br/>
 *
 * Because of pagination with this RPC call, it is a recursive function.<br/>
 * For those worried about recursive functions, it took 2283 recursive calls to an RPC before it blew up
 * with the Maximum call stack size exceeded on my machine (tested multiple times). That means 100,452 individual records
 * would need to be coming back to a pick list before you would ever run into an issue (something that would never happen).
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param retValue An array that will be populated by the recursive function - this array will be passed to the callback.
 * @param searchString The location to start returning data from - call with an empty String to retrieve all of the data.
 * @param callback This will be called with the array of data retrieved from multiple calls to the RPC (or if there's an error).
 * @param params Object which can contain optional and/or required parameters.
 */
function callRpcRecursively(logger, configuration, retValue, searchString, callback, params) {
    var newPersonsType = '';
    var date = _.get(params, 'date');

    if (!validate.isWholeNumber(date)) {
        date = null;
    }
    if (date) {
        date = dateConverter.getFilemanDateWithArgAsStr(date);
    }

    var rpcClient = rpcClientFactory.getClient(logger, configuration);

    rpcClient.execute('ORWU NEWPERS', searchString, '1', newPersonsType, date, function(err, rpcData) {
        if (err) {
            return callback(err.message || err);
        }
        if (validate.isStringNullish(rpcData) && retValue.length <= 0) {
            return callback('rpc did not return any data');
        }

        var MAX_RPC_RESULTS_RETURNED = 44; //RPC calls will return no more than 44 records if they support pagination (see javadoc).
        try {
            logger.debug(rpcData);
            var obj = parse(logger, rpcData);

            var localStartName = obj.length > 0 ? _.last(obj).name : null;

            var callAgain = false;
            if (obj.length >= MAX_RPC_RESULTS_RETURNED) {
                callAgain = true;
            }

            obj = removeExistingEntriesFromRPCResult(logger, retValue, obj);

            retValue = retValue.concat(obj);

            if (callAgain) {
                callRpcRecursively(logger, configuration, retValue, localStartName, callback, params);
                return;
            }
        }
        catch (parseAndRpcUtilError) {
            return callback(parseAndRpcUtilError.message || parseAndRpcUtilError);
        }

        logger.info('count of retValue symptoms: ' + retValue.length);
        logger.info({retValue: retValue});
        callback(null, retValue);
    });
}

/**
 * Calls the RPC 'ORWU NEWPERS' repeatedly and parses out the data<br/><br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>REQUIRED PARAMS</b></th></tr>
 * 	<tr><td colspan=2><b>NONE</b></td></tr>
 * </table>
 * <br/>
 * <br/>
 *
 * <table border="1">
 *  <tr><th colspan=2><b>OPTIONAL PARAMS</b></th></tr>
 *  <tr>
 *      <td>newPersonsType</td>
 *      <td>
 *          If not supplied, it will default to an empty string.
 *      </td>
 *  </tr>
 *  <tr>
 *      <td>dateTime</td>
 *      <td>
 *          just passes it directly through no matter what it is
 *      </td>
 *  </tr>
 * </table>
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param callback This will be called with the array of data retrieved from multiple calls to the RPC (or if there's an error).
 * @param params Object which can contain optional and/or required parameters as described above.
 */
module.exports.fetch = function(logger, configuration, callback, params) {
    var retValue = [];
    logger.info('Retrieving ORWU NEWPERS data');
    callRpcRecursively(logger, configuration, retValue, '', callback, params);
};


/**
 * Calls the RPC 'ORWU NEWPERS' once and parses out the data to retrieve a list of 44 results at a time.<br/><br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>REQUIRED PARAMS</b></th></tr>
 * 	<tr>
 * 		<td>searchString</td>
 * 		<td>
 * 			used when an RPC call requires a minimum of 3 characters in order to return data<br/>
 * 			This is not a filter - it is a search string.  For example, searching for RAD may return RADIACARE;<br/>
 * 			however, searching for DIA will not return RADIACARE.  Also, the search term may not always be the<br/>
 * 			first 3 characters.  For example, DIA will also return "CONTRAST MEDIA <DIAGNOSTIC DYES>".
 * 		</td>
 * 	</tr>
 * </table>
 * <br/>
 * <br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>OPTIONAL PARAMS</b></th></tr>
 *  <tr>
 * 		<td>newPersonsType</td>
 * 		<td>
 * 			If not supplied, it will default to an empty string.
 * 		</td>
 * 	</tr>
 * 	<tr>
 * 		<td>dateTime</td>
 * 		<td>
 * 			just passes it directly through no matter what it is
 * 		</td>
 * 	</tr>
 * </table>
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param callback This will be called with the array of data retrieved from multiple calls to the RPC (or if there's an error).
 * @param params object which can contain optional and/or required parameters as described above.
 */
module.exports.fetchDirectRpcCall = function(logger, configuration, callback, params) {
    var searchString = _.get(params, 'searchString');
    var newPersonsType = _.get(params, 'newPersonsType');
    var dateTime = _.get(params, 'dateTime');


    if (!validate.isStringNullish(searchString)) {
        searchString = searchString.toUpperCase();
    }
    else {
        searchString = '';
    }

    if (newPersonsType === undefined) {
        newPersonsType = '';
    }

    return rpcUtil.standardRPCCall(logger, configuration, 'ORWU NEWPERS', searchString, '1', newPersonsType, dateTime, parse, callback);
};
