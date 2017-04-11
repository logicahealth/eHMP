'use strict';

var rpcClientFactory = require('./../../core/rpc-client-factory');

module.exports.lockPatient = function(writebackContext, callback) {
    rpcClientFactory.getRpcClient(writebackContext, 'OR CPRS GUI CHART', function (error, rpcClient) {
        if (error) {
            return callback(error, null);
        }

        var rpcName = 'ORWDX LOCK';
        rpcClient.execute(rpcName, getParameters(writebackContext.model), function(err, data) {
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

module.exports.unlockPatient = function (writebackContext) {
    //TODO: Add logging
    rpcClientFactory.getRpcClient(writebackContext, 'OR CPRS GUI CHART', function (error, rpcClient) {
        if (error) {
            return;
        }

        var rpcName = 'ORWDX UNLOCK';
        rpcClient.execute(rpcName, getParameters(writebackContext.model), function(err, data) {
            return;
        });
    });
};

function getParameters(model) {
    var parameters = [];
    if (model && model.dfn) {
        parameters.push(model.dfn); }
    return parameters;
}

module.exports._getParameters = getParameters;
