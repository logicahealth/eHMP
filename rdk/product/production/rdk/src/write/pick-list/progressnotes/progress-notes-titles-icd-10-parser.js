'use strict';

var _ = require('lodash');
var rpcUtil = require('../utils/rpc-util');
var format = require('util').format;

/**
 * @param fields must always be an object
 * @param config
 * @returns {{preferredText: *, icdCodingSystem: *, icdCode: *, diagnosisIen: *}}
 */
function createEntry(fields, config) {
    var moreDetailAvailable = fields[0] === '+';
    var icd10Object = {
        preferredText: fields[1],
        icdCodingSystem: fields[2],
        icdCode: fields[3],
        diagnosisIen: fields[8]
    };

    if(moreDetailAvailable){
        icd10Object.childHref = format('%s?%s&%s', config.rootPath, 'type=progress-notes-titles-icd-10',
            'searchString=' + fields[3]);
    } else {
        icd10Object.ien = fields[0];
    }
    return icd10Object;
}

/**
 * Takes the return string from the RPC 'ORWLEX GETI10DX' and parses out the data.<br/><br/>
 *
 * Example of the RPC Data that is returned:<br/>
 * <pre>
 *+^Pyogenic arthritis^ICD-10-CM^M00.^^^^^-1
 *+^Direct infections of joint in infectious and parasitic diseases classified elsewhere^ICD-10-CM^M01.^^^^^-1
 *+^Postinfective and reactive arthropathies^ICD-10-CM^M02.^^^^^-1\r\n+^Rheumatoid arthritis with rheumatoid factor^
 * </pre>
 * END Example of the RPC Data that is returned:<br/>
 */
module.exports.parse = function(logger, rpcData, configuration) {
    logger.info({rpcData: rpcData});

    var icd10Data = [];
    var lines = rpcData.split('\r\n');
    lines = rpcUtil.removeEmptyValues(lines);

    var FIELD_LENGTH_EXPECTED = 9;

    var icd10Entry = null;

    _.each(lines, function(line) {
        var fields = line.split('^');
        if (fields.length === FIELD_LENGTH_EXPECTED) {
            icd10Entry = createEntry(fields, configuration);
        }
        else {
            logger.error('The RPC "ORWLEX GETI10DX" returned data but we couldn\'t understand it: ' + line);
            icd10Entry = null;
        }

        if (icd10Entry) {
            icd10Data.push(icd10Entry);
        }
    });

    logger.info({retValue: icd10Data});

    return icd10Data;
};
