'use strict';
var parse = require('./patient-select-parser').parse;
var nullUtil = require(global.VX_UTILS + '/null-utils');
var rpcUtil = require(global.VX_UTILS + '/rpc-util');
var _ = require('lodash');


module.exports.apiDocs = {
    spec: {
        summary: 'Selects patients by search criteria and returns basic patient and demographic information for patients found in search.',
        notes: 'HMP PATIENT SELECT',
        parameters: [
            {
                name: 'searchType',
                description: 'The type of search to perform. May be one of the following values: ' +
                            'LAST5 - "last5" format of ssn (i.e., patient\'s last intial + last4 of ssn) ' +
                            'NAME - search by patient name, can be partial name ' +
                            'ICN - select patient by ICN ' +
                            'PID - select patient by PID',
                type: 'string',
                required: true,
                paramType: 'query'
            },
            {
                name: 'searchString',
                description: 'Term to search for when looking up patient. Should match type specified in searchType.',
                type: 'string',
                required: true,
                paramType: 'query'
            }
        ],
        responseMessages: []
    }
};

/**
 * Checks to see if value is null, empty, or is not a String.  If any of those are true, this will return true.
 *
 * @param value The string to check for null, empty, or not a String
 * @returns {boolean} returns true if value is null, empty, or is not a String
 */
function isStringNullish(value) {
    return (nullUtil.isNullish(value) || value === '' || !_.isString(value) || _.isEmpty(value));
}

/**
 * Calls the RPC 'HMP PATIENT SELECT' and parses out the data - Selects patients by search criteria and returns basic
 * patient and demographic information for patients found in search.<br/><br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>REQUIRED PARAMS</b></th></tr>
 * 	<tr>
 * 		<td>searchType</td>
 * 		<td>
 * 			The type of search to perform. May be one of the following values:<br/>
 * 			<b>LAST5</b> - "last5" format of ssn (i.e., patient's last intial + last4 of ssn)<br/>
 * 			<b>NAME</b> - search by patient name, can be partial name<br/>
 * 			<b>ICN</b> - select patient by ICN<br/>
 * 			<b>PID</b> - select patient by PID
 * 		</td>
 * 	</tr>
 * 	<tr>
 * 		<td>searchString</td>
 * 		<td>
 * 			Term to search for when looking up patient. Should match type specified in searchType.
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
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param callback This will be called with the data retrieved from the RPC (or if there's an error).
 * @param params object which can contain optional and/or required parameters as described above.
 */
module.exports.fetch = function(logger, configuration, callback, params) {
    //This RPC is found in the following context - this context does not change and is specific to this RPC call.
    configuration.context = 'HMP UI CONTEXT';

	var searchString = params.searchString;
    var searchType = params.searchType;
    if (isStringNullish(searchString)) {
        return callback('searchString cannot be empty');
    }
    if (isStringNullish(searchType)) {
        return callback('searchType cannot be empty');
    }

    if (searchType !== 'LAST5' && searchType !== 'NAME' && searchType !== 'ICN' && searchType !== 'PID') {
        return callback('searchType must be "LAST5", "NAME", "ICN", or "PID"');
    }

    return rpcUtil.standardRPCCall(logger, configuration, 'HMP PATIENT SELECT', searchType, searchString, parse, callback);
};
