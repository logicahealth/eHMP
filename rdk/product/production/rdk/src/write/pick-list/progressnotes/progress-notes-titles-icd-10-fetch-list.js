'use strict';
var parse = require('./progress-notes-titles-icd-10-parser').parse;
var rpcUtil = require('../utils/rpc-util');
var validate = require('../utils/validation-util');
var rpcClientFactory = require('../utils/rpc-client-factory');
var _ = require('lodash');

/**
 * Calls the RPC 'ORWLEX GETI10DX' and parses out the data<br/><br/>
 *
 * <table border='1'>
 * 	<tr><th colspan=2><b>REQUIRED PARAMS</b></th></tr>
 * 	    <tr>
 * 		<td>searchString</td>
 * 		<td>
 * 			used when an RPC call requires a minimum of 3 characters in order to return data<br/>
 * 			This is not a filter - it is a search string.  For example, searching for KNEE may return Pyogenic arthritis and icdCode M00.;<br/>
 * 			, searching for M00. will  return Staphylococcal arthritis and polyarthritis and icdCode M00.0
 * 		    And Searching for M00.0 will return Pyogenic arthritis
 * 		</td>
 * 	</tr>
 * </table>
 * <br/>
 * <br/>
 *
 * <table border='1'>
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
    var searchString = _.get(params, 'searchString');

    if (validate.isStringNullish(searchString)) {
        searchString = '';
    }
    searchString = searchString.toUpperCase();

    var rpcClient = rpcClientFactory.getClient(logger, configuration);

    rpcClient.execute('ORWLEX GETFREQ', searchString, function(error, rpcData) {
        if(error) {
            return callback(error, null);
        }

        if(rpcData >= 5000) {
            return callback('Your search '+searchString+' matched '+ rpcData + ' records, too many to Display. Refine your search', null);
        }

        return rpcUtil.standardRPCCall(logger, configuration, 'ORWLEX GETI10DX', searchString, parse, callback);

    });
};
