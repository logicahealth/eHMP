/*
 TODO: Using ORWDXC SESSION until RPC wrapper is in place
 */
'use strict';

var rpcClientFactory = require('./../../core/rpc-client-factory');

module.exports.check = function(orderId, writebackContext, callback) {

    rpcClientFactory.getRpcClient(writebackContext, 'OR CPRS GUI CHART', function(error, rpcClient) {
        if (error) {
            return callback(error, null);
        }

        var rpcName = 'ORWDXC SESSION';
        rpcClient.execute(rpcName, getParameters(writebackContext.model.dfn, orderId), function(err, data) {
            if (err) {
                return callback(err, data);
            }
            return callback(null, '' + data);
        });
    });
};

function getParameters(dfn, orderId) {
    var parameters = [];
    if (dfn && orderId) {
        parameters.push(dfn);
        var orderList = {};
        orderList['1'] = orderId + '^^1';
        parameters.push(orderList);
    }
    return parameters;
}

module.exports._getParameters = getParameters;
