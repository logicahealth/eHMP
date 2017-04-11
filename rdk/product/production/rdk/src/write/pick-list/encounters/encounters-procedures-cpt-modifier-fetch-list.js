'use strict';
var parse = require('./encounters-procedures-cpt-modifier-parser').parse;
var rpcUtil = require('./../utils/rpc-util');
var dateConverter = require('../../../utils/fileman-date-converter');
var _ = require('lodash');


/**
 * Calls the RPC 'ORWPCE CPTMODS' and parses out the data<br/><br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>REQUIRED PARAMS</b></th></tr>
 * 	<tr>
 * 		<td>cpt</td>
 * 		<td>
 * 			The CPT code you want to look up modifiers for.
 * 		</td>
 * 	</tr>
 * </table>
 * <br/>
 * <br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>OPTIONAL PARAMS</b></th></tr>
 * 	<tr>
 * 		<td>visitDate</td>
 * 		<td>
 * 			The date of the visit/encounter
 * 		</td>
 * 	</tr>
 * </table>
 * <br/><br/>
 *
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param callback The function to call when done.
 * @param params object which can contain optional and/or required parameters as described above.
 */
module.exports.fetch = function(logger, configuration, callback, params) {
    var cpt = _.get(params, 'cpt');
    var visitDate = _.get(params, 'visitDate');

    if (!cpt) {
        return callback('cpt is a required parameter');
    }
    if (visitDate) {
        visitDate = dateConverter.getFilemanDateWithArgAsStr(visitDate);
    }
    return rpcUtil.standardRPCCall(logger, configuration, 'ORWPCE CPTMODS', cpt, visitDate, parse, callback);
};
