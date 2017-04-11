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
 * Returns entries from the IMMUNIZATION INFO SOURCE file (920.1).<br/><br/>
 *
 * Example of the RPC Data that is returned:<br/>
 * <pre>
 * Returns:
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
 * EXAMPLE OF DATA RETURNED
 * 9
 * 7^Historical information -from birth certificate^06^1
 * 3^Historical information -from other provider^02^1
 * 6^Historical information -from other registry^05^1
 * 5^Historical information -from parent's recall^04^1
 * 4^Historical information -from parent's written record^03^1
 * 9^Historical information -from public agency^08^1
 * 8^Historical information -from school record^07^1
 * 2^Historical information -source unspecified^01^1
 * 1^New immunization record^00^1
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
