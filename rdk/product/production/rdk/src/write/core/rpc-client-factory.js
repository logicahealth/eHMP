'use strict';

var _ = require('lodash');
var RpcClient = require('vista-js').RpcClient;

module.exports = {
    getRpcClient: function(writebackContext, vistaContext, callback) {

        if (_.isNull(writebackContext.rpcClient) || _.isUndefined(writebackContext.rpcClient)) {
            if (vistaContext) {
                writebackContext.vistaConfig.context = vistaContext;
            }

            var rpcClient = RpcClient.create(writebackContext.logger, writebackContext.vistaConfig);

            rpcClient.connect(function(err) {
                if (err) {
                    return callback(err);
                }
                writebackContext.rpcClient = rpcClient;
                return callback(null, rpcClient);
            });
        } else {
            callback(null, writebackContext.rpcClient);
        }
    },

    closeRpcClient: function(writebackContext) {
        var rpcClient = writebackContext.rpcClient;

        if (!_.isNull(rpcClient) && !_.isUndefined(rpcClient)) {
            rpcClient.close();
            writebackContext.rpcClient = null;
        }
    }
};
