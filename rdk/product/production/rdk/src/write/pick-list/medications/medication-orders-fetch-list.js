'use strict';
var parse = require('./medication-orders-parser').parseMedicationOrders;
var validate = require('./../utils/validation-util');
var rpcUtil = require('./../utils/rpc-util');
var _ = require('lodash');
/**
 * Calls the RPC 'ORWUL FVSUB' and parses out the data to retrieve a list of available Med Orders<br/><br/>
 *
 * <table border="1">
 *  <tr><th colspan=2><b>REQUIRED PARAMS</b></th></tr>
 *  <tr>
 *      <td>ien</td>
 *      <td>ien, from rpc 'ORWUL FV4DG' (call getMedicationList to get this value).</td>
 *  </tr>
 *  <tr>
 *      <td>first</td>
 *      <td>parameter for the first entry you want returned from the array returned</td>
 *  </tr>
 *  <tr>
 *      <td>last</td>
 *      <td>parameter for the last entry you want returned from the array returned</td>
 *  </tr>
 * </table>
 * <br/>
 * <br/>
 *
 * <table border="1">
 *  <tr><th colspan=2><b>OPTIONAL PARAMS</b></th></tr>
 *  <tr><td colspan=2><b>NONE</b></td></tr>
 * </table>
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param callback This will be called with the data retrieved from the RPC (or if there's an error).
 * @param params object which can contain optional and/or required parameters as described above.
 */
module.exports.fetch = function(logger, configuration, callback, params) {
    var ien = _.get(params, 'ien');
    var first = _.get(params, 'first');
    var last = _.get(params, 'last');
    if (!validate.isWholeNumber(ien)) {
        return callback('ien cannot be empty, must be a whole number, and it must be obtained from a call to \'ORWUL FV4DG\' (ex. 31 = O RX = Outpatient Meds).');
    }
    if (!validate.isWholeNumber(first)) {
        return callback('first parameter cannot be empty (or a non-numeric value)');
    }
    if (!validate.isWholeNumber(last)) {
        return callback('last parameter cannot be empty (or a non-numeric value)');
    }
    return rpcUtil.standardRPCCall(logger, configuration, 'ORWUL FVSUB', ien, first, last, parse, callback);
};