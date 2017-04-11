'use strict';

/**
 * Takes the return string from the RPC 'ORWDLR32 ABBSPEC' and parses out the data<br/><br/>
 * to retrieve lab specimens.<br/><br/>
 *
 * @param logger The logger
 * @param rpcData The String from the RPC that you want parsed
 * @returns {Array}
 */
module.exports.parseLabSpecimens = function(logger, rpcData) {
    var retValue = [];
    if (!rpcData) {
        throw new Error('The RPC returned no data');
    }
    var lines = rpcData.split('\r\n');
    if (lines.length > 1) {
        var fields;
        for (var i = 0; i < lines.length - 1; i++) {
            if (lines[i]) {
                fields = lines[i].split('^');
                if (fields.length > 1) {
                    var specimen = {
                        id: fields[0],
                        name: fields[1]
                    }
                    retValue.push(specimen);
                }
            }
        }
    } else {
        throw new Error("The RPC returned data but we couldn't understand it: " + rpcData);
    }
    logger.info({
        retValue: retValue
    });
    return retValue;
};
