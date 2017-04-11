'use strict';

var parse = require('./lab-order-specimens-parser').parse;
var validate = require('./../utils/validation-util');
var rpcUtil = require('./../utils/rpc-util');
var _ = require('lodash');


/**
 * Calls the RPC 'ORWDLR32 ALLSPEC' repeatedly and parses out the data<br/><br/>
 *
 * <table border="1">
 *  <tr><th colspan=2><b>REQUIRED PARAMS</b></th></tr>
 *  <tr><th colspan=2><b>NONE</b></th></tr>
 * </table>
 * <br/>
 * <br/>
 *
 * <table border="1">
 *  <tr><th colspan=2><b>OPTIONAL PARAMS</b></th></tr>
 *  <tr><th colspan=2><b>NONE</b></th></tr>
 * </table>
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param callback This will be called with the array of data retrieved from multiple calls to the RPC (or if there's an error).
 * //@param params object which can contain optional and/or required parameters as described above.
 */
module.exports.fetch = function(logger, configuration, callback/*, params*/) {
    rpcUtil.callRpcRecursively(logger, configuration, 'ORWDLR32 ALLSPEC', parse, [], '', 'name', callback);
};


/**
 * Calls the RPC 'ORWDLR32 ALLSPEC' once and parses out the data to retrieve a list of 44 results at a time.<br/><br/>
 *
 * Each element is as follows:<br/>
 * 1. ien<br/>
 * 2. name  (SNOMED CODE)<br/>
 * The SNOMED CODE will appear inside parentheses.<br/>
 *
 * <table border="1">
 *  <tr><th colspan=2><b>REQUIRED PARAMS</b></th></tr>
 *  <tr><td colspan=2><b>NONE</b></td></tr>
 * </table>
 * <br/>
 * <br/>
 *
 * <table border="1">
 *  <tr><th colspan=2><b>OPTIONAL PARAMS</b></th></tr>
 *  <tr>
 *      <td>searchString</td>
 *      <td>
 *          used when an RPC call requires a minimum of 3 characters in order to return data<br/>
 *          This is not a filter - it is a search string.  For example, searching for RAD may return RADIACARE;<br/>
 *          however, searching for DIA will not return RADIACARE.  Also, the search term may not always be the<br/>
 *          first 3 characters.  For example, DIA will also return "CONTRAST MEDIA <DIAGNOSTIC DYES>".
 *      </td>
 *  </tr>
 * </table>
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param callback This will be called with the array of data retrieved from multiple calls to the RPC (or if there's an error).
 * @param params object which can contain optional and/or required parameters as described above.
 */
module.exports.fetchDirectRpcCall = function(logger, configuration, callback, params) {
    var searchString = _.get(params, 'searchString');

    logger.trace('Retrieving ORWDLR32 ALLSPEC data');
    if (validate.isStringNullish(searchString)) {
        searchString = '';
    }
    searchString = searchString.toUpperCase();
    return rpcUtil.standardRPCCall(logger, configuration, 'ORWDLR32 ALLSPEC', searchString, '1', parse, callback);
};
