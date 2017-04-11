'use strict';

var _ = require('lodash');
var rpcUtil = require('./../utils/rpc-util');

/**
 * Extracts the time.
 *
 * @param logger The logger
 * @param fields an array of items to populate the entry with.
 */
function createEntry(logger, fields) {
    var obj = {
        time: fields[0]
    };

    logger.debug({obj: obj});
    return obj;
}

/**
 * Takes the return string from the RPC 'ORWDLR32 GET LAB TIMES' and parses out the data.<br/><br/>
 *
 * Example of the RPC Data that is returned:<br/>
 * <pre>
 * 0930
 * 1100
 * 1230
 * 1300
 * 1530
 * 1545
 * 1600
 * 1730
 * </pre>
 * END Example of the RPC Data that is returned:<br/>
 *
 * @param logger The logger
 * @param rpcData The string to parse
 */
module.exports.parse = function(logger, rpcData) {
    logger.info({rpcData: rpcData});

    var retValue = [];
    var lines = rpcData.split('\r\n');
    lines = rpcUtil.removeEmptyValues(lines);

	var FIELD_LENGTH_EXPECTED = 1;

    var obj = null;

    _.each(lines, function(line) {
        var fields = line.split('^');
        if (fields.length === FIELD_LENGTH_EXPECTED) {
        	obj = createEntry(logger, fields);
        }
        else {
        	logger.error('The RPC "ORWDLR32 GET LAB TIMES" returned data but we couldn\'t understand it: ' + line);
        }

        if (obj) {
            retValue.push(obj);
        }
    });

	//console.log(JSON.stringify(retValue, null, 2));
    logger.info({retValue: retValue});
    return retValue;
};
