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
    } else if (fields[0] === 'EDITION DATE') {
        _.last(records).editionDate = fields[1];
    } else if (fields[0] === 'EDITION STATUS') {
        _.last(records).editionStatus = fields[1];
    } else if (fields[0] === 'LANGUAGE') {
        _.last(records).language = fields[1];
    } else if (fields[0] === 'VIS TEXT') {
        _.last(records).visText = fields[1];
    } else if (fields[0] === '2D BAR CODE') {
        _.last(records).twoDBarCode = fields[1];
    } else if (fields[0] === 'VIS URL') {
        _.last(records).visUrl = fields[1];
    } else if (fields[0] === 'STATUS') {
        _.last(records).status = fields[1];
    } else {
        throw new Error('Unrecognized field: ' + fields[0]);
    }
}

/**
 * Takes the return string from the RPC 'PXVIMM VIS' and parses out the data.<br/><br/>
 *
 * This RPC returns information from the VACCINE INFORMATION STATEMENT file (#920).<br/><br/>
 *
 * Example of the RPC Data that is returned:<br/>
 * <pre>
 * return info format: Data Element Name^Data Element Value
 * -       error format: -1^error message
 *
 * For each record returned in the global array, the top value returned will
 * indicate the record number in the array and the total number of records
 * returned, e.g., "RECORD^1 OF 3".
 *
 * This RPC returns data in external format from the following data fields
 * in the VACCINE INFORMATION STATEMENT file:
 * - NAME (#.01)
 * - EDITION DATE (#.02)
 * - EDITION STATUS (#.03)
 * - LANGUAGE (#.04)
 * - VIS TEXT (#2) (word-processing)
 * - 2D BAR CODE (#100)
 * - VIS URL (#101)
 * - STATUS (computed by Data Standardization utility)
 *
 * Example Global Array Returned:
 * (Stored in ^TMP("PXVLST",$J,"SHINGLES VIS 1",)
 * 0)="RECORD^1 OF 1"
 * .01)="NAME^SHINGLES VIS"
 * .02)="EDITION DATE^OCT 06, 2009"
 * .03)="EDITION STATUS^CURRENT"
 * .04)="LANGUAGE^ENGLISH"
 * 2,1)="VIS TEXT 1^Shingles  Vaccine: What you need to know "
 * 2)="VIS TEXT 2^ "
 * 3)="VIS TEXT 3^1. What is shingles?"
 * 4)="VIS TEXT 4^ "
 * 5)="VIS TEXT 5^Shingles is a painful skin rash, often with blisters. It
 * is also called "
 * .
 * .
 * .
 * 117)="VIS TEXT 117^ "
 * 118)="VIS TEXT 118^Department of Health and Human Services"
 * 119)="VIS TEXT 119^Centers for Disease Control and Prevention"
 * 100)="2D BAR CODE^253088698300020211091006"
 * 101)="VIS URL^http://www.immunize.org/vis/shingles.pdf"
 * "STATUS")="STATUS^ACTIVE"
 *
 * Example Global Array Returned if No Records Found:
 * ^TMP("PXVLST",$J,0)="0 RECORDS"
 *
 * Example error messages:
 * ^TMP("PXVLST",$J,0)="-1^Invalid input value"
 * ^TMP("PXVLST",$J,0)="-1^Invalid input for VIS IEN"
 * ^TMP("PXVLST",$J,0)="-1^Invalid input for VIS name"
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
