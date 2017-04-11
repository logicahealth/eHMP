'use strict';

var encryptSig = require('../orders/common/orders-sig-code-encryptor');
var rpcClientFactory = require('../core/rpc-client-factory');

module.exports.validateSignature = function(writebackContext, callback) {
    executeValidation(writebackContext, function(err, result) {
        if (err || !result) {
            return callback(err);
        }
        writebackContext.vprResponse = 'Valid signature';
        return callback(null, writebackContext);
    });
};

function executeValidation(writebackContext, callback) {
    rpcClientFactory.getRpcClient(writebackContext, 'OR CPRS GUI CHART', function(error, rpcClient) {
        if (error) {
            return callback(error, null);
        }

        var rpcName = 'ORWU VALIDSIG';
        rpcClient.execute(rpcName, getValidateSignatureParameters(writebackContext.model), function(err, data) {
            var dataString = '' + data;
            if (dataString !== '1') {
                return callback(dataString.replace('0^', ''), data);
            } else {
                return callback(null, data);
            }
        });
    });
}

function getValidateSignatureParameters(model) {
    var parameters = [];
    if (model && model.signature) {
        parameters.push(encryptSig.encryptSig(model.signature));
    }
    return parameters;
}
