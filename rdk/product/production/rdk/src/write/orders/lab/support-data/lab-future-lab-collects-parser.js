'use strict';

/**
 * Takes the return string from the RPC 'ORWDLR33 FUTURE LAB COLLECTS' and parses out the data.<br/><br/>
 * Returns the number of days in the future to allow Lab Collects.<br/><br/>
 *
 * @param logger The logger
 * @param rpcData The String from the RPC that you want parsed
 * @returns {Array}
 */
module.exports.parseFutureLabCollects = function(logger, rpcData) {
    var retValue = [];
    if (rpcData) {
        retValue.push(rpcData);
    }else {
        throw new Error('The RPC did not return data');
    }
    logger.info({
        retValue: retValue
    });
    return retValue;
};
