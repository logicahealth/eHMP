'use strict';


var rpcUtil = require('./../utils/rpc-util');


function parse(logger, result) {
    var obj = {
        enabled: (result === '1')
    };
    return obj;
}

/**
 * Returns JSON containing a true/false value for 'enabled' indicating whether the PKI Digital Signature is enabled on the site.
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param callback This will be called with the data retrieved from the RPC (or if there's an error).
 */
module.exports.fetch = function(logger, configuration, callback) {
    return rpcUtil.standardRPCCall(logger, configuration, 'ORWOR PKISITE', parse, callback);
};
