/*
 TODO: Using ORWDX LOADRSP until RPC wrapper is in place
 */
'use strict';

var rpcClientFactory = require('./../../core/rpc-client-factory');


module.exports = function(writebackContext, callback) {
    getOrderDetail(writebackContext.resourceId, writebackContext, function(err, data) {
        if (err) {
            return callback(err, null);
        }
        writebackContext.vprResponse = data;
        return callback(null);
    });
};

module.exports.getDetail = function(resourceId, writebackContext, callback) {
    getOrderDetail(resourceId, writebackContext, function(err, data) {
        if (err) {
            return callback(err, null);
        }
        return callback(null, data);
    });
};

function getOrderDetail(resourceId, writebackContext, callback) {
    rpcClientFactory.getRpcClient(writebackContext, 'OR CPRS GUI CHART', function(error, rpcClient) {
        if (error) {
            return callback(error, null);
        }

        var rpcName = 'ORQOR DETAIL';
        var dfn = writebackContext.model.dfn;
        if (!dfn && writebackContext.pid) {
            dfn = writebackContext.pid.substring(writebackContext.pid.indexOf(';') + 1, writebackContext.pid.length);
        }
        rpcClient.execute(rpcName, getParameters(resourceId, dfn), function(err, data) {
            if (err) {
                return callback(err, data);
            }
            return callback(null, data);
        });
    });
};

function getParameters(resourceId, dfn) {
    var parameters = [];
    if (resourceId) {
        parameters.push(resourceId);
    }
    if (dfn) {
        parameters.push(dfn);
    }
    return parameters;
}

module.exports._getParameters = getParameters;
