'use strict';

var rpcClientFactory = require('./../../core/rpc-client-factory');
var readOnlyRpcClientFactory = require('./../../../subsystems/vista-read-only-subsystem');
var nullchecker = require('../../../core/rdk').utils.nullchecker;

module.exports = function(writebackContext, callback) {
    readOnlyRpcClientFactory.getRpcSystemClient(writebackContext, writebackContext.siteParam, function(error, rpcClient) {
        if (error) {
            return callback(error, null);
        }

        getOrderDetail(rpcClient, writebackContext.resourceId, writebackContext, function (err, data) {
            if (err) {
                return callback(err, null);
            }
            writebackContext.vprResponse = data;
            return callback(null);
        });
    });
};

module.exports.getDetail = function(resourceId, writebackContext, callback) {
    rpcClientFactory.getRpcClient(writebackContext, 'OR CPRS GUI CHART', function(error, rpcClient) {
        if (error) {
            return callback(error, null);
        }
        getOrderDetail(rpcClient, resourceId, writebackContext, function (err, data) {
            if (err) {
                return callback(err, null);
            }
            return callback(null, data);
        });
    });
};

function getOrderDetail(rpcClient, resourceId, writebackContext, callback) {
    var rpcName = 'ORQOR DETAIL';
    var dfn = writebackContext.interceptorResults.patientIdentifiers.dfn;
    if(nullchecker.isNullish(dfn)){
        return callback('Missing required patient identifiers');
    }

    rpcClient.execute(rpcName, getParameters(resourceId, dfn), function(err, data) {
        if (err) {
            return callback(err, data);
        }
        return callback(null, data);
    });
}

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
