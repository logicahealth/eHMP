'use strict';
var parse = require('./lab-order-max-days-continuous-parser').parse;
var validate = require('./../utils/validation-util');
var rpcUtil = require('./../utils/rpc-util');
var rdk = require('../../../core/rdk');
var locationUtil = rdk.utils.locationUtil;
var _ = require('lodash');
/**
 * Calls the RPC 'ORWDLR32 MAXDAYS' and parses out the data<br/><br/>
 *
 * <table border="1">
 *  <tr><th colspan=2><b>REQUIRED PARAMS</b></th></tr>
 *  <tr>
 *      <td>searchString</td>
 *      <td>The location of the lab order</td>
 *  </tr>
 *  <tr>
 *      <td>schedule</td>
 *      <td>The schedule of the lab order</td>
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
    var locationIEN = locationUtil.getLocationIEN(_.get(params, 'locationUid'));
    var schedule = _.get(params, 'schedule');
    if (!validate.isWholeNumber(schedule)) {
        return callback('schedule cannot be empty and must be a whole number');
    }
    if (!locationIEN) {
        return callback('locationIEN for Lab Order Max Days List Cannot be Empty');
    }
    return rpcUtil.standardRPCCall(logger, configuration, 'ORWDLR32 MAXDAYS', locationIEN, schedule, parse, callback);
};