'use strict';
var parse = require('./encounters-procedure-types-parser').parse;
var rpcUtil = require('./../utils/rpc-util');
var validate = require('./../utils/validation-util');
var dateConverter = require('../../../utils/fileman-date-converter');
var rdk = require('../../../core/rdk');
var locationUtil = rdk.utils.locationUtil;
var _ = require('lodash');
/**
 * Calls the RPC 'ORWPCE PROC' and parses out the data<br/><br/>
 *
 * <table border="1">
 *  <tr><th colspan=2><b>REQUIRED PARAMS</b></th></tr>
 *  <tr>
 *      <td>ien</td>
 *      <td>
 *          The ien of the clinic for which to find procedure types
 *      </td>
 *  </tr>
 * </table>
 * <br/>
 * <br/>
 *
 * <table border="1">
 *  <tr><th colspan=2><b>OPTIONAL PARAMS</b></th></tr>
 *  <tr>
 *      <td>visitDate</td>
 *      <td>
 *          The date of the visit/encounter
 *      </td>
 *  </tr>
 * </table>
 * <br/><br/>
 *
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param callback This will be called with the data retrieved from the RPC (or if there's an error).
 * @param params object which can contain optional and/or required parameters as described above.
 * 
 */
module.exports.fetch = function(logger, configuration, callback, params) {
    var locationIEN = locationUtil.getLocationIEN(_.get(params, 'locationUid'));
    var visitDate = _.get(params, 'visitDate');
    if (!validate.isWholeNumber(visitDate)) {
        visitDate = null;
    }
    if (visitDate) {
        visitDate = dateConverter.getFilemanDateWithArgAsStr(visitDate);
    }
    if (!locationIEN) {
        return callback('locationIEN for Encounters Procedure Types Cannot be Empty');
    }
    return rpcUtil.standardRPCCall(logger, configuration, 'ORWPCE PROC', locationIEN, visitDate, parse, callback);
};