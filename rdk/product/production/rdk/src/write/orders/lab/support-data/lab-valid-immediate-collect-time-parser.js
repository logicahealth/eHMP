'use strict';

/**
 * Takes the return string from the RPC 'ORWDLR32 IC VALID' and parses out the data.<br/><br/>
 * to retrieve valid immediate collect time.<br/><br/>
 * Convert fileman timestamp to VPR data time.<br/><br/>
 *
 * @param logger The logger
 * @param rpcData The String from the RPC that you want parsed
 * @returns {Array}
 */
module.exports.parseValidImmediateCollectTime = function(logger, rpcData) {
    var retValue = [];
    var fields = rpcData.split('^');
    if (fields.length > 1) {
        var validation = {
            isValid: fields[0],
            validationMessage: fields[1]
        }
        retValue.push(validation);
    } else {
        throw new Error("The RPC returned data but we couldn't understand it: " + rpcData);
    }
    logger.info({
        retValue: retValue
    });
    return retValue;
};
