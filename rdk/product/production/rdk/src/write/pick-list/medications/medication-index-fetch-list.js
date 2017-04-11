'use strict';
var parse = require('./medication-index-parser').parse;
var validate = require('./../utils/validation-util');
var rpcUtil = require('./../utils/rpc-util');
var _ = require('lodash');


/**
 * Calls the RPC 'ORWUL FVIDX' and parses out the data to get the index of a medication that meets a search term<br/><br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>REQUIRED PARAMS</b></th></tr>
 * 	<tr>
 * 		<td>ien</td>
 * 		<td>
 * 			There is differing opinions on where this IEN comes from<br/>
 *          One source says it comes from rpc 'ORWUL FV4DG'<br/>
 *          Another source says the following:<br/>
 *          Examples:  31 = O RX (Outpatient Meds), 32 = UD RX (Unit Dose – Inpatient Meds).
 *          There is no RPC that retrieves this IEN.  It is hardcoded in CPRS GUI code and passed as a literal string input.
 *          Use the quickViewIen 31 for Outpatient Medications.
 * 		</td>
 * 	</tr>
 * 	<tr>
 * 		<td>searchString</td>
 * 		<td>
 * 			The location to start returning data from - call with an empty String to retrieve all of the data.<br/>
 *          searchString is used when an RPC call requires a minimum of 3 characters in order to return data<br/>
 *          This is not a filter - it is a search string.  For example, searching for RAD may return RADIACARE; however, searching for
 *          DIA will not return RADIACARE.  Also, the search term may not always be the first 3 characters.  For example,
 *          DIA will also return "CONTRAST MEDIA <DIAGNOSTIC DYES>".
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
 * Each element is as follows:<br/>
 * ien<br/>
 * name
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param callback This will be called with the data retrieved from the RPC (or if there's an error).
 * @param params object which can contain optional and/or required parameters as described above.
 */
module.exports.fetch = function(logger, configuration, callback, params) {
    var ien = _.get(params, 'ien');
    var searchString = _.get(params, 'searchString');

    if (!validate.isWholeNumber(ien)) {
        return callback('ien cannot be empty, must be a whole number, and it must be obtained from a call to \'ORWUL FV4DG\' (ex. 31 = O RX = Outpatient Meds).');
    }
    if (validate.isStringLessThan3Characters(searchString)) {
        return callback('searchString is a required parameter and must contain 3 or more characters');
    }

    searchString = searchString.toUpperCase();

    return rpcUtil.standardRPCCall(logger, configuration, 'ORWUL FVIDX', ien, searchString, parse, callback);
};
