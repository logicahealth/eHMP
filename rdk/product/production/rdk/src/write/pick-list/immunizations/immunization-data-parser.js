'use strict';

var _ = require('lodash');
var rpcUtil = require('./../utils/rpc-util');

/**
 * The first record of the returned array contains the count of records
 * being returned.
 * Each record is a caret-delimited list of values.
 * Piece# Field# Field Name
 * ------ ------ ----------
 * 1             IEN
 * 2      .01    NAME
 * 3      .02    SHORT NAME
 * 4      .03    CVX CODE
 * 5      .05    MAX # IN SERIES
 * 6      .07    INACTIVE FLAG
 * 7      .09    VACCINE GROUP (SERIES TYPE)
 * 8      8801   MNEMONIC
 * 9      8802   ACRONYM
 * 10     8803   SELECTABLE FOR HISTORIC
 *
 * These are followed by the sub-file multiples (unless the BRIEF parameter
 * is set to 1):
 * 11     2      CDC FULL VACCINE NAME
 * 12     3      CODING SYSTEM
 * 13     4      VACCINE INFORMATION STATEMENT
 * 14     5      CDC PRODUCT NAME
 * 15     10     SYNONYM
 * 16     99.991 EFFECTIVE DATE/TIME
 *
 * @param logger The logger
 * @param fields an array of items to populate the entry with.
 */
function createEntry(logger, fields) {
    var obj = {
        ien: fields[0],
        name: fields[1],
        shortName: fields[2],
        cvxCode: fields[3],
        maxInSeries: fields[4],
        inactiveFlag: fields[5],
        vaccineGroup: fields[6],
        acronym: fields[7],
        selectableHistoric: fields[8]
    };

    if (fields.length > 9) {
        obj.cdcFullVaccineName = fields[9];
    }
    if (fields.length > 10) {
        obj.codingSystem = fields[10];
    }
    if (fields.length > 11) {
        obj.vaccineInfoStmt = fields[11];
    }
    if (fields.length > 12) {
        obj.cdcProductName = fields[12];
    }
    if (fields.length > 13) {
        obj.vaccineGroupName = fields[13];
    }
    if (fields.length > 14) {
        obj.synonym = fields[14];
    }
    if (fields.length > 15) {
        obj.effectiveDate = fields[15];
    }

    logger.debug({
        obj: obj
    });
    return obj;
}

/**
 * Takes the return string from the RPC 'PXVIMM IMMDATA' and parses out the data.<br/><br/>
 *
 * Return an array of the entries from the IMMUNIZATION file (9999999.14)<br/><br/>
 *
 * Example of the RPC Data that is returned:<br/>
 * <pre>
 *
 * </pre>
 * END Example of the RPC Data that is returned:<br/>
 *
 * @param logger The logger
 * @param rpcData The string to parse
 */
module.exports.parse = function (logger, rpcData) {
    logger.info({
        rpcData: rpcData
    });

    var retValue = [];
    var lines = rpcData.split('\r\n');
    lines = rpcUtil.removeEmptyValues(lines);

    var FIELD_LENGTH_EXPECTED = 16;

    var obj = null;
    var count = null;

    _.each(lines, function (line) {
        if (count === null) {
            count = Number(line);
        } else {
            var fields = line.split('^');
            if (fields.length <= FIELD_LENGTH_EXPECTED) {
                obj = createEntry(logger, fields);
            } else {
                logger.error('The RPC "PXVIMM ADMIN ROUTE" returned data but we couldn\'t understand it: ' + line);
                obj = null;
            }

            if (obj) {
                retValue.push(obj);
            }
        }
    });

    if (retValue.length !== count) {
        logger.warn('"PXVIMM IMMDATA" expected ' + retValue.length + ' entries from the RPC but got ' + count);
    }

    //console.log(JSON.stringify(retValue, null, 2));
    logger.info({
        retValue: retValue
    });
    return retValue;
};
