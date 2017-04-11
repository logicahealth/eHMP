'use strict';
var parse = require('./immunization-lot-parser').parse;
var rpcUtil = require('./../utils/rpc-util');
var validate = require('./../utils/validation-util');
var dateConverter = require('../../../utils/fileman-date-converter');
var _ = require('lodash');


/**
 * Calls the RPC 'PXVIMM IMM LOT' and parses out the data<br/><br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>REQUIRED PARAMS</b></th></tr>
 * 	<tr><td colspan=2><b>NONE</b></td></tr>
 * </table>
 * <br/>
 * <br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>OPTIONAL PARAMS</b></th></tr>
 * 	<tr>
 * 	    <td>filter</td>
 * 	    <td>
 * 	        Possible values are:<br/>
 * 	        R:XXX - Return entry with IEN XXX.<br/>
 * 	        H:XXX - Return entry with HL7 Code XXX.<br/>
 * 	        N:XXX - Return entry with #.01 field equal to XXX<br/>
 * 	        S:X   - Return all entries with a status of X.<br/><br/>
 *
 * 	        Possible values of X:<br/>
 * 	        A - Active Entries<br/>
 * 	        I - Inactive Entries<br/>
 * 	        B - Both active and inactive entries<br/><br/>
 *
 * 	        Defaults to "S:B".<br/><br/>
 *
 * 	        (NOTE: In re-reading the above, the intent is R:XXX returns IEN's - hence XXX is an IEN and not one
 * 	        of the A, I, or B entries that are possible values of X (which only apply to S:X).
 * 	        Similarly, N:XXX actually maps to name.)
 * 	    </td>
 * 	</tr>
 * 	<tr>
 * 	    <td>date</td>
 * 	    <td>
 * 	        Used for determining status (both for filtering and for return value).<br/><br/>
 *
 * 	        Defaults to NOW.
 * 	    </td>
 * 	</tr>
 * </table>
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param callback This will be called with the data retrieved from the RPC (or if there's an error).
 * @param params object which can contain optional and/or required parameters as described above.
 */
module.exports.fetch = function(logger, configuration, callback, params) {
    var filter = _.get(params, 'filter');
    if (!validate.isStringNullish(filter)) {
        var filterFields = filter.split(':');
        if (filterFields.length !== 2) {
            return callback('The filter parameter (if supplied) must contain 2 values separated by a colon');
        }

        if (filterFields[0] !== 'R' && filterFields[0] !== 'H' && filterFields[0] !== 'N' && filterFields[0] !== 'S') {
            return callback('The filter parameter (if supplied) must start with R, H, N, or S');
        }

        //If 'S', then the second field can only be 'A', 'I', or 'B'.
        if (filterFields[0] === 'S') {
            if (filterFields[1] !== 'A' && filterFields[1] !== 'I' && filterFields[1] !== 'B') {
                return callback('The filter parameter (if supplied) must end with A, I, or B');
            }
        }
        else {
            if (!validate.isStringNullish(filterFields[1])) {
                return callback('The filter parameter (if supplied) must contain a string after the colon');
            }
        }
    }

    var date = _.get(params, 'date');
    if (date) {
        date = dateConverter.getFilemanDateWithArgAsStr(date);
    }

    return rpcUtil.standardRPCCall(logger, configuration, 'PXVIMM IMM LOT', filter, date, parse, callback);
};
