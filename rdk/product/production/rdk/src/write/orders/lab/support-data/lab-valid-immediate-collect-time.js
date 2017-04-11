/**
 * This is temporary until 'ORWDLR32 IC VALID' is in pick-list resource
 */
'use strict';

var parse = require('./lab-valid-immediate-collect-time-parser').parseValidImmediateCollectTime;
var RpcClient = require('vista-js').RpcClient;
var validate = require('./../../../pick-list/utils/validation-util');
var filemanDateUtil = require('../../../../utils/fileman-date-converter');

/**
 * Calls the RPC 'ORWDLR32 IC VALID' and parses out the data.<br/>
 * to determine whether date selected is a valid lab immediate collect time.<br/><br/>
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param timestamp The supplied timestamp string
 * @param division The division on context for the RPC call.
 * @param callback This will be called with the data retrieved from the RPC (or if there's an error).
 */
module.exports.isValidImmediateCollectTime = function(logger, configuration, timestamp, division, callback) {
    if (validate.isStringNullish(timestamp)) {
        return callback('timestamp cannot be empty');
    }
    if (validate.isStringNullish(division)) {
        return callback('division cannot be empty');
    }
    var filemanTimestamp = filemanDateUtil.getFilemanDateWithArgAsStr(timestamp);

    // Set the division in the configuration object so that it is set in the RPC Client as part of the connection
    // context (XUS DIVISION SET) and we get results for that division.
    configuration.division = division;

    return RpcClient.callRpc(logger, configuration, 'ORWDLR32 IC VALID', filemanTimestamp, function(err, rpcData) {
        if (err) {
            return callback(err.message);
        }

        try {
            logger.debug(rpcData);
            var obj = parse(logger, rpcData);
            callback(null, obj);
        } catch (parseError) {
            return callback(parseError.message);
        }
    });
};
