'use strict';
var parse = require('./medication-orders-quantity-for-days-supply-parser-object').parse;
var validate = require('./../utils/validation-util');
var rpcUtil = require('./../utils/rpc-util');
var _ = require('lodash');


/**
 * Calls the RPC 'ORWDPS2 DAY2QTY' and parses out the data<br/><br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>REQUIRED PARAMS</b></th></tr>
 * 	<tr>
 * 		<td>daysSupply</td>
 * 		<td>DAY PARAMETER = DAY’S SUPPLY</td>
 * 	</tr>
 * 	<tr>
 * 		<td>unitsPerDose</td>
 * 		<td>UPD PARAMETER = DOSE</td>
 * 	</tr>
 *  <tr>
 * 		<td>schedule</td>
 * 		<td>SCH PARAMETER = SCHEDULE</td>
 * 	</tr>
 *  <tr>
 * 		<td>duration</td>
 * 		<td>DUR PARAMETER = DURATION (NO DURATION VALUE)</td>
 * 	</tr>
 *  <tr>
 * 		<td>patientDFN</td>
 * 		<td>PAT PARAMETER = PATIENT FILE #2 IEN</td>
 * 	</tr>
 *  <tr>
 * 		<td>drug</td>
 * 		<td>DRG PARAMETER = DRUG FILE #50 IEN</td>
 * 	</tr>
 * </table>
 * <br/>
 * <br/>
 *
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
    var daysSupply = _.get(params, 'daysSupply');
    var unitsPerDose = _.get(params, 'unitsPerDose');
    var schedule = _.get(params, 'schedule');
    var duration = _.get(params, 'duration');
    var options = {
        requiresDfn: true
    };
    validate.getPatientDFN(params, options, function(err, patientDFN) {
        if (err) {
            return callback(err);
        }

        var drug = _.get(params, 'drug');
        if (validate.isStringNullish(unitsPerDose)) {
            return callback('unitsPerDose cannot be empty');
        }
        if (validate.isStringNullish(schedule)) {
            return callback('schedule cannot be empty');
        }
        if (validate.isStringNullish(duration)) {
            return callback('duration cannot be empty');
        }
        if (validate.isStringNullish(drug)) {
            return callback('drug cannot be empty');
        }

        unitsPerDose = unitsPerDose.toUpperCase();
        schedule = schedule.toUpperCase();
        duration = duration.toUpperCase();
        patientDFN = patientDFN.toUpperCase();
        drug = drug.toUpperCase();

        return rpcUtil.standardRPCCall(logger, configuration, 'ORWDPS2 DAY2QTY', daysSupply, unitsPerDose, schedule, duration, patientDFN, drug, parse, callback);
    });
};