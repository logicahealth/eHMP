'use strict';
var parse = require('./encounters-visit-service-connected-parser').parse;
var validate = require('./../utils/validation-util');
var rpcUtil = require('./../utils/rpc-util');
var dateConverter = require('../../../utils/fileman-date-converter');
var _ = require('lodash');


/**
 * Calls the RPC 'ORWPCE SCSEL' and parses out the data.<br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>REQUIRED PARAMS</b></th></tr>
 * 	<tr>
 * 		<td>dfn</td>
 * 		<td>The dfn</td>
 * 	</tr>
 * 	<tr>
 * 		<td>visitDate</td>
 * 		<td>The visitDate</td>
 * 	</tr>
 * 	<tr>
 * 		<td>loc</td>
 * 		<td>The loc</td>
 * 	</tr>
 * </table>
 * <br/>
 * <br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>OPTIONAL PARAMS</b></th></tr>
 * 	<tr><td colspan=2><b>NONE</b></td></tr>
 * </table>
 * <br/><br/>
 *
 * input: DFN, VisitDate.Time, locIEN<br/>
 *
 * output: 0^;0^;0^;0^;0^;0^;0^;0<br/>
 *         SC^;CV^;AO^;IR^;SAC^;SHD^;MST^;HNC<br/>
 *         1 = Allowed, 0 = No<br/>
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param callback This will be called with the data retrieved from the RPC (or if there's an error).
 * @param params object which can contain optional and/or required parameters as described above.
 */
module.exports.fetch = function(logger, configuration, callback, params) {
    var dfn = _.get(params, 'dfn');
    var visitDate = _.get(params, 'visitDate');
    var loc = _.get(params, 'loc');

    if (validate.isStringNullish(dfn)) {
        return callback('dfn Cannot be Empty');
    }
    if (validate.isStringNullish(visitDate)) {
        return callback('visitDate Cannot be Empty');
    }
    if (validate.isStringNullish(loc)) {
        return callback('loc Cannot be Empty');
    }

    visitDate = dateConverter.getFilemanDateWithArgAsStr(visitDate);

    return rpcUtil.standardRPCCall(logger, configuration, 'ORWPCE SCSEL', dfn, visitDate, loc, parse, callback);
};
