/**
 * This is temporary until 'ORWDLR32 GET LAB TIMES' is in pick-list resource
 */
'use strict';

var parse = require('./lab-collect-times-parser').parse;
var RpcClient = require('vista-js').RpcClient;
var validate = require('./../../../pick-list/utils/validation-util');
var filemanDateUtil = require('../../../../utils/fileman-date-converter');

/**
 * Calls the RPC 'ORWDLR32 GET LAB TIMES' and parses out the data.<br/>
 * to retrieve list of lab collect times for a date & location.<br/><br/>
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param dateSelected The date selected string
 * @param location The location of the lab order
 * @param callback This will be called with the data retrieved from the RPC (or if there's an error).
 */
module.exports.getLabCollectTimes = function(logger, configuration, dateSelected, location, callback) {
    if (validate.isStringNullish(dateSelected)) {
        return callback('dateSelected cannot be empty');
    }
    if (!validate.isWholeNumber(location)) {
        return callback('location cannot be empty and must be a whole number');
    }
    var filemanDate = filemanDateUtil.getFilemanDateWithArgAsStr(dateSelected);

    return RpcClient.callRpc(logger, configuration, 'ORWDLR32 GET LAB TIMES', filemanDate, location, function(err, rpcData) {
        if (err) {
            return callback(err.message);
        }

        try {
            logger.debug(rpcData);
            var obj = parse(logger, rpcData);
            callback(null, obj);
        }
        catch (parseError) {
            return callback(parseError.message);
        }
    });
};
