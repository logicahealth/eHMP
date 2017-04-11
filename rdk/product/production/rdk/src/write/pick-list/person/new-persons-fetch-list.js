'use strict';

var rpcClientFactory = require('../utils/rpc-client-factory');
var parse = require('./new-persons-parser').parse;
var validate = require('./../utils/validation-util');
var rpcUtil = require('./../utils/rpc-util');
var _ = require('lodash');
var dateConverter = require('../../../utils/fileman-date-converter');


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
    var newPersonsType = '';
    var date = _.get(params, 'date');

    if (!validate.isWholeNumber(date)) {
        date = null;
    }
    if (date) {
        date = dateConverter.getFilemanDateWithArgAsStr(date);
    }

    logger.trace('Retrieving ORWU NEWPERS data');
    rpcUtil.callRpcRecursively(logger, configuration, 'ORWU NEWPERS', parse, [], '', 'name', callback, [newPersonsType, date]);
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
