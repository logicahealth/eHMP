'use strict';

var rpcUtil = require('./../utils/rpc-util');

/**
 * The maximum refills
 *
 * @param logger The logger
 * @param fields an array of items to populate the entry with.
 */
function createEntry(logger, fields) {
    var flag = false;
    if (fields[0] === '0') {
        flag = false;
    }
    else {
        flag = !!fields[0];
    }
    var obj = {
        flag: flag
    };

    logger.debug({obj: obj});
    return obj;
}

/**
 * Takes the return string from the RPC and parses out the data.<br/><br/>
 *
 * Example of the RPC Data that is returned:<br/>
 * <pre>
 * 0
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

        var fields = lines[0].split('^');
        if (fields.length !== 1) {
            throw new Error('The progress-notes-titles-fetch-flags RPC returned data but we couldn\'t understand it: ' + lines[0]);
        }

        retValue = createEntry(logger, fields);
    }

    //console.log(JSON.stringify(retValue, null, 2));
    logger.info({retValue: retValue});
    return retValue;
};
