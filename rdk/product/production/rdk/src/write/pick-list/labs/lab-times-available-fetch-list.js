'use strict';
var parse = require('./lab-times-available-parser').parse;
var rpcUtil = require('./../utils/rpc-util');
var validate = require('./../utils/validation-util');
var dateConverter = require('../../../utils/fileman-date-converter');
var rdk = require('../../../core/rdk');
var locationUtil = rdk.utils.locationUtil;
var _ = require('lodash');
/**
 * Calls the RPC 'ORWDLR32 GET LAB TIMES' and parses out the data<br/><br/>
 *
 * <table border="1">
 *  <tr><th colspan=2><b>REQUIRED PARAMS</b></th></tr>
 *  <tr>
 *      <td>date</td>
 *      <td>The date.</td>
 *  </tr>
 *  <tr>
 *      <td>locationUid</td>
 *      <td>The locationUid.</td>
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
    var date = _.get(params, 'date');
    var locationIEN = locationUtil.getLocationIEN(_.get(params, 'locationUid'));
    if (validate.isStringNullish(date)) {
        return callback('date cannot be empty');
    }
    if (!locationIEN) {
        return callback('locationIEN for Lab Times Cannot be Empty');
    }
    date = dateConverter.getFilemanDateWithArgAsStr(date);
    return rpcUtil.standardRPCCall(logger, configuration, 'ORWDLR32 GET LAB TIMES', date, locationIEN, parse, callback);
};