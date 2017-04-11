'use strict';

var _ = require('lodash');
var rpcUtil = require('./../utils/rpc-util');

function createNewService(logger, fields) {
    var newService = {
        ien: fields[0],
        name: fields[1]
    };

    logger.debug({newService: newService});
    return newService;
}


/**
 * Takes the return string from the RPC 'ORQQPL SRVC SRCH' and parses out the data.<br/><br/>
 *
 * Each element is as follows:<br/>
 * 1. IEN<br/>
 * 2. name <br/>
 *
 * Example of the RPC Data that is returned:<br/>
 * <pre>
 * 1000^AMBULATORY CARE
 * 1001^ANESTHESIOLOGY
 * 11^BLIND REHAB
 * 1003^BLIND REHABILITATION
 * 1008^DENTAL
 * 1018^MEDICAL
 * 2^MEDICINE
 * 9^NEUROLOGY
 * 13^PSYCHIATRY
 * 1032^PSYCHOLOGY
 * 3^SURGERY
 * 1041^SURGICAL
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
        var newService;
        var fields = line.split('^');
        if (fields.length === FIELD_LENGTH_EXPECTED) {
            newService = createNewService(logger, fields);
            retValue.push(newService);
        }
        else {
            throw new Error('The RPC returned data but we couldn\'t understand it: ' + rpcData);
        }
    });

    logger.info({retValue: retValue});
    return retValue;
};
