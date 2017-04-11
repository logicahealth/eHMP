'use strict';

var rpcClientFactory = require('./../../core/rpc-client-factory');

module.exports.lockOrder = function(orderId, writebackContext, callback) {
    rpcClientFactory.getRpcClient(writebackContext, 'OR CPRS GUI CHART', function (error, rpcClient) {
        if (error) {
            return callback(error, null);
        }

        var rpcName = 'ORWDX LOCK ORDER';
        rpcClient.execute(rpcName, orderId, function(err, data) {
            var dataString = '' + data;
            if (dataString !== '1') {
                return callback(dataString.replace('0^', ''), data);
            }
            else {
                return callback(null, data);
            }
        });
    });
};

module.exports.unlockOrder = function (orderId, writebackContext) {
    rpcClientFactory.getRpcClient(writebackContext, 'OR CPRS GUI CHART', function (error, rpcClient) {
        if (error) {
            writebackContext.logger.error(error);
            return;
        }

        var rpcName = 'ORWDX UNLOCK ORDER';
        rpcClient.execute(rpcName, orderId, function(err, data) {
            return;
        });
    });
};
