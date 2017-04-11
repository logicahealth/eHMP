'use strict';

var _ = require('lodash');
var rpcUtil = require('./../utils/rpc-util');

/**
 * PXVRSLT(0)=Count of elements returned (0 if nothing found)
 * PXVRSLT(n)=IEN^Name^HL7 Code^Status (1:Active, 0:Inactive)
 *
 * When filtering based off IEN, HL7 Code, or #.01 field, only one entry will
 * be returned in PXVRSLT(1).
 *
 * When filtering based off status, multiple entries can be returned. The
 * first entry will be returned in subscript 1, and subscripts will be
 * incremented by 1 for further entries. Entries will be sorted
 * alphabetically.
 *
 * If no entries are found based off the filtering criteria, PXVRSLT(0) will
 * equal 0, and there will be no data returned in the subsequent subscripts.
 *
 * @param logger The logger
 * @param fields an array of items to populate the entry with.
 */
function createEntry(logger, fields) {
    var obj = {
        ien: fields[0],
        name: fields[1],
        hl7Code: fields[2],
        status: fields[3]
    };

    logger.debug({obj: obj});
    return obj;
}

/**
 * Takes the return string from the RPC 'PXVIMM ADMIN ROUTE' and parses out the data.<br/><br/>
 *
 * Returns entries from the IMM ADMINISTRATION SITE (BODY) file (920.3).
 *
 * Example of the RPC Data that is returned:<br/>
 * <pre>
 * 12
 * 2^LEFT DELTOID^LD^1
 * 3^LEFT GLUTEOUS MEDIUS^LG^1
 * 4^LEFT LOWER FOREARM^LLFA^1
 * 5^LEFT THIGH^LT^1
 * 1^LEFT UPPER ARM^LA^1
 * 6^LEFT VASTUS LATERALIS^LVL^1
 * 8^RIGHT DELTOID^RD^1
 * 9^RIGHT GLUTEOUS MEDIUS^RG^1
 * 10^RIGHT LOWER FOREARM^RLFA^1
 * 11^RIGHT THIGH^RT^1
 * 7^RIGHT UPPER ARM^RA^1
 * 12^RIGHT VASTUS LATERALIS^RVL^1
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

    var FIELD_LENGTH_EXPECTED = 4;

    var obj = null;
    var count = null;

    _.each(lines, function(line) {
        if (count === null) {
            count = Number(line);
        }
        else {
            var fields = line.split('^');
            if (fields.length === FIELD_LENGTH_EXPECTED) {
                obj = createEntry(logger, fields);
            }
            else {
                logger.error('The RPC "PXVIMM ADMIN ROUTE" returned data but we couldn\'t understand it: ' + line);
                obj = null;
            }

            if (obj) {
                retValue.push(obj);
            }
        }
    });

    if (retValue.length !== count) {
        logger.warn('"PXVIMM ADMIN ROUTE" expected ' + retValue.length + ' entries from the RPC but got ' + count);
    }

    //console.log(JSON.stringify(retValue, null, 2));
    logger.info({retValue: retValue});
    return retValue;
};
