'use strict';

var rpcUtil = require('./../utils/rpc-util');

/**
 * 1^message if valid.
 * 0^message if invalid
 *
 * @param logger The logger
 * @param fields an array of items to populate the entry with.
 */
function createEntry(logger, fields) {
    var isValid;
    if (fields[0] === '0') {
        isValid = false;
    }
    else if (fields[0] === '1') {
        isValid = true;
    }
    else {
        throw new Error('Expected a zero or a one for whether this boolean is valid');
    }

    var obj = {
        valid: isValid,
        message: fields.length === 2 ? fields[1] : ''
    };

    logger.debug({obj: obj});
    return obj;
}

/**
 * Takes the return string from the RPC 'ORWDLR32 IC VALID' and parses out the data.<br/><br/>
 *
 * Example of the RPC Data that is returned:<br/>
 * <pre>
 * 1^message if valid.
 * 0^message if invalid
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
            throw new Error('Expected only one line from RPC');
        }

        var FIELD_COUNT_WITH_MESSAGE = 2;
        var FIELD_COUNT_NO_MESSAGE = 1;
        var fields = lines[0].split('^');
        if (fields.length !== FIELD_COUNT_WITH_MESSAGE && fields.length !== FIELD_COUNT_NO_MESSAGE) {
            throw new Error('The RPC "ORWDLR32 IC VALID" returned data but we couldn\'t understand it: ' + lines[0]);
        }

        retValue = createEntry(logger, fields);
    }

	//console.log(JSON.stringify(retValue, null, 2));
    logger.info({retValue: retValue});
    return retValue;
};
