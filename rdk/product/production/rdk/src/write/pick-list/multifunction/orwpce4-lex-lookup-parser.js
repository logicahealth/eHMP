'use strict';

var _ = require('lodash');
var rpcUtil = require('./../utils/rpc-util');

/**
 * Each of the values returned will contain an ien and a name.
 *
 * @param logger The logger
 * @param line The string to parse
 */
function createOrwpce4LexLookUp(logger, line) {
    logger.debug('line=' + line);

    var ICD_FIELD_LENGTH_EXPECTED = 7;
    var CPT_FIELD_LENGTH_EXPECTED = 6;

    var fields = line.split('^');
    if (fields.length !== ICD_FIELD_LENGTH_EXPECTED && fields.length !== CPT_FIELD_LENGTH_EXPECTED) {
        logger.error('The RPC "ORWPCE4 LEX" returned data but we couldn\'t understand it: ' + line);
        return null;
    }

    var obj = {
        lexIen: fields[0],
        prefText: fields[1],
        codeSys: fields[2],
        conceptId: fields[3],
        version: fields[4],
        code: fields[5]
    };

    if (fields.length === ICD_FIELD_LENGTH_EXPECTED) {
        obj.desigId = fields[6];
    }

    logger.debug({obj: obj});
    return obj;
}

/**
 * Takes the return string from the RPC 'ORWPCE4 LEX' and parses out the data.<br/><br/>
 *
 * Example of the RPC Data that is returned:<br/>
 * <pre>
 * 7163535^Diaper rash^SNOMED CT^91487003^ICD-9-CM^691.0^151553017
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

    _.each(lines, function(line) {
        var obj = createOrwpce4LexLookUp(logger, line);
        if (obj) {
            retValue.push(obj);
        }
    });

    //console.log(JSON.stringify(retValue, null, 2));
    logger.info({retValue: retValue});
    return retValue;
};
