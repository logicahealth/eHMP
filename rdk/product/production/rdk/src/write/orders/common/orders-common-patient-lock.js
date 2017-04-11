'use strict';

var rpcClientFactory = require('./../../core/rpc-client-factory');
var nullchecker = require('../../../core/rdk').utils.nullchecker;

module.exports.lockPatient = function(writebackContext, callback) {
    rpcClientFactory.getRpcClient(writebackContext, 'OR CPRS GUI CHART', function(error, rpcClient) {
        if (error) {
            return callback(error, null);
        }

        var rpcName = 'ORWDX LOCK';
        rpcClient.execute(rpcName, getParameters(writebackContext), function(err, data) {
            var dataString = '' + data;
            if (dataString !== '1') {
                return callback(dataString.replace('0^', ''), data);
            } else {
                return callback(null, data);
            }
        });
    });
};

module.exports.unlockPatient = function (writebackContext) {
    rpcClientFactory.getRpcClient(writebackContext, 'OR CPRS GUI CHART', function (error, rpcClient) {
        if (error) {
            writebackContext.logger.error(error);
            return;
        }

        var rpcName = 'ORWDX UNLOCK';
        rpcClient.execute(rpcName, getParameters(writebackContext), function(err, data) {
            return;
        });
    });
};

function getParameters(writebackContext) {
    var parameters = [];
    if (writebackContext && writebackContext.interceptorResults &&
        writebackContext.interceptorResults.patientIdentifiers && !nullchecker.isNullish(writebackContext.interceptorResults.patientIdentifiers.dfn)) {
        parameters.push(writebackContext.interceptorResults.patientIdentifiers.dfn);
    }
    return parameters;
}

module.exports._getParameters = getParameters;
