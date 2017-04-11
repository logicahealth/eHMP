'use strict';

var _ = require('lodash');
var rpcUtil = require('./../utils/rpc-util');

/**
 * @param logger The logger
 * @param fields an array of items to populate the entry with.
 */
function createEntry(logger, fields) {
    var obj = {
        ien: fields[0],
        name: fields[1],
        synonym: fields[2],
        special: fields[3]
    };

    logger.debug({obj: obj});
    return obj;
}

/**
 * Takes the return string from the RPC 'ORWDRA32 RAORDITM' and parses out the data.<br/><br/>
 * @param logger The logger
 * @param rpcData The string to parse
 */
module.exports.parse = function(logger, rpcData) {
    logger.info({rpcData: rpcData});
    
    var retValue = [];
    var lines = rpcData.split('\r\n');
    lines = rpcUtil.removeEmptyValues(lines);

    var FIELD_LENGTH_EXPECTED = 4;
    
    var obj = null;

    _.each(lines, function(line) {
        var fields = line.split('^');
        if (fields.length >= FIELD_LENGTH_EXPECTED) {
            obj = createEntry(logger, fields);
        }
        else {
            logger.error('The RPC "ORWDRA32 RAORDITM" returned data but we couldn\'t understand it: ' + line);
            obj = null;
        }
        
        if (obj) {
            retValue.push(obj);
        }
    });

    logger.info({retValue: retValue});
    return retValue;
};
