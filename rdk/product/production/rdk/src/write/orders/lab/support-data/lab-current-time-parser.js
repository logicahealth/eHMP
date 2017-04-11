'use strict';

var filemanDateUtil = require('../../../../utils/fileman-date-converter');

/**
 * Takes the return string from the RPC 'ORWU DT' and parses out the data.<br/><br/>
 * to retrieve current time.<br/><br/>
 * Convert fileman timestamp to VPR data time.<br/><br/>
 *
 * @param logger The logger
 * @param rpcData The String from the RPC that you want parsed
 * @returns {Array}
 */
module.exports.parseCurrentTime = function(logger, rpcData) {
    var retValue = [];
    if (rpcData) {
        var currentTime = {
            currentTime: filemanDateUtil.getVprDateTime(rpcData)
        };
        retValue.push(currentTime);
    } else {
        throw new Error("The RPC returned data but we couldn't understand it: " + rpcData);
    }
    logger.info({
        retValue: retValue
    });
    return retValue;
};
