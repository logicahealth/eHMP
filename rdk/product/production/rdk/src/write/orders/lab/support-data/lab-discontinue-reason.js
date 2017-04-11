'use strict';

var RpcClient = require('vista-js').RpcClient;

module.exports.getDiscontinueReason = function(logger, configuration, callback) {
    return RpcClient.callRpc(logger, configuration, 'ORWDX2 DCREASON', function(error, rpcData) {
        if (error) {
            return callback(error.message);
        }
        var dataString = '' + rpcData;
        var unformattedDataArray = (dataString.replace('~DCReason', '')).split('\r\n');
        var formattedDataArray = [];
        for (var i = 1; i < unformattedDataArray.length - 1; i++) {
            var dataArray = [];
            dataArray.push(unformattedDataArray[i].split('^'));
            var obj = {
                label: dataArray[0][1],
                value: dataArray[0][0].slice(1)
            };
            formattedDataArray.push(obj);

        }
        return callback(null, formattedDataArray);
    });
};
