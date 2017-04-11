'use strict';

var rpcClientFactory = require('./../../core/rpc-client-factory');

module.exports.actionValid = function(resourceId, actionCode, provider, writebackContext, callback) {
    rpcClientFactory.getRpcClient(writebackContext, 'OR CPRS GUI CHART', function(error, rpcClient) {
        if (error) {
            return callback(error, null);
        }

        var rpcName = 'ORWDXA VALID';
        rpcClient.execute(rpcName, getParameters(resourceId, actionCode, provider), function(err, data) {
            if (err) {
                return callback(err, data);
            }
            return callback(null);
        });
    });
};

function getParameters(resourceId, actionCode, provider) {
    var parameters = [];
    if (resourceId) {
        parameters.push(resourceId);
        parameters.push(actionCode);
        parameters.push(provider);
    }
    return parameters;
}

module.exports._getParameters = getParameters;
