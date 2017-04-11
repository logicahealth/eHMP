'use strict';

var _ = require('lodash');
var rpcUtil = require('./../utils/rpc-util');

/**
 * LEXIEN^PREFTEXT^ICDCODE(S)^ICDIEN^CODESYS^CONCEPTID^DESIGID^ICDVER
 *
 * @param logger
 * @param rpcData
 * @returns {Array}
 */
module.exports.parse = function(logger, rpcData) {
    logger.info({rpcData: rpcData});

    var lines = rpcData.split('\r\n');
    lines = rpcUtil.removeEmptyValues(lines);

    var FIELD_LENGTH_FOR_PROBLEMS = 8;
    var FIELD_LENGTH_NUM_RECORDS_FOUND = 1; //The last line of rpcData tells you how many records were returned.
    var retValue = [];

    _.each(lines, function(line) {
        var fields = line.split('^');

        if (fields.length >= FIELD_LENGTH_FOR_PROBLEMS) {
            var problem = {
                lexIen: fields[0],
                prefText: fields[1],
                code: fields[2],
                codeIen: fields[3],
                codeSys: fields[4],
                conceptId: fields[5],
                desigId: fields[6],
                version: fields[7]
            };
            retValue.push(problem);
        }
        else if (fields.length === FIELD_LENGTH_NUM_RECORDS_FOUND) {
            if (_.isEmpty(retValue)) {
                // if no records found yet, it is a message to the caller.

                logger.error(fields);
                retValue.push(rpcData);

                logger.info({retValue: retValue});
                return retValue;
            } else {
                retValue.push('records found: ', fields[0]);
            }
        }
        else {
            logger.error('The RPC returned data but we couldn\'t understand it: ' + rpcData);
        }
    });

    logger.info({retValue: retValue});
    return retValue;
};
