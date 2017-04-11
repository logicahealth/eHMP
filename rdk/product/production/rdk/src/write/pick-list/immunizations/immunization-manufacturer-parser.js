'use strict';

var _ = require('lodash');
var rpcUtil = require('./../utils/rpc-util');

/**
 * For each individual entry, add it to the last record.
 *
 * @param logger The logger
 * @param records The array of records that we will be pushing the field to.
 * @param fields an array of items to populate the entry with.
 */
function addRecordEntry(logger, records, fields) {
    if (fields[0] === '-1') {
        throw new Error(fields[1]);
    }

    if (fields[0] === 'IEN') {
        _.last(records).ien = fields[1];
    } else if (fields[0] === 'NAME') {
        _.last(records).name = fields[1];
    } else if (fields[0] === 'MVX CODE') {
        _.last(records).mvx = fields[1];
    } else if (fields[0] === 'INACTIVE FLAG') {
        _.last(records).inactiveFlag = fields[1];
    } else if (fields[0] === 'CDC NOTES') {
        _.last(records).cdcNotes = fields[1];
    } else if (fields[0] === 'STATUS') {
        _.last(records).status = fields[1];
    } else {
        throw new Error('Unrecognized field: ' + fields[0]);
    }
}

/**
 * Takes the return string from the RPC 'PXVIMM IMM MAN' and parses out the data.<br/><br/>
 *
 * This RPC returns information from the IMM MANUFACTURER file (#9999999.04).<br/><br/>

 * Example of the RPC Data that is returned:<br/>
 * <pre>
 *     - return info format: Data Element Name^Data Element Value
 *     -       error format: -1^error message
 *
 * For each record returned in the global array, the top value returned will
 * indicate the record number in the array and the total number of records
 * returned, e.g., "RECORD^1 OF 3".
 *
 * This RPC returns data in external format from the following data fields
 * in the IMM MANUFACTURER file:
 * - NAME (#.01)
 * - MVX (#.02)
 * - INACTIVE FLAG (#.03)
 * - CDC NOTES (#201)
 * - STATUS (computed by Data Standardization utility)
 *
 * Example Global Array Returned:
 * ^TMP("PXVLST",$J,"WYETH-AYERST 1",0)="RECORD^1 OF 1"
 * .01)="NAME^WYETH-AYERST"
 * .02)="MVX CODE^WA"
 * .03)="INACTIVE FLAG^INACTIVE"
 * 201)="CDC NOTES^became WAL, now owned by
 * Pfizer"
 * "STATUS")="STATUS^INACTIVE"
 *
 * Example Global Array Returned if No Records Found:
 * ^TMP("PXVLST",$J,0)="0 RECORDS"
 *
 * Example error messages:
 * ^TMP("PXVLST",$J,0)="-1^Invalid input value"
 * ^TMP("PXVLST",$J,0)="-1^Invalid input for manufacturer IEN"
 * ^TMP("PXVLST",$J,0)="-1^Invalid input for MVX code"
 * ^TMP("PXVLST",$J,0)="-1^Invalid input for manufacturer name"
 *
 * EXAMPLE DATA RETURNED
 * RECORD^1 OF 68
 * NAME^ABBOTT LABORATORIES
 * MVX CODE^AB
 * INACTIVE FLAG^ACTIVE
 * CDC NOTES^includes Ross Products Division, Solvay
 * STATUS^ACTIVE
 * RECORD^2 OF 68
 * NAME^ACAMBIS, INC
 * MVX CODE^ACA
 * INACTIVE FLAG^INACTIVE
 * CDC NOTES^acquired by sanofi in sept 2008
 * STATUS^ACTIVE
 * ...
 * </pre>
 * END Example of the RPC Data that is returned:<br/>
 *
 * @param logger The logger
 * @param rpcData The string to parse
 */
module.exports.parse = function (logger, rpcData) {
    logger.info({rpcData: rpcData});

    var records = [];
    var lines = rpcData.split('\r\n');
    lines = rpcUtil.removeEmptyValues(lines);

    var FIELD_LENGTH_EXPECTED = 2;

    _.each(lines, function (line) {
        var fields = line.split('^');
        if (fields.length !== FIELD_LENGTH_EXPECTED) {
            logger.error('The RPC "PXVIMM IMM MAN" returned data but we couldn\'t understand it: ' + line);
        }

        if (fields[0] === 'RECORD') {
            var record = {
                record: fields[1]
            };

            logger.debug({record: record});
            records.push(record);
        } else {
            addRecordEntry(logger, records, fields);
        }
    });

    //console.log(JSON.stringify(records, null, 2));
    logger.info({records: records});
    return records;
};
