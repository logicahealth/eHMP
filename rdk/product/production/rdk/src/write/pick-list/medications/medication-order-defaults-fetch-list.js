'use strict';
var parse = require('./medication-order-defaults-parser').parse;
var validate = require('./../utils/validation-util');
var rpcUtil = require('./../utils/rpc-util');
var _ = require('lodash');


/**
 * Calls the RPC 'ORWDPS2 OISLCT' and parses out the data to retrieve values for medication dialog<br/><br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>REQUIRED PARAMS</b></th></tr>
 * 	<tr>
 * 		<td>pharmacyType</td>
 * 		<td>Pharmacy Type (U = Unit Dose, O = Outpatient, X = Non-VA Med)</td>
 * 	</tr>
 * </table>
 * <br/>
 * <br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>OPTIONAL PARAMS</b></th></tr>
 * 	<tr>
 * 		<td>ien</td>
 * 		<td>medication ien (from ORWUL FVSUB)</td>
 * 	</tr>
 * 	<tr>
 * 		<td>outpatientDfn</td>
 * 		<td>Patient DFN</td>
 * 	</tr>
 * 	<tr>
 * 		<td>needPatientInstructions</td>
 * 		<td>boolean for whether you need patient instructions</td>
 * 	</tr>
 * 	<tr>
 * 		<td>pkiEnabled</td>
 * 		<td>boolean for whether pki is enabled on this server - obtained from RPC 'ORWOR PKISITE'.</td>
 * 	</tr>
 * </table>
 *
 *
 * Each element is as follows:<br/>
 *
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param callback This will be called with the data retrieved from the RPC (or if there's an error).
 * @param params object which can contain optional and/or required parameters as described above.
 */
module.exports.fetch = function(logger, configuration, callback, params) {
    var ien = _.get(params, 'ien');
    var pharmacyType = _.get(params, 'pharmacyType');
    var options = {
        requiresDfn: false
    };
    validate.getPatientDFN(params, options, function(err, outpatientDfn) {
        if (err) {
            return callback(err);
        }
        var needPatientInstructions = Boolean(_.get(params, 'needPatientInstructions'));
        var pkiEnabled = Boolean(_.get(params, 'pkiEnabled'));

        if (!validate.isWholeNumber(ien)) {
            ien = null;
        }
        if (validate.isStringNullish(pharmacyType)) {
            return callback('pharmacyType cannot be empty');
        }
        if (!_.isBoolean(needPatientInstructions)) {
            needPatientInstructions = false;
        }
        if (!_.isBoolean(pkiEnabled)) {
            pkiEnabled = false;
        }

        pharmacyType = pharmacyType.toUpperCase();

        //NOTE: If more types are supported, add them with documentation in the Javadoc as to what those types represent.
        if (pharmacyType !== 'U' && pharmacyType !== 'O' && pharmacyType !== 'X') {
            return callback('view must be \'U\', \'O\', or \'X\'');
        }

        needPatientInstructions = rpcUtil.convertBooleanToYN(needPatientInstructions);
        pkiEnabled = rpcUtil.convertBooleanToYN(pkiEnabled);

        return rpcUtil.standardRPCCall(logger, configuration, 'ORWDPS2 OISLCT', ien, pharmacyType, outpatientDfn, needPatientInstructions, pkiEnabled, parse, callback);
    });
};