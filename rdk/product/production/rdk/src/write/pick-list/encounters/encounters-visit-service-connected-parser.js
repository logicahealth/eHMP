'use strict';

var _ = require('lodash');

/**
 * Takes the return string from the RPC 'ORWPCE SCSEL' and parses out the data.<br/><br/>
 *
 * @param logger The logger
 * @param rpcData The String from the RPC that you want parsed
 */
module.exports.parse = function(logger, rpcData) {
    var FIELD_LENGTH = 8;
    var fields = _.map(rpcData.split(';'), function(s) {
        var retArray = s.split('^');
        var retVal = {enabled:Boolean(parseInt(retArray[0])),value:''};
        if (retArray.length === 2) {
            if (retArray[1] === '1') {
                retVal.value = 'yes';
            }
            if(retArray[1] === '0') {
                retVal.value = 'no';
            }
        }
        return retVal;
    });
    if (fields.length === FIELD_LENGTH) {
        return {
            SC: fields[0],
            AO: fields[1],
            IR: fields[2],
            SAC: fields[3],
            MST: fields[4],
            HNC: fields[5],
            CV: fields[6],
            SHD: fields[7]
        };
    } else {
        throw new Error('The RPC returned data but we couldn\'t understand it: ' + rpcData);
    }
};
