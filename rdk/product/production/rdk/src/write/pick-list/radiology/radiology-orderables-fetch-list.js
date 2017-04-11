'use strict';

var parse = require('./radiology-orderables-parser').parse;
var validate = require('./../utils/validation-util');
var rpcUtil = require('./../utils/rpc-util');
var _ = require('lodash');


/**
 * Calls the RPC 'ORWDRA32 RAORDITM' repeatedly and parses out the data<br/><br/>
 *
 * Required parameter: imgType
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param callback This will be called with the array of data retrieved from multiple calls to the RPC (or if there's an error).
 * @param params object containing parameters.
 */
module.exports.fetch = function(logger, configuration, callback, params) {
    var imgType = _.get(params, 'imgType');

    if (!imgType) {
        return callback('imgType is a required parameter');
    }
    if (validate.isStringNullish(imgType)) {
        return callback('imgType cannot be empty');
    }

    logger.trace('Retrieving ORWDRA32 RAORDITM data');
    rpcUtil.callRpcRecursively(logger, configuration, 'ORWDRA32 RAORDITM', parse, [], '', 'name', callback, imgType);
};
