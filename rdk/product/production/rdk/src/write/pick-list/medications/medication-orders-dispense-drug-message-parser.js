'use strict';

var rpcUtil = require('./../utils/rpc-util');

/**
 * From here: https://github.com/OSEHRA/VistA/blob/master/Packages/Order%20Entry%20Results%20Reporting/CPRS/CPRS-Chart/Orders/rODBase.pas
 * I found this code<br/>
 * <code>
 *     x := sCallV('ORWDPS32 DRUGMSG', [AnIEN]);
 *     ...
 *     uLastDispenseMsg := Piece(x, U, 1);
 *     uLastQuantityMsg := Piece(x, U, 2);
 * </code>
 *
 * @param logger The logger
 * @param fields an array of items to populate the entry with.
 */
function createEntry(logger, fields) {
    var obj = {
        dispenseMsg: fields[0],
        quantityMsg: fields[1]
    };

    logger.debug({obj: obj});
    return obj;
}

/**
 * Takes the return string from the RPC 'ORWDPS32 DRUGMSG' and parses out the data.<br/><br/>
 *
 * Example of the RPC Data that is returned:<br/>
 * <pre>
 * INTEN^
 * </pre>
 * END Example of the RPC Data that is returned:<br/>
 *
 * @param logger The logger
 * @param rpcData The string to parse
 */
module.exports.parse = function(logger, rpcData) {
    logger.info({rpcData: rpcData});

    var lines = rpcData.split('\r\n');
    lines = rpcUtil.removeEmptyValues(lines);
    if (lines.length !== 1) {
        throw new Error('Expected only one entry and one line from RPC');
    }

    var fields = lines[0].split('^');
    if (fields.length !== 2) {
        throw new Error('The RPC "ORWDPS32 DRUGMSG" returned data but we couldn\'t understand it: ' + lines[0]);
    }

    var retValue = createEntry(logger, fields);


    //console.log(JSON.stringify(retValue, null, 2));
    logger.info({retValue: retValue});
    return retValue;
};
