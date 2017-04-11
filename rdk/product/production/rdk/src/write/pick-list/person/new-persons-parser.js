'use strict';

var _ = require('lodash');
var rpcUtil = require('./../utils/rpc-util');

function createNewPerson(logger, fields) {
    var newPerson = {
        code: fields[0],
        name: fields[1]
    };

    if(!_.isUndefined(fields[2])) {
        newPerson.title = fields[2];
    }

    logger.debug({newPerson: newPerson});
    return newPerson;
}

/**
 * Takes the return string from the RPC 'ORWU NEWPERS' and parses out the data.<br/><br/>
 *
 * Each element is as follows:<br/>
 * 1. code<br/>
 * 2. name <br/>
 * 3. title (optional)<br/>
 *
 * Example of the RPC Data that is returned:<br/>
 * <pre>
 * 11272^Access,New
 * 11656^Amie,Vaco
 * 10000000229^Anesthesiologist,One^- ANESTHESIOLOGIST
 * 20221^Atl,Student^- INFORMATION RESOURCE MGMT
 * </pre>
 *
 * @param logger The logger
 * @param rpcData The String from the RPC that you want parsed
 * @returns {Array}
 */
module.exports.parse = function(logger, rpcData) {

    logger.info({rpcData: rpcData});

    var retValue = [];
    var lines = rpcData.split('\r\n');
    lines = rpcUtil.removeEmptyValues(lines);

    var FIELD_LENGTH_EXPECTED = 2;

    _.each(lines, function(line) {
        var newPerson;
        var fields = line.split('^');

        if (fields.length >= FIELD_LENGTH_EXPECTED) {
            newPerson = createNewPerson(logger, fields);
            retValue.push(newPerson);
        } else {
            throw new Error('The RPC returned data but we couldn\'t understand it: ' + rpcData);
        }
    });

    logger.info({retValue: retValue});
    return retValue;
};
