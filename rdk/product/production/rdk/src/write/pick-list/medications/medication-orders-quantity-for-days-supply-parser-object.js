'use strict';

var rpcUtil = require('./../utils/rpc-util');

/**
 * Return the quantity for Days supply.
 *
 * @param logger The logger
 * @param fields an array of items to populate the entry with.
 */
function createEntry(logger, fields) {
    var obj = {
        quantityForDaysSupply: fields[0]
    };

    logger.debug({obj: obj});
    return obj;
}

/**
 * Takes the return string from the RPC 'ORWDPS2 DAY2QTY' and parses out the data.<br/><br/>
 * Example of the RPC Data that is returned:<br/>
 * <pre>
 * 720
 * </pre>
 * END Example of the RPC Data that is returned:<br/>
 *
 * @param logger The logger
 * @param rpcData The string to parse
 */
module.exports.parse = function(logger, rpcData) {
    logger.info({rpcData: rpcData});

    var retValue = {};

    var lines = rpcData.split('\r\n');
    lines = rpcUtil.removeEmptyValues(lines);
    if (lines.length === 0) {
        retValue = createEntry(logger, ['']);
    }
    else {
        if (lines.length !== 1) {
            throw new Error('Expected only one entry and one line from RPC');
        }

        var FIELD_LENGTH_EXPECTED = 1;
        var fields = lines[0].split('^');
        if (fields.length !== FIELD_LENGTH_EXPECTED) {
            throw new Error('The RPC "ORWDPS2 DAY2QTY" returned data but we couldn\'t understand it: ' + lines[0]);
        }

        retValue = createEntry(logger, fields);
    }

    //console.log(JSON.stringify(retValue, null, 2));
    logger.info({retValue: retValue});
    return retValue;
};
