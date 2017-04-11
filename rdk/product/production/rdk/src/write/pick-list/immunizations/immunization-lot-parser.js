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
    } else if (fields[0] === 'LOT NUMBER') {
        _.last(records).lotNumber = fields[1];
    } else if (fields[0] === 'MANUFACTURER') {
        _.last(records).manufacturer = fields[1];
    } else if (fields[0] === 'STATUS') {
        _.last(records).status = fields[1];
    } else if (fields[0] === 'VACCINE') {
        _.last(records).vaccine = fields[1];
    } else if (fields[0] === 'EXPIRATION DATE') {
        _.last(records).expirationDate = fields[1];
    } else if (fields[0] === 'DOSES UNUSED') {
        _.last(records).dosesUnused = fields[1];
    } else if (fields[0] === 'LOW SUPPLY ALERT') {
        _.last(records).lowSupplyAlert = fields[1];
    } else if (fields[0] === 'NDC CODE (VA)') {
        _.last(records).ndcCodeVa = fields[1];
    } else if (fields[0] === 'ASSOCIATED VA FACILITY') {
        _.last(records).associatedFacility = fields[1];
    } else {
        throw new Error('Unrecognized field: ' + fields[0]);
    }
}

/**
 * Takes the return string from the RPC 'PXVIMM IMM LOT' and parses out the data.<br/><br/>
 *
 * This RPC returns information from the IMMUNIZATION LOT file (#9999999.41).<br/><br/>
 *
 * return info format: Data Element Name^Data Element Value
 *       error format: -1^error message
 *
 * For each record returned in the global array, the top value returned will
 * indicate the record number in the array and the total number of records
 * returned, e.g., "RECORD^1 OF 3".
 *
 * This RPC returns data in external format from the following data fields
 * in the IMMUNIZATION LOT file:
 * - LOT NUMBER (#.01)
 * - MANUFACTURER (#.02)
 * - STATUS (#.03)
 * - VACCINE (#.04)
 * - EXPIRATION DATE (#.09)
 * - DOSES UNUSED (#.12)
 * - LOW SUPPLY ALERT (#.15)
 * - NDC CODE (VA) (#.18)
 *
 * Example of the RPC Data that is returned:<br/>
 * <pre>
 * Example Global Array Returned:
 * ^TMP("PXVLST",$J,"P92A8769LN 1",0)="RECORD^1 OF 1"
 * .01)="LOT NUMBER^P92A8769LN"
 * .02)="MANUFACTURER^SCLAVO, INC."
 * .03)="STATUS^ACTIVE"
 * .04)="VACCINE^ANTHRAX"
 * .09)="EXPIRATION DATE^DEC 31, 2016"
 * .12)="DOSES UNUSED^94"
 * .15)="LOW SUPPLY ALERT^10"
 * .18)="NDC CODE (VA)^"
 *
 * Example Global Array Returned if No Records Found:
 * ^TMP("PXVLST",$J,0)="0 RECORDS"
 *
 * Example error messages:
 * ^TMP("PXVLST",$J,0)="-1^Invalid input value"
 * ^TMP("PXVLST",$J,0)="-1^Invalid input for immunization lot IEN"
 * ^TMP("PXVLST",$J,0)="-1^Invalid input for lot number"
 *
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
            logger.error('The RPC "PXVIMM IMM LOT" returned data but we couldn\'t understand it: ' + line);
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
