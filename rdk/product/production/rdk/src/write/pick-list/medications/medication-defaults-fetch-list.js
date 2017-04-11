'use strict';
var parse = require('./medication-defaults-parser').parse;
var validate = require('./../utils/validation-util');
var rpcUtil = require('./../utils/rpc-util');
var _ = require('lodash');


/**
 * Calls the RPC 'ORWDPS1 ODSLCT' and parses out the data to retrieve values for medication dialog<br/><br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>REQUIRED PARAMS</b></th></tr>
 * 	<tr>
 * 		<td>pharmacyType</td>
 * 		<td>Pharmacy Type (U = Unit Dose, F = IV Fluids, and O = Outpatient)</td>
 * 	</tr>
 * </table>
 * <br/>
 * <br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>OPTIONAL PARAMS</b></th></tr>
 *  <tr>
 * 		<td>outpatientDfn</td>
 * 		<td>Patient DFN</td>
 * 	</tr>
 * 	<tr>
 * 		<td>locationIen</td>
 * 		<td>Encounter Location</td>
 * 	</tr>
 * </table>
 *
 * Each element is as follows:<br/>
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param callback This will be called with the data retrieved from the RPC (or if there's an error).
 * @param params object which can contain optional and/or required parameters as described above.
 */
module.exports.fetch = function(logger, configuration, callback, params) {
    var pharmacyType = _.get(params, 'pharmacyType');
    var outpatientDfn = _.get(params, 'outpatientDfn');
    var locationIen = _.get(params, 'locationIen');

    if (validate.isStringNullish(pharmacyType)) {
        return callback('pharmacyType cannot be empty and it must be \'U\', \'F\', or \'O\'');
    }
    if (validate.isStringNullish(outpatientDfn)) {
        outpatientDfn = null;
    }
    if (!validate.isWholeNumber(locationIen)) {
        locationIen = null;
    }

    pharmacyType = pharmacyType.toUpperCase();

    //NOTE: If more types are supported, add them with documentation in the Javadoc as to what those types represent.
    if (pharmacyType !== 'U' && pharmacyType !== 'F' && pharmacyType !== 'O') {
        return callback('view must be \'U\', \'F\', or \'O\'');
    }

    return rpcUtil.standardRPCCall(logger, configuration, 'ORWDPS1 ODSLCT', pharmacyType, outpatientDfn, locationIen, parse, callback);
};
